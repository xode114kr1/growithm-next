export type FriendListFilter = "friends" | "received" | "sent";

export type FriendRelationStatus =
  | "friend"
  | "received_request"
  | "sent_request"
  | "none";

export type FriendProfile = {
  avatar: string;
  name: string;
  offline?: boolean;
  relationStatus: FriendRelationStatus;
  tier: string;
  tierClass: string;
};

export type FriendRequest = FriendProfile & {
  relationStatus: "received_request" | "sent_request";
};

export type FriendListMap = {
  friends: FriendProfile[];
  received: FriendRequest[];
  sent: FriendRequest[];
};

export type FriendPageData = {
  lists: FriendListMap;
};

export type FriendSearchFilter = {
  query: string;
  relationStatus?: FriendRelationStatus;
};

export type FriendListFilterState = {
  list: FriendListFilter;
  search: FriendSearchFilter;
};
