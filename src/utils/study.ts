import type { StudyTier } from "@/types/study";
import { getScoreTierProgress } from "@/utils/score";

const studyScoreTierThresholds = [
  { minScore: 5_000_000, tier: "Diamond" },
  { minScore: 500_000, tier: "Platinum" },
  { minScore: 50_000, tier: "Gold" },
  { minScore: 5_000, tier: "Silver" },
  { minScore: 0, tier: "Bronze" },
] satisfies Array<{ minScore: number; tier: StudyTier }>;

export const tierThumbnails: Record<
  StudyTier,
  { className: string; label: string }
> = {
  Bronze: {
    className: "border-amber-700/20 bg-amber-700 text-white shadow-amber-900/10",
    label: "B",
  },
  Silver: {
    className: "border-slate-300 bg-slate-200 text-slate-700 shadow-slate-400/10",
    label: "S",
  },
  Gold: {
    className:
      "border-yellow-400/30 bg-yellow-400 text-yellow-950 shadow-yellow-500/10",
    label: "G",
  },
  Platinum: {
    className:
      "border-cyan-200 bg-primary-fixed text-primary shadow-cyan-500/10",
    label: "P",
  },
  Diamond: {
    className: "border-sky-300 bg-sky-100 text-sky-800 shadow-sky-500/10",
    label: "D",
  },
};

// 스터디 점수의 현재 티어 내 진행률을 계산한다.
export function getTierProgress(score: number, tier: StudyTier) {
  return getScoreTierProgress(score, tier, studyScoreTierThresholds);
}
