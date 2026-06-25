import type { OwnerMember } from "@/types/study";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";

import { removeStudyMember, updateStudyMemberRole } from "../actions";

export default function ManageMembersCard({
  members,
  studyId,
}: {
  members: OwnerMember[];
  studyId: string;
}) {
  return (
    <section className="app-card p-6">
      <div className="mb-6 flex flex-col justify-between gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="section-title">멤버 관리</h2>
          <p className="text-body-sm text-slate-500">
            역할을 변경하거나 스터디에서 내보낼 수 있습니다.
          </p>
        </div>
        <span className="text-body-sm text-slate-500">
          전체 멤버: {members.length}명
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <TableHead>사용자</TableHead>
              <TableHead>기여도</TableHead>
              <TableHead>역할</TableHead>
              <TableHead>가입일</TableHead>
              <TableHead>관리</TableHead>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {members.map((member) => (
              <tr
                className="transition-colors hover:bg-slate-50/80"
                key={member.id}
              >
                <td className="min-w-55 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      image={member.avatar}
                      name={member.name}
                      size="sm"
                    />
                    <div>
                      <p className="font-semibold text-on-surface">
                        {member.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        최근 활동 {member.lastActive}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-body-sm font-semibold text-secondary">
                  {member.contribution.toLocaleString()} XP
                </td>
                <td className="px-6 py-4">
                  {member.role === "OWNER" ? (
                    <span className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-body-sm font-semibold text-slate-400">
                      OWNER
                    </span>
                  ) : (
                    <form action={updateStudyMemberRole} className="flex gap-2">
                      <input name="studyId" type="hidden" value={studyId} />
                      <input name="memberId" type="hidden" value={member.id} />
                      <select
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-body-sm outline-none"
                        defaultValue={member.role}
                        name="role"
                      >
                        <option value="LEADER">리더</option>
                        <option value="MEMBER">멤버</option>
                      </select>
                      <Button type="submit" variant="secondary">
                        저장
                      </Button>
                    </form>
                  )}
                </td>
                <td className="px-6 py-4 text-body-sm text-slate-500">
                  {member.joinedAt}
                </td>
                <td className="px-6 py-4">
                  {member.role === "OWNER" ? (
                    <span className="text-xs italic text-slate-300">
                      작업 없음
                    </span>
                  ) : (
                    <form action={removeStudyMember}>
                      <input name="studyId" type="hidden" value={studyId} />
                      <input name="memberId" type="hidden" value={member.id} />
                      <button
                        className="rounded-lg bg-error-container px-4 py-2 text-body-sm font-semibold text-error transition-opacity hover:opacity-80"
                        type="submit"
                      >
                        내보내기
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-4 text-label-caps text-slate-400">{children}</th>
  );
}
