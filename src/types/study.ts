import type { ScoreTier } from "@/types/score";
import type { ProblemPlatform } from "@/generated/prisma/enums";
import type {
  InfiniteScrollRequest,
  InfiniteScrollResponse,
} from "@/types/infinite-scroll";

export type StudyTier = ScoreTier;

export type StudyListItem = {
  description: string;
  id: string;
  isOwner: boolean;
  memberCount: number;
  ownerName: string;
  progress: number;
  progressLabel: string;
  score: number;
  tier: StudyTier;
  title: string;
};

export type StudyInviteItem = {
  id: string;
  invitedByName: string;
  studyTitle: string;
  timeLabel: string;
};

export type StudyMember = {
  contribution: number;
  id: string;
  joinedAt: string;
  joinedAtTime: number;
  lastActive: string;
  lastActiveTime: number;
  name: string;
  role: "OWNER" | "LEADER" | "MEMBER";
  userId: string;
};

export type StudyMemberRoleFilter = "ALL" | StudyMember["role"];
export type StudyMemberSort =
  | "contribution"
  | "lastActive"
  | "joinedAt"
  | "name";

export type StudyMemberFilters = {
  q: string;
  role: StudyMemberRoleFilter;
  sort: StudyMemberSort;
};

export type StudyOverviewSummary = {
  description: string;
  id: string;
  name: string;
  nextTierScore: number;
  score: number;
  tier: StudyTier;
};

export type StudyOverviewStats = {
  memberCount: number;
  totalSolved: number;
  weeklySolved: number;
};

export type StudyContributionItem = {
  name: string;
  score: number;
};

export type StudyOverviewMember = {
  name: string;
  role: "owner" | "member";
};

export type StudyRecentProblem = {
  platform: string;
  solvedBy: string;
  tier: string;
  title: string;
};

export type OwnerStudy = {
  description: string;
  id: string;
  name: string;
};

export type OwnerMember = {
  contribution: number;
  id: string;
  isCurrentUser: boolean;
  joinedAt: string;
  lastActive: string;
  name: string;
  role: "OWNER" | "LEADER" | "MEMBER";
};

export type OwnerInvite = {
  id: string;
  status: "Pending";
  target: string;
};

export type StudyProblemListItem = {
  categories: string[];
  code: string;
  id: string;
  platform: string;
  sharedAtLabel: string;
  sharedBy: string;
  status: import("@/generated/prisma/enums").ProblemSubmissionStatus;
  tier: string | null;
  title: string;
};

export type StudyProblemDetail = StudyProblemListItem & {
  description: string | null;
  link: string | null;
  memo: string | null;
  score: number | null;
  scoreMax: number | null;
  solutionCode: string | null;
  submittedAtText: string | null;
};

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

export type StudyProblemInfiniteScrollFilters = Omit<
  StudyProblemFilters,
  "sort"
>;

export type StudyProblemInfiniteScrollRequest = InfiniteScrollRequest<
  StudyProblemInfiniteScrollFilters,
  StudyProblemSort
>;

export type StudyProblemInfiniteScrollResponse =
  InfiniteScrollResponse<StudyProblemListItem>;

export type StudyProblemPageSearchParams = {
  member?: string | string[];
  platform?: string | string[];
  sort?: string | string[];
  tier?: string | string[];
};

export type StudyLayoutData = {
  id: string;
  isOwner: boolean;
  name: string;
};

export type ProblemShareTargetStudy = {
  hasShared: boolean;
  id: string;
  memberCount: number;
  ownerName: string;
  score: number;
  title: string;
};
