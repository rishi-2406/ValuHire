const { verifyAccessToken } = require("../lib/auth");

function createAuthMiddleware(prisma) {
  async function requireAuth(req, _res, next) {
    try {
      const header = req.headers.authorization || "";
      const [, token] = header.split(" ");
      if (!token) {
        const error = new Error("Authentication required");
        error.statusCode = 401;
        throw error;
      }

      const payload = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        include: { company: true }
      });

      if (!user || user.status === "BANNED") {
        const error = new Error("User is not allowed to access ValuHire");
        error.statusCode = 403;
        throw error;
      }

      req.user = user;
      next();
    } catch (error) {
      error.statusCode = error.statusCode || 401;
      next(error);
    }
  }

  function requireRole(...roles) {
    return (req, _res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        const error = new Error("Insufficient role");
        error.statusCode = 403;
        next(error);
        return;
      }
      next();
    };
  }

  function requireApprovedCompany(req, _res, next) {
    if (req.user.role !== "RECRUITER") {
      const error = new Error("Recruiter access required");
      error.statusCode = 403;
      next(error);
      return;
    }
    if (!req.user.company || req.user.company.status !== "APPROVED") {
      const error = new Error("Company approval required");
      error.statusCode = 403;
      next(error);
      return;
    }
    next();
  }

  return {
    requireAuth,
    requireApprovedCompany,
    requireRole
  };
}

module.exports = createAuthMiddleware;
