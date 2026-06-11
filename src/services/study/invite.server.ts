import "server-only";

import { prisma } from "@/lib/prisma";
import type { StudyInviteItem } from "@/types/study";
import { formatRelativeDate, getUserDisplayName } from "@/utils/study";

// 사용자에게 도착한 유효한 대기 중 스터디 초대를 조회한다.
export async function getPendingInvites(
  userId: string,
): Promise<StudyInviteItem[]> {
  const invites = await prisma.studyInvite.findMany({
    include: {
      invitedBy: {
        select: {
          name: true,
        },
      },
      study: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    where: {
      expiresAt: {
        gt: new Date(),
      },
      status: "PENDING",
      targetUserId: userId,
    },
  });

  return invites.map((invite) => ({
    id: invite.id,
    invitedByName: getUserDisplayName(invite.invitedBy.name),
    studyTitle: invite.study.title,
    timeLabel: formatRelativeDate(invite.createdAt),
  }));
}
