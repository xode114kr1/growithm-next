import "server-only";

import {
  acceptFriendRequestRecord,
  createFriendRequest,
  deleteFriendship,
  deleteSentFriendRequest,
  findFriendRequest,
  findFriendship,
  rejectReceivedFriendRequest,
} from "@/server/friends/friend.repository";
import { findUserById } from "@/server/users/user.repository";

// 대상 사용자에게 중복되지 않는 친구 요청을 전송한다.
export async function sendFriendRequest({
  requesterId,
  targetUserId,
}: {
  requesterId: string;
  targetUserId: string;
}) {
  // 본인에게 보내는 요청인지 확인
  if (requesterId === targetUserId) {
    return;
  }

  // 요청 대상 사용자가 존재하는지 확인
  const targetUser = await findUserById(targetUserId);

  if (!targetUser) {
    return;
  }

  // 이미 친구 관계인지 확인
  const friendPair = createSortedFriendPair(requesterId, targetUserId);
  const existingFriendship = await findFriendship(friendPair);

  if (existingFriendship) {
    return;
  }

  // 상대방에게 받은 친구 요청이 있는지 확인
  const receivedRequest = await findFriendRequest({
    addresseeId: requesterId,
    requesterId: targetUserId,
  });

  if (receivedRequest) {
    return;
  }

  await createFriendRequest({ requesterId, targetUserId });
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
  await acceptFriendRequestRecord({ addresseeId, requestId });
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
    createSortedFriendPair(currentUserId, friendUserId),
  );
}

function createSortedFriendPair(
  firstUserId: string,
  secondUserId: string,
) {
  const [userAId, userBId] = [firstUserId, secondUserId].sort();

  return { userAId, userBId };
}
