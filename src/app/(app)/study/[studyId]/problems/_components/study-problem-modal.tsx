"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import ProblemTierBadge from "@/components/ui/problem-tier-badge";
import type {
  StudyProblemDetail,
  StudyProblemListItem,
} from "@/types/study";

import { ProblemState, ProblemTags } from "./study-problem-item";

export default function StudyProblemModal({
  onClose,
  onSelectProblem,
  problem,
  problems,
  studyId,
}: {
  onClose: () => void;
  onSelectProblem: (problem: StudyProblemListItem) => void;
  problem: StudyProblemListItem | null;
  problems: StudyProblemListItem[];
  studyId: string;
}) {
  const [detail, setDetail] = useState<StudyProblemDetail | null>(null);
  const [loadErrorProblemId, setLoadErrorProblemId] = useState<string | null>(
    null,
  );
  const [reloadKey, setReloadKey] = useState(0);
  const selectedIndex = problem
    ? problems.findIndex((studyProblem) => studyProblem.id === problem.id)
    : -1;
  const previousProblem = selectedIndex > 0 ? problems[selectedIndex - 1] : null;
  const nextProblem =
    selectedIndex >= 0 && selectedIndex < problems.length - 1
      ? problems[selectedIndex + 1]
      : null;

  useEffect(() => {
    const problemId = problem?.id;

    if (!problemId) {
      return;
    }

    const selectedProblemId = problemId;
    const controller = new AbortController();

    async function loadDetail() {
      try {
        const response = await fetch(
          `/api/studies/${encodeURIComponent(studyId)}/problems/${encodeURIComponent(selectedProblemId)}`,
          { cache: "no-store", signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Failed to load study problem detail");
        }

        setDetail((await response.json()) as StudyProblemDetail);
        setLoadErrorProblemId(null);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setLoadErrorProblemId(selectedProblemId);
      }
    }

    void loadDetail();

    return () => controller.abort();
  }, [problem, reloadKey, studyId]);

  useEffect(() => {
    if (!problem) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft" && previousProblem) {
        onSelectProblem(previousProblem);
      } else if (event.key === "ArrowRight" && nextProblem) {
        onSelectProblem(nextProblem);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextProblem, onClose, onSelectProblem, previousProblem, problem]);

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
          <div className="flex shrink-0 items-center gap-1">
            <button
              aria-label="이전 문제"
              className="flex size-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary disabled:cursor-not-allowed disabled:text-slate-300"
              disabled={!previousProblem}
              onClick={() => previousProblem && onSelectProblem(previousProblem)}
              type="button"
            >
              <ChevronLeft aria-hidden="true" size={20} />
            </button>
            <button
              aria-label="다음 문제"
              className="flex size-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary disabled:cursor-not-allowed disabled:text-slate-300"
              disabled={!nextProblem}
              onClick={() => nextProblem && onSelectProblem(nextProblem)}
              type="button"
            >
              <ChevronRight aria-hidden="true" size={20} />
            </button>
            <button
              aria-label="문제 상세 창 닫기"
              className="flex size-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary"
              onClick={onClose}
              type="button"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </div>
        </header>
        {detail?.id === problem.id ? (
          <ProblemDetailContent problem={detail} />
        ) : (
          <ProblemDetailState
            hasLoadError={loadErrorProblemId === problem.id}
            onRetry={() => setReloadKey((key) => key + 1)}
          />
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
          <a
            className="btn-secondary w-full"
            href={problem.link}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink aria-hidden="true" size={16} />
            Open Original
          </a>
        ) : null}
        <Link className="btn-primary w-full" href={`/problem/${problem.id}`}>
          Open Detail Page
        </Link>
      </aside>
    </div>
  );
}

function ProblemDetailState({
  hasLoadError,
  onRetry,
}: {
  hasLoadError: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-72 flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="font-semibold text-on-surface">
        {hasLoadError
          ? "문제 상세 정보를 불러오지 못했습니다."
          : "문제 상세 정보를 불러오는 중입니다."}
      </p>
      {hasLoadError ? (
        <button className="btn-secondary" onClick={onRetry} type="button">
          다시 시도
        </button>
      ) : null}
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
  const [copied, setCopied] = useState(false);

  async function handleCopyCode() {
    if (!code) {
      return;
    }

    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="section-title">풀이 코드</h3>
        {code ? (
          <button
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-body-sm font-semibold text-slate-600 transition-colors hover:border-secondary hover:text-secondary"
            onClick={handleCopyCode}
            type="button"
          >
            {copied ? (
              <Check aria-hidden="true" size={14} />
            ) : (
              <Copy aria-hidden="true" size={14} />
            )}
            {copied ? "복사됨" : "복사"}
          </button>
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
