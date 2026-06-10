import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { ProblemSubmissionStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type {
  PendingProblem,
  PlatformProblemCount,
  ProblemDetail,
  ProblemFiltersState,
  ProblemListItem,
  ProblemShareResult,
  ProblemSort,
  ProblemTierBucket,
} from "@/types/problem";
import {
  createPendingProblem,
  createPlatformProblemCounts,
  createProblemTierBuckets,
  normalizeProblemCategories,
} from "@/utils/problem";

export const PROBLEM_PAGE_SIZE = 25;
const PENDING_PROBLEM_LIMIT = 3;

export async function getProblems({
  filters,
  page,
}: {
  filters: ProblemFiltersState;
  page: number;
}): Promise<ProblemListItem[]> {
  const rows = await prisma.problemSubmission.findMany({
    orderBy: buildProblemOrderBy(filters.sort),
    select: {
      categories: true,
      createdAt: true,
      id: true,
      platform: true,
      problemId: true,
      status: true,
      submittedAtText: true,
      tier: true,
      title: true,
    },
    skip: (page - 1) * PROBLEM_PAGE_SIZE,
    take: PROBLEM_PAGE_SIZE,
    where: buildProblemWhere(filters),
  });

  return rows.map((problem) => ({
    categories: normalizeProblemCategories(problem.categories),
    code: `${problem.platform}-${problem.problemId}`,
    createdAt: problem.createdAt,
    id: problem.id,
    platform: problem.platform,
    problemId: problem.problemId,
    status: problem.status,
    submittedAtText: problem.submittedAtText,
    tier: problem.tier,
    title: problem.title,
  }));
}

export async function getProblemCount(filters?: ProblemFiltersState) {
  return prisma.problemSubmission.count({
    where: filters ? buildProblemWhere(filters) : undefined,
  });
}

export async function getAvailableProblemTiers() {
  const tiers = await prisma.problemSubmission.findMany({
    distinct: ["tier"],
    orderBy: {
      tier: "asc",
    },
    select: {
      tier: true,
    },
    where: {
      tier: {
        not: null,
      },
    },
  });

  return tiers.flatMap((item) => item.tier ?? []);
}

export async function getProblemDetail(id: string): Promise<ProblemDetail | null> {
  const problem = await prisma.problemSubmission.findUnique({
    select: {
      accuracy: true,
      categories: true,
      code: true,
      createdAt: true,
      description: true,
      id: true,
      link: true,
      memory: true,
      memo: true,
      platform: true,
      problemId: true,
      score: true,
      scoreMax: true,
      status: true,
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
    categories: normalizeProblemCategories(problem.categories),
  };
}

export async function getProblemTierDistribution(
  userId: string | undefined,
): Promise<ProblemTierBucket[]> {
  if (!userId) {
    return createProblemTierBuckets([]);
  }

  const rows = await prisma.problemSubmission.findMany({
    select: {
      tier: true,
    },
    where: {
      userId,
    },
  });

  return createProblemTierBuckets(rows);
}

export async function getPendingProblems(
  userId: string | undefined,
): Promise<PendingProblem[]> {
  if (!userId) {
    return [];
  }

  const rows = await prisma.problemSubmission.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    select: {
      id: true,
      platform: true,
      problemId: true,
      submittedAtText: true,
      tier: true,
      title: true,
    },
    take: PENDING_PROBLEM_LIMIT,
    where: {
      status: ProblemSubmissionStatus.PENDING,
      userId,
    },
  });

  return rows.map(createPendingProblem);
}

export async function getProblemCountsByPlatform(
  userId: string | undefined,
): Promise<PlatformProblemCount[]> {
  if (!userId) {
    return createPlatformProblemCounts([]);
  }

  const rows = await prisma.problemSubmission.groupBy({
    by: ["platform"],
    _count: {
      _all: true,
    },
    where: {
      userId,
    },
  });

  return createPlatformProblemCounts(rows);
}

export async function getSolvedProblemCount(userId: string | undefined) {
  if (!userId) {
    return 0;
  }

  return prisma.problemSubmission.count({
    where: {
      userId,
    },
  });
}

export async function updateProblemMemo({
  memo,
  problemId,
  userId,
}: {
  memo: string;
  problemId: string;
  userId: string;
}) {
  const result = await prisma.problemSubmission.updateMany({
    data: {
      memo: memo || null,
      status: memo
        ? ProblemSubmissionStatus.COMPLETED
        : ProblemSubmissionStatus.PENDING,
    },
    where: {
      id: problemId,
      userId,
    },
  });

  return result.count > 0;
}

export async function shareProblemWithStudies({
  problemId,
  studyIds,
  userId,
}: {
  problemId: string;
  studyIds: string[];
  userId: string;
}): Promise<ProblemShareResult> {
  const problem = await prisma.problemSubmission.findFirst({
    select: {
      id: true,
      status: true,
      submittedAtText: true,
      tier: true,
    },
    where: {
      id: problemId,
      userId,
    },
  });

  if (!problem) {
    return createProblemShareError("공유할 수 있는 문제를 찾을 수 없습니다.");
  }

  if (problem.status !== ProblemSubmissionStatus.COMPLETED) {
    return createProblemShareError(
      "메모 작성이 완료된 문제만 공유할 수 있습니다.",
    );
  }

  const studies = await prisma.study.findMany({
    select: {
      id: true,
    },
    where: {
      id: {
        in: studyIds,
      },
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
  const authorizedStudyIds = studies.map((study) => study.id);

  if (authorizedStudyIds.length === 0) {
    return createProblemShareError("공유할 수 있는 스터디를 찾을 수 없습니다.");
  }

  const existingShares = await prisma.studyProblemShare.findMany({
    select: {
      studyId: true,
    },
    where: {
      problemSubmissionId: problem.id,
      studyId: {
        in: authorizedStudyIds,
      },
    },
  });
  const existingStudyIds = new Set(existingShares.map((share) => share.studyId));
  const newStudyIds = authorizedStudyIds.filter(
    (studyId) => !existingStudyIds.has(studyId),
  );
  const skippedCount = studyIds.length - newStudyIds.length;

  if (newStudyIds.length === 0) {
    return {
      error: null,
      newStudyIds,
      skippedCount,
    };
  }

  const shareScore = isWithinShareScoreWindow(problem.submittedAtText)
    ? getProblemShareScore(problem.tier)
    : 0;

  await prisma.$transaction(async (tx) => {
    await tx.studyProblemShare.createMany({
      data: newStudyIds.map((studyId) => ({
        problemSubmissionId: problem.id,
        score: shareScore,
        studyId,
        userId,
      })),
      skipDuplicates: true,
    });

    if (shareScore > 0) {
      await tx.study.updateMany({
        data: {
          score: {
            increment: shareScore,
          },
        },
        where: {
          id: {
            in: newStudyIds,
          },
        },
      });
    }
  });

  return {
    error: null,
    newStudyIds,
    skippedCount,
  };
}

function buildProblemWhere(filters: ProblemFiltersState) {
  const where: Prisma.ProblemSubmissionWhereInput = {};

  if (filters.platform) {
    where.platform = filters.platform;
  }

  if (filters.tier) {
    where.tier = filters.tier;
  }

  if (filters.q) {
    where.OR = [
      {
        title: {
          contains: filters.q,
          mode: "insensitive",
        },
      },
      {
        problemId: {
          contains: filters.q,
          mode: "insensitive",
        },
      },
    ];
  }

  return where;
}

function buildProblemOrderBy(sort: ProblemSort) {
  const orderBy: Prisma.ProblemSubmissionOrderByWithRelationInput[] = [];

  if (sort === "oldest") {
    orderBy.push({ createdAt: "asc" });
  } else if (sort === "title") {
    orderBy.push({ title: "asc" });
  } else if (sort === "platform") {
    orderBy.push({ platform: "asc" });
  } else {
    orderBy.push({ createdAt: "desc" });
  }

  orderBy.push({ id: "asc" });

  return orderBy;
}

function createProblemShareError(error: string): ProblemShareResult {
  return {
    error,
    newStudyIds: [],
    skippedCount: 0,
  };
}

function getProblemShareScore(tier: string | null) {
  const normalizedTier = tier?.toLowerCase() ?? "";

  if (normalizedTier.includes("ruby")) return 60;
  if (normalizedTier.includes("diamond")) return 50;
  if (normalizedTier.includes("platinum")) return 40;
  if (normalizedTier.includes("gold")) return 30;
  if (normalizedTier.includes("silver")) return 20;
  if (normalizedTier.includes("bronze")) return 10;

  const levelMatch = normalizedTier.match(/(?:lv\.?|level)\s*(\d+)/);

  return levelMatch ? Math.max(0, Number(levelMatch[1]) * 10) : 0;
}

function isWithinShareScoreWindow(submittedAtText: string | null) {
  const submittedAt = parseSubmittedAt(submittedAtText);

  if (!submittedAt) {
    return false;
  }

  const elapsedMs = Date.now() - submittedAt.getTime();

  return elapsedMs >= 0 && elapsedMs <= 2 * 24 * 60 * 60 * 1000;
}

function parseSubmittedAt(submittedAtText: string | null) {
  if (!submittedAtText) {
    return null;
  }

  const trimmed = submittedAtText.trim();
  const numericParts = trimmed.match(/\d+/g);

  if (numericParts && numericParts.length >= 3) {
    return new Date(
      Number(numericParts[0]),
      Number(numericParts[1]) - 1,
      Number(numericParts[2]),
      Number(numericParts[3] ?? 0),
      Number(numericParts[4] ?? 0),
      Number(numericParts[5] ?? 0),
    );
  }

  const parsed = new Date(trimmed);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
