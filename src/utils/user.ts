import { getPersonalScoreTier } from "@/features/score/utils";

const tierClasses = {
  Bronze: "bg-orange-50 border-orange-200 text-orange-800",
  Diamond: "bg-cyan-50 border-cyan-200 text-cyan-800",
  Gold: "bg-gradient-to-r from-amber-100 to-amber-50 border-amber-200 text-amber-700",
  Platinum:
    "bg-gradient-to-r from-slate-100 to-white border-slate-200 text-slate-600",
  Silver: "bg-slate-200 border-slate-300 text-slate-600",
};

export function getUserTier(score: number) {
  const tier = getPersonalScoreTier(score);

  return {
    tier: `${tier} Tier`,
    tierClass: tierClasses[tier],
  };
}

export function getUserDisplayName(name: string | null, email: string | null) {
  return name?.trim() || email?.trim() || "Unknown Developer";
}

export function getUserAvatar(image: string | null) {
  return image || "https://avatars.githubusercontent.com/u/0?v=4";
}
