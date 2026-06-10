import { Award } from "lucide-react";

import { getSolvedProblemCount } from "@/services/problem.server";
import { getUserPersonalTier } from "@/services/user.server";
import type { PersonalScoreTier } from "@/types/user";

const tierStyles: Record<
  PersonalScoreTier,
  { badge: string; icon: string; ring: string }
> = {
  Bronze: {
    badge: "border-amber-700/20 bg-amber-700 text-white",
    icon: "bg-amber-700 text-white",
    ring: "from-amber-700 to-amber-500",
  },
  Diamond: {
    badge: "border-sky-300 bg-sky-100 text-sky-800",
    icon: "bg-sky-100 text-sky-800",
    ring: "from-sky-400 to-cyan-300",
  },
  Gold: {
    badge: "border-yellow-400/40 bg-yellow-400 text-yellow-950",
    icon: "bg-yellow-400 text-yellow-950",
    ring: "from-yellow-400 to-amber-300",
  },
  Platinum: {
    badge: "border-cyan-200 bg-primary-fixed text-primary",
    icon: "bg-primary-fixed text-primary",
    ring: "from-cyan-300 to-teal-300",
  },
  Silver: {
    badge: "border-slate-300 bg-slate-200 text-slate-700",
    icon: "bg-slate-200 text-slate-700",
    ring: "from-slate-300 to-slate-400",
  },
};

export default async function PersonalTierCard({
  userId,
}: {
  userId: string | undefined;
}) {
  const [tier, solvedCount] = await Promise.all([
    getUserPersonalTier(userId),
    getSolvedProblemCount(userId),
  ]);
  const personalTier = { ...tier, solvedCount };

  const styles = tierStyles[personalTier.tier];
  const remainingScore = Math.max(
    personalTier.nextTierScore - personalTier.score,
    0,
  );

  return (
    <section className="app-card flex flex-col justify-between p-6 md:col-span-4">
      <div>
        <div className="mb-5 flex items-start justify-between gap-3">
          <span
            className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}
          >
            <Award aria-hidden="true" size={22} strokeWidth={2.4} />
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${styles.badge}`}
          >
            {personalTier.tier}
          </span>
        </div>
        <h2 className="mb-1 text-label-caps text-slate-500">My Tier</h2>
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
          <p className="font-serif text-8 font-semibold leading-tight text-primary">
            {personalTier.tier}
          </p>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <div className="h-2 overflow-hidden rounded-full bg-surface-container">
          <div
            className={`h-full rounded-full bg-linear-to-r ${styles.ring}`}
            style={{ width: `${personalTier.progress}%` }}
          />
        </div>
        <div className="flex flex-col justify-between gap-1 text-xs font-semibold text-slate-500 sm:flex-row">
          <span>{personalTier.progressLabel}</span>
          <span className="text-secondary">
            {remainingScore > 0
              ? `${remainingScore.toLocaleString()} XP left`
              : "Max tier"}
          </span>
        </div>
        <p className="text-xs font-medium text-on-surface-variant">
          {personalTier.solvedCount.toLocaleString()} submitted problems counted
        </p>
      </div>
    </section>
  );
}
