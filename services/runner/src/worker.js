require("dotenv").config();

const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const { PrismaClient } = require("@prisma/client");
const { executeAgainstTestCases } = require("./lib/executor");

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null
});
const prisma = new PrismaClient();

const worker = new Worker(
  "code-submissions",
  async (job) => {
    if (job.name === "run-ad-hoc") {
      const { runProcess } = require("./lib/executor");
      const { buildDockerCommand, getLanguageConfig } = require("./lib/adapters");
      const fs = require("fs/promises");
      const path = require("path");
      const os = require("os");
      
      const config = getLanguageConfig(job.data.language);
      const baseDir = process.env.VALUHIRE_WORK_DIR || os.tmpdir();
      const workDir = await fs.mkdtemp(path.join(baseDir, "valuhire-run-"));
      const fileName = config.language === "java" ? "Main.java" : `main.${config.extension}`;
      const filePath = path.join(workDir, fileName);
      await fs.writeFile(filePath, job.data.code, "utf8");

      try {
        const useDocker = process.env.VALUHIRE_USE_DOCKER === "true";
        const commandParts = useDocker
          ? buildDockerCommand({ language: config.language, filePath, workDir })
          : config.command(filePath);
        const [command, ...args] = commandParts;
        const result = await runProcess(command, args, { input: "" });
        return result;
      } finally {
        await fs.rm(workDir, { recursive: true, force: true });
      }
    }

    const submission = await prisma.submission.findUnique({
      where: { id: job.data.submissionId },
      include: { codingQuestion: { include: { testCases: true } } }
    });

    if (!submission) {
      throw new Error(`Submission not found: ${job.data.submissionId}`);
    }

    await prisma.submission.update({ where: { id: submission.id }, data: { status: "RUNNING" } });

    const isFinalSubmit = Boolean(job.data.isFinalSubmit);

    const result = await executeAgainstTestCases({
      code: submission.code,
      language: submission.language,
      testCases: submission.codingQuestion.testCases,
      questionPoints: submission.codingQuestion.points,
      isFinalSubmit
    });

    await prisma.submission.update({
      where: { id: submission.id },
      data: {
        status: result.status,
        score: result.score,
        executionTimeMs: result.executionTimeMs,
        testResults: result.testResults
      }
    });

    return result;
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Submission job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(`Submission job ${job?.id} failed`, error);
});

console.log("ValuHire runner worker listening on queue: code-submissions");

const shutdown = async () => {
  console.log("Shutting down worker gracefully...");
  await worker.close();
  connection.quit();
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
