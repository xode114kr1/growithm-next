"use client";

import { ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getProblemStatusBadgeClass,
  getProblemStatusDescription,
  getProblemStatusLabel,
} from "@/app/(app)/problem/_lib/problem-status";
import type { ProblemSubmissionStatus } from "@/generated/prisma/enums";

export type StudyProblem = {
  categories: string[];
  code: string;
  description: string | null;
  id: string;
  link: string | null;
  memo: string | null;
  platform: string;
  score: number | null;
  scoreMax: number | null;
  sharedAtLabel: string;
  sharedBy: string;
  solutionCode: string | null;
  status: ProblemSubmissionStatus;
  submittedAtText: string | null;
  tier: string | null;
  title: string;
};

export default function StudyProblemModalTable({
  memberNames,
  problems,
  tiers,
}: {
  memberNames: string[];
  problems: StudyProblem[];
  tiers: string[];
}) {
  const [platformFilter, setPlatformFilter] = useState("All");
  const [selectedProblem, setSelectedProblem] = useState<StudyProblem | null>(
    null,
  );
  const [sharedByFilter, setSharedByFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("All");
  const filteredProblems = problems.filter((problem) => {
    const matchesPlatform =
      platformFilter === "All" || problem.platform === platformFilter;
    const matchesTier = tierFilter === "All" || problem.tier === tierFilter;
    const matchesSharedBy =
      sharedByFilter === "All" || problem.sharedBy === sharedByFilter;

    return matchesPlatform && matchesTier && matchesSharedBy;
  });
  const hasActiveFilters =
    platformFilter !== "All" || tierFilter !== "All" || sharedByFilter !== "All";

  function clearFilters() {
    setPlatformFilter("All");
    setSharedByFilter("All");
    setTierFilter("All");
  }

  return (
    <>
      <StudyProblemFilters
        filteredCount={filteredProblems.length}
        memberNames={memberNames}
        onClearFilters={clearFilters}
        onPlatformChange={setPlatformFilter}
        onSharedByChange={setSharedByFilter}
        onTierChange={setTierFilter}
        platformFilter={platformFilter}
        sharedByFilter={sharedByFilter}
        tiers={tiers}
        tierFilter={tierFilter}
        totalCount={problems.length}
      />
      <section className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <TableHead>Problem Details</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Shared By</TableHead>
                <TableHead>Shared At</TableHead>
                <TableHead>State</TableHead>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProblems.map((problem) => (
                <tr
                  className="group transition-colors hover:bg-slate-50/80"
                  key={problem.id}
                >
                  <td className="min-w-[360px] max-w-[560px] px-6 py-5">
                    <button
                      className="flex w-full items-start gap-4 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
                      onClick={() => setSelectedProblem(problem)}
                      type="button"
                    >
                      <span
                        className={`mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border text-xs font-black shadow-sm ${getTierBadgeClass(problem.tier)}`}
                      >
                        {getPlatformInitial(problem.platform)}
                      </span>
                      <span className="min-w-0 space-y-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-mono-code text-[11px] text-slate-500">
                            {problem.code}
                          </span>
                          {problem.tier ? (
                            <span className={getTierBadgeClass(problem.tier)}>
                              {problem.tier}
                            </span>
                          ) : null}
                        </span>
                        <span className="block text-pretty break-words font-semibold leading-snug text-on-surface transition-colors group-hover:text-secondary">
                          {problem.title}
                        </span>
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <ProblemTags categories={problem.categories} />
                  </td>
                  <td className="px-6 py-5 text-body-sm font-semibold text-secondary">
                    {problem.sharedBy}
                  </td>
                  <td className="px-6 py-5 text-body-sm text-slate-500">
                    {problem.sharedAtLabel}
                  </td>
                  <td className="px-6 py-5">
                    <ProblemState status={problem.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProblems.length === 0 ? (
          <EmptyState
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        ) : null}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-100 bg-slate-50/30 px-6 py-4 sm:flex-row sm:items-center">
          <p className="text-body-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-on-surface">
              {filteredProblems.length > 0 ? "1" : "0"} -{" "}
              {filteredProblems.length}
            </span>{" "}
            of {problems.length.toLocaleString()} study problems
          </p>
          {hasActiveFilters ? (
            <button
              className="text-body-sm font-semibold text-secondary hover:underline"
              onClick={clearFilters}
              type="button"
            >
              Clear filters
            </button>
          ) : null}
        </div>
        <StudyProblemModal
          onClose={() => setSelectedProblem(null)}
          problem={selectedProblem}
        />
      </section>
    </>
  );
}

function StudyProblemFilters({
  filteredCount,
  memberNames,
  onClearFilters,
  onPlatformChange,
  onSharedByChange,
  onTierChange,
  platformFilter,
  sharedByFilter,
  tiers,
  tierFilter,
  totalCount,
}: {
  filteredCount: number;
  memberNames: string[];
  onClearFilters: () => void;
  onPlatformChange: (platform: string) => void;
  onSharedByChange: (sharedBy: string) => void;
  onTierChange: (tier: string) => void;
  platformFilter: string;
  sharedByFilter: string;
  tiers: string[];
  tierFilter: string;
  totalCount: number;
}) {
  const hasActiveFilters =
    platformFilter !== "All" || tierFilter !== "All" || sharedByFilter !== "All";

  return (
    <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <FilterCard title="Platform">
        <div className="flex flex-wrap gap-2">
          {["All", "BAEKJOON", "PROGRAMMERS"].map((platform) => (
            <button
              aria-pressed={platformFilter === platform}
              className={
                platformFilter === platform
                  ? "rounded-lg border border-primary-container/20 bg-primary-container px-3 py-1.5 text-body-sm font-medium text-on-primary-container"
                  : "rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-body-sm font-medium text-slate-600 transition-colors hover:border-primary-container hover:text-primary"
              }
              key={platform}
              onClick={() => onPlatformChange(platform)}
              type="button"
            >
              {platform}
            </button>
          ))}
        </div>
      </FilterCard>
      <FilterCard title="Tier">
        <select
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
          onChange={(event) => onTierChange(event.target.value)}
          value={tierFilter}
        >
          <option>All</option>
          {tiers.map((tier) => (
            <option key={tier}>{tier}</option>
          ))}
        </select>
      </FilterCard>
      <FilterCard title="Shared By">
        <select
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
          onChange={(event) => onSharedByChange(event.target.value)}
          value={sharedByFilter}
        >
          <option>All</option>
          {memberNames.map((memberName) => (
            <option key={memberName}>{memberName}</option>
          ))}
        </select>
      </FilterCard>
      <FilterCard title="Result">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-h3-ui text-primary">
              {filteredCount.toLocaleString()}
            </p>
            <p className="text-body-sm text-slate-500">
              of {totalCount.toLocaleString()} shared
            </p>
          </div>
          {hasActiveFilters ? (
            <button
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-body-sm font-semibold text-slate-600 transition-colors hover:border-secondary hover:text-secondary"
              onClick={onClearFilters}
              type="button"
            >
              Reset
            </button>
          ) : null}
        </div>
      </FilterCard>
    </section>
  );
}

function FilterCard({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="app-card min-w-0 p-4">
      <h2 className="mb-3 block text-label-caps text-slate-500">{title}</h2>
      {children}
    </div>
  );
}

function StudyProblemModal({
  onClose,
  problem,
}: {
  onClose: () => void;
  problem: StudyProblem | null;
}) {
  useEffect(() => {
    if (!problem) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, problem]);

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
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-mono-code text-[11px] text-slate-500">
                {problem.code}
              </span>
              {problem.tier ? (
                <span className={getTierBadgeClass(problem.tier)}>
                  {problem.tier}
                </span>
              ) : null}
              <span className="text-[11px] font-semibold text-slate-400">
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
            aria-label="Close problem modal"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </header>
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
                <h3 className="mb-2 text-label-caps text-slate-500">Memo</h3>
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
          </aside>
        </div>
      </div>
    </div>
  );
}

function ProblemMetaList({ problem }: { problem: StudyProblem }) {
  const score =
    problem.score !== null
      ? `${problem.score.toLocaleString()}${problem.scoreMax !== null ? ` / ${problem.scoreMax.toLocaleString()}` : ""}`
      : "-";

  return (
    <dl className="grid gap-3">
      <MetaItem label="Submitted" value={problem.submittedAtText ?? "-"} />
      <MetaItem label="Score" value={score} />
      <MetaItem label="Shared By" value={problem.sharedBy} />
      <MetaItem label="Shared At" value={problem.sharedAtLabel} />
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
  return (
    <section>
      <h3 className="mb-3 section-title">풀이 코드</h3>
      {code ? (
        <pre className="max-h-[420px] overflow-auto rounded-lg bg-surface-container-low p-4 text-mono-code text-body-sm text-primary">
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

function ProblemTags({ categories }: { categories: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {categories.length > 0 ? (
        categories.map((tag) => (
          <span
            className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500"
            key={tag}
          >
            {tag}
          </span>
        ))
      ) : (
        <span className="text-body-sm text-slate-400">No tags</span>
      )}
    </div>
  );
}

function ProblemState({ status }: { status: ProblemSubmissionStatus }) {
  return (
    <div className="flex min-w-36 flex-col items-start gap-1.5">
      <span className={getProblemStatusBadgeClass(status)}>
        {getProblemStatusLabel(status)}
      </span>
      <span className="text-body-sm text-slate-500">
        {getProblemStatusDescription(status)}
      </span>
    </div>
  );
}

function EmptyState({
  hasActiveFilters,
  onClearFilters,
}: {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  if (hasActiveFilters) {
    return (
      <div className="border-t border-slate-100 px-6 py-14 text-center">
        <p className="font-semibold text-on-surface">No matching problems</p>
        <p className="mt-2 text-body-sm text-slate-500">
          Change or reset the filters to see more shared problems.
        </p>
        <button className="btn-secondary mt-5" onClick={onClearFilters} type="button">
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-100 px-6 py-14 text-center">
      <p className="font-semibold text-on-surface">No shared problems yet</p>
      <p className="mt-2 text-body-sm text-slate-500">
        Share a completed submission from your problem detail page to populate
        this study list.
      </p>
      <Link className="btn-secondary mt-5" href="/problem">
        Browse Problems
      </Link>
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-4 text-label-caps text-slate-400">{children}</th>
  );
}

function getPlatformInitial(platform: string) {
  return platform.charAt(0);
}

function getTierBadgeClass(tier: string | null) {
  if (tier?.toLowerCase().includes("ruby")) {
    return "border-rose-300 bg-rose-600 text-white";
  }

  if (tier?.toLowerCase().includes("diamond")) {
    return "border-sky-300 bg-sky-100 text-sky-800";
  }

  if (tier?.toLowerCase().includes("platinum")) {
    return "badge-tier-platinum";
  }

  if (tier?.toLowerCase().includes("gold")) {
    return "badge-tier-gold";
  }

  if (tier?.toLowerCase().includes("bronze")) {
    return "border-amber-700/20 bg-amber-700 text-white";
  }

  return "badge-tier-silver";
}
