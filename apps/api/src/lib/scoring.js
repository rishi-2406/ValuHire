function normalizeOutput(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

function scoreMcq(questions, answers) {
  const selectedByQuestion = new Map(answers.map((answer) => [answer.questionId, answer.selectedKey]));
  return questions.reduce((total, question) => {
    return total + (selectedByQuestion.get(question.id) === question.correctKey ? question.points : 0);
  }, 0);
}

function summarizeCoding(submissions) {
  const bestByQuestion = new Map();
  for (const submission of submissions) {
    const previous = bestByQuestion.get(submission.codingQuestionId);
    if (!previous || submission.score > previous.score) {
      bestByQuestion.set(submission.codingQuestionId, submission);
    }
  }
  
  let totalScore = 0;
  let testCasesPassed = 0;
  let testCasesTotal = 0;
  
  for (const submission of bestByQuestion.values()) {
    totalScore += submission.score;
    if (submission.testResults && Array.isArray(submission.testResults)) {
      testCasesTotal += submission.testResults.length;
      testCasesPassed += submission.testResults.filter(r => r.passed).length;
    }
  }
  
  return { score: totalScore, testCasesPassed, testCasesTotal };
}

function scoreTestCases(testCases, results, questionPoints) {
  if (!testCases.length) return 0;
  const passed = results.filter((result) => result.passed).length;
  return Math.round((passed / testCases.length) * questionPoints);
}

function compareTestOutput(expectedOutput, actualOutput) {
  return normalizeOutput(expectedOutput) === normalizeOutput(actualOutput);
}

function buildAssessmentScore({ mcqQuestions = [], mcqAnswers = [], submissions = [] }) {
  const mcqScore = scoreMcq(mcqQuestions, mcqAnswers);
  const codingSummary = summarizeCoding(submissions);
  return {
    mcqScore,
    codingScore: codingSummary.score,
    testCasesPassed: codingSummary.testCasesPassed,
    testCasesTotal: codingSummary.testCasesTotal,
    totalScore: mcqScore + codingSummary.score
  };
}

module.exports = {
  buildAssessmentScore,
  compareTestOutput,
  normalizeOutput,
  scoreMcq,
  scoreTestCases,
  summarizeCoding
};

