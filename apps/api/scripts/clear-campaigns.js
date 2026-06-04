const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearCampaigns() {
  console.log("Starting DB cleanup...");

  // Delete all dependent records first to avoid foreign key constraint errors
  await prisma.submission.deleteMany({});
  await prisma.proctorEvent.deleteMany({});
  await prisma.mcqAnswer.deleteMany({});
  await prisma.assessmentResult.deleteMany({});
  await prisma.assessmentSession.deleteMany({});
  await prisma.testCase.deleteMany({});
  await prisma.codingQuestion.deleteMany({});
  await prisma.mcqQuestion.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.inviteLink.deleteMany({});
  await prisma.interviewFeedback.deleteMany({});
  await prisma.interviewSlot.deleteMany({});
  await prisma.notification.deleteMany({});
  
  const deleted = await prisma.campaign.deleteMany({});
  console.log(`Deleted ${deleted.count} campaigns and all associated data. Users and Companies are preserved.`);
}

clearCampaigns()
  .catch(e => {
    console.error("Error during cleanup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Cleanup complete.");
  });
