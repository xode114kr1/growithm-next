import "server-only";

import { formatRelativeDate } from "@/utils/date";
import {
  getNextScoreTierScore,
  getScoreProgressLabel,
  studyScoreTierThresholds,
} from "@/utils/score";
import type {
  ProblemShareTargetStudy,
  StudyInviteItem,
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

// 알 수 없는 카테고리 값을 문자열 배열로 정리한다.
export function normalizeCategories(categories: unknown): string[] {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.filter(
    (category): category is string => typeof category === "string",
  );
}
