import type { ProblemTierBucketName } from "@/types/problem";
import type { PersonalScoreTier } from "@/types/user";

// 차트의 격자, 축, 툴팁, 막대에 공통으로 사용하는 색상입니다.
export const chartColors = {
  grid: "#eff4ff",
  axisPrimary: "#404848",
  axisMuted: "#717978",
  axisStrong: "#0b1c30",
  tooltipBorder: "#c0c8c8",
  barBackground: "#f8fafc",
  contributionBar: "#006875",
} as const;

// 문제 티어별 분포 차트의 막대 색상입니다.
export const problemTierChartColors: Record<ProblemTierBucketName, string> = {
  BRONZE: "#c58b68",
  SILVER: "#cbd5e1",
  GOLD: "#f2cc72",
  PLATINUM: "#9fd8d2",
  DIAMOND: "#7dd3e8",
  RUBY: "#e58a9b",
} as const;

// 대시보드 Award 아이콘 색상입니다.
export const awardIconColors: Record<PersonalScoreTier, string> = {
  Bronze: "bg-amber-700 text-white",
  Diamond: "bg-sky-100 text-sky-800",
  Gold: "bg-yellow-400 text-yellow-950",
  Platinum: "bg-primary-fixed text-primary",
  Silver: "bg-slate-200 text-slate-700",
};
