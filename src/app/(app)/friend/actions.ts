"use server";

import { revalidatePath } from "next/cache";

import {
  acceptFriendRequest,
  cancelFriendRequest,
  deleteFriend,
  deleteReceivedFriendRequest,
  sendFriendRequest,
} from "@/services/friends/friend.server";
import { auth } from "@/lib/auth/auth";

type FriendActionResult =
  | { ok: true }
  | { message: string; ok: false };

export async function sendFriendRequestAction(formData: FormData) {
  const targetUserId = getFormValue(formData, "targetUserId");

  return sendFriendRequestByIdAction(targetUserId);
}

export async function sendFriendRequestByIdAction(
  targetUserId: string,
): Promise<FriendActionResult> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { message: "Login is required.", ok: false };
  }

  if (!targetUserId) {
    return { message: "Friend target is required.", ok: false };
  }

  await sendFriendRequest({ requesterId: userId, targetUserId });
  revalidatePath("/friend");

  return { ok: true };
}

export async function cancelFriendRequestAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const requestId = getFormValue(formData, "requestId");

  if (!userId || !requestId) {
    return;
  }

  await cancelFriendRequest({ requesterId: userId, requestId });
  revalidatePath("/friend");
}

export async function deleteReceivedFriendRequestAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const requestId = getFormValue(formData, "requestId");

  if (!userId || !requestId) {
    return;
  }

  await deleteReceivedFriendRequest({ addresseeId: userId, requestId });
  revalidatePath("/friend");
}

export async function acceptFriendRequestAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const requestId = getFormValue(formData, "requestId");

  if (!userId || !requestId) {
    return;
  }

  await acceptFriendRequest({ addresseeId: userId, requestId });
  revalidatePath("/friend");
}

export async function deleteFriendAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const friendUserId = getFormValue(formData, "friendUserId");

  if (!userId || !friendUserId) {
    return;
  }

  await deleteFriend({ currentUserId: userId, friendUserId });
  revalidatePath("/friend");
}

async function getCurrentUserId() {
  const session = await auth();

  return session?.user?.id ?? null;
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}
