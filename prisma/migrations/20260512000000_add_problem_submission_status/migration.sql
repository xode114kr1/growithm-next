-- CreateEnum
CREATE TYPE "ProblemSubmissionStatus" AS ENUM ('pending', 'completed');

-- AlterTable
ALTER TABLE "problem_submissions"
ADD COLUMN "status" "ProblemSubmissionStatus" NOT NULL DEFAULT 'pending';

-- Backfill existing memo-written submissions as completed.
UPDATE "problem_submissions"
SET "status" = 'completed'
WHERE "memo" IS NOT NULL AND btrim("memo") <> '';

-- CreateIndex
CREATE INDEX "problem_submissions_status_idx" ON "problem_submissions"("status");
