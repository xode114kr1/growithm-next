import "server-only";

export type FriendUserRow = {
  email: string | null;
  id: string;
  image: string | null;
  name: string | null;
  score: number;
};

export type FriendshipRow = {
  userAId: string;
  userBId: string;
};

export type ReceivedFriendRequestRow = {
  id: string;
  requesterId: string;
};

export type SentFriendRequestRow = {
  addresseeId: string;
  id: string;
};
