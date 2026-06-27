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

export type FriendActionState = {
  error: string | null;
  status: "idle" | "error" | "success";
};

// 폼에서 대상 사용자 ID를 읽어 친구 요청 Server Action을 실행한다.
export async function sendFriendRequestAction(
  _prevState: FriendActionState,
  formData: FormData,
): Promise<FriendActionState> {
  const targetUserId = getFormValue(formData, "targetUserId");
  const userId = await getCurrentUserId();

  if (!userId) {
    return createErrorState("로그인이 필요합니다.");
  }

  if (!targetUserId) {
    return createErrorState("사용자 정보를 찾을 수 없습니다.");
  }

  try {
    await sendFriendRequest({ requesterId: userId, targetUserId });
    revalidatePath("/friend");

    return createSuccessState();
  } catch (error) {
    console.error("Failed to send friend request", error);

    return createErrorState("친구 요청을 보내지 못했습니다. 잠시 후 다시 시도해주세요.");
  }
}

// 인증된 사용자가 보낸 친구 요청을 취소하고 친구 페이지 캐시를 갱신한다.
export async function cancelFriendRequestAction(
  _prevState: FriendActionState,
  formData: FormData,
): Promise<FriendActionState> {
  const userId = await getCurrentUserId();
  const requestId = getFormValue(formData, "requestId");

  if (!userId) {
    return createErrorState("로그인이 필요합니다.");
  }

  if (!requestId) {
    return createErrorState("요청 정보를 찾을 수 없습니다.");
  }

  try {
    await cancelFriendRequest({ requesterId: userId, requestId });
    revalidatePath("/friend");

    return createSuccessState();
  } catch (error) {
    console.error("Failed to cancel friend request", error);

    return createErrorState("친구 요청을 취소하지 못했습니다. 잠시 후 다시 시도해주세요.");
  }
}

// 인증된 사용자가 받은 친구 요청을 거절하고 친구 페이지 캐시를 갱신한다.
export async function rejectFriendRequestAction(
  _prevState: FriendActionState,
  formData: FormData,
): Promise<FriendActionState> {
  const userId = await getCurrentUserId();
  const requestId = getFormValue(formData, "requestId");

  if (!userId) {
    return createErrorState("로그인이 필요합니다.");
  }

  if (!requestId) {
    return createErrorState("요청 정보를 찾을 수 없습니다.");
  }

  try {
    await rejectFriendRequest({ addresseeId: userId, requestId });
    revalidatePath("/friend");

    return createSuccessState();
  } catch (error) {
    console.error("Failed to reject friend request", error);

    return createErrorState("친구 요청을 거절하지 못했습니다. 잠시 후 다시 시도해주세요.");
  }
}

// 인증된 사용자가 받은 친구 요청을 수락하고 친구 페이지 캐시를 갱신한다.
export async function acceptFriendRequestAction(
  _prevState: FriendActionState,
  formData: FormData,
): Promise<FriendActionState> {
  const userId = await getCurrentUserId();
  const requestId = getFormValue(formData, "requestId");

  if (!userId) {
    return createErrorState("로그인이 필요합니다.");
  }

  if (!requestId) {
    return createErrorState("요청 정보를 찾을 수 없습니다.");
  }

  try {
    await acceptFriendRequest({ addresseeId: userId, requestId });
    revalidatePath("/friend");

    return createSuccessState();
  } catch (error) {
    console.error("Failed to accept friend request", error);

    return createErrorState("친구 요청을 수락하지 못했습니다. 잠시 후 다시 시도해주세요.");
  }
}

// 인증된 사용자의 친구 관계를 삭제하고 친구 페이지 캐시를 갱신한다.
export async function deleteFriendAction(
  _prevState: FriendActionState,
  formData: FormData,
): Promise<FriendActionState> {
  const userId = await getCurrentUserId();
  const friendUserId = getFormValue(formData, "friendUserId");

  if (!userId) {
    return createErrorState("로그인이 필요합니다.");
  }

  if (!friendUserId) {
    return createErrorState("친구 정보를 찾을 수 없습니다.");
  }

  try {
    await deleteFriend({ currentUserId: userId, friendUserId });
    revalidatePath("/friend");

    return createSuccessState();
  } catch (error) {
    console.error("Failed to delete friend", error);

    return createErrorState("친구를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
  }
}

function createSuccessState(): FriendActionState {
  return {
    error: null,
    status: "success",
  };
}

function createErrorState(error: string): FriendActionState {
  return {
    error,
    status: "error",
  };
}

// FormData 값을 문자열로 정규화한다.
function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}
