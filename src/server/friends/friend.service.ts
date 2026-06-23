import "server-only";

import {
  acceptFriendship,
  countFriendUsers,
  deleteFriendship,
  deleteSentFriendRequest,
  findFriendshipAndReceivedRequest,
  findFriendRelationsForUserIds,
  findFriendUsers,
  findReceivedFriendRequest,
  findReceivedFriendRequests,
  findSentFriendRequests,
  findUserById,
  rejectReceivedFriendRequest,
  upsertFriendRequest,
} from "@/server/friends/friend.repository";
import { createFriendProfile } from "@/server/friends/friend.mapper";
import type {
  FriendFiltersState,
  FriendRequest,
} from "@/types/friend";

export const FRIEND_PAGE_SIZE = 10;

// 현재 사용자의 친구 목록을 화면용 프로필 데이터로 조회한다.
export async function getFriends({
  filters,
  page = 1,
  userId,
}: {
  filters: FriendFiltersState;
  page?: number;
  userId: string | undefined;
}) {
  if (!userId) {
    return [];
  }

  const friendships = await findFriendUsers({
    page,
    pageSize: FRIEND_PAGE_SIZE,
    query: filters.query,
    userId,
  });

  return friendships.map((friendship) =>
    createFriendProfile(
      friendship.userAId === userId ? friendship.userB : friendship.userA,
      "friend",
    ),
  );
}

// 현재 사용자의 검색 조건에 맞는 친구 수를 조회한다.
export async function getFriendCount({
  filters,
  userId,
}: {
  filters: FriendFiltersState;
  userId: string | undefined;
}) {
  if (!userId) {
    return 0;
  }

  return countFriendUsers({
    query: filters.query,
    userId,
  });
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

export async function getFriendRelationsForUserIds({
  userId,
  userIds,
}: {
  userId: string;
  userIds: string[];
}) {
  return findFriendRelationsForUserIds({ userId, userIds });
}

// 대상 사용자에게 중복되지 않는 친구 요청을 전송한다.
export async function sendFriendRequest({
  requesterId,
  targetUserId,
}: {
  requesterId: string;
  targetUserId: string;
}) {
  if (requesterId === targetUserId) {
    return;
  }

  const targetUser = await findUserById(targetUserId);

  if (!targetUser) {
    return;
  }

  const friendPair = normalizeFriendshipUserIds(requesterId, targetUserId);
  const { existingFriendship, receivedRequest } =
    await findFriendshipAndReceivedRequest({
      friendPair,
      requesterId,
      targetUserId,
    });

  if (existingFriendship || receivedRequest) {
    return;
  }

  await upsertFriendRequest({ requesterId, targetUserId });
}

// 현재 사용자가 보낸 친구 요청을 취소한다.
export async function cancelFriendRequest({
  requesterId,
  requestId,
}: {
  requesterId: string;
  requestId: string;
}) {
  await deleteSentFriendRequest({ requesterId, requestId });
}

// 현재 사용자가 받은 친구 요청을 거절한다.
export async function rejectFriendRequest({
  addresseeId,
  requestId,
}: {
  addresseeId: string;
  requestId: string;
}) {
  await rejectReceivedFriendRequest({ addresseeId, requestId });
}

// 받은 친구 요청을 수락하고 친구 관계를 생성한다.
export async function acceptFriendRequest({
  addresseeId,
  requestId,
}: {
  addresseeId: string;
  requestId: string;
}) {
  const request = await findReceivedFriendRequest({ addresseeId, requestId });

  if (!request || request.requesterId === addresseeId) {
    return;
  }

  await acceptFriendship({
    addresseeId,
    friendPair: normalizeFriendshipUserIds(addresseeId, request.requesterId),
    requesterId: request.requesterId,
  });
}

// 현재 사용자와 대상 사용자의 친구 관계를 삭제한다.
export async function deleteFriend({
  currentUserId,
  friendUserId,
}: {
  currentUserId: string;
  friendUserId: string;
}) {
  await deleteFriendship(
    normalizeFriendshipUserIds(currentUserId, friendUserId),
  );
}

function normalizeFriendshipUserIds(
  firstUserId: string,
  secondUserId: string,
) {
  const [userAId, userBId] = [firstUserId, secondUserId].sort();

  return { userAId, userBId };
}
