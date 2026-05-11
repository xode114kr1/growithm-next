-- CreateTable
CREATE TABLE "studies" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_members" (
    "id" TEXT NOT NULL,
    "study_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_problem_shares" (
    "id" TEXT NOT NULL,
    "study_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "problem_submission_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shared_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_problem_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "studies_owner_id_idx" ON "studies"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "study_members_study_id_user_id_key" ON "study_members"("study_id", "user_id");

-- CreateIndex
CREATE INDEX "study_members_user_id_idx" ON "study_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "study_problem_shares_study_id_problem_submission_id_key" ON "study_problem_shares"("study_id", "problem_submission_id");

-- CreateIndex
CREATE INDEX "study_problem_shares_user_id_idx" ON "study_problem_shares"("user_id");

-- CreateIndex
CREATE INDEX "study_problem_shares_problem_submission_id_idx" ON "study_problem_shares"("problem_submission_id");

-- AddForeignKey
ALTER TABLE "studies" ADD CONSTRAINT "studies_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_members" ADD CONSTRAINT "study_members_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_members" ADD CONSTRAINT "study_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_problem_shares" ADD CONSTRAINT "study_problem_shares_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_problem_shares" ADD CONSTRAINT "study_problem_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_problem_shares" ADD CONSTRAINT "study_problem_shares_problem_submission_id_fkey" FOREIGN KEY ("problem_submission_id") REFERENCES "problem_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
