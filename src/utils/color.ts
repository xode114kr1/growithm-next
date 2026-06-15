import type { ProblemTierBucketName } from "@/types/problem";

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
  BRONZE: "#a5663f",
  SILVER: "#dde3eb",
  GOLD: "#f4bf3a",
  PLATINUM: "#a3cfcf",
  DIAMOND: "#00daf3",
  RUBY: "#ba1a1a",
} as const;
