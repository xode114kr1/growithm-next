import type { ProblemTierBucketName } from "@/types/problem";
import type { StudyTier } from "@/types/study";
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

// 문제 목록의 난이도 뱃지 색상입니다.
export const problemTierBadgeColors: Record<ProblemTierBucketName, string> = {
  BRONZE: "bg-[#c58b68] text-[#4b2615]",
  SILVER: "bg-tertiary-fixed text-on-tertiary-fixed",
  GOLD: "bg-[#f4bf3a] text-[#3b2a00]",
  PLATINUM: "bg-[#9fd8d2] text-[#174e49]",
  DIAMOND: "bg-sky-100 text-sky-800",
  RUBY: "bg-rose-100 text-rose-800",
};

// 대시보드 Award 아이콘 색상입니다.
export const awardIconColors: Record<PersonalScoreTier, string> = {
  Bronze: "bg-amber-700 text-white",
  Diamond: "bg-sky-100 text-sky-800",
  Gold: "bg-yellow-400 text-yellow-950",
  Platinum: "bg-primary-fixed text-primary",
  Silver: "bg-slate-200 text-slate-700",
};

// 대시보드 개인 티어 뱃지 색상입니다.
export const tierBadgeColors: Record<PersonalScoreTier, string> = {
  Bronze: "border-amber-700/20 bg-amber-700 text-white",
  Diamond: "border-sky-300 bg-sky-100 text-sky-800",
  Gold: "border-yellow-400/40 bg-yellow-400 text-yellow-950",
  Platinum: "border-cyan-200 bg-primary-fixed text-primary",
  Silver: "border-slate-300 bg-slate-200 text-slate-700",
};

// 대시보드 개인 티어 프로그레스 바 색상입니다.
export const tierProgressColors: Record<PersonalScoreTier, string> = {
  Bronze: "from-amber-700 to-amber-500",
  Diamond: "from-sky-400 to-cyan-300",
  Gold: "from-yellow-400 to-amber-300",
  Platinum: "from-cyan-300 to-teal-300",
  Silver: "from-slate-300 to-slate-400",
};

// 스터디 목록의 티어 썸네일 색상입니다.
export const studyTierThumbnailColors: Record<StudyTier, string> = {
  Bronze: "border-amber-700/20 bg-amber-700 text-white shadow-amber-900/10",
  Diamond: "border-sky-300 bg-sky-100 text-sky-800 shadow-sky-500/10",
  Gold: "border-yellow-400/30 bg-yellow-400 text-yellow-950 shadow-yellow-500/10",
  Platinum:
    "border-cyan-200 bg-primary-fixed text-primary shadow-cyan-500/10",
  Silver: "border-slate-300 bg-slate-200 text-slate-700 shadow-slate-400/10",
};

// 스터디 오버뷰의 티어 뱃지 색상입니다.
export const studyTierBadgeColors: Record<StudyTier, string> = {
  Bronze: "border-amber-700/20 bg-amber-700 text-white",
  Diamond: "border-sky-300 bg-sky-100 text-sky-800",
  Gold: "border-yellow-400/40 bg-yellow-400 text-yellow-950",
  Platinum: "border-cyan-200 bg-primary-fixed text-primary",
  Silver: "border-slate-300 bg-slate-200 text-slate-700",
};

// 스터디 티어 프로그레스 바 색상입니다.
export const studyTierProgressColors: Record<StudyTier, string> = {
  Bronze: "from-amber-700 to-amber-500",
  Diamond: "from-sky-400 to-cyan-300",
  Gold: "from-yellow-400 to-amber-300",
  Platinum: "from-cyan-300 to-teal-300",
  Silver: "from-slate-300 to-slate-500",
};
