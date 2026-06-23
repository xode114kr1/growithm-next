"use server";

import { revalidatePath } from "next/cache";

import {
  acceptFriendRequest,
  cancelFriendRequest,
  deleteFriend,
  rejectFriendRequest,
  sendFriendRequest,
} from "@/server/friends/friend.command.service";
import { getCurrentUserId } from "@/lib/session/session";

// 폼에서 대상 사용자 ID를 읽어 친구 요청 Server Action을 실행한다.
export async function sendFriendRequestAction(formData: FormData) {
  const targetUserId = getFormValue(formData, "targetUserId");
  const userId = await getCurrentUserId();

  if (!userId || !targetUserId) {
    return;
  }

  await sendFriendRequest({ requesterId: userId, targetUserId });
  revalidatePath("/friend");
}

// 인증된 사용자가 보낸 친구 요청을 취소하고 친구 페이지 캐시를 갱신한다.
export async function cancelFriendRequestAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const requestId = getFormValue(formData, "requestId");

  if (!userId || !requestId) {
    return;
  }

  await cancelFriendRequest({ requesterId: userId, requestId });
  revalidatePath("/friend");
}

// 인증된 사용자가 받은 친구 요청을 거절하고 친구 페이지 캐시를 갱신한다.
export async function rejectFriendRequestAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const requestId = getFormValue(formData, "requestId");

  if (!userId || !requestId) {
    return;
  }

  await rejectFriendRequest({ addresseeId: userId, requestId });
  revalidatePath("/friend");
}

// 인증된 사용자가 받은 친구 요청을 수락하고 친구 페이지 캐시를 갱신한다.
export async function acceptFriendRequestAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const requestId = getFormValue(formData, "requestId");

  if (!userId || !requestId) {
    return;
  }

  await acceptFriendRequest({ addresseeId: userId, requestId });
  revalidatePath("/friend");
}

// 인증된 사용자의 친구 관계를 삭제하고 친구 페이지 캐시를 갱신한다.
export async function deleteFriendAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const friendUserId = getFormValue(formData, "friendUserId");

  if (!userId || !friendUserId) {
    return;
  }

  await deleteFriend({ currentUserId: userId, friendUserId });
  revalidatePath("/friend");
}

// FormData 값을 문자열로 정규화한다.
function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}
