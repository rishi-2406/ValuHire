const { asyncHandler, requireFields, sendCreated } = require("../lib/http");

function createSubmissionRoutes({ router, prisma, middleware, queue }) {
  router.post("/submissions", middleware.requireAuth, middleware.requireRole("CANDIDATE"), asyncHandler(async (req, res) => {
    requireFields(req.body, ["codingQuestionId", "code", "language"]);
    const question = await prisma.codingQuestion.findUnique({ where: { id: req.body.codingQuestionId } });
    if (!question) {
      const error = new Error("Coding question not found");
      error.statusCode = 404;
      throw error;
    }
    const submission = await prisma.submission.create({
      data: {
        assessmentSessionId: req.body.assessmentSessionId,
        candidateId: req.user.id,
        codingQuestionId: question.id,
        code: req.body.code,
        language: req.body.language,
        status: "QUEUED"
      }
    });
    await queue.add("run-code", { submissionId: submission.id });
    sendCreated(res, { submission });
  }));

  router.get("/submissions/:id", middleware.requireAuth, middleware.requireRole("CANDIDATE"), asyncHandler(async (req, res) => {
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id }
    });
    if (!submission) {
      const error = new Error("Submission not found");
      error.statusCode = 404;
      throw error;
    }
    res.json({ submission });
  }));
}

module.exports = createSubmissionRoutes;

