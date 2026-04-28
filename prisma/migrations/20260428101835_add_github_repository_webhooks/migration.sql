-- CreateTable
CREATE TABLE "github_repository_webhooks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "repository_full_name" TEXT NOT NULL,
    "hook_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "github_repository_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "github_repository_webhooks_repository_full_name_key" ON "github_repository_webhooks"("repository_full_name");

-- CreateIndex
CREATE INDEX "github_repository_webhooks_user_id_idx" ON "github_repository_webhooks"("user_id");

-- AddForeignKey
ALTER TABLE "github_repository_webhooks" ADD CONSTRAINT "github_repository_webhooks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "problem_submissions_repository_full_name_commit_sha_readme_path" RENAME TO "problem_submissions_repository_full_name_commit_sha_readme__key";
