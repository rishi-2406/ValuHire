const {
  hashPassword,
  hashToken,
  makeOpaqueToken,
  refreshExpiryDate,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
  verifyRefreshToken
} = require("../lib/auth");
const { asyncHandler, requireFields, sendCreated, sendOk, toPublicUser } = require("../lib/http");

function createAuthRoutes({ router, prisma, middleware }) {
  router.post("/auth/register", asyncHandler(async (req, res) => {
    const { name, email, password, role = "CANDIDATE", companyName } = req.body;
    requireFields(req.body, ["name", "email", "password"]);

    if (!["CANDIDATE", "RECRUITER"].includes(role)) {
      const error = new Error("Only candidate and recruiter self-registration is allowed");
      error.statusCode = 400;
      throw error;
    }

    const passwordHash = await hashPassword(password);
    let company;
    if (role === "RECRUITER") {
      if (!companyName) {
        const error = new Error("Recruiter registration requires companyName");
        error.statusCode = 400;
        throw error;
      }
      company = await prisma.company.create({
        data: { name: companyName, status: "PENDING" }
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        companyId: company?.id
      },
      include: { company: true }
    });

    sendCreated(res, { user: toPublicUser(user) });
  }));

  router.post("/auth/login", asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    requireFields(req.body, ["email", "password"]);

    const user = await prisma.user.findUnique({ where: { email }, include: { company: true } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }
    if (user.status === "BANNED") {
      const error = new Error("User is banned");
      error.statusCode = 403;
      throw error;
    }

    const opaque = makeOpaqueToken();
    const refreshRecord = await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(opaque),
        userId: user.id,
        expiresAt: refreshExpiryDate()
      }
    });

    sendOk(res, {
      user: toPublicUser(user),
      accessToken: signAccessToken(user),
      refreshToken: `${signRefreshToken(user, refreshRecord.id)}.${opaque}`
    });
  }));

  router.post("/auth/refresh", asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    requireFields(req.body, ["refreshToken"]);
    const parts = refreshToken.split(".");
    const opaque = parts.pop();
    const signed = parts.join(".");
    const payload = verifyRefreshToken(signed);

    const record = await prisma.refreshToken.findUnique({ where: { id: payload.jti }, include: { user: true } });
    if (!record || record.revokedAt || record.expiresAt < new Date() || record.tokenHash !== hashToken(opaque)) {
      const error = new Error("Refresh token is invalid or expired");
      error.statusCode = 401;
      throw error;
    }

    sendOk(res, {
      accessToken: signAccessToken(record.user),
      user: toPublicUser(record.user)
    });
  }));

  router.post("/auth/logout", asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const parts = refreshToken.split(".");
      const signed = parts.slice(0, -1).join(".");
      const payload = verifyRefreshToken(signed);
      await prisma.refreshToken.updateMany({
        where: { id: payload.jti },
        data: { revokedAt: new Date() }
      });
    }
    sendOk(res, { loggedOut: true });
  }));

  router.get("/auth/me", middleware.requireAuth, asyncHandler(async (req, res) => {
    sendOk(res, { user: toPublicUser(req.user) });
  }));
}

module.exports = createAuthRoutes;

