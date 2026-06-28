import { problemTierBadgeColors } from "@/utils/color";
import { getGrowithmProblemTier } from "@/utils/problem";

export default function ProblemTierBadge({
  className,
  tier,
}: {
  className?: string;
  tier: string;
}) {
  const growithmTier = getGrowithmProblemTier(tier) ?? "BRONZE";

  return (
    <span
      className={`inline-flex items-center rounded border border-slate-200 px-2 py-1 text-xs font-bold uppercase ${problemTierBadgeColors[growithmTier]} ${className ?? ""}`}
    >
      {tier}
    </span>
  );
}
