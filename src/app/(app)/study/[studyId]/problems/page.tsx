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
      <StudyProblemModalTable
        memberNames={data.memberNames}
        problems={data.problems}
        tiers={data.tiers}
      />
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
    sharedAtTime: share.sharedAt.getTime(),
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
