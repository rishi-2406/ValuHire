const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { webOrigin } = require("./config/env");

const app = express();

app.use(helmet());
app.use(cors({ origin: webOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "valuhire-api"
  });
});

app.get("/api/v1/meta", (_req, res) => {
  res.json({
    product: "ValuHire",
    phase: "foundation",
    modules: [
      "auth",
      "companies",
      "campaigns",
      "assessments",
      "submissions",
      "results",
      "interviews"
    ]
  });
});

module.exports = app;
