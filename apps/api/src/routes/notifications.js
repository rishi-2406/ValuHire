const { asyncHandler, sendOk } = require("../lib/http");

function createNotificationRoutes({ router, prisma, middleware }) {
  // GET /notifications — fetch all notifications for the current user
  router.get("/notifications", middleware.requireAuth, asyncHandler(async (req, res) => {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50
    });
    const unreadCount = notifications.filter(n => !n.isRead).length;
    sendOk(res, { notifications, unreadCount });
  }));

  // PATCH /notifications/:id/read — mark a single notification as read
  router.patch("/notifications/:id/read", middleware.requireAuth, asyncHandler(async (req, res) => {
    const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!notification || notification.userId !== req.user.id) {
      const error = new Error("Notification not found");
      error.statusCode = 404;
      throw error;
    }
    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });
    sendOk(res, { notification: updated });
  }));

  // PATCH /notifications/read-all — mark all as read
  router.patch("/notifications/read-all", middleware.requireAuth, asyncHandler(async (req, res) => {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });
    sendOk(res, { success: true });
  }));
}

module.exports = createNotificationRoutes;
