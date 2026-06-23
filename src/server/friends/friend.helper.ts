import type { FriendProfile } from "@/types/friend";
import { getUserAvatar, getUserDisplayName, getUserTier } from "@/server/users/user.helper";

export type FriendUserRow = {
  email: string | null;
  id: string;
  image: string | null;
  name: string | null;
  score: number;
};

// 사용자 조회 결과를 친구 화면용 프로필 데이터로 변환한다.
export function createFriendProfile(
  user: FriendUserRow,
  relationStatus: FriendProfile["relationStatus"],
): FriendProfile {
  return {
    avatar: getUserAvatar(user.image),
    id: user.id,
    name: getUserDisplayName(user.name, user.email),
    relationStatus,
    tier: getUserTier(user.score),
  };
}

// 친구 관계의 두 사용자 ID를 일관된 순서로 정렬한다.
export function normalizeFriendshipUserIds(
  firstUserId: string,
  secondUserId: string,
) {
  const [userAId, userBId] = [firstUserId, secondUserId].sort();

  return { userAId, userBId };
}
