import "server-only";

import { formatRelativeDate, formatShortDate } from "@/utils/date";
import {
  getNextScoreTierScore,
  getScoreProgressLabel,
  getStudyTier,
  studyScoreTierThresholds,
} from "@/utils/score";
import { getTierProgress } from "@/utils/study";
import type {
  ProblemShareTargetStudy,
  StudyInviteItem,
  StudyLayoutData,
  StudyListItem,
  StudyMember,
  StudyMemberFilters,
  StudyOverviewSummary,
  StudyTier,
} from "@/types/study";

type ProblemShareTargetStudyRow = {
  _count: { members: number };
  id: string;
  owner: { name: string | null };
  problemShares: { id: string }[];
  score: number;
  title: string;
};

type StudyInviteItemRow = {
  createdAt: Date;
  id: string;
  invitedBy: {
    image: string | null;
    name: string | null;
  };
  study: { title: string };
};

type StudyLayoutRow = {
  id: string;
  ownerId: string;
  title: string;
};

type StudyListItemRow = {
  _count: { members: number };
  description: string | null;
  id: string;
  owner: { name: string | null };
  ownerId: string;
  score: number;
  title: string;
};

type StudySummaryRow = {
  description: string | null;
  id: string;
  score: number;
  title: string;
};

type StudyMemberActivityRow = {
  _max: { sharedAt: Date | null };
  _sum: { score: number | null };
  userId: string;
};

type StudyMemberRow = {
  id: string;
  joinedAt: Date;
  role: StudyMember["role"];
  user: {
    image: string | null;
    name: string | null;
  };
  userId: string;
};

// 스터디 티어 진행도를 점수 범위 문자열로 만든다.
export function getProgressLabel(score: number, tier: StudyTier) {
  return getScoreProgressLabel(score, tier, studyScoreTierThresholds);
}

// 스터디 티어의 다음 티어 진입 점수를 반환한다.
export function getNextTierScore(tier: StudyTier) {
  return getNextScoreTierScore(tier, studyScoreTierThresholds);
}

// 사용자 이름이 없을 때 사용할 표시 이름을 결정한다.
export function getUserDisplayName(name: string | null) {
  return name || "Unknown";
}

// 문제 공유 대상 스터디 조회 결과를 화면용 데이터로 변환한다.
export function createStudyForProblemSharing(
  study: ProblemShareTargetStudyRow,
): ProblemShareTargetStudy {
  return {
    hasShared: study.problemShares.length > 0,
    id: study.id,
    memberCount: study._count.members,
    ownerName: study.owner.name ?? "Unknown",
    score: study.score,
    title: study.title,
  };
}

// 스터디 초대 조회 결과를 화면용 데이터로 변환한다.
export function createStudyInviteItem(
  invite: StudyInviteItemRow,
): StudyInviteItem {
  return {
    id: invite.id,
    invitedByAvatar: invite.invitedBy.image,
    invitedByName: getUserDisplayName(invite.invitedBy.name),
    studyTitle: invite.study.title,
    timeLabel: formatRelativeDate(invite.createdAt),
  };
}

// 스터디 조회 결과를 상세 레이아웃용 데이터로 변환한다.
export function createStudyLayoutData(
  study: StudyLayoutRow,
  userId: string,
): StudyLayoutData {
  return {
    id: study.id,
    isOwner: study.ownerId === userId,
    name: study.title,
  };
}

// 스터디 조회 결과를 목록용 데이터로 변환한다.
export function createStudyListItem(
  study: StudyListItemRow,
  userId: string,
): StudyListItem {
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
}

// 스터디 조회 결과를 개요 화면의 기본 정보로 변환한다.
export function createStudySummary(
  study: StudySummaryRow,
): StudyOverviewSummary {
  const tier = getStudyTier(study.score);

  return {
    description: study.description ?? "아직 스터디 설명이 없습니다.",
    id: study.id,
    name: study.title,
    nextTierScore: getNextTierScore(tier),
    score: study.score,
    tier,
  };
}

// 스터디 멤버와 활동 집계를 화면용 목록으로 변환하고 정렬한다.
export function createStudyMembers({
  activities,
  members,
  sort,
}: {
  activities: StudyMemberActivityRow[];
  members: StudyMemberRow[];
  sort: StudyMemberFilters["sort"];
}): StudyMember[] {
  const activityByUserId = new Map(
    activities.map((activity) => [activity.userId, activity]),
  );
  const studyMembers = members.map((member) => {
    const activity = activityByUserId.get(member.userId);
    const lastActiveAt = activity?._max.sharedAt ?? member.joinedAt;

    return {
      avatar: member.user.image,
      contribution: activity?._sum.score ?? 0,
      id: member.id,
      joinedAt: formatShortDate(member.joinedAt),
      joinedAtTime: member.joinedAt.getTime(),
      lastActive: formatShortDate(lastActiveAt),
      lastActiveTime: lastActiveAt.getTime(),
      name: getUserDisplayName(member.user.name),
      role: member.role,
      userId: member.userId,
    };
  });

  if (sort === "lastActive") {
    return studyMembers.toSorted(
      (firstMember, secondMember) =>
        secondMember.lastActiveTime - firstMember.lastActiveTime,
    );
  }

  if (sort === "contribution") {
    return studyMembers.toSorted(
      (firstMember, secondMember) =>
        secondMember.contribution - firstMember.contribution,
    );
  }

  return studyMembers;
}

// 알 수 없는 카테고리 값을 문자열 배열로 정리한다.
export function normalizeCategories(categories: unknown): string[] {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.filter(
    (category): category is string => typeof category === "string",
  );
}
