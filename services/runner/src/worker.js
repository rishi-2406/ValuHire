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
    const submission = await prisma.submission.findUnique({
      where: { id: job.data.submissionId },
      include: { codingQuestion: { include: { testCases: true } } }
    });

    if (!submission) {
      throw new Error(`Submission not found: ${job.data.submissionId}`);
    }

    await prisma.submission.update({ where: { id: submission.id }, data: { status: "RUNNING" } });

    const result = await executeAgainstTestCases({
      code: submission.code,
      language: submission.language,
      testCases: submission.codingQuestion.testCases,
      questionPoints: submission.codingQuestion.points
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
