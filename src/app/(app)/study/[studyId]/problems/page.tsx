import Link from "next/link";
import { notFound } from "next/navigation";

import StudyProblemModalTable from "@/app/(app)/study/[studyId]/problems/_components/study-problem-modal-table";
import type { StudyProblem } from "@/app/(app)/study/[studyId]/problems/_components/study-problem-modal-table";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

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
      <StudyProblemModalTable problems={data.problems} />
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
              code: true,
              description: true,
              id: true,
              link: true,
              memo: true,
              platform: true,
              problemId: true,
              score: true,
              scoreMax: true,
              status: true,
              submittedAtText: true,
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
    description: share.problemSubmission.description,
    id: share.problemSubmission.id,
    link: share.problemSubmission.link,
    memo: share.problemSubmission.memo,
    platform: share.problemSubmission.platform,
    score: share.problemSubmission.score,
    scoreMax: share.problemSubmission.scoreMax,
    sharedAtLabel: formatDate(share.sharedAt),
    sharedBy: getUserDisplayName(share.user.name),
    status: share.problemSubmission.status,
    submittedAtText: share.problemSubmission.submittedAtText,
    tier: share.problemSubmission.tier,
    title: share.problemSubmission.title,
    solutionCode: share.problemSubmission.code,
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

function normalizeCategories(categories: unknown): string[] {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.filter(
    (category): category is string => typeof category === "string",
  );
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
