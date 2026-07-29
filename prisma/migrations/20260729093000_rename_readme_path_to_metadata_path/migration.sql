ALTER TABLE "problem_submissions"
RENAME COLUMN "readme_path" TO "metadata_path";

ALTER INDEX "problem_submissions_repository_full_name_commit_sha_readme__key"
RENAME TO "problem_submissions_repository_commit_metadata_key";
