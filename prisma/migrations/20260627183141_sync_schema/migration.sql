/*
  Warnings:

  - Made the column `durationSeconds` on table `AssessmentResult` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ApplicationStatus" ADD VALUE 'INTERVIEW_COMPLETED';
ALTER TYPE "ApplicationStatus" ADD VALUE 'SHORTLISTED';

-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "codingDurationMinutes" INTEGER,
ADD COLUMN     "mcqDurationMinutes" INTEGER;

-- AlterTable
ALTER TABLE "AssessmentResult" ADD COLUMN     "codingDurationSeconds" INTEGER,
ADD COLUMN     "mcqDurationSeconds" INTEGER,
ADD COLUMN     "testCasesPassed" INTEGER,
ADD COLUMN     "testCasesTotal" INTEGER,
ADD COLUMN     "totalApplicants" INTEGER,
ALTER COLUMN "durationSeconds" SET NOT NULL,
ALTER COLUMN "durationSeconds" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "AssessmentSession" ADD COLUMN     "selectedVariants" JSONB;

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "durationDays" INTEGER,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "interviewQuestions" JSONB,
ADD COLUMN     "requiredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "targetRole" TEXT;

-- AlterTable
ALTER TABLE "CodingQuestion" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'javascript',
ADD COLUMN     "slotIndex" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "McqQuestion" ADD COLUMN     "slotIndex" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "codeforcesUrl" TEXT,
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "leetcodeUrl" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "portfolioUrl" TEXT;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
