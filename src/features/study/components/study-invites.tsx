import {
  acceptStudyInvite,
  declineStudyInvite,
} from "@/features/study/actions/study-actions";
import { auth } from "@/lib/auth/auth";
import { getPendingInvites } from "@/features/study/server/study-invites-data";
import type { StudyInviteItem } from "@/features/study/types";

export default async function StudyInvites() {
  const session = await auth();
  const userId = session?.user?.id;
  const invites = userId ? await getPendingInvites(userId) : [];

  return (
    <section className="app-card flex h-[min(520px,calc(100vh-9rem))] flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-50 p-6">
        <h2 className="section-title">Invites & Requests</h2>
        {invites.length > 0 ? (
          <span className="rounded-full bg-error px-1.5 py-0.5 text-2.5 font-bold text-white">
            {invites.length}
          </span>
        ) : null}
      </div>
      <div className="flex-1 divide-y divide-slate-50 overflow-y-auto">
        {invites.map((invite) => (
          <InviteCard invite={invite} key={invite.id} />
        ))}
        {invites.length === 0 ? (
          <div className="p-6 text-center text-body-sm text-slate-500">
            대기 중인 초대가 없습니다.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function InviteCard({ invite }: { invite: StudyInviteItem }) {
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
            </span>{" "}
            invited you to{" "}
            <span className="font-semibold text-primary">
              {invite.studyTitle}
            </span>
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
            Accept
          </button>
        </form>
        <form action={declineStudyInvite} className="flex-1">
          <input name="inviteId" type="hidden" value={invite.id} />
          <button
            className="w-full rounded-md bg-surface-container py-1.5 text-xs font-bold text-on-surface-variant transition-all hover:bg-outline-variant/20"
            type="submit"
          >
            Decline
          </button>
        </form>
      </div>
    </article>
  );
}

