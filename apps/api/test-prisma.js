const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const campaigns = await prisma.campaign.findMany({
    include: {
      assessment: {
        include: {
          sessions: {
            select: {
              _count: {
                select: { proctorEvents: true }
              }
            }
          }
        }
      }
    }
  });
  console.log(JSON.stringify(campaigns, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
