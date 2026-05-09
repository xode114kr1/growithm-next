import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

type Problem = {
  accuracy: number | null;
  categories: string[];
  createdAt: Date;
  description: string | null;
  id: string;
  link: string | null;
  memory: string | null;
  platform: string;
  problemId: string;
  score: number | null;
  scoreMax: number | null;
  submittedAtText: string | null;
  tier: string | null;
  time: string | null;
  title: string;
  updatedAt: Date;
};

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const problem = await getProblem(id);

  if (!problem) {
    notFound();
  }

  return (
    <main className="page-shell">
      <div className="mx-auto w-full max-w-[1120px] space-y-8">
        <ProblemHeader problem={problem} />
        <ProblemMetadata problem={problem} />
        <ProblemDescription description={problem.description} />
      </div>
    </main>
  );
}

// Loads one problem submission and maps nullable JSON fields for the detail UI.
async function getProblem(id: string): Promise<Problem | null> {
  const problem = await prisma.problemSubmission.findUnique({
    select: {
      accuracy: true,
      categories: true,
      createdAt: true,
      description: true,
      id: true,
      link: true,
      memory: true,
      platform: true,
      problemId: true,
      score: true,
      scoreMax: true,
      submittedAtText: true,
      tier: true,
      time: true,
      title: true,
      updatedAt: true,
    },
    where: {
      id,
    },
  });

  if (!problem) {
    return null;
  }

  return {
    ...problem,
    categories: normalizeCategories(problem.categories),
  };
}

function ProblemHeader({ problem }: { problem: Problem }) {
  return (
    <header className="border-b border-outline-variant/40 pb-8">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-body-sm text-slate-500">
        <Link className="font-semibold transition-colors hover:text-primary" href="/problem">
          Problems
        </Link>
        <span>/</span>
        <span>{problem.platform}</span>
        <span>/</span>
        <span>{problem.problemId}</span>
      </div>

      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary px-3 py-1 text-body-sm font-semibold text-on-primary">
              {problem.platform}
            </span>
            {problem.tier ? (
              <span className={getTierBadgeClass(problem.tier)}>{problem.tier}</span>
            ) : null}
            <span className="inline-flex rounded-full bg-secondary-fixed px-3 py-1 text-body-sm font-semibold text-on-secondary-fixed">
              Submitted
            </span>
          </div>
          <p className="mb-2 text-label-caps text-slate-400">
            Problem {problem.problemId}
          </p>
          <h1 className="page-title text-pretty break-words text-primary">
            {problem.title}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
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

function ProblemMetadata({ problem }: { problem: Problem }) {
  const metadata = [
    { label: "Memory", value: problem.memory },
    { label: "Time", value: problem.time },
    { label: "Submitted", value: problem.submittedAtText },
    { label: "Accuracy", value: formatAccuracy(problem.accuracy) },
    { label: "Score", value: formatScore(problem.score, problem.scoreMax) },
    { label: "Updated", value: formatDate(problem.updatedAt) },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));

  return (
    <section className="app-card p-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {metadata.map((item) => (
          <div key={item.label}>
            <p className="text-label-caps text-slate-400">{item.label}</p>
            <p className="mt-1 text-body-md font-semibold text-on-surface">
              {item.value}
            </p>
          </div>
        ))}
      </div>
      {problem.categories.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
          {problem.categories.map((category) => (
            <span
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-body-sm font-medium text-slate-600"
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

function ProblemDescription({ description }: { description: string | null }) {
  if (!description) {
    return (
      <section className="app-card p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-8 w-1 rounded-full bg-secondary-fixed-dim" />
          <h2 className="section-title">문제 설명</h2>
        </div>
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-body-sm text-slate-500">
          저장된 문제 설명이 없습니다.
        </div>
      </section>
    );
  }

  return (
    <section className="app-card p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="h-8 w-1 rounded-full bg-secondary-fixed-dim" />
        <h2 className="section-title">문제 설명</h2>
      </div>
      <div
        className="problem-description text-body-md text-on-surface-variant"
        // Server-provided HTML must be sanitized before rendering in production.
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </section>
  );
}

function normalizeCategories(categories: unknown): string[] {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.filter(
    (category): category is string => typeof category === "string",
  );
}

function formatAccuracy(accuracy: number | null) {
  return accuracy === null ? null : `${accuracy}%`;
}

function formatScore(score: number | null, scoreMax: number | null) {
  if (score === null) {
    return null;
  }

  return scoreMax === null ? String(score) : `${score} / ${scoreMax}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
  }).format(date);
}

function getTierBadgeClass(tier: string) {
  if (tier.toLowerCase().includes("platinum")) {
    return "badge-tier-platinum";
  }

  if (tier.toLowerCase().includes("gold")) {
    return "badge-tier-gold";
  }

  return "badge-tier-silver";
}
