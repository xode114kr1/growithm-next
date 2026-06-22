"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import type { FriendSearchResult } from "@/types/friend";

import {
  acceptFriendRequestAction,
  cancelFriendRequestAction,
  deleteFriendAction,
  rejectFriendRequestAction,
  sendFriendRequestByIdAction,
} from "../actions";

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
        <Button disabled variant="secondary">
          Friends
        </Button>
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
          <Button disabled variant="secondary">
            Request Sent
          </Button>
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
    <Button
      disabled={isDisabled}
      onClick={handleSendFriendRequest}
      variant="primary"
    >
      {isSent ? "요청 보냄" : "친구 추가"}
    </Button>
  );
}

export function DeleteFriendButton({ friendUserId }: { friendUserId: string }) {
  return (
    <form action={deleteFriendAction}>
      <input name="friendUserId" type="hidden" value={friendUserId} />
      <Button
        className="w-full"
        size="md"
        type="submit"
        variant="secondary"
      >
        Delete Friend
      </Button>
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
      <Button type="submit" variant="secondary">
        Reject
      </Button>
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
      <Button type="submit" variant="primary">
        Accept
      </Button>
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
      <Button type="submit" variant="secondary">
        Cancel
      </Button>
    </form>
  );
}
