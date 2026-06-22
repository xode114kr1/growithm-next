"use client";

import { Button } from "@/components/ui/button";
import type { FriendSearchResult } from "@/types/friend";

import {
  acceptFriendRequestAction,
  cancelFriendRequestAction,
  deleteFriendAction,
  rejectFriendRequestAction,
  sendFriendRequestAction,
} from "../actions";

const friendActions = {
  accept: {
    action: acceptFriendRequestAction,
    fieldName: "requestId",
    label: "Accept",
    variant: "primary",
  },
  cancel: {
    action: cancelFriendRequestAction,
    fieldName: "requestId",
    label: "Cancel",
    variant: "secondary",
  },
  delete: {
    action: deleteFriendAction,
    fieldName: "friendUserId",
    label: "Delete Friend",
    variant: "secondary",
  },
  reject: {
    action: rejectFriendRequestAction,
    fieldName: "requestId",
    label: "Reject",
    variant: "secondary",
  },
  send: {
    action: sendFriendRequestAction,
    fieldName: "targetUserId",
    label: "친구 추가",
    variant: "primary",
  },
} as const;

type FriendActionType = keyof typeof friendActions;

export function SearchResultActions({
  profile,
}: {
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
    if (!profile.requestId) return null;

    return (
      <div className="flex shrink-0 items-center gap-2">
        <FriendActionButton actionType="reject" id={profile.requestId} />
        <FriendActionButton actionType="accept" id={profile.requestId} />
      </div>
    );
  }

  if (profile.relationStatus === "sent_request") {
    return profile.requestId ? (
      <div className="flex shrink-0 items-center gap-2">
        <FriendActionButton actionType="cancel" id={profile.requestId} />
      </div>
    ) : (
      <div className="flex shrink-0 items-center gap-2">
        <Button disabled variant="secondary">
          Request Sent
        </Button>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <FriendActionButton actionType="send" id={profile.id} />
    </div>
  );
}

export function FriendActionButton({
  actionType,
  className,
  id,
}: {
  actionType: FriendActionType;
  className?: string;
  id: string;
}) {
  const action = friendActions[actionType];

  return (
    <form action={action.action}>
      <input name={action.fieldName} type="hidden" value={id} />
      <Button
        className={className}
        type="submit"
        variant={action.variant}
      >
        {action.label}
      </Button>
    </form>
  );
}
