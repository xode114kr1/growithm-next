import type {
  PersonalScoreTier,
  UserPersonalTier,
  UserSummary,
} from "@/types/user";

import {
  getNextScoreTierScore,
  getScoreProgressLabel,
  getScoreTier,
  getScoreTierProgress,
} from "@/utils/score";

const personalScoreTierThresholds = [
  { minScore: 1_000_000, tier: "Diamond" },
  { minScore: 100_000, tier: "Platinum" },
  { minScore: 10_000, tier: "Gold" },
  { minScore: 1_000, tier: "Silver" },
  { minScore: 0, tier: "Bronze" },
] satisfies Array<{ minScore: number; tier: PersonalScoreTier }>;

const tierClasses = {
  Bronze: "bg-orange-50 border-orange-200 text-orange-800",
  Diamond: "bg-cyan-50 border-cyan-200 text-cyan-800",
  Gold: "bg-gradient-to-r from-amber-100 to-amber-50 border-amber-200 text-amber-700",
  Platinum:
    "bg-gradient-to-r from-slate-100 to-white border-slate-200 text-slate-600",
  Silver: "bg-slate-200 border-slate-300 text-slate-600",
};

// 사용자 점수에 맞는 티어 이름과 스타일을 반환한다.
export function getUserTier(score: number) {
  const tier = getPersonalScoreTier(score);

  return {
    tier: `${tier} Tier`,
    tierClass: tierClasses[tier],
  };
}

// 개인 점수에 해당하는 티어를 계산한다.
function getPersonalScoreTier(score: number): PersonalScoreTier {
  return getScoreTier(score, personalScoreTierThresholds, "Bronze");
}

// 개인 점수의 현재 티어 내 진행률을 계산한다.
function getPersonalTierProgress(
  score: number,
  tier: PersonalScoreTier,
) {
  return getScoreTierProgress(score, tier, personalScoreTierThresholds);
}

// 개인 티어 진행도를 점수 범위 문자열로 만든다.
function getPersonalProgressLabel(
  score: number,
  tier: PersonalScoreTier,
) {
  return getScoreProgressLabel(score, tier, personalScoreTierThresholds);
}

// 개인 티어의 다음 티어 진입 점수를 반환한다.
function getNextPersonalTierScore(tier: PersonalScoreTier) {
  return getNextScoreTierScore(tier, personalScoreTierThresholds);
}

// 사용자 이름이 없을 때 사용할 표시 이름을 결정한다.
export function getUserDisplayName(name: string | null, email: string | null) {
  return name?.trim() || email?.trim() || "Unknown Developer";
}

// 사용자 이미지가 없을 때 기본 아바타 URL을 반환한다.
export function getUserAvatar(image: string | null) {
  return image || "https://avatars.githubusercontent.com/u/0?v=4";
}

export type UserSummaryRow = {
  email: string | null;
  id: string;
  image: string | null;
  name: string | null;
  score: number;
};

// 점수를 기반으로 개인 티어 표시 데이터를 구성한다.
export function createPersonalTier(score: number): UserPersonalTier {
  const tier = getPersonalScoreTier(score);

  return {
    nextTierScore: getNextPersonalTierScore(tier),
    progress: getPersonalTierProgress(score, tier),
    progressLabel: getPersonalProgressLabel(score, tier),
    score,
    tier,
  };
}

// 사용자 조회 결과를 공용 사용자 요약 데이터로 변환한다.
export function createUserSummary(user: UserSummaryRow): UserSummary {
  const tier = getUserTier(user.score);

  return {
    avatar: getUserAvatar(user.image),
    id: user.id,
    name: getUserDisplayName(user.name, user.email),
    tier: tier.tier,
    tierClass: tier.tierClass,
  };
}
