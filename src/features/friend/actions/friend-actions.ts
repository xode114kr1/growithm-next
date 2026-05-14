"use server";

import { revalidatePath } from "next/cache";

import {
  acceptFriendRequest,
  cancelFriendRequest,
  deleteFriend,
  deleteReceivedFriendRequest,
  sendFriendRequest,
} from "@/features/friend/server/friend-mutations";
import { auth } from "@/lib/auth/auth";

export async function sendFriendRequestAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const targetUserId = getFormValue(formData, "targetUserId");

  if (!userId || !targetUserId) {
    return;
  }

  await sendFriendRequest({ requesterId: userId, targetUserId });
  revalidatePath("/friend");
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
