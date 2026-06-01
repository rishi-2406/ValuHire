const { Queue } = require("bullmq");
const IORedis = require("ioredis");
const { redisUrl } = require("../config/env");
const { asyncHandler, requireFields, sendCreated } = require("../lib/http");

function makeQueue() {
  const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
  return new Queue("code-submissions", { connection });
}

function createSubmissionRoutes({ router, prisma, middleware, queue = makeQueue() }) {
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
}

module.exports = createSubmissionRoutes;

