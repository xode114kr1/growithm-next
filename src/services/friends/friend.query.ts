import "server-only";

import {
  findFriendUsers,
  findFriendRelationsForUserIds,
  findReceivedFriendRequests,
  findSentFriendRequests,
} from "@/services/friends/friend.persistence.server";
import { createFriendProfile } from "@/services/friends/friend.helper";
import type {
  FriendRelationStatus,
  FriendRequest,
  FriendSearchResult,
} from "@/types/friend";
import type { UserSummary } from "@/types/user";

// 현재 사용자의 친구 목록을 화면용 프로필 데이터로 조회한다.
export async function getFriendUsers(userId: string | undefined) {
  if (!userId) {
    return [];
  }

  const friendships = await findFriendUsers(userId);

  return friendships.map((friendship) =>
    createFriendProfile(
      friendship.userAId === userId ? friendship.userB : friendship.userA,
      "friend",
    ),
  );
}

// 현재 사용자가 받은 대기 중인 친구 요청을 화면용 데이터로 조회한다.
export async function getReceivedFriendRequests(
  userId: string | undefined,
): Promise<FriendRequest[]> {
  if (!userId) {
    return [];
  }

  const requests = await findReceivedFriendRequests(userId);

  return requests.map((request) => ({
    ...createFriendProfile(request.requester, "received_request"),
    requestId: request.id,
    relationStatus: "received_request",
  }));
}

// 현재 사용자가 보낸 대기 중인 친구 요청을 화면용 데이터로 조회한다.
export async function getSentFriendRequests(
  userId: string | undefined,
): Promise<FriendRequest[]> {
  if (!userId) {
    return [];
  }

  const requests = await findSentFriendRequests(userId);

  return requests.map((request) => ({
    ...createFriendProfile(request.addressee, "sent_request"),
    requestId: request.id,
    relationStatus: "sent_request",
  }));
}

// 사용자 목록에 현재 사용자와의 친구 관계 상태를 결합한다.
export async function getFriendRelationsForUsers({
  users,
  userId,
}: {
  users: UserSummary[];
  userId: string | undefined;
}): Promise<FriendSearchResult[]> {
  if (!userId || users.length === 0) {
    return [];
  }

  const { friendships, receivedRequests, sentRequests } =
    await findFriendRelationsForUserIds({
      userId,
      userIds: users.map((user) => user.id),
    });
  const relationStatusByUserId = new Map<string, FriendRelationStatus>();
  const requestIdByUserId = new Map<string, string>();

  for (const friendship of friendships) {
    relationStatusByUserId.set(
      friendship.userAId === userId ? friendship.userBId : friendship.userAId,
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

  return users.map((user) => ({
    ...user,
    relationStatus: relationStatusByUserId.get(user.id) ?? "none",
    requestId: requestIdByUserId.get(user.id),
  }));
}
