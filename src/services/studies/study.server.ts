import "server-only";

import { prisma } from "@/lib/prisma";
import type { ProblemShareTargetStudy } from "@/types/study";

// 문제를 공유할 수 있는 사용자의 스터디 목록을 조회한다.
export async function getProblemShareTargetStudies({
  problemId,
  userId,
}: {
  problemId: string;
  userId: string | undefined;
}): Promise<ProblemShareTargetStudy[]> {
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
