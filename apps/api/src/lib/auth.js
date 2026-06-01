const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { jwtAccessSecret, jwtRefreshSecret } = require("../config/env");

const ACCESS_TTL = "15m";
const REFRESH_TTL_DAYS = 14;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function makeOpaqueToken() {
  return crypto.randomBytes(40).toString("hex");
}

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, jwtAccessSecret, { expiresIn: ACCESS_TTL });
}

function signRefreshToken(user, tokenId) {
  return jwt.sign({ sub: user.id, jti: tokenId }, jwtRefreshSecret, { expiresIn: `${REFRESH_TTL_DAYS}d` });
}

function verifyAccessToken(token) {
  return jwt.verify(token, jwtAccessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, jwtRefreshSecret);
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

function refreshExpiryDate() {
  const date = new Date();
  date.setDate(date.getDate() + REFRESH_TTL_DAYS);
  return date;
}

module.exports = {
  hashPassword,
  hashToken,
  makeOpaqueToken,
  refreshExpiryDate,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyPassword,
  verifyRefreshToken
};

