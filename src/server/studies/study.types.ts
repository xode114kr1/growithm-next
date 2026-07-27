import "server-only";

import type {
  OwnerMember,
  StudyMember,
  StudyMemberFilters,
  StudyProblemDetail,
  StudyProblemListItem,
} from "@/types/study";

export type ProblemShareTargetStudyRow = {
  _count: { members: number };
  id: string;
  owner: { name: string | null };
  problemShares: { id: string }[];
  score: number;
  title: string;
};

export type StudyInviteItemRow = {
  createdAt: Date;
  id: string;
  invitedBy: {
    image: string | null;
    name: string | null;
  };
  study: { title: string };
};

export type StudyLayoutRow = {
  id: string;
  ownerId: string;
  title: string;
};

export type StudyListItemRow = {
  _count: { members: number };
  description: string | null;
  id: string;
  owner: { name: string | null };
  ownerId: string;
  score: number;
  title: string;
};

export type StudySummaryRow = {
  description: string | null;
  id: string;
  score: number;
  title: string;
};

export type StudyStatsRow = {
  members: { userId: string }[];
};

export type StudyProblemShareCounts = {
  totalSolved: number;
  weeklySolved: number;
};

export type StudyContributionRow = {
  members: {
    user: { name: string | null };
    userId: string;
  }[];
};

export type StudyContributionScoreRow = {
  _sum: { score: number | null };
  userId: string;
};

export type StudyMemberPreviewRow = {
  members: {
    user: {
      image: string | null;
      name: string | null;
    };
    userId: string;
  }[];
  ownerId: string;
};

export type StudyMemberActivityRow = {
  _max: { sharedAt: Date | null };
  _sum: { score: number | null };
  userId: string;
};

export type StudyMemberRow = {
  id: string;
  joinedAt: Date;
  role: StudyMember["role"];
  user: {
    image: string | null;
    name: string | null;
  };
  userId: string;
};

export type StudyMembersInput = {
  activities: StudyMemberActivityRow[];
  members: StudyMemberRow[];
  sort: StudyMemberFilters["sort"];
};

export type StudyRecentProblemRow = {
  problemSubmission: {
    platform: string;
    tier: string | null;
    title: string;
  };
  user: { name: string | null };
};

export type OwnedStudyRow = {
  description: string | null;
  id: string;
  title: string;
};

export type OwnedStudyMembersRow = {
  createdAt: Date;
  members: {
    id: string;
    joinedAt: Date;
    role: OwnerMember["role"];
    user: {
      image: string | null;
      name: string | null;
    };
    userId: string;
  }[];
  owner: {
    image: string | null;
    name: string | null;
  };
  ownerId: string;
};

export type OwnedStudyMembersInput = {
  activities: StudyMemberActivityRow[];
  study: OwnedStudyMembersRow;
  userId: string;
};

export type OwnedStudyInviteRow = {
  id: string;
  target: string;
};

export type StudyProblemListItemRow = {
  problemSubmission: {
    categories: unknown;
    id: string;
    platform: string;
    problemId: string;
    status: StudyProblemListItem["status"];
    tier: string | null;
    title: string;
  };
  sharedAt: Date;
  user: { name: string | null };
};

export type StudyProblemDetailRow = {
  problemSubmission: {
    categories: unknown;
    code: string | null;
    description: string | null;
    id: string;
    link: string | null;
    memo: string | null;
    platform: string;
    problemId: string;
    score: number | null;
    scoreMax: number | null;
    status: StudyProblemDetail["status"];
    submittedAtText: string | null;
    tier: string | null;
    title: string;
  };
  sharedAt: Date;
  user: { name: string | null };
};

export type StudyProblemMemberRow = {
  name: string | null;
};

export type StudyProblemTierRow = {
  tier: string | null;
};

export type StudyProblemPage = {
  hasNextPage: boolean;
  items: StudyProblemListItem[];
  nextCursor: string | null;
};
