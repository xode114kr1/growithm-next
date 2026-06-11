import "server-only";

import { prisma } from "@/lib/prisma";
import type { StudyProblemsData } from "@/types/study";
import {
  getUserDisplayName,
  normalizeCategories,
} from "@/services/studies/study.helper";
import { formatShortDate } from "@/utils/date";

// 스터디에 공유된 문제 목록과 필터 정보를 조회한다.
export async function getStudyProblemsData({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}): Promise<StudyProblemsData | null> {
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
    sharedAtLabel: formatShortDate(share.sharedAt),
    sharedAtTime: share.sharedAt.getTime(),
    sharedBy: getUserDisplayName(share.user.name),
    solutionCode: share.problemSubmission.code,
    status: share.problemSubmission.status,
    submittedAtText: share.problemSubmission.submittedAtText,
    tier: share.problemSubmission.tier,
    title: share.problemSubmission.title,
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
