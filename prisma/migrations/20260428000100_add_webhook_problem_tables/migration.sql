-- CreateEnum
CREATE TYPE "ProblemPlatform" AS ENUM ('baekjoon', 'programmers');

-- CreateEnum
CREATE TYPE "WebhookDeliveryStatus" AS ENUM ('received', 'ignored', 'processed', 'no_readme', 'parse_failed', 'fetch_failed', 'failed');

-- CreateTable
CREATE TABLE "webhook_deliveries" (
    "id" TEXT NOT NULL,
    "delivery_id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "repository_full_name" TEXT,
    "payload" JSONB NOT NULL,
    "status" "WebhookDeliveryStatus" NOT NULL DEFAULT 'received',
    "error_message" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_submissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "webhook_delivery_id" TEXT,
    "repository_full_name" TEXT NOT NULL,
    "commit_sha" TEXT NOT NULL,
    "readme_path" TEXT NOT NULL,
    "platform" "ProblemPlatform" NOT NULL,
    "problem_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tier" TEXT,
    "link" TEXT,
    "memory" TEXT,
    "time" TEXT,
    "categories" JSONB,
    "accuracy" DOUBLE PRECISION,
    "score" DOUBLE PRECISION,
    "score_max" DOUBLE PRECISION,
    "submitted_at_text" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webhook_deliveries_delivery_id_key" ON "webhook_deliveries"("delivery_id");

-- CreateIndex
CREATE INDEX "webhook_deliveries_event_idx" ON "webhook_deliveries"("event");

-- CreateIndex
CREATE INDEX "webhook_deliveries_repository_full_name_idx" ON "webhook_deliveries"("repository_full_name");

-- CreateIndex
CREATE INDEX "webhook_deliveries_status_idx" ON "webhook_deliveries"("status");

-- CreateIndex
CREATE UNIQUE INDEX "problem_submissions_repository_full_name_commit_sha_readme_path_key" ON "problem_submissions"("repository_full_name", "commit_sha", "readme_path");

-- CreateIndex
CREATE INDEX "problem_submissions_user_id_idx" ON "problem_submissions"("user_id");

-- CreateIndex
CREATE INDEX "problem_submissions_webhook_delivery_id_idx" ON "problem_submissions"("webhook_delivery_id");

-- CreateIndex
CREATE INDEX "problem_submissions_platform_problem_id_idx" ON "problem_submissions"("platform", "problem_id");

-- AddForeignKey
ALTER TABLE "problem_submissions" ADD CONSTRAINT "problem_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_submissions" ADD CONSTRAINT "problem_submissions_webhook_delivery_id_fkey" FOREIGN KEY ("webhook_delivery_id") REFERENCES "webhook_deliveries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
