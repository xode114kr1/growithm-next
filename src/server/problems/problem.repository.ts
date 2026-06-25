import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { ProblemSubmissionStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { ProblemFiltersState, ProblemSort } from "@/types/problem";

// 필터와 페이지 조건에 맞는 문제 제출 목록을 조회한다.
export async function findProblems({
  filters,
  page,
  pageSize,
  userId,
}: {
  filters: ProblemFiltersState;
  page: number;
  pageSize: number;
  userId: string;
}) {
  return prisma.problemSubmission.findMany({
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
    skip: (page - 1) * pageSize,
    take: pageSize,
    where: {
      ...buildProblemWhere(filters),
      userId,
    },
  });
}

// 사용자의 필터 조건에 해당하는 문제 제출 수를 조회한다.
export async function countProblems({
  filters,
  userId,
}: {
  filters?: ProblemFiltersState;
  userId: string;
}) {
  return prisma.problemSubmission.count({
    where: {
      ...(filters ? buildProblemWhere(filters) : {}),
      userId,
    },
  });
}

// 사용자의 문제 제출에 등록된 고유 티어 목록을 조회한다.
export async function findAvailableProblemTiers(userId: string) {
  return prisma.problemSubmission.findMany({
    distinct: ["tier"],
    orderBy: { tier: "asc" },
    select: { tier: true },
    where: {
      tier: { not: null },
      userId,
    },
  });
}

// 사용자가 소유한 문제 제출 ID에 해당하는 상세 정보를 조회한다.
export async function findProblemDetail({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  return prisma.problemSubmission.findFirst({
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
    where: { id, userId },
  });
}

// 사용자의 문제 제출 티어 목록을 조회한다.
export async function findProblemTiersByUserId(userId: string) {
  return prisma.problemSubmission.findMany({
    select: { tier: true },
    where: { userId },
  });
}

// 사용자의 최근 대기 문제를 조회한다.
export async function findPendingProblemsByUserId({
  limit,
  userId,
}: {
  limit: number;
  userId: string;
}) {
  return prisma.problemSubmission.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    select: {
      id: true,
      platform: true,
      problemId: true,
      submittedAtText: true,
      tier: true,
      title: true,
    },
    take: limit,
    where: {
      status: ProblemSubmissionStatus.PENDING,
      userId,
    },
  });
}

// 사용자의 전체 문제 제출 수를 조회한다.
export async function countProblemsByUserId(userId: string) {
  return prisma.problemSubmission.count({ where: { userId } });
}

// 사용자가 소유한 문제 제출의 메모와 상태를 갱신한다.
export async function updateProblemMemoRecord({
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
    where: { id: problemId, userId },
  });

  return result.count > 0;
}

// 사용자가 소유한 공유 대상 문제를 조회한다.
export async function findOwnedProblemForSharing({
  problemId,
  userId,
}: {
  problemId: string;
  userId: string;
}) {
  return prisma.problemSubmission.findFirst({
    select: {
      id: true,
      platform: true,
      status: true,
      submittedAtText: true,
      tier: true,
    },
    where: { id: problemId, userId },
  });
}

// 사용자가 공유할 권한이 있는 스터디 ID를 조회한다.
export async function findAuthorizedStudyIds({
  studyIds,
  userId,
}: {
  studyIds: string[];
  userId: string;
}) {
  const studies = await prisma.study.findMany({
    select: { id: true },
    where: {
      id: { in: studyIds },
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
  });

  return studies.map((study) => study.id);
}

// 새로 생성된 문제 공유에 대해서만 스터디 점수를 반영한다.
export async function createProblemShares({
  problemId,
  shareScore,
  studyIds,
  userId,
}: {
  problemId: string;
  shareScore: number;
  studyIds: string[];
  userId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const shareLockKey = `problem-share:${problemId}`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${shareLockKey}, 0))`;

    const existingShares = await tx.studyProblemShare.findMany({
      select: { studyId: true },
      where: {
        problemSubmissionId: problemId,
        studyId: { in: studyIds },
      },
    });
    const existingStudyIds = new Set(
      existingShares.map((share) => share.studyId),
    );
    const newStudyIds = studyIds.filter(
      (studyId) => !existingStudyIds.has(studyId),
    );

    if (newStudyIds.length === 0) return [];

    await tx.studyProblemShare.createMany({
      data: newStudyIds.map((studyId) => ({
        problemSubmissionId: problemId,
        score: shareScore,
        studyId,
        userId,
      })),
    });

    if (shareScore > 0) {
      await tx.study.updateMany({
        data: { score: { increment: shareScore } },
        where: { id: { in: newStudyIds } },
      });
    }

    return newStudyIds;
  });
}

// 문제 목록 필터를 Prisma 조회 조건으로 변환한다.
function buildProblemWhere(filters: ProblemFiltersState) {
  const where: Prisma.ProblemSubmissionWhereInput = {};

  if (filters.platform) where.platform = filters.platform;
  if (filters.tier) where.tier = filters.tier;

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { problemId: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return where;
}

// 선택한 문제 정렬 기준을 Prisma 정렬 조건으로 변환한다.
function buildProblemOrderBy(sort: ProblemSort) {
  const orderBy: Prisma.ProblemSubmissionOrderByWithRelationInput[] = [];

  if (sort === "oldest") orderBy.push({ createdAt: "asc" });
  else if (sort === "title") orderBy.push({ title: "asc" });
  else if (sort === "platform") orderBy.push({ platform: "asc" });
  else orderBy.push({ createdAt: "desc" });

  orderBy.push({ id: "asc" });

  return orderBy;
}
