require("dotenv").config();

module.exports = {
  apiPort: Number(process.env.API_PORT || 4000),
  webOrigin: process.env.WEB_ORIGIN || "http://localhost:5173",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret"
};
