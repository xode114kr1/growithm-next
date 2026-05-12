-- AlterTable
ALTER TABLE "study_invites" ADD COLUMN "target_user_id" TEXT;

-- Backfill from the existing invite target where possible.
UPDATE "study_invites" AS invite
SET "target_user_id" = "users"."id"
FROM "users"
WHERE invite."target_user_id" IS NULL
  AND (invite."target" = "users"."email" OR invite."target" = "users"."name");

-- Existing unresolved string-only invites cannot be accepted safely after target users become required.
DELETE FROM "study_invites" WHERE "target_user_id" IS NULL;

-- AlterTable
ALTER TABLE "study_invites" ALTER COLUMN "target_user_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "study_invites_study_id_target_user_id_key" ON "study_invites"("study_id", "target_user_id");

-- CreateIndex
CREATE INDEX "study_invites_target_user_id_idx" ON "study_invites"("target_user_id");

-- AddForeignKey
ALTER TABLE "study_invites" ADD CONSTRAINT "study_invites_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
