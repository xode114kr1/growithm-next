import type { StudyInviteItem } from "@/types/study";
import InviteItem from "./study-invite-item";

export default function StudyInvites({
  invites,
}: {
  invites: StudyInviteItem[];
}) {
  return (
    <section className="app-card flex h-[min(520px,calc(100vh-9rem))] flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-50 p-6">
        <h2 className="section-title">초대 및 요청</h2>
        {invites.length > 0 ? (
          <span className="rounded-full bg-error px-1.5 py-0.5 text-2.5 font-bold text-white">
            {invites.length}
          </span>
        ) : null}
      </div>
      <div className="flex-1 divide-y divide-slate-50 overflow-y-auto">
        {invites.map((invite) => (
          <InviteItem invite={invite} key={invite.id} />
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
