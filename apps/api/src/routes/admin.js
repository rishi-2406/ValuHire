const { asyncHandler, sendOk } = require("../lib/http");

function createAdminRoutes({ router, prisma, middleware }) {
  const adminOnly = [middleware.requireAuth, middleware.requireRole("ADMIN")];

  router.get("/admin/companies", ...adminOnly, asyncHandler(async (_req, res) => {
    const companies = await prisma.company.findMany({
      include: { recruiters: { select: { id: true, name: true, email: true, status: true } } },
      orderBy: { createdAt: "desc" }
    });
    sendOk(res, { companies });
  }));

  router.patch("/admin/companies/:id/status", ...adminOnly, asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!["PENDING", "APPROVED", "BANNED"].includes(status)) {
      const error = new Error("Invalid company status");
      error.statusCode = 400;
      throw error;
    }
    const company = await prisma.company.update({ where: { id: req.params.id }, data: { status } });
    sendOk(res, { company });
  }));

  router.get("/admin/users", ...adminOnly, asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, status: true, company: true, createdAt: true },
      orderBy: { createdAt: "desc" }
    });
    sendOk(res, { users });
  }));

  router.patch("/admin/users/:id/status", ...adminOnly, asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!["ACTIVE", "BANNED"].includes(status)) {
      const error = new Error("Invalid user status");
      error.statusCode = 400;
      throw error;
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status },
      select: { id: true, name: true, email: true, role: true, status: true }
    });
    sendOk(res, { user });
  }));
}

module.exports = createAdminRoutes;

