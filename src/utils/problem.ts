import {
  ProblemPlatform,
  ProblemSubmissionStatus,
} from "@/generated/prisma/enums";
import type { ProblemTierBucketName } from "@/types/problem";

export const PROBLEM_SHARE_SCORE_DAY_DIFFERENCE = 2;

const baekjoonBaseScores: Record<string, number> = {
  bronze: 1,
  diamond: 6_250_000,
  gold: 2_500,
  platinum: 125_000,
  silver: 50,
};

const baekjoonTierMultipliers: Record<string, number> = {
  i: 5,
  ii: 4,
  iii: 3,
  iv: 2,
  v: 1,
};

const programmersLevelScores: Record<number, number> = {
  1: 3,
  2: 150,
  3: 7_500,
  4: 375_000,
  5: 18_750_000,
};

const programmersLevelTiers: Partial<Record<number, ProblemTierBucketName>> = {
  1: "BRONZE",
  2: "SILVER",
  3: "GOLD",
  4: "PLATINUM",
  5: "DIAMOND",
};

const growithmProblemTiers = new Set<ProblemTierBucketName>([
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "DIAMOND",
  "RUBY",
]);

// 문제 제출 상태의 표시 이름을 반환한다.
export function getProblemStatusLabel(status: ProblemSubmissionStatus) {
  return status === ProblemSubmissionStatus.COMPLETED
    ? "작성 완료"
    : "메모 작성 대기";
}

// 문제 제출 상태의 보조 설명 문구를 반환한다.
export function getProblemStatusDescription(status: ProblemSubmissionStatus) {
  return status === ProblemSubmissionStatus.COMPLETED
    ? "공유 가능"
    : "공유하려면 메모를 작성하세요";
}

// 문제 제출 상태에 맞는 배지 스타일 클래스를 반환한다.
export function getProblemStatusBadgeClass(status: ProblemSubmissionStatus) {
  return status === ProblemSubmissionStatus.COMPLETED
    ? "inline-flex items-center rounded-full bg-secondary-fixed px-3 py-1 text-body-sm font-semibold text-on-secondary-fixed"
    : "inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-body-sm font-semibold text-amber-700";
}

// 정확도 값을 화면 표시용 백분율 문자열로 변환한다.
export function formatAccuracy(accuracy: number | null) {
  return accuracy === null ? null : `${accuracy}%`;
}

// 점수와 최대 점수를 화면 표시용 문자열로 변환한다.
export function formatScore(score: number | null, scoreMax: number | null) {
  if (score === null) return null;

  return scoreMax === null ? String(score) : `${score} / ${scoreMax}`;
}

// 제출 시각이 없을 때 기본 문구를 적용해 표시값을 만든다.
export function getSubmittedLabel(submittedAtText: string | null) {
  return submittedAtText ?? "제출됨";
}

// 플랫폼과 티어를 기준으로 문제 경험치 점수를 계산한다.
export function getProblemExperienceScore({
  platform,
  tier,
}: {
  platform: ProblemPlatform;
  tier: string | null | undefined;
}) {
  if (!tier) return 0;

  if (platform === ProblemPlatform.BAEKJOON) {
    return (
      getBaekjoonExperienceScore(tier) || getProgrammersExperienceScore(tier)
    );
  }

  if (platform === ProblemPlatform.PROGRAMMERS) {
    return (
      getProgrammersExperienceScore(tier) || getBaekjoonExperienceScore(tier)
    );
  }

  return 0;
}

// 플랫폼별 원본 난이도를 Growithm 문제 티어로 변환한다.
export function getGrowithmProblemTier(tier: string | null) {
  const normalizedTier = tier?.trim().toLowerCase() ?? "";

  if (!normalizedTier) return null;

  const levelMatch = normalizedTier.match(/(?:lv\.?|level)\s*(\d+)/);

  if (levelMatch) {
    return programmersLevelTiers[Number(levelMatch[1])] ?? null;
  }

  const tierName = normalizedTier.split(/\s+/)[0]?.toUpperCase();

  return growithmProblemTiers.has(tierName as ProblemTierBucketName)
    ? (tierName as ProblemTierBucketName)
    : null;
}

// 백준 티어 문자열을 경험치 점수로 변환한다.
function getBaekjoonExperienceScore(tier: string) {
  const normalizedTier = tier.trim().toLowerCase();
  const tierMatch = normalizedTier.match(
    /(bronze|silver|gold|platinum|diamond)\s+(i{1,3}|iv|v)\b/,
  );

  if (!tierMatch) return 0;

  const baseScore = baekjoonBaseScores[tierMatch[1]];
  const multiplier = baekjoonTierMultipliers[tierMatch[2]];

  return baseScore && multiplier ? baseScore * multiplier : 0;
}

// 프로그래머스 레벨 문자열을 경험치 점수로 변환한다.
function getProgrammersExperienceScore(tier: string) {
  const levelMatch = tier.trim().toLowerCase().match(/(?:lv\.?|level)\s*(\d+)/);

  if (!levelMatch) return 0;

  return programmersLevelScores[Number(levelMatch[1])] ?? 0;
}
