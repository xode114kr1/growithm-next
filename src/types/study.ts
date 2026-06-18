import type { ScoreTier } from "@/types/score";
import type { ProblemPlatform } from "@/generated/prisma/enums";

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

export type StudyOwnerData = {
  members: OwnerMember[];
  pendingInvites: OwnerInvite[];
  study: OwnerStudy;
};

export type StudyProblem = {
  categories: string[];
  code: string;
  description: string | null;
  id: string;
  link: string | null;
  memo: string | null;
  platform: string;
  score: number | null;
  scoreMax: number | null;
  sharedAtLabel: string;
  sharedAtTime: number;
  sharedBy: string;
  solutionCode: string | null;
  status: import("@/generated/prisma/enums").ProblemSubmissionStatus;
  submittedAtText: string | null;
  tier: string | null;
  title: string;
};

export type StudyProblemFilterOptions = {
  memberNames: string[];
  tiers: string[];
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
