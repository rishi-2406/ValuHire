require("dotenv").config();

const { Worker } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null
});

const worker = new Worker(
  "code-submissions",
  async (job) => {
    console.log("Received code submission job", job.id, job.data);

    return {
      status: "queued-foundation",
      message: "Runner scaffold is ready; language adapters are implemented in Phase 5."
    };
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
