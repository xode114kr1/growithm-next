import "server-only";

import {
  createPersonalTier,
  createUserSummary,
} from "@/services/users/user.helper";
import { findFriendRelationsForUserIds } from "@/services/friends/friend.persistence.server";
import {
  findUserProfile,
  findUsersByQuery,
  findUserScore,
} from "@/services/users/user.persistence.server";
import type {
  FriendRelationStatus,
  FriendSearchResult,
} from "@/types/friend";
import type { UserPersonalTier, UserProfile } from "@/types/user";

// 사용자의 점수를 조회해 개인 티어 정보를 만든다.
export async function getUserPersonalTier(
  userId: string | undefined,
): Promise<UserPersonalTier> {
  if (!userId) {
    return createPersonalTier(0);
  }

  const user = await findUserScore(userId);

  return createPersonalTier(user?.score ?? 0);
}

// 사용자 프로필 모달에 표시할 정보를 조회한다.
export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  const user = await findUserProfile(userId);

  if (!user) {
    return null;
  }

  return {
    ...createUserSummary(user),
    score: user.score,
    solvedCount: user._count.problemSubmissions,
  };
}

// 검색어와 일치하는 사용자 목록을 현재 사용자 제외 후 조회한다.
export async function searchUsersWithRelation({
  excludedUserId,
  query,
}: {
  excludedUserId: string;
  query: string;
}): Promise<FriendSearchResult[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const users = await findUsersByQuery({
    excludedUserId,
    limit: 12,
    query: normalizedQuery,
  });
  const userSummaries = users.map(createUserSummary);
  const { friendships, receivedRequests, sentRequests } =
    await findFriendRelationsForUserIds({
      userId: excludedUserId,
      userIds: userSummaries.map((user) => user.id),
    });
  const relationStatusByUserId = new Map<string, FriendRelationStatus>();
  const requestIdByUserId = new Map<string, string>();

  for (const friendship of friendships) {
    relationStatusByUserId.set(
      friendship.userAId === excludedUserId
        ? friendship.userBId
        : friendship.userAId,
      "friend",
    );
  }

  for (const request of receivedRequests) {
    relationStatusByUserId.set(request.requesterId, "received_request");
    requestIdByUserId.set(request.requesterId, request.id);
  }

  for (const request of sentRequests) {
    relationStatusByUserId.set(request.addresseeId, "sent_request");
    requestIdByUserId.set(request.addresseeId, request.id);
  }

  return userSummaries.map((user) => ({
    ...user,
    relationStatus: relationStatusByUserId.get(user.id) ?? "none",
    requestId: requestIdByUserId.get(user.id),
  }));
}
