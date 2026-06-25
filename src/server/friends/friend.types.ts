import "server-only";

export type FriendUserRow = {
  email: string | null;
  id: string;
  image: string | null;
  name: string | null;
  score: number;
};
