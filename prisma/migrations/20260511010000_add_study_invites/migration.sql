-- CreateEnum
CREATE TYPE "StudyInviteStatus" AS ENUM ('PENDING', 'CANCELED', 'ACCEPTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "study_invites" (
    "id" TEXT NOT NULL,
    "study_id" TEXT NOT NULL,
    "invited_by_id" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "status" "StudyInviteStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "study_invites_study_id_target_key" ON "study_invites"("study_id", "target");

-- CreateIndex
CREATE INDEX "study_invites_invited_by_id_idx" ON "study_invites"("invited_by_id");

-- CreateIndex
CREATE INDEX "study_invites_status_idx" ON "study_invites"("status");

-- AddForeignKey
ALTER TABLE "study_invites" ADD CONSTRAINT "study_invites_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_invites" ADD CONSTRAINT "study_invites_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
