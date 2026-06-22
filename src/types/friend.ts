import type { PersonalScoreTier } from "@/types/user";
import type { InfiniteScrollResponse } from "@/types/infinite-scroll";

export type FriendFiltersState = {
  query: string;
};

export type FriendPageSearchParams = {
  query?: string | string[];
};

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

export type FriendInfiniteScrollResponse =
  InfiniteScrollResponse<FriendProfile>;
