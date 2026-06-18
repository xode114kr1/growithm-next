import type { ProblemPlatform } from "@/generated/prisma/enums";

export type StudyProblemSort =
  | "latest"
  | "oldest"
  | "title"
  | "tier"
  | "member";

export type StudyProblemFilters = {
  member: string | null;
  platform: ProblemPlatform | null;
  sort: StudyProblemSort;
  tier: string | null;
};

export type StudyProblemPageSearchParams = {
  member?: string | string[];
  page?: string | string[];
  platform?: string | string[];
  sort?: string | string[];
  tier?: string | string[];
};
