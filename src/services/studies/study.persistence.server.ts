import "server-only";

import type { StudyMemberRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

// 스터디 접근 권한을 소유자 또는 멤버 조건으로 구성한다.
const accessibleStudyWhere = (studyId: string, userId: string) => ({
  id: studyId,
  OR: [{ ownerId: userId }, { members: { some: { userId } } }],
});

const accessibleRelatedStudyWhere = (userId: string) => ({
  OR: [{ ownerId: userId }, { members: { some: { userId } } }],
});

// 문제를 공유할 수 있는 사용자의 스터디를 조회한다.
export async function findProblemShareTargetStudies({
  problemId,
  userId,
}: {
  problemId: string;
  userId: string;
}) {
  return prisma.study.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      _count: { select: { members: true } },
      id: true,
      owner: { select: { name: true } },
      problemShares: {
        select: { id: true },
        where: { problemSubmissionId: problemId },
      },
      score: true,
      title: true,
    },
    where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
  });
}

// 사용자에게 도착한 유효한 대기 초대를 조회한다.
export async function findPendingInvites(userId: string) {
  return prisma.studyInvite.findMany({
    include: {
      invitedBy: { select: { name: true } },
      study: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    where: {
      expiresAt: { gt: new Date() },
      status: "PENDING",
      targetUserId: userId,
    },
  });
}

// 사용자가 접근 가능한 스터디의 레이아웃 정보를 조회한다.
export async function findStudyForLayout({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}) {
  return prisma.study.findFirst({
    select: { id: true, ownerId: true, title: true },
    where: accessibleStudyWhere(studyId, userId),
  });
}

// 사용자가 참여하거나 소유한 스터디 목록을 조회한다.
export async function findUserStudies(userId: string) {
  return prisma.study.findMany({
    include: {
      _count: { select: { members: true } },
      owner: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
    where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
  });
}

// 사용자가 접근 가능한 스터디의 제목과 설명을 조회한다.
export async function findStudyBasicInfo({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}) {
  return prisma.study.findFirst({
    select: {
      description: true,
      title: true,
    },
    where: accessibleStudyWhere(studyId, userId),
  });
}

// 사용자가 접근 가능한 스터디의 멤버와 기여 정보를 조회한다.
export async function findStudyForMembers({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}) {
  return prisma.study.findFirst({
    include: {
      members: {
        include: { user: { select: { name: true } } },
        orderBy: { joinedAt: "asc" },
      },
      problemShares: { select: { score: true, sharedAt: true, userId: true } },
    },
    where: accessibleStudyWhere(studyId, userId),
  });
}

// 사용자가 접근 가능한 스터디의 기본 정보를 조회한다.
export async function findStudySummary({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}) {
  return prisma.study.findFirst({
    select: {
      description: true,
      id: true,
      score: true,
      title: true,
    },
    where: accessibleStudyWhere(studyId, userId),
  });
}

// 사용자가 접근 가능한 스터디의 멤버를 조회한다.
export async function findStudyMembers({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}) {
  return prisma.study.findFirst({
    select: {
      members: {
        orderBy: { joinedAt: "asc" },
        select: {
          user: { select: { name: true } },
          userId: true,
        },
      },
      ownerId: true,
    },
    where: accessibleStudyWhere(studyId, userId),
  });
}

// 사용자가 접근 가능한 스터디의 전체 및 최근 공유 수를 집계한다.
export async function countStudyProblemShares({
  oneWeekAgo,
  studyId,
  userId,
}: {
  oneWeekAgo: Date;
  studyId: string;
  userId: string;
}) {
  const accessibleShareWhere = {
    study: accessibleRelatedStudyWhere(userId),
    studyId,
  };

  const [totalSolved, weeklySolved] = await prisma.$transaction([
    prisma.studyProblemShare.count({
      where: accessibleShareWhere,
    }),
    prisma.studyProblemShare.count({
      where: {
        ...accessibleShareWhere,
        sharedAt: { gte: oneWeekAgo },
      },
    }),
  ]);

  return { totalSolved, weeklySolved };
}

// 사용자가 접근 가능한 스터디의 사용자별 공유 점수를 집계한다.
export async function sumStudyProblemShareScoresByUser({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}) {
  return prisma.studyProblemShare.groupBy({
    by: ["userId"],
    _sum: { score: true },
    where: {
      study: accessibleRelatedStudyWhere(userId),
      studyId,
    },
  });
}

// 사용자가 접근 가능한 스터디의 최근 공유 문제를 조회한다.
export async function findRecentStudyProblems({
  limit,
  studyId,
  userId,
}: {
  limit: number;
  studyId: string;
  userId: string;
}) {
  return prisma.studyProblemShare.findMany({
    include: {
      problemSubmission: {
        select: { platform: true, tier: true, title: true },
      },
      user: { select: { name: true } },
    },
    orderBy: { sharedAt: "desc" },
    take: limit,
    where: {
      study: accessibleRelatedStudyWhere(userId),
      studyId,
    },
  });
}

// 소유자가 관리할 스터디의 멤버와 초대 정보를 조회한다.
export async function findStudyForOwner({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}) {
  return prisma.study.findFirst({
    include: {
      invites: {
        orderBy: { createdAt: "desc" },
        select: { id: true, status: true, target: true },
        where: { status: "PENDING" },
      },
      members: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { joinedAt: "asc" },
      },
      owner: { select: { id: true, name: true } },
      problemShares: { select: { score: true, sharedAt: true, userId: true } },
    },
    where: { id: studyId, ownerId: userId },
  });
}

// 사용자가 접근 가능한 스터디에 공유된 문제 정보를 조회한다.
export async function findStudyForProblems({
  studyId,
  userId,
}: {
  studyId: string;
  userId: string;
}) {
  return prisma.study.findFirst({
    include: {
      members: {
        include: { user: { select: { name: true } } },
        orderBy: { joinedAt: "asc" },
      },
      owner: { select: { name: true } },
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
          user: { select: { name: true } },
        },
        orderBy: { sharedAt: "desc" },
      },
    },
    where: accessibleStudyWhere(studyId, userId),
  });
}

// 스터디를 생성하고 소유자를 OWNER 멤버로 추가한다.
export async function createStudyRecord({
  description,
  title,
  userId,
}: {
  description: string;
  title: string;
  userId: string;
}) {
  return prisma.study.create({
    data: {
      description: description || null,
      members: { create: { role: "OWNER", user: { connect: { id: userId } } } },
      owner: { connect: { id: userId } },
      title,
    },
    select: { id: true },
  });
}

// 사용자가 받은 유효한 대기 초대를 조회한다.
export async function findPendingInviteForUser({
  inviteId,
  userId,
}: {
  inviteId: string;
  userId: string;
}) {
  return prisma.studyInvite.findFirst({
    select: { id: true, studyId: true },
    where: {
      expiresAt: { gt: new Date() },
      id: inviteId,
      status: "PENDING",
      targetUserId: userId,
    },
  });
}

// 초대를 수락하고 사용자를 스터디 멤버로 추가한다.
export async function acceptStudyInviteRecord({
  inviteId,
  studyId,
  userId,
}: {
  inviteId: string;
  studyId: string;
  userId: string;
}) {
  await prisma.$transaction([
    prisma.studyMember.upsert({
      create: { studyId, userId },
      update: {},
      where: { studyId_userId: { studyId, userId } },
    }),
    prisma.studyInvite.update({
      data: { status: "ACCEPTED" },
      where: { id: inviteId },
    }),
  ]);
}

// 사용자가 받은 대기 초대를 취소 상태로 변경한다.
export async function declineStudyInviteRecord({
  inviteId,
  userId,
}: {
  inviteId: string;
  userId: string;
}) {
  await prisma.studyInvite.updateMany({
    data: { status: "CANCELED" },
    where: { id: inviteId, status: "PENDING", targetUserId: userId },
  });
}

// 소유한 스터디와 초대 대상 사용자 및 멤버 여부를 조회한다.
export async function findStudyInviteContext({
  studyId,
  target,
  userId,
}: {
  studyId: string;
  target: string;
  userId: string;
}) {
  const study = await prisma.study.findFirst({
    select: { id: true },
    where: { id: studyId, ownerId: userId },
  });
  const targetUser = await prisma.user.findFirst({
    select: { id: true, name: true },
    where: { OR: [{ email: target }, { name: target }] },
  });
  const existingMember =
    study && targetUser
      ? await prisma.studyMember.findUnique({
          select: { id: true },
          where: {
            studyId_userId: { studyId: study.id, userId: targetUser.id },
          },
        })
      : null;

  return { existingMember, study, targetUser };
}

// 스터디 초대를 생성하거나 기존 초대를 대기 상태로 갱신한다.
export async function upsertStudyInvite({
  expiresAt,
  studyId,
  target,
  targetUserId,
  userId,
}: {
  expiresAt: Date;
  studyId: string;
  target: string;
  targetUserId: string;
  userId: string;
}) {
  await prisma.studyInvite.upsert({
    create: {
      expiresAt,
      invitedById: userId,
      status: "PENDING",
      studyId,
      target,
      targetUserId,
    },
    update: { expiresAt, invitedById: userId, status: "PENDING" },
    where: { studyId_targetUserId: { studyId, targetUserId } },
  });
}

// 소유자가 보낸 대기 초대를 취소한다.
export async function cancelStudyInviteRecord({
  inviteId,
  studyId,
  userId,
}: {
  inviteId: string;
  studyId: string;
  userId: string;
}) {
  await prisma.studyInvite.updateMany({
    data: { status: "CANCELED" },
    where: {
      id: inviteId,
      status: "PENDING",
      study: { id: studyId, ownerId: userId },
    },
  });
}

// 소유한 스터디의 일반 멤버 역할을 변경한다.
export async function updateStudyMemberRoleRecord({
  memberId,
  role,
  studyId,
  userId,
}: {
  memberId: string;
  role: StudyMemberRole;
  studyId: string;
  userId: string;
}) {
  const study = await prisma.study.findFirst({
    select: { ownerId: true },
    where: { id: studyId, ownerId: userId },
  });
  if (!study) return false;

  const result = await prisma.studyMember.updateMany({
    data: { role },
    where: { id: memberId, studyId, userId: { not: study.ownerId } },
  });
  return result.count > 0;
}

// 소유한 스터디에서 일반 멤버를 제거한다.
export async function removeStudyMemberRecord({
  memberId,
  studyId,
  userId,
}: {
  memberId: string;
  studyId: string;
  userId: string;
}) {
  const study = await prisma.study.findFirst({
    select: { ownerId: true },
    where: { id: studyId, ownerId: userId },
  });
  if (!study) return false;

  const result = await prisma.studyMember.deleteMany({
    where: { id: memberId, studyId, userId: { not: study.ownerId } },
  });
  return result.count > 0;
}

// 소유한 스터디의 제목과 설명을 갱신한다.
export async function updateStudySettingsRecord({
  description,
  studyId,
  title,
  userId,
}: {
  description: string;
  studyId: string;
  title: string;
  userId: string;
}) {
  const result = await prisma.study.updateMany({
    data: { description: description || null, title },
    where: { id: studyId, ownerId: userId },
  });
  return result.count > 0;
}

// 제목 확인값이 일치하는 소유자의 스터디를 삭제한다.
export async function deleteOwnedStudy({
  confirmText,
  studyId,
  userId,
}: {
  confirmText: string;
  studyId: string;
  userId: string;
}) {
  const study = await prisma.study.findFirst({
    select: { id: true, title: true },
    where: { id: studyId, ownerId: userId },
  });
  if (!study || confirmText !== study.title) return false;

  await prisma.study.delete({ where: { id: study.id } });
  return true;
}
