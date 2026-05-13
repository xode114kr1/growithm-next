export type StudyTier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" | "Ruby";

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

export type StudyMembersData = {
  description: string;
  memberCount: number;
  members: StudyMember[];
  name: string;
};

export type StudyOverview = {
  contribution: Array<{ name: string; score: number }>;
  description: string;
  id: string;
  isOwner: boolean;
  memberCount: number;
  members: Array<{ name: string; role: "owner" | "member" }>;
  name: string;
  nextTierScore: number;
  recentProblems: Array<{
    platform: string;
    solvedBy: string;
    tier: string;
    title: string;
  }>;
  score: number;
  tier: StudyTier;
  totalSolved: number;
  weeklySolved: number;
};
