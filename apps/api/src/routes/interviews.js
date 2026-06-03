const { makeOpaqueToken } = require("../lib/auth");
const { asyncHandler, requireFields, sendCreated, sendOk } = require("../lib/http");

function createInterviewRoutes({ router, prisma, middleware, io }) {
  router.post("/interviews", middleware.requireAuth, middleware.requireApprovedCompany, asyncHandler(async (req, res) => {
    requireFields(req.body, ["campaignId", "candidateId", "startsAt", "endsAt"]);
    const campaign = await prisma.campaign.findUnique({ where: { id: req.body.campaignId } });
    if (!campaign || campaign.companyId !== req.user.companyId) {
      const error = new Error("Campaign not found");
      error.statusCode = 404;
      throw error;
    }
    const slot = await prisma.interviewSlot.create({
      data: {
        campaignId: campaign.id,
        candidateId: req.body.candidateId,
        recruiterId: req.user.id,
        startsAt: new Date(req.body.startsAt),
        endsAt: new Date(req.body.endsAt),
        roomCode: makeOpaqueToken().slice(0, 12)
      }
    });
    await prisma.application.updateMany({
      where: { candidateId: req.body.candidateId, campaignId: campaign.id },
      data: { status: "INTERVIEW_SCHEDULED" }
    });
    // Create notification for candidate
    const notification = await prisma.notification.create({
      data: {
        userId: req.body.candidateId,
        type: "INTERVIEW_SCHEDULED",
        title: "Interview Scheduled! 📅",
        message: `Your interview for "${campaign.title}" has been scheduled. Please check your Interviews tab for details.`,
        metadata: { campaignId: campaign.id, campaignTitle: campaign.title, slotId: slot.id }
      }
    });
    if (io) {
      io.to(`user:${req.body.candidateId}`).emit("new_notification", notification);
    }
    sendCreated(res, { slot });
  }));

  router.get("/interviews", middleware.requireAuth, asyncHandler(async (req, res) => {
    const where = req.user.role === "RECRUITER" ? { recruiterId: req.user.id } : { candidateId: req.user.id };
    const slots = await prisma.interviewSlot.findMany({
      where,
      include: { campaign: true, candidate: true, recruiter: true, feedback: true },
      orderBy: { startsAt: "asc" }
    });
    sendOk(res, { slots });
  }));

  router.get("/interviews/rooms/:roomCode", middleware.requireAuth, asyncHandler(async (req, res) => {
    const slot = await prisma.interviewSlot.findUnique({
      where: { roomCode: req.params.roomCode },
      include: { campaign: true, candidate: true, recruiter: true, feedback: true }
    });
    if (!slot || ![slot.candidateId, slot.recruiterId].includes(req.user.id)) {
      const error = new Error("Interview room access denied");
      error.statusCode = 403;
      throw error;
    }
    sendOk(res, { slot });
  }));

  router.post("/interviews/:id/feedback", middleware.requireAuth, middleware.requireRole("RECRUITER", "ADMIN"), asyncHandler(async (req, res) => {
    const slot = await prisma.interviewSlot.findUnique({ where: { id: req.params.id } });
    if (!slot || (req.user.role === "RECRUITER" && slot.recruiterId !== req.user.id)) {
      const error = new Error("Interview not found");
      error.statusCode = 404;
      throw error;
    }
    const feedback = await prisma.interviewFeedback.upsert({
      where: { interviewSlotId: slot.id },
      update: {
        notes: req.body.notes,
        rating: req.body.rating,
        recommendation: req.body.recommendation
      },
      create: {
        interviewSlotId: slot.id,
        interviewerId: req.user.id,
        notes: req.body.notes,
        rating: req.body.rating,
        recommendation: req.body.recommendation
      }
    });
    await prisma.interviewSlot.update({ where: { id: slot.id }, data: { status: "COMPLETED" } });
    sendOk(res, { feedback });
  }));
}

module.exports = createInterviewRoutes;

