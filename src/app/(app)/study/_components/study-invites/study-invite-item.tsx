import { StudyInviteItem } from "@/types/study";
import { acceptStudyInvite, declineStudyInvite } from "../../actions";

export default function InviteItem({ invite }: { invite: StudyInviteItem }) {
  return (
    <article className="p-4 transition-all hover:bg-slate-50">
      <div className="mb-3 flex gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed font-bold text-primary">
          {invite.invitedByName[0]?.toUpperCase()}
        </div>
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
        <form action={acceptStudyInvite} className="flex-1">
          <input name="inviteId" type="hidden" value={invite.id} />
          <button
            className="w-full rounded-md bg-primary py-1.5 text-xs font-bold text-on-primary transition-all hover:opacity-90"
            type="submit"
          >
            수락
          </button>
        </form>
        <form action={declineStudyInvite} className="flex-1">
          <input name="inviteId" type="hidden" value={invite.id} />
          <button
            className="w-full rounded-md bg-surface-container py-1.5 text-xs font-bold text-on-surface-variant transition-all hover:bg-outline-variant/20"
            type="submit"
          >
            거절
          </button>
        </form>
      </div>
    </article>
  );
}
