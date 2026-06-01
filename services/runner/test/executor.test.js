const test = require("node:test");
const assert = require("node:assert/strict");

const { executeAgainstTestCases } = require("../src/lib/executor");

test("rejects unsupported execution languages before running code", async () => {
  await assert.rejects(
    executeAgainstTestCases({
      language: "ruby",
      code: "puts 'ready'",
      questionPoints: 10,
      useDocker: false,
      testCases: [{ input: "", expectedOutput: "ready" }]
    }),
    /Unsupported language/
  );
});
