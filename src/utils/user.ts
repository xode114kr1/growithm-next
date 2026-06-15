import type { PersonalScoreTier } from "@/types/user";

const userTierBadgeClasses: Record<PersonalScoreTier, string> = {
  Bronze: "bg-orange-50 border-orange-200 text-orange-800",
  Diamond: "bg-cyan-50 border-cyan-200 text-cyan-800",
  Gold:
    "bg-gradient-to-r from-amber-100 to-amber-50 border-amber-200 text-amber-700",
  Platinum:
    "bg-gradient-to-r from-slate-100 to-white border-slate-200 text-slate-600",
  Silver: "bg-slate-200 border-slate-300 text-slate-600",
};

// 개인 티어에 맞는 프론트엔드 뱃지 스타일을 반환한다.
export function getUserTierBadgeClass(tier: PersonalScoreTier) {
  return userTierBadgeClasses[tier];
}
