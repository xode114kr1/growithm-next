import "server-only";

import type {
  FriendProfile,
  FriendRelationStatus,
  FriendSearchResult,
} from "@/types/friend";
import type {
  FriendSearchResultsInput,
  FriendUserRow,
} from "@/server/friends/friend.types";
import { getUserAvatar, getUserDisplayName } from "@/server/users/user.mapper";
import { getPersonalTier } from "@/utils/score";

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
    tier: getPersonalTier(user.score),
  };
}

// 사용자 요약과 친구 관계 조회 결과를 검색 결과로 합친다.
export function createFriendSearchResults({
  friendships,
  receivedRequests,
  sentRequests,
  userId,
  users,
}: FriendSearchResultsInput): FriendSearchResult[] {
  const relationStatusByUserId = new Map<string, FriendRelationStatus>();
  const requestIdByUserId = new Map<string, string>();

  for (const friendship of friendships) {
    const friendUserId =
      friendship.userAId === userId
        ? friendship.userBId
        : friendship.userAId;

    relationStatusByUserId.set(friendUserId, "friend");
  }

  for (const request of receivedRequests) {
    relationStatusByUserId.set(request.requesterId, "received_request");
    requestIdByUserId.set(request.requesterId, request.id);
  }

  for (const request of sentRequests) {
    relationStatusByUserId.set(request.addresseeId, "sent_request");
    requestIdByUserId.set(request.addresseeId, request.id);
  }

  return users.map((user) => ({
    ...user,
    relationStatus: relationStatusByUserId.get(user.id) ?? "none",
    requestId: requestIdByUserId.get(user.id),
  }));
}
