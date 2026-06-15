import type { PersonalScoreTier } from "@/types/user";

export type FriendListFilter = "friends" | "received" | "sent";

export type FriendRelationStatus =
  | "friend"
  | "received_request"
  | "sent_request"
  | "none";

export type FriendProfile = {
  avatar: string;
  id: string;
  name: string;
  relationStatus: FriendRelationStatus;
  tier: PersonalScoreTier;
};

export type FriendRequest = FriendProfile & {
  requestId: string;
  relationStatus: "received_request" | "sent_request";
};

export type FriendSearchResult = FriendProfile & {
  requestId?: string;
};
