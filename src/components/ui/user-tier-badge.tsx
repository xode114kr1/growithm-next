import type { PersonalScoreTier } from "@/types/user";
import { tierBadgeColors } from "@/utils/color";

export default function UserTierBadge({
  className,
  tier,
}: {
  className?: string;
  tier: PersonalScoreTier;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold uppercase ${tierBadgeColors[tier]} ${className ?? ""}`}
    >
      {tier}
    </span>
  );
}
