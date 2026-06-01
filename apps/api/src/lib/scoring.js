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
  return Array.from(bestByQuestion.values()).reduce((total, submission) => total + submission.score, 0);
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
  const codingScore = summarizeCoding(submissions);
  return {
    mcqScore,
    codingScore,
    totalScore: mcqScore + codingScore
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

