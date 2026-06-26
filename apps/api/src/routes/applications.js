const { hashToken } = require("../lib/auth");
const { buildAssessmentScore } = require("../lib/scoring");
const { asyncHandler, requireFields, sendCreated, sendOk } = require("../lib/http");

function createApplicationsRoutes({ router, prisma, middleware, io, queue }) {
  const candidateOnly = [middleware.requireAuth, middleware.requireRole("CANDIDATE")];

  router.get("/applications/me", ...candidateOnly, asyncHandler(async (req, res) => {
    const applications = await prisma.application.findMany({
      where: { candidateId: req.user.id },
      include: { 
        campaign: { include: { company: true, assessment: true } },
        candidate: {
          select: {
            interviewSlots: true
          }
        }
      },
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

  // POST /applications/shortlist — recruiter bulk-shortlists candidates
  router.post("/applications/shortlist", middleware.requireAuth, middleware.requireApprovedCompany, asyncHandler(async (req, res) => {
    requireFields(req.body, ["campaignId", "candidateIds"]);
    const { campaignId, candidateIds } = req.body;
    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      const error = new Error("candidateIds must be a non-empty array");
      error.statusCode = 400;
      throw error;
    }
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign || campaign.companyId !== req.user.companyId) {
      const error = new Error("Campaign not found");
      error.statusCode = 404;
      throw error;
    }

    const results = [];
    for (const candidateId of candidateIds) {
      // Only shortlist if not already shortlisted or further advanced
      const app = await prisma.application.findUnique({
        where: { candidateId_campaignId: { candidateId, campaignId } },
        include: { candidate: true }
      });
      if (!app) continue;
      if (["SHORTLISTED", "INTERVIEW_SCHEDULED", "HIRED"].includes(app.status)) {
        results.push({ candidateId, alreadyShortlisted: true });
        continue;
      }
      await prisma.application.update({
        where: { candidateId_campaignId: { candidateId, campaignId } },
        data: { status: "SHORTLISTED" }
      });
      // Create a persisted notification
      const notification = await prisma.notification.create({
        data: {
          userId: candidateId,
          type: "SHORTLISTED",
          title: "You've been shortlisted! 🎉",
          message: `Congratulations! You have been shortlisted for the role of "${campaign.title}". The recruiter will be in touch to schedule an interview.`,
          metadata: { campaignId, campaignTitle: campaign.title }
        }
      });
      // Emit real-time event if candidate is connected
      if (io) {
        io.to(`user:${candidateId}`).emit("new_notification", notification);
      }
      results.push({ candidateId, shortlisted: true, notification });
    }
    sendOk(res, { results });
  }));

  // GET /applications/campaign/:campaignId/shortlisted — fetch shortlisted candidates for a campaign
  router.get("/applications/campaign/:campaignId/shortlisted", middleware.requireAuth, middleware.requireApprovedCompany, asyncHandler(async (req, res) => {
    const campaign = await prisma.campaign.findUnique({ where: { id: req.params.campaignId } });
    if (!campaign || campaign.companyId !== req.user.companyId) {
      const error = new Error("Campaign not found");
      error.statusCode = 404;
      throw error;
    }
    const applications = await prisma.application.findMany({
      where: {
        campaignId: req.params.campaignId,
        status: { in: ["SHORTLISTED", "INTERVIEW_SCHEDULED", "INTERVIEW_COMPLETED", "HIRED"] }
      },
      include: {
        candidate: {
          select: {
            id: true, name: true, email: true, bio: true, skills: true,
            profilePicUrl: true, resumeUrl: true,
            interviewSlots: {
              where: { campaignId: req.params.campaignId },
              include: { feedback: true }
            }
          }
        },
        campaign: { select: { id: true, title: true } }
      },
      orderBy: { appliedAt: "desc" }
    });
    sendOk(res, { applications });
  }));

  router.post("/assessments/:id/sessions", ...candidateOnly, asyncHandler(async (req, res) => {
    const assessment = await prisma.assessment.findUnique({ 
      where: { id: req.params.id }, 
      include: { campaign: true, mcqQuestions: true, codingQuestions: { include: { testCases: true } } } 
    });
    if (!assessment) {
      const error = new Error("Assessment not found");
      error.statusCode = 404;
      throw error;
    }
    if (assessment.campaign.status !== "OPEN") {
      const error = new Error(`Assessment is not available because the campaign is currently in ${assessment.campaign.status} status`);
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

    let session = await prisma.assessmentSession.findFirst({
      where: { assessmentId: assessment.id, candidateId: req.user.id }
    });

    if (session && session.status === "SUBMITTED") {
      const error = new Error("Assessment already submitted");
      error.statusCode = 403;
      throw error;
    }

    if (!session) {
      const selectVariants = (questions) => {
        const grouped = {};
        for (const q of questions) {
          if (!grouped[q.slotIndex]) grouped[q.slotIndex] = [];
          grouped[q.slotIndex].push(q.id);
        }
        return Object.values(grouped).map(slot => slot[Math.floor(Math.random() * slot.length)]);
      };

      const selectedMcq = selectVariants(assessment.mcqQuestions);
      const selectedCoding = selectVariants(assessment.codingQuestions);

      for (let i = selectedMcq.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [selectedMcq[i], selectedMcq[j]] = [selectedMcq[j], selectedMcq[i]];
      }

      const totalDuration = (assessment.mcqDurationMinutes || 0) + (assessment.codingDurationMinutes || 0);
      const durationToUse = totalDuration > 0 ? totalDuration : assessment.durationMinutes;
      const expiresAt = new Date(Date.now() + durationToUse * 60 * 1000);

      session = await prisma.assessmentSession.create({
        data: { 
          assessmentId: assessment.id, 
          candidateId: req.user.id, 
          expiresAt,
          selectedVariants: { mcq: selectedMcq, coding: selectedCoding }
        }
      });
    }

    const selectedVariants = session.selectedVariants || { mcq: [], coding: [] };
    const filteredMcq = selectedVariants.mcq.map(id => assessment.mcqQuestions.find(q => q.id === id)).filter(Boolean);
    const filteredCoding = selectedVariants.coding.map(id => assessment.codingQuestions.find(q => q.id === id)).filter(Boolean);

    // Strip answers from mcq for security
    filteredMcq.forEach(q => delete q.correctKey);
    // Strip hidden test cases
    filteredCoding.forEach(q => {
      if (q.testCases) {
        q.testCases = q.testCases.filter(tc => !tc.isHidden);
      }
    });

    const timeLeft = Math.max(0, Math.floor((session.expiresAt.getTime() - Date.now()) / 1000));

    sendCreated(res, { 
      session: { 
        ...session, 
        timeLeft,
        assessment: { ...assessment, mcqQuestions: filteredMcq, codingQuestions: filteredCoding }
      } 
    });
  }));

  router.get("/assessment-sessions/:id", ...candidateOnly, asyncHandler(async (req, res) => {
    const session = await prisma.assessmentSession.findUnique({
      where: { id: req.params.id },
      include: {
        assessment: { include: { mcqQuestions: true, codingQuestions: { include: { testCases: true } } } }
      }
    });
    if (!session || session.candidateId !== req.user.id) {
      const error = new Error("Assessment session not found");
      error.statusCode = 404;
      throw error;
    }
    
    if (session.status === "SUBMITTED") {
      const error = new Error("Assessment already submitted");
      error.statusCode = 403;
      throw error;
    }

    const selectedVariants = session.selectedVariants || { mcq: [], coding: [] };
    const filteredMcq = selectedVariants.mcq.map(id => session.assessment.mcqQuestions.find(q => q.id === id)).filter(Boolean);
    const filteredCoding = selectedVariants.coding.map(id => session.assessment.codingQuestions.find(q => q.id === id)).filter(Boolean);

    filteredMcq.forEach(q => delete q.correctKey);
    filteredCoding.forEach(q => {
      if (q.testCases) {
        q.testCases = q.testCases.filter(tc => !tc.isHidden);
      }
    });

    const timeLeft = Math.max(0, Math.floor((session.expiresAt.getTime() - Date.now()) / 1000));
    sendOk(res, {
      session: {
        ...session,
        timeLeft,
        assessment: { ...session.assessment, mcqQuestions: filteredMcq, codingQuestions: filteredCoding }
      }
    });
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

    const latestSubmissionsMap = new Map();
    for (const sub of session.submissions) {
      const existing = latestSubmissionsMap.get(sub.codingQuestionId);
      if (!existing || sub.createdAt > existing.createdAt) {
        latestSubmissionsMap.set(sub.codingQuestionId, sub);
      }
    }

    const finalSubmissionIds = [];
    for (const [qId, sub] of latestSubmissionsMap) {
      const finalSub = await prisma.submission.create({
        data: {
          assessmentSessionId: session.id,
          candidateId: req.user.id,
          codingQuestionId: qId,
          code: sub.code,
          language: sub.language,
          status: "QUEUED"
        }
      });
      finalSubmissionIds.push(finalSub.id);
      await queue.add("run-code", { submissionId: finalSub.id, isFinalSubmit: true });
    }

    if (finalSubmissionIds.length > 0) {
      let pending = true;
      let iterations = 0;
      while (pending && iterations < 30) {
        await new Promise(r => setTimeout(r, 1000));
        const checks = await prisma.submission.findMany({ where: { id: { in: finalSubmissionIds } } });
        pending = checks.some(c => c.status === "QUEUED" || c.status === "RUNNING");
        iterations++;
      }
      const refreshedSession = await prisma.assessmentSession.findUnique({
        where: { id: session.id },
        include: { submissions: true }
      });
      session.submissions = refreshedSession.submissions;
    }
    
    const score = buildAssessmentScore({
      mcqQuestions: session.assessment.mcqQuestions,
      mcqAnswers: session.mcqAnswers,
      submissions: session.submissions
    });
    const durationSeconds = Math.max(0, Math.round((Date.now() - session.startedAt.getTime()) / 1000));
    
    // Accept tracking from client
    const { mcqElapsed, codingElapsed } = req.body || {};
    const mcqDurationSeconds = typeof mcqElapsed === "number" ? Math.floor(mcqElapsed) : null;
    const codingDurationSeconds = typeof codingElapsed === "number" ? Math.floor(codingElapsed) : null;

    const result = await prisma.assessmentResult.upsert({
      where: { assessmentSessionId: session.id },
      update: { ...score, durationSeconds, mcqDurationSeconds, codingDurationSeconds },
      create: {
        assessmentSessionId: session.id,
        candidateId: req.user.id,
        assessmentId: session.assessmentId,
        ...score,
        durationSeconds,
        mcqDurationSeconds,
        codingDurationSeconds
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

