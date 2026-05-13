import type {
  ProblemPlatform,
  ProblemSubmissionStatus,
} from "@/generated/prisma/enums";

export type ProblemSort = "newest" | "oldest" | "title" | "platform";

export type ProblemFiltersState = {
  platform: ProblemPlatform | null;
  q: string;
  sort: ProblemSort;
  tier: string;
};

export type ProblemEmptyStateReason = "no-submissions" | "no-filter-results";

export type ProblemListItem = {
  categories: string[];
  code: string;
  createdAt: Date;
  id: string;
  platform: string;
  problemId: string;
  status: ProblemSubmissionStatus;
  submittedAtText: string | null;
  tier: string | null;
  title: string;
};

export type ProblemPageSearchParams = {
  page?: string | string[];
  platform?: string | string[];
  q?: string | string[];
  sort?: string | string[];
  tier?: string | string[];
};
