import {
  getNextScoreTierScore,
  getScoreProgressLabel,
  getScoreTier,
  getScoreTierProgress,
} from "@/utils/score";
import type { StudyTier } from "@/types/study";

const studyScoreTierThresholds = [
  { minScore: 5_000_000, tier: "Diamond" },
  { minScore: 500_000, tier: "Platinum" },
  { minScore: 50_000, tier: "Gold" },
  { minScore: 5_000, tier: "Silver" },
  { minScore: 0, tier: "Bronze" },
] satisfies Array<{ minScore: number; tier: StudyTier }>;

export const tierThumbnails: Record<StudyTier, { className: string; label: string }> = {
  Bronze: {
    className: "border-amber-700/20 bg-amber-700 text-white shadow-amber-900/10",
    label: "B",
  },
  Silver: {
    className: "border-slate-300 bg-slate-200 text-slate-700 shadow-slate-400/10",
    label: "S",
  },
  Gold: {
    className: "border-yellow-400/30 bg-yellow-400 text-yellow-950 shadow-yellow-500/10",
    label: "G",
  },
  Platinum: {
    className: "border-cyan-200 bg-primary-fixed text-primary shadow-cyan-500/10",
    label: "P",
  },
  Diamond: {
    className: "border-sky-300 bg-sky-100 text-sky-800 shadow-sky-500/10",
    label: "D",
  },
};

// 스터디 점수에 해당하는 티어를 계산한다.
export function getStudyTier(score: number): StudyTier {
  return getScoreTier(score, studyScoreTierThresholds, "Bronze");
}

// 스터디 점수의 현재 티어 내 진행률을 계산한다.
export function getTierProgress(score: number, tier: StudyTier) {
  return getScoreTierProgress(score, tier, studyScoreTierThresholds);
}

// 스터디 티어 진행도를 점수 범위 문자열로 만든다.
export function getProgressLabel(score: number, tier: StudyTier) {
  return getScoreProgressLabel(score, tier, studyScoreTierThresholds);
}

// 스터디 티어의 다음 티어 진입 점수를 반환한다.
export function getNextTierScore(tier: StudyTier) {
  return getNextScoreTierScore(tier, studyScoreTierThresholds);
}

// 날짜를 한국어 짧은 날짜 형식으로 변환한다.
export function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

// 날짜를 현재 시점 기준의 상대 시간 문자열로 변환한다.
export function formatRelativeDate(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60_000));

  if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hours ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  return `${diffDays} days ago`;
}

// 사용자 이름이 없을 때 사용할 표시 이름을 결정한다.
export function getUserDisplayName(name: string | null) {
  return name || "Unknown";
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
