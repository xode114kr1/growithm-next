import type { StudyMember } from "@/types/study";

import StudyMemberItem from "./study-member-item";

export default function StudyMemberList({
  members,
}: {
  members: StudyMember[];
}) {
  if (members.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-body-sm text-slate-500">
        검색 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-gutter xl:grid-cols-2">
      {members.map((member) => (
        <StudyMemberItem key={member.id} member={member} />
      ))}
    </div>
  );
}
