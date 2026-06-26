const { makeOpaqueToken } = require("../lib/auth");
const { asyncHandler, requireFields, sendCreated, sendOk } = require("../lib/http");

function createInterviewRoutes({ router, prisma, middleware, io, queue }) {
  router.post("/interviews", middleware.requireAuth, middleware.requireApprovedCompany, asyncHandler(async (req, res) => {
    requireFields(req.body, ["campaignId", "candidateId", "startsAt", "endsAt"]);
    const campaign = await prisma.campaign.findUnique({ where: { id: req.body.campaignId } });
    if (!campaign || campaign.companyId !== req.user.companyId) {
      const error = new Error("Campaign not found");
      error.statusCode = 404;
      throw error;
    }
    
    const startsAtDate = new Date(req.body.startsAt);
    const endsAtDate = new Date(req.body.endsAt);
    
    const overlapping = await prisma.interviewSlot.findFirst({
      where: {
        recruiterId: req.user.id,
        status: { notIn: ["COMPLETED", "CANCELLED"] },
        startsAt: { lt: endsAtDate },
        endsAt: { gt: startsAtDate }
      }
    });

    if (overlapping) {
      const error = new Error("You already have an active interview scheduled during this time");
      error.statusCode = 409;
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
    // Create notification for candidate with full meeting details
    const durationMs = new Date(req.body.endsAt) - new Date(req.body.startsAt);
    const durationMinutes = Math.round(durationMs / 60000);
    const notification = await prisma.notification.create({
      data: {
        userId: req.body.candidateId,
        type: "INTERVIEW_SCHEDULED",
        title: "Interview Scheduled! 📅",
        message: `Your interview for "${campaign.title}" has been scheduled. Please check your Interviews tab for details.`,
        metadata: {
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          slotId: slot.id,
          scheduledAt: new Date(req.body.startsAt).toISOString(),
          endsAt: new Date(req.body.endsAt).toISOString(),
          durationMinutes,
          interviewerName: req.user.name || null,
          notes: req.body.notes || null
        }
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
    await prisma.application.updateMany({
      where: { candidateId: slot.candidateId, campaignId: slot.campaignId },
      data: { status: "INTERVIEW_COMPLETED" }
    });

    // Send notification to the candidate
    const notification = await prisma.notification.create({
      data: {
        userId: slot.candidateId,
        type: "INTERVIEW_COMPLETED",
        title: "Interview Completed! 🎉",
        message: "Nice! You've successfully completed your interview. You will hear soon in your mail regarding the result.",
        metadata: {
          slotId: slot.id,
        }
      }
    });

    if (io) {
      io.to(`user:${slot.candidateId}`).emit("new_notification", notification);
    }

    sendOk(res, { feedback });
  }));

  // Ad-hoc run code for live interview
  router.post("/interviews/:id/run", middleware.requireAuth, asyncHandler(async (req, res) => {
    requireFields(req.body, ["code", "language"]);
    const slot = await prisma.interviewSlot.findUnique({ where: { id: req.params.id } });
    if (!slot || ![slot.candidateId, slot.recruiterId].includes(req.user.id)) {
      const error = new Error("Interview not found or access denied");
      error.statusCode = 403;
      throw error;
    }
    const job = await queue.add("run-ad-hoc", {
      code: req.body.code,
      language: req.body.language
    });
    
    sendCreated(res, { jobId: job.id });
  }));

  // Poll job status
  router.get("/interviews/jobs/:jobId", middleware.requireAuth, asyncHandler(async (req, res) => {
    const job = await queue.getJob(req.params.jobId);
    if (!job) {
      const error = new Error("Job not found");
      error.statusCode = 404;
      throw error;
    }
    
    const state = await job.getState();
    let result = null;
    if (state === "completed") result = job.returnvalue;
    else if (state === "failed") result = { status: "FAILED", stderr: job.failedReason };

    sendOk(res, { status: state, result });
  }));
}

module.exports = createInterviewRoutes;

