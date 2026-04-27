import Link from "next/link";
import StudyLocalNav from "@/app/(app)/study/[studyId]/_components/study-local-nav";
import OwnerConsole from "@/app/(app)/study/[studyId]/owner/_components/owner-console";

const study = {
  description:
    "매일 아침 9시, 알고리즘 문제를 풀고 코드 리뷰를 진행하는 스터디입니다.",
  inviteLink: "https://growithm.app/invite/study-1",
  name: "Algorithm Sprint",
};

const pendingInvites = [
  { id: "invite-1", status: "Pending" as const, target: "dev_minho" },
  { id: "invite-2", status: "Pending" as const, target: "sara.coder@gmail.com" },
];

const members = [
  {
    contribution: 28,
    isCurrentUser: true,
    joinedAt: "2023.10.12",
    lastActive: "2026-03-24",
    name: "helppy",
    role: "OWNER" as const,
  },
  {
    contribution: 74005,
    isCurrentUser: false,
    joinedAt: "2023.11.05",
    lastActive: "2026-04",
    name: "xode114kr1",
    role: "MEMBER" as const,
  },
  {
    contribution: 12840,
    isCurrentUser: false,
    joinedAt: "2024.01.08",
    lastActive: "2026-04-20",
    name: "logic_wizard",
    role: "LEADER" as const,
  },
];

export default async function StudyOwnerPage({
  params,
}: {
  params: Promise<{ studyId: string }>;
}) {
  const { studyId } = await params;

  return (
    <main className="page-shell">
      <div className="workspace-container">
        <StudyLocalNav active="owner" studyId={studyId} studyName={study.name} />
        <div className="min-w-0 flex-1">
          <StudyOwnerHeading />
          <OwnerConsole
            initialInvites={pendingInvites}
            members={members}
            study={study}
          />
        </div>
      </div>
    </main>
  );
}

function StudyOwnerHeading() {
  return (
    <div className="mb-8">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-body-sm text-slate-500">
        <Link className="font-semibold transition-colors hover:text-primary" href="/study">
          Studies
        </Link>
        <span>/</span>
        <span className="font-semibold text-primary">{study.name}</span>
        <span>/</span>
        <span>스터디 - Owner</span>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h1 className="page-title">
          Study Owner Console
        </h1>
        <span className="w-fit rounded bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-on-primary">
          Owner Only
        </span>
      </div>
      <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
        멤버 초대, 멤버 권한, 스터디 설정과 삭제를 관리합니다.
      </p>
    </div>
  );
}
