"use client";

import { useActionState } from "react";

import { StudyInviteItem } from "@/types/study";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  acceptStudyInvite,
  rejectStudyInvite,
  type StudyInviteActionState,
} from "../../actions";

const initialActionState: StudyInviteActionState = {
  error: null,
  status: "idle",
};

export default function InviteItem({ invite }: { invite: StudyInviteItem }) {
  const [acceptState, acceptFormAction, isAcceptPending] = useActionState(
    acceptStudyInvite,
    initialActionState,
  );
  const [rejectState, rejectFormAction, isRejectPending] = useActionState(
    rejectStudyInvite,
    initialActionState,
  );
  const isPending = isAcceptPending || isRejectPending;
  const errorMessage = acceptState.error ?? rejectState.error;

  return (
    <article className="p-4 transition-all hover:bg-slate-50">
      <div className="mb-3 flex gap-3">
        <UserAvatar
          image={invite.invitedByAvatar}
          name={invite.invitedByName}
        />
        <div className="min-w-0 flex-1">
          <p className="text-body-sm">
            <span className="font-bold text-on-surface">
              {invite.invitedByName}
            </span>
            님이
            <span className="font-semibold text-primary">
              {invite.studyTitle}
            </span>
            스터디에 초대했습니다.
          </p>
          <span className="text-2.5 uppercase tracking-wider text-outline">
            {invite.timeLabel}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <form action={acceptFormAction} className="flex-1">
          <input name="inviteId" type="hidden" value={invite.id} />
          <Button
            className="w-full"
            disabled={isPending}
            size="xs"
            type="submit"
            variant="primary"
          >
            수락
          </Button>
        </form>
        <form action={rejectFormAction} className="flex-1">
          <input name="inviteId" type="hidden" value={invite.id} />
          <Button
            className="w-full"
            disabled={isPending}
            size="xs"
            type="submit"
            variant="secondary"
          >
            거절
          </Button>
        </form>
      </div>
      {errorMessage ? (
        <p className="mt-2 text-xs font-medium text-error">{errorMessage}</p>
      ) : null}
    </article>
  );
}
