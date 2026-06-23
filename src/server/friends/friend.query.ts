import "server-only";

import {
  countFriendUsers,
  findFriendUsers,
  findReceivedFriendRequests,
  findSentFriendRequests,
} from "@/server/friends/friend.persistence.server";
import { createFriendProfile } from "@/server/friends/friend.helper";
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
