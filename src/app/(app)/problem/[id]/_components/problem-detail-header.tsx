import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import ProblemTierBadge from "@/components/ui/problem-tier-badge";
import type { ProblemDetail } from "@/types/problem";
import type { ProblemShareTargetStudy } from "@/types/study";

import ProblemShareScoreBadge from "../../_components/problem-share-score-badge";
import ProblemShareModal from "./problem-share/study-share-modal";

export default function ProblemHeader({
  problem,
  shareTargetStudies,
}: {
  problem: ProblemDetail;
  shareTargetStudies: ProblemShareTargetStudy[];
}) {
  const currentTime = new Date().toISOString();

  return (
    <header className="border-b border-outline-variant/40 pb-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary px-3 py-1 text-body-sm font-semibold text-on-primary">
              {problem.platform}
            </span>
            {problem.tier ? <ProblemTierBadge tier={problem.tier} /> : null}
            <ProblemShareScoreBadge
              currentTime={currentTime}
              submittedAtText={problem.submittedAtText}
            />
          </div>

          <p className="mb-2 text-label-caps text-slate-400">
            Problem {problem.problemId}
          </p>

          <h1 className="page-title text-pretty wrap-break-word text-primary">
            {problem.title}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <ProblemShareModal
            currentTime={currentTime}
            problemId={problem.id}
            problemStatus={problem.status}
            submittedAtText={problem.submittedAtText}
            studies={shareTargetStudies}
          />

          <ButtonLink href="/problem" variant="secondary">
            뒤로가기
          </ButtonLink>

          {problem.link ? (
            <ButtonAnchor
              href={problem.link}
              rel="noreferrer"
              target="_blank"
              variant="primary"
            >
              원문 보기
            </ButtonAnchor>
          ) : null}
        </div>
      </div>
    </header>
  );
}
