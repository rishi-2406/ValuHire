const test = require("node:test");
const assert = require("node:assert/strict");

const { buildDockerCommand, getLanguageConfig, normalizeLanguage } = require("../src/lib/adapters");

test("normalizes language aliases", () => {
  assert.equal(normalizeLanguage("js"), "javascript");
  assert.equal(normalizeLanguage("c++"), "cpp");
  assert.equal(normalizeLanguage("py"), "python");
});

test("returns adapter config for supported languages", () => {
  assert.equal(getLanguageConfig("java").extension, "java");
  assert.equal(getLanguageConfig("javascript").image, "node:22-alpine");
});

test("builds docker command with network and memory restrictions", () => {
  const command = buildDockerCommand({
    language: "python",
    filePath: "/tmp/run/main.py",
    workDir: "/tmp/run"
  });

  assert.equal(command[0], "docker");
  assert.equal(command.includes("--network"), true);
  assert.equal(command.includes("none"), true);
  assert.equal(command.includes("--memory"), true);
  assert.equal(command.includes("python:3.12-alpine"), true);
});

