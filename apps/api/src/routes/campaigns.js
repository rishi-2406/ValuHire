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

  router.get("/campaigns/:id", middleware.requireAuth, asyncHandler(async (req, res) => {
    const isRecruiter = req.user.role === "RECRUITER";
    const restrictedSelect = { select: { id: true, points: true, slotIndex: true } };
    const includeMcqQuestions = isRecruiter ? true : restrictedSelect;
    const includeCodingQuestions = isRecruiter ? { include: { testCases: true } } : restrictedSelect;

    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: { 
        company: true, 
        _count: { select: { applications: true } },
        assessment: {
          include: {
            mcqQuestions: includeMcqQuestions,
            codingQuestions: includeCodingQuestions
          }
        }
      }
    });
    if (!campaign) {
      const error = new Error("Campaign not found");
      error.statusCode = 404;
      throw error;
    }
    if (req.user.role === "RECRUITER" && campaign.companyId !== req.user.companyId) {
      const error = new Error("Campaign belongs to another company");
      error.statusCode = 403;
      throw error;
    }
    sendOk(res, { campaign });
  }));

  router.get("/campaigns", ...recruiter, asyncHandler(async (req, res) => {
    const campaigns = await prisma.campaign.findMany({
      where: { companyId: req.user.companyId },
      include: {
        assessment: { include: { mcqQuestions: true, codingQuestions: { include: { testCases: true } } } },
        inviteLinks: true,
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    sendOk(res, { campaigns });
  }));

  router.post("/campaigns", ...recruiter, asyncHandler(async (req, res) => {
    requireFields(req.body, ["title"]);
    let expiresAt = null;
    let durationDays = null;
    if (req.body.duration && !isNaN(Number(req.body.duration))) {
      durationDays = Number(req.body.duration);
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);
    }
    const campaign = await prisma.campaign.create({
      data: {
        title: req.body.title,
        description: req.body.description,
        targetRole: req.body.targetRole,
        durationDays,
        requiredSkills: req.body.tags || [],
        status: req.body.status || "OPEN",
        expiresAt,
        companyId: req.user.companyId
      }
    });
    sendCreated(res, { campaign });
  }));

  router.patch("/campaigns/:id", ...recruiter, asyncHandler(async (req, res) => {
    const existing = await prisma.campaign.findUnique({ where: { id: req.params.id } });
    assertCampaignAccess(existing, req.user);
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status
    };
    if (req.body.interviewQuestions !== undefined) {
      updateData.interviewQuestions = req.body.interviewQuestions;
    }
    if (req.body.expiresAt !== undefined) {
      updateData.expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : null;
    }
    const campaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: updateData
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
    requireFields(req.body, ["title"]);

    const existing = await prisma.assessment.findUnique({ where: { campaignId: campaign.id } });

    if (existing) {
      const validMcqIds = (req.body.mcqQuestions || []).map(q => q.id).filter(id => typeof id === 'string' && id.startsWith('c'));
      const validCodingIds = (req.body.codingQuestions || []).map(q => q.id).filter(id => typeof id === 'string' && id.startsWith('c'));

      try {
        const assessment = await prisma.assessment.update({
          where: { id: existing.id },
          data: {
            title: req.body.title,
            durationMinutes: Number(req.body.durationMinutes || 0),
            mcqDurationMinutes: req.body.mcqDurationMinutes ? Number(req.body.mcqDurationMinutes) : null,
            codingDurationMinutes: req.body.codingDurationMinutes ? Number(req.body.codingDurationMinutes) : null,
            instructions: req.body.instructions,
            mcqQuestions: {
              deleteMany: { id: { notIn: validMcqIds } },
              upsert: (req.body.mcqQuestions || []).map((question) => ({
                where: { id: (typeof question.id === 'string' && question.id.startsWith('c')) ? question.id : 'non-existent' },
                update: {
                  slotIndex: Number(question.slotIndex || 0),
                  prompt: question.prompt,
                  options: question.options,
                  correctKey: String(question.correctKey),
                  points: Number(question.points || 1)
                },
                create: {
                  slotIndex: Number(question.slotIndex || 0),
                  prompt: question.prompt,
                  options: question.options,
                  correctKey: String(question.correctKey),
                  points: Number(question.points || 1)
                }
              }))
            },
            codingQuestions: {
              deleteMany: { id: { notIn: validCodingIds } },
              upsert: (req.body.codingQuestions || []).map((question) => ({
                where: { id: (typeof question.id === 'string' && question.id.startsWith('c')) ? question.id : 'non-existent' },
                update: {
                  slotIndex: Number(question.slotIndex || 0),
                  title: question.title,
                  statement: question.statement,
                  difficulty: question.difficulty || "Medium",
                  language: question.language || "javascript",
                  constraints: question.constraints,
                  points: Number(question.points || 10),
                  testCases: {
                    deleteMany: {},
                    create: (question.testCases || []).map((testCase) => ({
                      input: testCase.input || "",
                      expectedOutput: testCase.expectedOutput || "",
                      isHidden: Boolean(testCase.isHidden)
                    }))
                  }
                },
                create: {
                  slotIndex: Number(question.slotIndex || 0),
                  title: question.title,
                  statement: question.statement,
                  difficulty: question.difficulty || "Medium",
                  language: question.language || "javascript",
                  constraints: question.constraints,
                  points: Number(question.points || 10),
                  testCases: {
                    create: (question.testCases || []).map((testCase) => ({
                      input: testCase.input || "",
                      expectedOutput: testCase.expectedOutput || "",
                      isHidden: Boolean(testCase.isHidden)
                    }))
                  }
                }
              }))
            }
          },
          include: { mcqQuestions: true, codingQuestions: { include: { testCases: true } } }
        });
        return sendOk(res, { assessment });
      } catch (e) {
        if (e.code === 'P2003') {
          const error = new Error("Cannot delete questions that have already been answered by candidates.");
          error.statusCode = 400;
          throw error;
        }
        throw e;
      }
    }

    const assessment = await prisma.assessment.create({
      data: {
        campaignId: campaign.id,
        title: req.body.title,
        durationMinutes: Number(req.body.durationMinutes || 0),
        mcqDurationMinutes: req.body.mcqDurationMinutes ? Number(req.body.mcqDurationMinutes) : null,
        codingDurationMinutes: req.body.codingDurationMinutes ? Number(req.body.codingDurationMinutes) : null,
        instructions: req.body.instructions,
        mcqQuestions: {
          create: (req.body.mcqQuestions || []).map((question) => ({
            slotIndex: Number(question.slotIndex || 0),
            prompt: question.prompt,
            options: question.options,
            correctKey: String(question.correctKey),
            points: Number(question.points || 1)
          }))
        },
        codingQuestions: {
          create: (req.body.codingQuestions || []).map((question) => ({
            slotIndex: Number(question.slotIndex || 0),
            title: question.title,
            statement: question.statement,
            difficulty: question.difficulty || "Medium",
            language: question.language || "javascript",
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

  router.patch("/companies/mine", ...recruiter, asyncHandler(async (req, res) => {
    const { name, website } = req.body;
    const updateData = {};
    if (name && typeof name === "string") updateData.name = name.trim();
    if (website !== undefined) updateData.website = website;

    const company = await prisma.company.update({
      where: { id: req.user.companyId },
      data: updateData
    });
    sendOk(res, { company });
  }));
}

module.exports = createCampaignRoutes;

