import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getProblemStatusBadgeClass,
  getProblemStatusDescription,
  getProblemStatusLabel,
} from "@/app/(app)/problem/_lib/problem-status";
import type { ProblemSubmissionStatus } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

type StudyProblem = {
  categories: string[];
  code: string;
  id: string;
  platform: string;
  sharedAt: Date;
  sharedBy: string;
  status: ProblemSubmissionStatus;
  tier: string | null;
  title: string;
};

type StudyProblemsData = {
  description: string;
  memberNames: string[];
  name: string;
  problems: StudyProblem[];
  tiers: string[];
};

export default async function StudyProblemsPage({
  params,
}: {
  params: Promise<{ studyId: string }>;
}) {
  const { studyId } = await params;
  const data = await getStudyProblemsData(studyId);

  if (!data) {
    notFound();
  }

  return (
    <>
      <StudyProblemsHeading
        description={data.description}
        name={data.name}
        totalCount={data.problems.length}
      />
      <StudyProblemFilters
        memberNames={data.memberNames}
        tiers={data.tiers}
        totalCount={data.problems.length}
      />
      <StudyProblemTable problems={data.problems} />
    </>
  );
}

async function getStudyProblemsData(
  studyId: string,
): Promise<StudyProblemsData | null> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const study = await prisma.study.findFirst({
    include: {
      members: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          joinedAt: "asc",
        },
      },
      owner: {
        select: {
          name: true,
        },
      },
      problemShares: {
        include: {
          problemSubmission: {
            select: {
              categories: true,
              id: true,
              platform: true,
              problemId: true,
              status: true,
              tier: true,
              title: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          sharedAt: "desc",
        },
      },
    },
    where: {
      id: studyId,
      OR: [
        {
          ownerId: userId,
        },
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
  });

  if (!study) {
    return null;
  }

  const problems = study.problemShares.map((share) => ({
    categories: normalizeCategories(share.problemSubmission.categories),
    code: `${share.problemSubmission.platform}-${share.problemSubmission.problemId}`,
    id: share.problemSubmission.id,
    platform: share.problemSubmission.platform,
    sharedAt: share.sharedAt,
    sharedBy: getUserDisplayName(share.user.name),
    status: share.problemSubmission.status,
    tier: share.problemSubmission.tier,
    title: share.problemSubmission.title,
  }));

  return {
    description:
      study.description ?? "스터디원들이 함께 공유한 문제를 확인합니다.",
    memberNames: [
      getUserDisplayName(study.owner.name),
      ...study.members.map((member) => getUserDisplayName(member.user.name)),
    ].filter((name, index, names) => names.indexOf(name) === index),
    name: study.title,
    problems,
    tiers: problems
      .flatMap((problem) => problem.tier ?? [])
      .filter((tier, index, tiers) => tiers.indexOf(tier) === index),
  };
}

function StudyProblemsHeading({
  description,
  name,
  totalCount,
}: {
  description: string;
  name: string;
  totalCount: number;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2 text-body-sm text-slate-500">
          <Link
            className="font-semibold transition-colors hover:text-primary"
            href="/study"
          >
            Studies
          </Link>
          <span>/</span>
          <span className="font-semibold text-primary">{name}</span>
          <span>/</span>
          <span>스터디 - 문제 리스트</span>
        </div>
        <h1 className="page-title mb-2">Study Problem List</h1>
        <p className="max-w-xl text-body-md text-on-surface-variant">
          {description}
        </p>
      </div>
      <div className="app-card px-5 py-3">
        <p className="text-label-caps text-slate-400">Shared Problems</p>
        <p className="text-h3-ui text-primary">{totalCount.toLocaleString()}</p>
      </div>
    </div>
  );
}

function StudyProblemFilters({
  memberNames,
  tiers,
  totalCount,
}: {
  memberNames: string[];
  tiers: string[];
  totalCount: number;
}) {
  return (
    <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <FilterCard title="Platform">
        <div className="flex flex-wrap gap-2">
          {["All", "BAEKJOON", "PROGRAMMERS"].map((platform) => (
            <span
              className={
                platform === "All"
                  ? "rounded-lg border border-primary-container/20 bg-primary-container px-3 py-1.5 text-body-sm font-medium text-on-primary-container"
                  : "rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-body-sm font-medium text-slate-600"
              }
              key={platform}
            >
              {platform}
            </span>
          ))}
        </div>
      </FilterCard>
      <FilterCard title="Tier">
        <select className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20">
          <option>All Tiers</option>
          {tiers.map((tier) => (
            <option key={tier}>{tier}</option>
          ))}
        </select>
      </FilterCard>
      <FilterCard title="Shared By">
        <select className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20">
          <option>All Members</option>
          {memberNames.map((memberName) => (
            <option key={memberName}>{memberName}</option>
          ))}
        </select>
      </FilterCard>
      <FilterCard title="Result">
        <p className="text-h3-ui text-primary">{totalCount.toLocaleString()}</p>
        <p className="text-body-sm text-slate-500">현재 공유된 문제 수</p>
      </FilterCard>
    </section>
  );
}

function StudyProblemTable({
  problems,
}: {
  problems: StudyProblem[];
}) {
  return (
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
            {problems.map((problem) => (
              <tr
                className="group transition-colors hover:bg-slate-50/80"
                key={problem.id}
              >
                <td className="min-w-[360px] max-w-[560px] px-6 py-5">
                  <Link
                    className="flex items-start gap-4 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
                    href={`/problem/${problem.id}`}
                  >
                    <span
                      className={`mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border text-xs font-black shadow-sm ${getTierBadgeClass(problem.tier)}`}
                    >
                      {getPlatformInitial(problem.platform)}
                    </span>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-mono-code text-[11px] text-slate-500">
                          {problem.code}
                        </span>
                        {problem.tier ? (
                          <span className={getTierBadgeClass(problem.tier)}>
                            {problem.tier}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="text-pretty break-words font-semibold leading-snug text-on-surface transition-colors group-hover:text-secondary">
                        {problem.title}
                      </h3>
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-1.5">
                    {problem.categories.length > 0 ? (
                      problem.categories.map((tag) => (
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
                </td>
                <td className="px-6 py-5 text-body-sm font-semibold text-secondary">
                  {problem.sharedBy}
                </td>
                <td className="px-6 py-5 text-body-sm text-slate-500">
                  {formatDate(problem.sharedAt)}
                </td>
                <td className="px-6 py-5">
                  <ProblemState status={problem.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {problems.length === 0 ? <EmptyState /> : null}
      <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-100 bg-slate-50/30 px-6 py-4 sm:flex-row sm:items-center">
        <p className="text-body-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-on-surface">
            {problems.length > 0 ? "1" : "0"} - {problems.length}
          </span>{" "}
          of {problems.length.toLocaleString()} study problems
        </p>
      </div>
    </section>
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

function EmptyState() {
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

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-4 text-label-caps text-slate-400">{children}</th>
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

function getUserDisplayName(name: string | null) {
  return name || "Unknown";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
