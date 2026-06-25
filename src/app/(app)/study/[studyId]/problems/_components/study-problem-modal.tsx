"use client";

import { Copy, ExternalLink, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button, ButtonAnchor, ButtonLink } from "@/components/ui/button";
import ProblemTierBadge from "@/components/ui/problem-tier-badge";
import type {
  StudyProblemDetail,
  StudyProblemListItem,
} from "@/types/study";

import {
  ProblemState,
  ProblemTags,
} from "./study-problem-list/study-problem-item";

export default function StudyProblemModal({
  onClose,
  problem,
  studyId,
}: {
  onClose: () => void;
  problem: StudyProblemListItem | null;
  studyId: string;
}) {
  const [detail, setDetail] = useState<StudyProblemDetail | null>(null);
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    const problemId = problem?.id;

    if (!problemId) return;

    async function loadDetail() {
      setDetail(null);
      setHasLoadError(false);

      try {
        const response = await fetch(
          `/api/studies/${studyId}/problems/${problemId}`,
        );

        if (!response.ok) return setHasLoadError(true);

        setDetail((await response.json()) as StudyProblemDetail);
      } catch {
        setHasLoadError(true);
      }
    }

    loadDetail();
  }, [problem?.id, studyId]);

  if (!problem) {
    return null;
  }

  return (
    <div
      aria-labelledby="study-problem-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="flex max-h-[88svh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 md:p-6">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-mono-code text-2.75 text-slate-500">
                {problem.code}
              </span>
              {problem.tier ? (
                <ProblemTierBadge tier={problem.tier} />
              ) : null}
              <span className="text-2.75 font-semibold text-slate-400">
                {problem.platform}
              </span>
            </div>
            <h2
              className="text-pretty text-h3-ui text-on-surface"
              id="study-problem-modal-title"
            >
              {problem.title}
            </h2>
            <p className="mt-2 text-body-sm text-slate-500">
              {problem.sharedBy} shared on {problem.sharedAtLabel}
            </p>
          </div>
          <button
            aria-label="문제 상세 창 닫기"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </header>
        {detail?.id === problem.id ? (
          <ProblemDetailContent problem={detail} />
        ) : (
          <ProblemDetailState hasLoadError={hasLoadError} />
        )}
      </div>
    </div>
  );
}

function ProblemDetailContent({ problem }: { problem: StudyProblemDetail }) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-6 p-5 md:p-6">
        <ProblemDescription description={problem.description} />
        <ProblemSolutionCode code={problem.solutionCode} />
      </div>
      <aside className="space-y-5 border-t border-slate-100 bg-slate-50/50 p-5 md:p-6 lg:border-l lg:border-t-0">
        <ProblemState status={problem.status} />
        <ProblemMetaList problem={problem} />
        <ProblemTags categories={problem.categories} />
        {problem.memo ? (
          <section>
            <h3 className="mb-2 text-label-caps text-slate-500">메모</h3>
            <p className="rounded-lg border border-slate-100 bg-white p-3 text-body-sm leading-relaxed text-on-surface-variant">
              {problem.memo}
            </p>
          </section>
        ) : null}
        {problem.link ? (
          <ButtonAnchor
            className="w-full"
            href={problem.link}
            rel="noreferrer"
            target="_blank"
            variant="secondary"
          >
            <ExternalLink aria-hidden="true" size={16} />
            Open Original
          </ButtonAnchor>
        ) : null}
        <ButtonLink
          className="w-full"
          href={`/problem/${problem.id}`}
          variant="primary"
        >
          Open Detail Page
        </ButtonLink>
      </aside>
    </div>
  );
}

function ProblemDetailState({ hasLoadError }: { hasLoadError: boolean }) {
  return (
    <div className="flex min-h-72 flex-1 items-center justify-center p-6 text-center">
      <p className="font-semibold text-on-surface">
        {hasLoadError
          ? "문제 상세 정보를 불러오지 못했습니다."
          : "문제 상세 정보를 불러오는 중입니다."}
      </p>
    </div>
  );
}

function ProblemMetaList({ problem }: { problem: StudyProblemDetail }) {
  const score =
    problem.score !== null
      ? `${problem.score.toLocaleString()}${problem.scoreMax !== null ? ` / ${problem.scoreMax.toLocaleString()}` : ""}`
      : "-";

  return (
    <dl className="grid gap-3">
      <MetaItem label="제출일" value={problem.submittedAtText ?? "-"} />
      <MetaItem label="점수" value={score} />
      <MetaItem label="공유한 멤버" value={problem.sharedBy} />
      <MetaItem label="공유일" value={problem.sharedAtLabel} />
    </dl>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-3">
      <dt className="text-label-caps text-slate-400">{label}</dt>
      <dd className="mt-1 text-body-sm font-semibold text-on-surface">{value}</dd>
    </div>
  );
}

function ProblemDescription({ description }: { description: string | null }) {
  if (!description) {
    return (
      <section>
        <h3 className="mb-3 section-title">문제 설명</h3>
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-body-sm text-slate-500">
          저장된 문제 설명이 없습니다.
        </div>
      </section>
    );
  }

  return (
    <section>
      <h3 className="mb-3 section-title">문제 설명</h3>
      <div
        className="problem-description text-body-md text-on-surface-variant"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </section>
  );
}

function ProblemSolutionCode({ code }: { code: string | null }) {
  async function handleCopyCode() {
    if (!code) return;

    await navigator.clipboard.writeText(code);
  }

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="section-title">풀이 코드</h3>
        {code ? (
          <Button
            onClick={handleCopyCode}
            size="xs"
            variant="secondary"
          >
            <Copy aria-hidden="true" size={14} />
            복사
          </Button>
        ) : null}
      </div>
      {code ? (
        <pre className="max-h-105 overflow-auto rounded-lg bg-surface-container-low p-4 text-mono-code text-body-sm text-primary">
          <code>{code}</code>
        </pre>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-body-sm text-slate-500">
          저장된 풀이 코드가 없습니다.
        </div>
      )}
    </section>
  );
}
