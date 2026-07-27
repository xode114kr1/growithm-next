import "server-only";

import type {
  UserPersonalTier,
  UserProfile,
  UserSummary,
} from "@/types/user";
import type {
  UserProfileRow,
  UserSummaryRow,
} from "@/server/users/user.types";

import { formatShortDate, formatSubmittedDateText } from "@/utils/date";
import {
  getNextScoreTierScore,
  getPersonalTier,
  getScoreProgressLabel,
  getScoreTierProgress,
  personalScoreTierThresholds,
} from "@/utils/score";

// 사용자 이름이 없을 때 사용할 표시 이름을 결정한다.
export function getUserDisplayName(name: string | null, email: string | null) {
  return name?.trim() || email?.trim() || "Unknown Developer";
}

// 사용자 이미지가 없을 때 기본 아바타 URL을 반환한다.
export function getUserAvatar(image: string | null) {
  return image || "https://avatars.githubusercontent.com/u/0?v=4";
}

// 점수를 기반으로 개인 티어 표시 데이터를 구성한다.
export function createPersonalTier(score: number): UserPersonalTier {
  const tier = getPersonalTier(score);

  return {
    nextTierScore: getNextScoreTierScore(tier, personalScoreTierThresholds),
    progress: getScoreTierProgress(
      score,
      tier,
      personalScoreTierThresholds,
    ),
    progressLabel: getScoreProgressLabel(
      score,
      tier,
      personalScoreTierThresholds,
    ),
    score,
    tier,
  };
}

// 사용자 조회 결과를 공용 사용자 요약 데이터로 변환한다.
export function createUserSummary(user: UserSummaryRow): UserSummary {
  return {
    avatar: getUserAvatar(user.image),
    id: user.id,
    name: getUserDisplayName(user.name, user.email),
    tier: getPersonalTier(user.score),
  };
}

// 사용자 조회 결과를 프로필 화면의 표시 데이터로 변환한다.
export function createUserProfile(user: UserProfileRow): UserProfile {
  const latestSubmission = user.problemSubmissions[0];

  return {
    ...createUserSummary(user),
    githubId: user.accounts[0]?.providerAccountId ?? null,
    latestSolvedAt: latestSubmission
      ? formatSubmittedDateText(latestSubmission.submittedAtText) ??
        formatShortDate(latestSubmission.createdAt)
      : null,
    score: user.score,
    solvedCount: user._count.problemSubmissions,
    todaySolvedCount: user.todaySolvedCount,
  };
}
