const { hashToken } = require("../lib/auth");
const { buildAssessmentScore } = require("../lib/scoring");
const { asyncHandler, requireFields, sendCreated, sendOk } = require("../lib/http");

function createApplicationsRoutes({ router, prisma, middleware }) {
  const candidateOnly = [middleware.requireAuth, middleware.requireRole("CANDIDATE")];

  router.get("/applications/me", ...candidateOnly, asyncHandler(async (req, res) => {
    const applications = await prisma.application.findMany({
      where: { candidateId: req.user.id },
      include: { campaign: { include: { company: true, assessment: true } } },
      orderBy: { appliedAt: "desc" }
    });
    sendOk(res, { applications });
  }));

  router.post("/applications", ...candidateOnly, asyncHandler(async (req, res) => {
    requireFields(req.body, ["campaignId"]);
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.body.campaignId },
      include: { company: true }
    });
    if (!campaign || campaign.status !== "OPEN" || campaign.company.status !== "APPROVED") {
      const error = new Error("Campaign is not accepting applications");
      error.statusCode = 403;
      throw error;
    }
    const application = await prisma.application.upsert({
      where: { candidateId_campaignId: { candidateId: req.user.id, campaignId: campaign.id } },
      update: {},
      create: { candidateId: req.user.id, campaignId: campaign.id }
    });
    sendCreated(res, { application });
  }));

  router.post("/applications/invite", ...candidateOnly, asyncHandler(async (req, res) => {
    requireFields(req.body, ["token"]);
    const invite = await prisma.inviteLink.findUnique({ where: { tokenHash: hashToken(req.body.token) }, include: { campaign: true } });
    if (!invite || invite.usedAt || (invite.expiresAt && invite.expiresAt < new Date())) {
      const error = new Error("Invite link is invalid or expired");
      error.statusCode = 403;
      throw error;
    }
    const application = await prisma.application.upsert({
      where: { candidateId_campaignId: { candidateId: req.user.id, campaignId: invite.campaignId } },
      update: { status: "ASSESSMENT_INVITED" },
      create: { candidateId: req.user.id, campaignId: invite.campaignId, status: "ASSESSMENT_INVITED" }
    });
    await prisma.inviteLink.update({ where: { id: invite.id }, data: { usedAt: new Date() } });
    sendOk(res, { application });
  }));

  router.post("/assessments/:id/sessions", ...candidateOnly, asyncHandler(async (req, res) => {
    const assessment = await prisma.assessment.findUnique({ where: { id: req.params.id }, include: { campaign: true } });
    if (!assessment || assessment.campaign.status !== "OPEN") {
      const error = new Error("Assessment is not available");
      error.statusCode = 403;
      throw error;
    }
    const application = await prisma.application.findUnique({
      where: { candidateId_campaignId: { candidateId: req.user.id, campaignId: assessment.campaignId } }
    });
    if (!application) {
      const error = new Error("Apply or use an invite before starting this assessment");
      error.statusCode = 403;
      throw error;
    }
    const expiresAt = new Date(Date.now() + assessment.durationMinutes * 60 * 1000);
    const session = await prisma.assessmentSession.create({
      data: { assessmentId: assessment.id, candidateId: req.user.id, expiresAt }
    });
    sendCreated(res, { session });
  }));

  router.post("/assessment-sessions/:id/mcq-answers", ...candidateOnly, asyncHandler(async (req, res) => {
    requireFields(req.body, ["questionId", "selectedKey"]);
    const session = await prisma.assessmentSession.findUnique({ where: { id: req.params.id } });
    if (!session || session.candidateId !== req.user.id || session.status !== "STARTED") {
      const error = new Error("Assessment session is not writable");
      error.statusCode = 403;
      throw error;
    }
    const question = await prisma.mcqQuestion.findUnique({ where: { id: req.body.questionId } });
    const isCorrect = question.correctKey === req.body.selectedKey;
    const answer = await prisma.mcqAnswer.upsert({
      where: {
        assessmentSessionId_questionId: {
          assessmentSessionId: session.id,
          questionId: question.id
        }
      },
      update: { selectedKey: req.body.selectedKey, isCorrect, pointsAwarded: isCorrect ? question.points : 0 },
      create: {
        assessmentSessionId: session.id,
        questionId: question.id,
        selectedKey: req.body.selectedKey,
        isCorrect,
        pointsAwarded: isCorrect ? question.points : 0
      }
    });
    sendOk(res, { answer });
  }));

  router.post("/assessment-sessions/:id/proctor-events", ...candidateOnly, asyncHandler(async (req, res) => {
    requireFields(req.body, ["type"]);
    const session = await prisma.assessmentSession.findUnique({ where: { id: req.params.id } });
    if (!session || session.candidateId !== req.user.id) {
      const error = new Error("Assessment session not found");
      error.statusCode = 404;
      throw error;
    }
    const event = await prisma.proctorEvent.create({
      data: {
        assessmentSessionId: session.id,
        type: req.body.type,
        metadata: req.body.metadata || {}
      }
    });
    sendCreated(res, { event });
  }));

  router.post("/assessment-sessions/:id/final-submit", ...candidateOnly, asyncHandler(async (req, res) => {
    const session = await prisma.assessmentSession.findUnique({
      where: { id: req.params.id },
      include: {
        assessment: { include: { mcqQuestions: true } },
        mcqAnswers: true,
        submissions: true
      }
    });
    if (!session || session.candidateId !== req.user.id) {
      const error = new Error("Assessment session not found");
      error.statusCode = 404;
      throw error;
    }

    const score = buildAssessmentScore({
      mcqQuestions: session.assessment.mcqQuestions,
      mcqAnswers: session.mcqAnswers,
      submissions: session.submissions
    });
    const durationSeconds = Math.max(0, Math.round((Date.now() - session.startedAt.getTime()) / 1000));
    const result = await prisma.assessmentResult.upsert({
      where: { assessmentSessionId: session.id },
      update: { ...score, durationSeconds },
      create: {
        assessmentSessionId: session.id,
        candidateId: req.user.id,
        assessmentId: session.assessmentId,
        ...score,
        durationSeconds
      }
    });
    await prisma.assessmentSession.update({ where: { id: session.id }, data: { status: "SUBMITTED", submittedAt: new Date() } });
    await prisma.application.updateMany({
      where: { candidateId: req.user.id, campaign: { assessment: { id: session.assessmentId } } },
      data: { status: "ASSESSMENT_COMPLETED" }
    });
    sendOk(res, { result });
  }));
}

module.exports = createApplicationsRoutes;

