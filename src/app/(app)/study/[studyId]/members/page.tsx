import Link from "next/link";
import StudyMemberList, {
  type StudyMember,
} from "@/app/(app)/study/[studyId]/members/_components/study-member-list";

const study = {
  description: "스터디 멤버의 기여도와 최근 활동 상태를 확인합니다.",
  name: "Algorithm Sprint",
};

const members: StudyMember[] = [
  {
    contribution: 28,
    lastActive: "2026-03-24",
    name: "helppy",
    role: "LEADER",
  },
  {
    contribution: 74005,
    lastActive: "2026-04",
    name: "xode114kr1",
    role: "MEMBER",
  },
];

export default function StudyMembersPage() {
  return (
    <>
      <StudyMembersHeading memberCount={members.length} />
      <StudyMemberList members={members} />
    </>
  );
}

function StudyMembersHeading({ memberCount }: { memberCount: number }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2 text-body-sm text-slate-500">
          <Link className="font-semibold transition-colors hover:text-primary" href="/study">
            Studies
          </Link>
          <span>/</span>
          <span className="font-semibold text-primary">{study.name}</span>
          <span>/</span>
          <span>스터디 - 멤버</span>
        </div>
        <h1 className="page-title mb-2">
          Study Members
        </h1>
        <p className="max-w-xl text-body-md text-on-surface-variant">
          {study.description}
        </p>
      </div>
      <div className="app-card px-5 py-3">
        <p className="text-label-caps text-slate-400">Members</p>
        <p className="text-h3-ui text-primary">{memberCount}명</p>
      </div>
    </div>
  );
}
