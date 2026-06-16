import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import ProblemTierBadge from "@/components/ui/problem-tier-badge";
import { getProblemDetail } from "@/services/problems/problem.query";
import { getProblemShareTargetStudies } from "@/services/studies/study.query";
import type { ProblemDetail } from "@/types/problem";
import type { ProblemShareTargetStudy } from "@/types/study";

import ProblemMemoEditor from "./problem-memo-editor";
import ProblemShareModal from "./problem-share-modal";

export default async function ProblemSection({
  problemId,
  userId,
}: {
  problemId: string;
  userId: string | undefined;
}) {
  const [problem, shareTargetStudies] = await Promise.all([
    getProblemDetail({ id: problemId, userId }),
    getProblemShareTargetStudies({
      problemId,
      userId,
    }),
  ]);

  if (!problem) {
    notFound();
  }

  return (
    <>
      <ProblemHeader
        problem={problem}
        shareTargetStudies={shareTargetStudies}
      />
      <ProblemMetadata problem={problem} />
      <ProblemMemoEditor initialMemo={problem.memo} problemId={problem.id} />
      <ProblemSolutionCode code={problem.code} />
      <ProblemDescription description={problem.description} />
    </>
  );
}

function ProblemHeader({
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
            {problem.tier ? <ProblemTierBadge tier={problem.tier} /> : null}
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

function ProblemMetadata({ problem }: { problem: ProblemDetail }) {
  const metadata = [
    { label: "메모리", value: problem.memory ?? "기록 없음" },
    { label: "실행 시간", value: problem.time ?? "기록 없음" },
    { label: "제출일", value: problem.submittedAtText ?? "제출 완료" },
  ].filter((item): item is { label: string; value: string } =>
    Boolean(item.value),
  );

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {metadata.map((item) => (
          <div className="app-card p-4" key={item.label}>
            <p className="text-label-caps text-slate-400">{item.label}</p>
            <p className="mt-2 wrap-break-word text-body-md font-semibold text-on-surface">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {problem.categories.length > 0 ? (
        <div className="app-card flex flex-wrap gap-2 p-4">
          {problem.categories.map((category) => (
            <span
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-body-sm font-semibold text-slate-600"
              key={category}
            >
              {category}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ProblemSolutionCode({ code }: { code: string | null }) {
  return (
    <ProblemContentSection title="풀이 코드" accent="primary">
      {code ? (
        <pre className="max-h-130 overflow-auto rounded-lg bg-surface-container-low p-4 text-mono-code text-body-sm text-primary">
          <code>{code}</code>
        </pre>
      ) : (
        <EmptyContent>저장된 풀이 코드가 없습니다.</EmptyContent>
      )}
    </ProblemContentSection>
  );
}

function ProblemDescription({ description }: { description: string | null }) {
  return (
    <ProblemContentSection title="문제 설명" accent="secondary">
      {description ? (
        <div
          className="problem-description text-body-md text-on-surface-variant"
          // 서버에서 받은 HTML은 운영 환경에서 렌더링 전에 반드시 sanitizing 해야 한다.
          dangerouslySetInnerHTML={{ __html: description }}
        />
      ) : (
        <EmptyContent>저장된 문제 설명이 없습니다.</EmptyContent>
      )}
    </ProblemContentSection>
  );
}

function ProblemContentSection({
  accent,
  children,
  title,
}: {
  accent: "primary" | "secondary";
  children: ReactNode;
  title: string;
}) {
  const accentClass =
    accent === "primary" ? "bg-primary-fixed-dim" : "bg-secondary-fixed-dim";

  return (
    <section className="app-card p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className={`h-8 w-1 rounded-full ${accentClass}`} />
        <h2 className="section-title">{title}</h2>
      </div>

      {children}
    </section>
  );
}

function EmptyContent({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-body-sm text-slate-500">
      {children}
    </div>
  );
}
