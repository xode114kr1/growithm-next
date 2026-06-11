import "server-only";

import { prisma } from "@/lib/prisma";
import type { StudyListItem } from "@/types/study";
import {
  getProgressLabel,
  getStudyTier,
  getTierProgress,
} from "@/utils/study";

// 사용자가 참여하거나 소유한 스터디 목록을 조회한다.
export async function getUserStudies(userId: string): Promise<StudyListItem[]> {
  const studies = await prisma.study.findMany({
    include: {
      _count: {
        select: {
          members: true,
        },
      },
      owner: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
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

  return studies.map((study) => {
    const tier = getStudyTier(study.score);
    const progress = getTierProgress(study.score, tier);

    return {
      description: study.description ?? "아직 스터디 설명이 없습니다.",
      id: study.id,
      isOwner: study.ownerId === userId,
      memberCount: study._count.members,
      ownerName: study.owner.name ?? "Unknown",
      progress,
      progressLabel: getProgressLabel(study.score, tier),
      score: study.score,
      tier,
      title: study.title,
    };
  });
}
