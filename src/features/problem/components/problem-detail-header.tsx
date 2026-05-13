import Link from "next/link";

import ProblemShareModal from "@/features/problem/components/problem-share-modal";
import {
  getProblemStatusBadgeClass,
  getProblemStatusLabel,
  getSubmittedLabel,
  getTierBadgeClass,
} from "@/features/problem/utils";
import type {
  ProblemDetail,
  ProblemShareTargetStudy,
} from "@/features/problem/types";

export default function ProblemDetailHeader({
  problem,
  shareTargetStudies,
}: {
  problem: ProblemDetail;
  shareTargetStudies: ProblemShareTargetStudy[];
}) {
  return (
    <header className="border-b border-outline-variant/40 pb-8">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-body-sm text-slate-500">
        <Link
          className="font-semibold transition-colors hover:text-primary"
          href="/problem"
        >
          Problems
        </Link>
        <span>/</span>
        <span>{problem.platform}</span>
        <span>/</span>
        <span>{problem.problemId}</span>
      </div>

      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary px-3 py-1 text-body-sm font-semibold text-on-primary">
              {problem.platform}
            </span>
            {problem.tier ? (
              <span className={getTierBadgeClass(problem.tier)}>
                {problem.tier}
              </span>
            ) : null}
            <span className="badge-solved">
              {getSubmittedLabel(problem.submittedAtText)}
            </span>
            <span className={getProblemStatusBadgeClass(problem.status)}>
              {getProblemStatusLabel(problem.status)}
            </span>
          </div>
          <p className="mb-2 text-label-caps text-slate-400">
            Problem {problem.problemId}
          </p>
          <h1 className="page-title text-pretty wrap-break-word text-primary">
            {problem.title}
          </h1>
          <p className="mt-3 max-w-2xl text-body-md text-on-surface-variant">
            제출 기록에서 수집한 문제 정보와 풀이 메타데이터를 확인합니다.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ProblemShareModal
            problemId={problem.id}
            problemStatus={problem.status}
            studies={shareTargetStudies}
          />
          <Link className="btn-secondary" href="/problem">
            뒤로가기
          </Link>
          {problem.link ? (
            <a
              className="btn-primary"
              href={problem.link}
              rel="noreferrer"
              target="_blank"
            >
              원문 보기
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
