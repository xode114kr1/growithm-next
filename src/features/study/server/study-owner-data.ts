import { prisma } from "@/lib/prisma";
import type { OwnerMember, StudyOwnerData } from "@/features/study/types";
import { formatShortDate, getUserDisplayName } from "@/features/study/utils";

export async function getStudyOwnerData({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}): Promise<StudyOwnerData | null> {
  const study = await prisma.study.findFirst({
    include: {
      invites: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          status: true,
          target: true,
        },
        where: {
          status: "PENDING",
        },
      },
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
        select: {
          score: true,
          sharedAt: true,
          userId: true,
        },
      },
    },
    where: {
      id: studyId,
      ownerId: userId,
    },
  });

  if (!study) {
    return null;
  }

  const members = study.members.map((member): OwnerMember => {
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
      isCurrentUser: member.userId === userId,
      joinedAt: formatShortDate(member.joinedAt),
      lastActive: formatShortDate(lastSharedAt ?? member.joinedAt),
      name: getUserDisplayName(member.user.name),
      role: member.userId === study.ownerId ? "OWNER" : member.role,
    };
  });

  if (!members.some((member) => member.role === "OWNER")) {
    members.unshift({
      contribution: study.problemShares
        .filter((share) => share.userId === study.ownerId)
        .reduce((total, share) => total + share.score, 0),
      id: study.ownerId,
      isCurrentUser: study.ownerId === userId,
      joinedAt: formatShortDate(study.createdAt),
      lastActive: formatShortDate(study.createdAt),
      name: getUserDisplayName(study.owner.name),
      role: "OWNER",
    });
  }

  return {
    members,
    pendingInvites: study.invites.map((invite) => ({
      id: invite.id,
      status: "Pending",
      target: invite.target,
    })),
    study: {
      description: study.description ?? "아직 스터디 설명이 없습니다.",
      id: study.id,
      name: study.title,
    },
  };
}
