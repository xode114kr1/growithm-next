"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  acceptFriendRequestAction,
  cancelFriendRequestAction,
  deleteFriendAction,
  rejectFriendRequestAction,
  sendFriendRequestByIdAction,
} from "../actions";
import type { FriendSearchResult } from "@/types/friend";

export function SearchResultActions({
  isPending,
  onAddFriend,
  profile,
}: {
  isPending: boolean;
  onAddFriend: () => void;
  profile: FriendSearchResult;
}) {
  if (profile.relationStatus === "friend") {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <button
          className="rounded-lg bg-slate-100 px-3 py-2 text-body-sm font-semibold text-slate-500"
          disabled
          type="button"
        >
          Friends
        </button>
      </div>
    );
  }

  if (profile.relationStatus === "received_request") {
    return (
      <div className="flex shrink-0 items-center gap-2">
        {profile.requestId ? (
          <>
            <RejectFriendRequestButton requestId={profile.requestId} />
            <AcceptFriendRequestButton requestId={profile.requestId} />
          </>
        ) : null}
      </div>
    );
  }

  if (profile.relationStatus === "sent_request" || isPending) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        {profile.requestId ? (
          <CancelFriendRequestButton requestId={profile.requestId} />
        ) : (
          <button
            className="rounded-lg bg-slate-100 px-3 py-2 text-body-sm font-semibold text-slate-500"
            disabled
            type="button"
          >
            Request Sent
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <SendFriendRequestButton
        onAddFriend={onAddFriend}
        targetUserId={profile.id}
      />
    </div>
  );
}

export function SendFriendRequestButton({
  onAddFriend,
  targetUserId,
}: {
  onAddFriend?: () => void;
  targetUserId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSent, setIsSent] = useState(false);
  const isDisabled = isPending || isSent;

  function handleSendFriendRequest() {
    if (isDisabled) {
      return;
    }

    startTransition(async () => {
      const result = await sendFriendRequestByIdAction(targetUserId);

      if (!result.ok) {
        return;
      }

      setIsSent(true);
      onAddFriend?.();
      router.refresh();
    });
  }

  return (
    <button
      className="rounded-lg bg-primary px-3 py-2 text-body-sm font-semibold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95 disabled:bg-slate-100 disabled:text-slate-500 disabled:shadow-none disabled:hover:opacity-100 disabled:active:scale-100"
      disabled={isDisabled}
      onClick={handleSendFriendRequest}
      type="button"
    >
      {isSent ? "요청 보냄" : "친구 추가"}
    </button>
  );
}

export function DeleteFriendButton({ friendUserId }: { friendUserId: string }) {
  return (
    <form action={deleteFriendAction}>
      <input name="friendUserId" type="hidden" value={friendUserId} />
      <button
        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-body-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-error"
        type="submit"
      >
        Delete Friend
      </button>
    </form>
  );
}

export function RejectFriendRequestButton({
  requestId,
}: {
  requestId: string;
}) {
  return (
    <form action={rejectFriendRequestAction}>
      <input name="requestId" type="hidden" value={requestId} />
      <button
        className="rounded-lg border border-slate-200 px-3 py-2 text-body-sm font-semibold text-slate-600 transition-all hover:bg-slate-50"
        type="submit"
      >
        Reject
      </button>
    </form>
  );
}

export function AcceptFriendRequestButton({
  requestId,
}: {
  requestId: string;
}) {
  return (
    <form action={acceptFriendRequestAction}>
      <input name="requestId" type="hidden" value={requestId} />
      <button
        className="rounded-lg bg-primary px-3 py-2 text-body-sm font-semibold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
        type="submit"
      >
        Accept
      </button>
    </form>
  );
}

export function CancelFriendRequestButton({
  requestId,
}: {
  requestId: string;
}) {
  return (
    <form action={cancelFriendRequestAction}>
      <input name="requestId" type="hidden" value={requestId} />
      <button
        className="rounded-lg border border-slate-200 px-3 py-2 text-body-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-error"
        type="submit"
      >
        Cancel
      </button>
    </form>
  );
}
