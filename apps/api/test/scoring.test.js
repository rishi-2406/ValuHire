const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildAssessmentScore,
  compareTestOutput,
  scoreTestCases
} = require("../src/lib/scoring");

test("compares outputs with whitespace normalization", () => {
  assert.equal(compareTestOutput("42\n", "42"), true);
  assert.equal(compareTestOutput("hello", "hello world"), false);
});

test("scores visible and hidden coding test cases proportionally", () => {
  const testCases = [
    { input: "1", expectedOutput: "2" },
    { input: "2", expectedOutput: "4", isHidden: true }
  ];
  const results = [{ passed: true }, { passed: false }];

  assert.equal(scoreTestCases(testCases, results, 10), 5);
});

test("builds mixed assessment score from mcq answers and best coding submissions", () => {
  const score = buildAssessmentScore({
    mcqQuestions: [
      { id: "m1", correctKey: "A", points: 2 },
      { id: "m2", correctKey: "B", points: 3 }
    ],
    mcqAnswers: [
      { questionId: "m1", selectedKey: "A" },
      { questionId: "m2", selectedKey: "C" }
    ],
    submissions: [
      { codingQuestionId: "c1", score: 4 },
      { codingQuestionId: "c1", score: 8 },
      { codingQuestionId: "c2", score: 5 }
    ]
  });

  assert.deepEqual(score, { mcqScore: 2, codingScore: 13, totalScore: 15 });
});

