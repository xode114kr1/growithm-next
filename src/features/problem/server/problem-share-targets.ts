import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

import type { ProblemShareTargetStudy } from "@/features/problem/types";

export async function getProblemShareTargetStudies(problemId: string): Promise<
  ProblemShareTargetStudy[]
> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return [];
  }

  const studies = await prisma.study.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      _count: {
        select: {
          members: true,
        },
      },
      id: true,
      owner: {
        select: {
          name: true,
        },
      },
      score: true,
      problemShares: {
        select: {
          id: true,
        },
        where: {
          problemSubmissionId: problemId,
        },
      },
      title: true,
    },
    where: {
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

  return studies.map((study) => ({
    hasShared: study.problemShares.length > 0,
    id: study.id,
    memberCount: study._count.members,
    ownerName: study.owner.name ?? "Unknown",
    score: study.score,
    title: study.title,
  }));
}
