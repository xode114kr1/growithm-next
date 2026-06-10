import { Check } from "lucide-react";

import type { DashboardStatsSummary } from "@/types/dashboard";

const statStyle = {
  accent: "bg-secondary-fixed text-on-secondary-container",
  label: "Total Solved",
} as const;

export default function DashboardStats({
  stats,
}: {
  stats: DashboardStatsSummary;
}) {
  return (
    <article className="app-card flex flex-col justify-between p-6 md:col-span-4">
      <div>
        <div className="mb-4 flex items-start justify-between">
          <span
            className={`flex size-10 items-center justify-center rounded-lg ${statStyle.accent}`}
          >
            <Check aria-hidden="true" size={20} strokeWidth={3} />
          </span>
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
