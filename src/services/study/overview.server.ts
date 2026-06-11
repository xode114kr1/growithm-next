import "server-only";

import { prisma } from "@/lib/prisma";
import type { StudyOverview } from "@/types/study";
import {
  getNextTierScore,
  getStudyTier,
  getUserDisplayName,
} from "@/utils/study";

// 스터디 개요 화면에 필요한 통계와 최근 활동을 조회한다.
export async function getStudyOverview({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}): Promise<StudyOverview | null> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const study = await prisma.study.findFirst({
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
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
          id: true,
          name: true,
        },
      },
      problemShares: {
        include: {
          problemSubmission: {
            select: {
              platform: true,
              tier: true,
              title: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          sharedAt: "desc",
        },
        take: 10,
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

  const tier = getStudyTier(study.score);
  const contribution = study.members.map((member) => ({
    name: getUserDisplayName(member.user.name),
    score: study.problemShares
      .filter((share) => share.userId === member.userId)
      .reduce((total, share) => total + share.score, 0),
  }));

  return {
    contribution,
    description: study.description ?? "아직 스터디 설명이 없습니다.",
    id: study.id,
    isOwner: study.ownerId === userId,
    memberCount: study.members.length,
    members: study.members.map((member) => ({
      name: getUserDisplayName(member.user.name),
      role: member.userId === study.ownerId ? "owner" : "member",
    })),
    name: study.title,
    nextTierScore: getNextTierScore(tier),
    recentProblems: study.problemShares.map((share) => ({
      platform: share.problemSubmission.platform,
      solvedBy: getUserDisplayName(share.user.name),
      tier: share.problemSubmission.tier ?? "-",
      title: share.problemSubmission.title,
    })),
    score: study.score,
    tier,
    totalSolved: study.problemShares.length,
    weeklySolved: study.problemShares.filter((share) => share.sharedAt >= oneWeekAgo)
      .length,
  };
}
