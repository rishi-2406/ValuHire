const crypto = require("crypto");
const { hashToken, makeOpaqueToken } = require("../lib/auth");
const { asyncHandler, requireFields, sendCreated, sendOk } = require("../lib/http");

function assertCampaignAccess(campaign, user) {
  if (!campaign) {
    const error = new Error("Campaign not found");
    error.statusCode = 404;
    throw error;
  }
  if (campaign.companyId !== user.companyId) {
    const error = new Error("Campaign belongs to another company");
    error.statusCode = 403;
    throw error;
  }
}

function createCampaignRoutes({ router, prisma, middleware }) {
  const recruiter = [middleware.requireAuth, middleware.requireApprovedCompany];

  router.get("/campaigns/public", asyncHandler(async (_req, res) => {
    const campaigns = await prisma.campaign.findMany({
      where: { status: "OPEN", company: { status: "APPROVED" } },
      include: { company: true, assessment: true },
      orderBy: { createdAt: "desc" }
    });
    sendOk(res, { campaigns });
  }));

  router.get("/campaigns", ...recruiter, asyncHandler(async (req, res) => {
    const campaigns = await prisma.campaign.findMany({
      where: { companyId: req.user.companyId },
      include: { assessment: { include: { mcqQuestions: true, codingQuestions: { include: { testCases: true } } } }, inviteLinks: true },
      orderBy: { createdAt: "desc" }
    });
    sendOk(res, { campaigns });
  }));

  router.post("/campaigns", ...recruiter, asyncHandler(async (req, res) => {
    requireFields(req.body, ["title"]);
    const campaign = await prisma.campaign.create({
      data: {
        title: req.body.title,
        description: req.body.description,
        status: req.body.status || "DRAFT",
        companyId: req.user.companyId
      }
    });
    sendCreated(res, { campaign });
  }));

  router.patch("/campaigns/:id", ...recruiter, asyncHandler(async (req, res) => {
    const existing = await prisma.campaign.findUnique({ where: { id: req.params.id } });
    assertCampaignAccess(existing, req.user);
    const campaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: {
        title: req.body.title,
        description: req.body.description,
        status: req.body.status
      }
    });
    sendOk(res, { campaign });
  }));

  router.post("/campaigns/:id/invite-links", ...recruiter, asyncHandler(async (req, res) => {
    const campaign = await prisma.campaign.findUnique({ where: { id: req.params.id } });
    assertCampaignAccess(campaign, req.user);
    const token = makeOpaqueToken();
    const expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : null;
    const inviteLink = await prisma.inviteLink.create({
      data: {
        campaignId: campaign.id,
        tokenHash: hashToken(token),
        expiresAt
      }
    });
    sendCreated(res, { inviteLink: { ...inviteLink, token } });
  }));

  router.put("/campaigns/:id/assessment", ...recruiter, asyncHandler(async (req, res) => {
    const campaign = await prisma.campaign.findUnique({ where: { id: req.params.id } });
    assertCampaignAccess(campaign, req.user);
    requireFields(req.body, ["title", "durationMinutes"]);

    const existing = await prisma.assessment.findUnique({ where: { campaignId: campaign.id } });
    if (existing) {
      await prisma.assessment.delete({ where: { id: existing.id } });
    }

    const assessment = await prisma.assessment.create({
      data: {
        campaignId: campaign.id,
        title: req.body.title,
        durationMinutes: Number(req.body.durationMinutes),
        instructions: req.body.instructions,
        mcqQuestions: {
          create: (req.body.mcqQuestions || []).map((question) => ({
            prompt: question.prompt,
            options: question.options,
            correctKey: question.correctKey,
            points: Number(question.points || 1)
          }))
        },
        codingQuestions: {
          create: (req.body.codingQuestions || []).map((question) => ({
            title: question.title,
            statement: question.statement,
            difficulty: question.difficulty || "Medium",
            constraints: question.constraints,
            points: Number(question.points || 10),
            testCases: {
              create: (question.testCases || []).map((testCase) => ({
                input: testCase.input || "",
                expectedOutput: testCase.expectedOutput || "",
                isHidden: Boolean(testCase.isHidden)
              }))
            }
          }))
        }
      },
      include: { mcqQuestions: true, codingQuestions: { include: { testCases: true } } }
    });

    sendOk(res, { assessment });
  }));
}

module.exports = createCampaignRoutes;

