import type {
  ProblemPlatform,
  ProblemSubmissionStatus,
} from "@/generated/prisma/enums";
import type {
  InfiniteScrollRequest,
  InfiniteScrollResponse,
} from "@/types/infinite-scroll";

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

export type ProblemInfiniteScrollFilters = Omit<
  ProblemFiltersState,
  "sort"
>;

export type ProblemInfiniteScrollRequest = InfiniteScrollRequest<
  ProblemInfiniteScrollFilters,
  ProblemSort
>;

export type ProblemInfiniteScrollItem = Omit<
  ProblemListItem,
  "createdAt"
> & {
  createdAt: string;
};

export type ProblemInfiniteScrollResponse =
  InfiniteScrollResponse<ProblemInfiniteScrollItem>;

export type ProblemPageSearchParams = {
  platform?: string | string[];
  q?: string | string[];
  sort?: string | string[];
  tier?: string | string[];
};

export type ProblemDetail = {
  accuracy: number | null;
  categories: string[];
  code: string | null;
  createdAt: Date;
  description: string | null;
  id: string;
  link: string | null;
  memory: string | null;
  memo: string | null;
  platform: string;
  problemId: string;
  score: number | null;
  scoreMax: number | null;
  status: ProblemSubmissionStatus;
  submittedAtText: string | null;
  tier: string | null;
  time: string | null;
  title: string;
  updatedAt: Date;
};

export type ProblemShareResult = {
  error: string | null;
  newStudyIds: string[];
  skippedCount: number;
};

export type ProblemTierBucketName =
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "DIAMOND"
  | "RUBY";

export type ProblemTierBucket = {
  solved: number;
  tier: ProblemTierBucketName;
};

export type PendingProblem = {
  id: string;
  platform: ProblemPlatform;
  problemId: string;
  submittedAtText: string;
  tier: string;
  title: string;
};

export type PlatformProblemCount = {
  platform: ProblemPlatform;
  problemCount: number;
};
