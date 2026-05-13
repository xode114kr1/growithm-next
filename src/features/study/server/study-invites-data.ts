import { prisma } from "@/lib/prisma";
import type { StudyInviteItem } from "@/features/study/types";
import { formatRelativeDate, getUserDisplayName } from "@/features/study/utils";

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
