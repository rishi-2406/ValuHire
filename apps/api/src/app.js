const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { webOrigin } = require("./config/env");
const prisma = require("./lib/prisma");
const createAuthMiddleware = require("./middleware/auth");
const createAuthRoutes = require("./routes/auth");
const createAdminRoutes = require("./routes/admin");
const createCampaignRoutes = require("./routes/campaigns");
const createApplicationsRoutes = require("./routes/applications");
const createSubmissionRoutes = require("./routes/submissions");
const createResultsRoutes = require("./routes/results");
const createInterviewRoutes = require("./routes/interviews");
const createNotificationRoutes = require("./routes/notifications");

function createApp({ prismaClient = prisma, queue, io } = {}) {
  const app = express();
  const router = express.Router();
  const middleware = createAuthMiddleware(prismaClient);

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "valuhire-api"
    });
  });

  router.get("/meta", (_req, res) => {
    res.json({
      product: "ValuHire",
      phase: "v1-mvp",
      modules: [
        "auth",
        "companies",
        "campaigns",
        "assessments",
        "applications",
        "submissions",
        "results",
        "interviews"
      ]
    });
  });

  createAuthRoutes({ router, prisma: prismaClient, middleware });
  createAdminRoutes({ router, prisma: prismaClient, middleware });
  createCampaignRoutes({ router, prisma: prismaClient, middleware });
  createApplicationsRoutes({ router, prisma: prismaClient, middleware, io });
  createSubmissionRoutes({ router, prisma: prismaClient, middleware, queue });
  createResultsRoutes({ router, prisma: prismaClient, middleware });
  createInterviewRoutes({ router, prisma: prismaClient, middleware, io });
  createNotificationRoutes({ router, prisma: prismaClient, middleware });

  app.use("/api/v1", router);

  app.use((req, _res, next) => {
    const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
  });

  app.use((error, _req, res, _next) => {
    const status = error.statusCode || 500;
    res.status(status).json({
      error: {
        message: error.message || "Unexpected server error",
        status
      }
    });
  });

  return app;
}

module.exports = (io) => createApp({ io });
module.exports.createApp = createApp;
