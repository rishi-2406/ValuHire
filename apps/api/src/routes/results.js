const { asyncHandler, sendOk } = require("../lib/http");

function createResultsRoutes({ router, prisma, middleware }) {
  router.get("/results/campaigns/:campaignId", middleware.requireAuth, middleware.requireApprovedCompany, asyncHandler(async (req, res) => {
    const campaign = await prisma.campaign.findUnique({ where: { id: req.params.campaignId }, include: { assessment: true } });
    if (!campaign || campaign.companyId !== req.user.companyId) {
      const error = new Error("Campaign not found");
      error.statusCode = 404;
      throw error;
    }
    const results = await prisma.assessmentResult.findMany({
      where: { assessmentId: campaign.assessment?.id },
      include: { session: { include: { candidate: true, proctorEvents: true } } },
      orderBy: [
        { totalScore: "desc" },
        { codingDurationSeconds: "asc" },
        { mcqDurationSeconds: "asc" }
      ]
    });
    sendOk(res, {
      results: results.map((result, index) => ({
        ...result,
        rank: index + 1,
        proctorEventCount: result.session.proctorEvents.length
      }))
    });
  }));

  router.get("/results/:id", middleware.requireAuth, asyncHandler(async (req, res) => {
    const result = await prisma.assessmentResult.findUnique({
      where: { id: req.params.id },
      include: { session: { include: { candidate: true, submissions: true, mcqAnswers: true, proctorEvents: true } } }
    });
    if (!result) {
      const error = new Error("Result not found");
      error.statusCode = 404;
      throw error;
    }
    if (req.user.role === "CANDIDATE" && result.candidateId !== req.user.id) {
      const error = new Error("Cannot view another candidate result");
      error.statusCode = 403;
      throw error;
    }
    sendOk(res, { result });
  }));

  router.get("/results/me/history", middleware.requireAuth, middleware.requireRole("CANDIDATE"), asyncHandler(async (req, res) => {
    const results = await prisma.assessmentResult.findMany({
      where: { candidateId: req.user.id },
      include: { 
        session: { 
          include: { 
            assessment: { 
              include: { 
                campaign: { include: { company: true } },
                mcqQuestions: true,
                codingQuestions: true
              } 
            },
            submissions: true,
            mcqAnswers: true,
            proctorEvents: true
          } 
        } 
      },
      orderBy: { createdAt: "desc" }
    });

    const resultsWithRanks = await Promise.all(results.map(async (r) => {
      const allResults = await prisma.assessmentResult.findMany({
        where: { assessmentId: r.assessmentId },
        orderBy: [
          { totalScore: "desc" },
          { codingDurationSeconds: "asc" },
          { mcqDurationSeconds: "asc" }
        ],
        select: { id: true }
      });
      const rank = allResults.findIndex(ar => ar.id === r.id) + 1;
      return { ...r, rank, totalApplicants: allResults.length };
    }));

    sendOk(res, { results: resultsWithRanks });
  }));
}

module.exports = createResultsRoutes;

