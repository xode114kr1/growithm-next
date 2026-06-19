import type { StudyMember } from "@/types/study";

import { studyMemberRoleLabels } from "../constants";

export default function MemberProfileModal({
  member,
  onClose,
}: {
  member: StudyMember;
  onClose: () => void;
}) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8"
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl shadow-slate-950/20">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-black text-on-primary">
              {member.name[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-primary">
                {member.name}
              </h2>
              <p className="text-body-sm font-semibold text-slate-500">
                {studyMemberRoleLabels[member.role]}
              </p>
            </div>
          </div>
          <button
            aria-label="멤버 프로필 닫기"
            className="rounded-lg px-3 py-2 text-body-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary"
            onClick={onClose}
            type="button"
          >
            닫기
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ProfileStat
            label="기여도"
            value={`${member.contribution.toLocaleString()} XP`}
          />
          <ProfileStat
            label="역할"
            value={studyMemberRoleLabels[member.role]}
          />
          <ProfileStat label="최근 활동" value={member.lastActive} />
          <ProfileStat label="참여일" value={member.joinedAt} />
        </div>
      </div>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <p className="text-label-caps text-slate-400">{label}</p>
      <p className="mt-2 text-body-md font-bold text-on-surface">{value}</p>
    </div>
  );
}
