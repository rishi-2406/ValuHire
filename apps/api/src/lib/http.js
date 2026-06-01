function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function requireFields(body, fields) {
  const missing = fields.filter((field) => body[field] === undefined || body[field] === "");
  if (missing.length) {
    const error = new Error(`Missing required fields: ${missing.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }
}

function sendCreated(res, data) {
  res.status(201).json({ data });
}

function sendOk(res, data) {
  res.json({ data });
}

function toPublicUser(user) {
  if (!user) return null;
  const { passwordHash, refreshTokens, ...safeUser } = user;
  return safeUser;
}

module.exports = {
  asyncHandler,
  requireFields,
  sendCreated,
  sendOk,
  toPublicUser
};

