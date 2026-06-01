const path = require("path");

const LANGUAGE_CONFIG = {
  python: {
    extension: "py",
    image: "python:3.12-alpine",
    command: (file) => ["python3", file]
  },
  javascript: {
    extension: "js",
    image: "node:22-alpine",
    command: (file) => ["node", file]
  },
  cpp: {
    extension: "cpp",
    image: "gcc:14",
    command: (file) => {
      const output = path.join(path.dirname(file), "main");
      return ["sh", "-lc", `g++ ${file} -O2 -std=c++17 -o ${output} && ${output}`];
    }
  },
  java: {
    extension: "java",
    image: "eclipse-temurin:22",
    command: (file) => ["sh", "-lc", `javac ${file} && java -cp ${path.dirname(file)} Main`]
  }
};

function normalizeLanguage(language) {
  const key = String(language || "").toLowerCase();
  if (["js", "node"].includes(key)) return "javascript";
  if (["py"].includes(key)) return "python";
  if (["c++"].includes(key)) return "cpp";
  return key;
}

function getLanguageConfig(language) {
  const normalized = normalizeLanguage(language);
  const config = LANGUAGE_CONFIG[normalized];
  if (!config) {
    const error = new Error(`Unsupported language: ${language}`);
    error.status = "RUNTIME_ERROR";
    throw error;
  }
  return { ...config, language: normalized };
}

function buildDockerCommand({ language, filePath, workDir, timeoutSeconds = 5, memory = "256m" }) {
  const config = getLanguageConfig(language);
  const fileInContainer = `/workspace/${path.basename(filePath)}`;
  const command = config.command(fileInContainer);
  return [
    "docker",
    "run",
    "--rm",
    "--network",
    "none",
    "--memory",
    memory,
    "--cpus",
    "1",
    "-v",
    `${workDir}:/workspace:ro`,
    config.image,
    "timeout",
    `${timeoutSeconds}s`,
    ...command
  ];
}

module.exports = {
  LANGUAGE_CONFIG,
  buildDockerCommand,
  getLanguageConfig,
  normalizeLanguage
};

