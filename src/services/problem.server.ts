import "server-only";

import { ProblemSubmissionStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type {
  PendingProblem,
  PlatformProblemCount,
  ProblemTierBucket,
} from "@/types/problem";
import {
  createPendingProblem,
  createPlatformProblemCounts,
  createProblemTierBuckets,
} from "@/utils/problem";

const PENDING_PROBLEM_LIMIT = 3;

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
