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
