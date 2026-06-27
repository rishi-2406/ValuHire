const fs = require("fs/promises");
const fsSync = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const { compareTestOutput, scoreTestCases } = require("../../../../apps/api/src/lib/scoring");
const { buildDockerCommand, getLanguageConfig } = require("./adapters");

const OUTPUT_LIMIT = 64 * 1024;

function runProcess(command, args, { input = "", timeoutMs = 5000 } = {}) {
  const started = Date.now();
  let result;
  if (input) {
    const inputPath = path.join(os.tmpdir(), `valuhire-input-${process.pid}-${Date.now()}-${Math.random()}`);
    fsSync.writeFileSync(inputPath, input);
    const shellCommand = [...[command], ...args].map(shellQuote).join(" ");
    result = spawnSync("sh", ["-c", `${shellCommand} < ${shellQuote(inputPath)}`], {
      timeout: timeoutMs,
      encoding: "utf8",
      maxBuffer: OUTPUT_LIMIT
    });
    fsSync.rmSync(inputPath, { force: true });
  } else {
    result = spawnSync(command, args, {
      timeout: timeoutMs,
      encoding: "utf8",
      maxBuffer: OUTPUT_LIMIT
    });
  }
  const stdout = result.stdout || "";
  const stderr = result.stderr || result.error?.message || "";
  if (result.error) {
    return Promise.resolve({ status: result.error.code === "ETIMEDOUT" ? "TIMEOUT" : "RUNTIME_ERROR", stdout, stderr, executionTimeMs: Date.now() - started });
  }
  if (result.error?.code === "ETIMEDOUT" || result.signal === "SIGTERM") {
    return Promise.resolve({ status: "TIMEOUT", stdout, stderr, executionTimeMs: Date.now() - started });
  }
  return Promise.resolve({
    status: result.status === 0 ? "PASSED" : "RUNTIME_ERROR",
    stdout,
    stderr,
    executionTimeMs: Date.now() - started
  });
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

async function executeAgainstTestCases({ code, language, testCases, questionPoints, isFinalSubmit = false, useDocker = process.env.VALUHIRE_USE_DOCKER === "true" }) {
  const config = getLanguageConfig(language);
  const baseDir = process.env.VALUHIRE_WORK_DIR || os.tmpdir();
  const workDir = await fs.mkdtemp(path.join(baseDir, "valuhire-run-"));
  const fileName = config.language === "java" ? "Main.java" : `main.${config.extension}`;
  const filePath = path.join(workDir, fileName);
  await fs.writeFile(filePath, code, "utf8");

  const results = [];
  let finalStatus = "PASSED";
  let totalTime = 0;
  
  const targetTestCases = isFinalSubmit ? testCases : testCases.filter(tc => !tc.isHidden);

  try {
    for (const testCase of targetTestCases) {
      const commandParts = useDocker
        ? buildDockerCommand({ language: config.language, filePath, workDir })
        : config.command(filePath);
      const [command, ...args] = commandParts;
      const result = await runProcess(command, args, { input: testCase.input || "" });
      totalTime += result.executionTimeMs;
      const passed = result.status === "PASSED" && compareTestOutput(testCase.expectedOutput, result.stdout);
      if (!passed && finalStatus === "PASSED") finalStatus = result.status === "PASSED" ? "FAILED" : result.status;
      results.push({
        input: testCase.isHidden ? undefined : testCase.input,
        expectedOutput: testCase.isHidden ? undefined : testCase.expectedOutput,
        actualOutput: testCase.isHidden ? undefined : result.stdout,
        stderr: result.stderr,
        passed,
        status: result.status,
        isHidden: Boolean(testCase.isHidden),
        executionTimeMs: result.executionTimeMs
      });
    }
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }

  return {
    status: finalStatus,
    score: scoreTestCases(testCases, results, questionPoints),
    executionTimeMs: totalTime,
    testResults: results
  };
}

module.exports = {
  executeAgainstTestCases,
  runProcess
};
