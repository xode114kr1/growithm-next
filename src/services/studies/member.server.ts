import "server-only";

import { prisma } from "@/lib/prisma";
import type { StudyMembersData } from "@/types/study";
import { getUserDisplayName } from "@/services/studies/study.helper";
import { formatShortDate } from "@/utils/date";

// 스터디 멤버 화면에 필요한 멤버와 기여도 정보를 조회한다.
export async function getStudyMembersData({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}): Promise<StudyMembersData | null> {
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
      problemShares: {
        select: {
          score: true,
          sharedAt: true,
          userId: true,
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

  return {
    description:
      study.description ?? "스터디 멤버의 기여도와 최근 활동 상태를 확인합니다.",
    memberCount: study.members.length,
    members: study.members.map((member) => {
      const shares = study.problemShares.filter(
        (share) => share.userId === member.userId,
      );
      const lastSharedAt = shares.reduce<Date | null>(
        (latestSharedAt, share) =>
          !latestSharedAt || share.sharedAt > latestSharedAt
            ? share.sharedAt
            : latestSharedAt,
        null,
      );

      return {
        contribution: shares.reduce((total, share) => total + share.score, 0),
        id: member.id,
        joinedAt: formatShortDate(member.joinedAt),
        joinedAtTime: member.joinedAt.getTime(),
        lastActive: formatShortDate(lastSharedAt ?? member.joinedAt),
        lastActiveTime: (lastSharedAt ?? member.joinedAt).getTime(),
        name: getUserDisplayName(member.user.name),
        role: member.role,
      };
    }),
    name: study.title,
  };
}
