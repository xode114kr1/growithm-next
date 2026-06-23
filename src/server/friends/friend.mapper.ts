import "server-only";

import type { FriendProfile } from "@/types/friend";
import { getUserAvatar, getUserDisplayName, getUserTier } from "@/server/users/user.helper";
import type { FriendUserRow } from "@/server/friends/friend.types";

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
