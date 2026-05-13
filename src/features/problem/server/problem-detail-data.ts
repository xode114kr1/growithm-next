import { prisma } from "@/lib/prisma";

import type { ProblemDetail } from "@/features/problem/types";

// 문제 제출 1건을 조회하고 상세 UI에 맞게 nullable JSON 필드를 정리한다.
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
    categories: normalizeCategories(problem.categories),
  };
}

function normalizeCategories(categories: unknown): string[] {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.filter(
    (category): category is string => typeof category === "string",
  );
}
