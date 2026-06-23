import "server-only";

import { normalizeFriendshipUserIds } from "@/server/friends/friend.helper";
import {
  acceptFriendship,
  deleteFriendship,
  deleteSentFriendRequest,
  findFriendshipAndReceivedRequest,
  findReceivedFriendRequest,
  findUserById,
  rejectReceivedFriendRequest,
  upsertFriendRequest,
} from "@/server/friends/friend.persistence.server";

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
