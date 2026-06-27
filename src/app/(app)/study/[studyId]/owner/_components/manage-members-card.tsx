import type { OwnerMember } from "@/types/study";

import ManageMemberRow from "./manage-member-row";

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
              <ManageMemberRow
                key={member.id}
                member={member}
                studyId={studyId}
              />
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
