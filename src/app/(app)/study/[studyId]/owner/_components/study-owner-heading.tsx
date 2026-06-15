import Link from "next/link";

import type { OwnerStudy } from "@/types/study";

export default function StudyOwnerHeading({ study }: { study: OwnerStudy }) {
  return (
    <div className="mb-8">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-body-sm text-slate-500">
        <Link className="font-semibold transition-colors hover:text-primary" href="/study">
          Studies
        </Link>
        <span>/</span>
        <span className="font-semibold text-primary">{study.name}</span>
        <span>/</span>
        <span>스터디 - 관리</span>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h1 className="page-title">
          스터디 관리
        </h1>
        <span className="w-fit rounded bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-on-primary">
          방장 전용
        </span>
      </div>
      <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
        멤버 초대, 멤버 권한, 스터디 설정과 삭제를 관리합니다.
      </p>
    </div>
  );
}
