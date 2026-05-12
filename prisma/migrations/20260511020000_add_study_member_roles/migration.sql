-- CreateEnum
CREATE TYPE "StudyMemberRole" AS ENUM ('OWNER', 'LEADER', 'MEMBER');

-- AlterTable
ALTER TABLE "study_members" ADD COLUMN "role" "StudyMemberRole" NOT NULL DEFAULT 'MEMBER';
