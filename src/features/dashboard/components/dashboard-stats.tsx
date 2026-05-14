import { Check } from "lucide-react";

import type { DashboardStatsSummary } from "@/features/dashboard/types";

const statStyle = {
  accent: "bg-secondary-fixed text-on-secondary-container",
  label: "Total Solved",
} as const;

export default function DashboardStats({
  stats,
}: {
  stats: DashboardStatsSummary;
}) {
  const weeklyChangePrefix = stats.weeklyChangePercent > 0 ? "+" : "";
  const weeklyChangeMeta =
    stats.weeklySolved > 0
      ? `${weeklyChangePrefix}${stats.weeklyChangePercent}% vs last week`
      : "No submissions this week";
  const metaClass =
    stats.weeklyChangePercent >= 0 ? "text-teal-600" : "text-red-600";

  return (
    <article className="app-card flex flex-col justify-between p-6 md:col-span-4">
      <div>
        <div className="mb-4 flex items-start justify-between">
          <span
            className={`flex size-10 items-center justify-center rounded-lg ${statStyle.accent}`}
          >
            <Check aria-hidden="true" size={20} strokeWidth={3} />
          </span>
          <div className="text-right">
            <span className={`block text-mono-code text-xs ${metaClass}`}>
              {weeklyChangeMeta}
            </span>
            <span className="mt-1 block text-mono-code text-xs text-slate-400">
              {stats.weeklySolved.toLocaleString()} this week
            </span>
          </div>
        </div>
        <h2 className="mb-1 text-label-caps text-slate-500">
          {statStyle.label}
        </h2>
        <p className="font-serif text-8 font-semibold leading-tight">
          {stats.totalSolved.toLocaleString()}
        </p>
      </div>
    </article>
  );
}
