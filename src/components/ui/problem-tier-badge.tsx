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
      className={`inline-flex items-center rounded-full px-2.5 py-1.5 text-xs font-bold leading-none ${problemTierBadgeColors[growithmTier]} ${className ?? ""}`}
    >
      {tier}
    </span>
  );
}
