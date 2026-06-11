import "server-only";

import { ProblemSubmissionStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type {
  PendingProblem,
  PlatformProblemCount,
  ProblemDetail,
  ProblemFiltersState,
  ProblemListItem,
  ProblemShareResult,
  ProblemTierBucket,
} from "@/types/problem";
import {
  createPendingProblem,
  createPlatformProblemCounts,
  createProblemTierBuckets,
  normalizeProblemCategories,
} from "@/utils/problem";
import {
  buildProblemOrderBy,
  buildProblemWhere,
  createProblemShareError,
  getProblemShareScore,
  isWithinShareScoreWindow,
} from "@/utils/problem.helper";

export const PROBLEM_PAGE_SIZE = 25;
const PENDING_PROBLEM_LIMIT = 3;

// 필터와 페이지 조건에 맞는 문제 목록을 조회한다.
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

// 필터 조건에 해당하는 문제 수를 조회한다.
export async function getProblemCount(filters?: ProblemFiltersState) {
  return prisma.problemSubmission.count({
    where: filters ? buildProblemWhere(filters) : undefined,
  });
}

// 문제 필터에 사용할 고유 티어 목록을 조회한다.
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

// 문제 상세 화면에 필요한 단일 문제 정보를 조회한다.
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

// 완료한 문제를 티어별로 집계해 분포 데이터를 만든다.
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

// 메모 작성이 필요한 사용자의 대기 문제를 조회한다.
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

// 사용자의 완료 문제 수를 플랫폼별로 집계한다.
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

// 사용자의 완료 문제 수를 조회한다.
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

// 사용자가 소유한 문제 제출의 메모와 상태를 수정한다.
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

// 문제를 선택한 스터디에 공유하고 스터디 점수를 갱신한다.
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
