"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { INITIAL_ACTION_STATE } from "@/utils/action-state";

import {
  acceptFriendRequestAction,
  cancelFriendRequestAction,
  deleteFriendAction,
  type FriendActionState,
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

export function FriendActionButton({
  actionType,
  className,
  id,
  onSuccess,
}: {
  actionType: FriendActionType;
  className?: string;
  id: string;
  onSuccess?: () => void | Promise<void>;
}) {
  const action = friendActions[actionType];
  const handleAction = async (
    prevState: FriendActionState,
    formData: FormData,
  ): Promise<FriendActionState> => {
    const nextState = await action.action(prevState, formData);

    if (nextState.status === "success") {
      await onSuccess?.();
    }

    return nextState;
  };
  const [state, formAction, isPending] = useActionState(
    handleAction,
    INITIAL_ACTION_STATE,
  );

  return (
    <div className="min-w-0">
      <form action={formAction}>
        <input name={action.fieldName} type="hidden" value={id} />
        <Button
          className={className}
          disabled={isPending}
          type="submit"
          variant={action.variant}
        >
          {action.label}
        </Button>
      </form>
      {state.status === "error" ? (
        <p className="mt-1 max-w-40 text-xs font-medium text-error">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
