import type { StudyTier } from "@/features/study/types";

const tierThresholds = [
  { minScore: 3000, tier: "Ruby" },
  { minScore: 1500, tier: "Diamond" },
  { minScore: 700, tier: "Platinum" },
  { minScore: 300, tier: "Gold" },
  { minScore: 100, tier: "Silver" },
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
  Ruby: {
    className: "border-rose-300 bg-rose-600 text-white shadow-rose-700/10",
    label: "R",
  },
};

export function getStudyTier(score: number): StudyTier {
  return (
    tierThresholds.find((threshold) => score >= threshold.minScore)?.tier ??
    "Bronze"
  );
}

export function getTierProgress(score: number, tier: StudyTier) {
  const currentTierIndex = tierThresholds.findIndex(
    (threshold) => threshold.tier === tier,
  );
  const currentThreshold = tierThresholds[currentTierIndex];
  const nextThreshold = tierThresholds[currentTierIndex - 1];

  if (!currentThreshold || !nextThreshold) {
    return 100;
  }

  const currentTierScore = score - currentThreshold.minScore;
  const nextTierScore = nextThreshold.minScore - currentThreshold.minScore;

  return Math.max(0, Math.min((currentTierScore / nextTierScore) * 100, 100));
}

export function getProgressLabel(score: number, tier: StudyTier) {
  const currentTierIndex = tierThresholds.findIndex(
    (threshold) => threshold.tier === tier,
  );
  const nextThreshold = tierThresholds[currentTierIndex - 1];

  if (!nextThreshold) {
    return "Max tier";
  }

  return `${score.toLocaleString()} / ${nextThreshold.minScore.toLocaleString()} XP`;
}

export function getNextTierScore(tier: StudyTier) {
  const currentTierIndex = tierThresholds.findIndex(
    (threshold) => threshold.tier === tier,
  );
  const nextThreshold = tierThresholds[currentTierIndex - 1];

  return nextThreshold?.minScore ?? tierThresholds[0].minScore;
}

export function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

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

export function getUserDisplayName(name: string | null) {
  return name || "Unknown";
}

export function normalizeCategories(categories: unknown): string[] {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.filter(
    (category): category is string => typeof category === "string",
  );
}
