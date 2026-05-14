"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DashboardMasteryBucket } from "@/features/dashboard/types";

const masteryTooltipLabels: Record<string, string> = {
  BRONZE: "Bronze / Level 1",
  DIAMOND: "Diamond / Level 5",
  GOLD: "Gold / Level 3",
  PLATINUM: "Platinum / Level 4",
  RUBY: "Ruby",
  SILVER: "Silver / Level 2",
};

export default function GrowthMastery({
  mastery,
}: {
  mastery: DashboardMasteryBucket[];
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsMounted(true);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="app-card p-6 md:col-span-12 lg:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="section-title mb-1">Growth Mastery</h2>
          <p className="text-body-sm text-on-surface-variant">
            Problem distribution across six difficulty tiers.
          </p>
        </div>
      </div>
      <div className="h-80 min-w-0">
        {isMounted ? (
          <ResponsiveContainer height="100%" width="100%">
            <BarChart
              data={mastery}
              margin={{ bottom: 0, left: -20, right: 8, top: 8 }}
            >
              <CartesianGrid stroke="#eff4ff" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="tier"
                tick={{ fill: "#404848", fontSize: 12, fontWeight: 700 }}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tick={{ fill: "#717978", fontSize: 12 }}
                tickLine={false}
              />
              <Tooltip
                content={<MasteryTooltip />}
                cursor={{ fill: "#eff4ff" }}
              />
              <Bar dataKey="solved" radius={[10, 10, 0, 0]}>
                {mastery.map((entry) => (
                  <Cell fill={entry.fill} key={entry.tier} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-xl bg-surface-container-low" />
        )}
      </div>
    </section>
  );
}

function MasteryTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: DashboardMasteryBucket }>;
}) {
  const bucket = payload?.[0]?.payload;

  if (!active || !bucket) {
    return null;
  }

  return (
    <div className="rounded-xl border border-outline-variant bg-white px-4 py-3 shadow-lg">
      <p className="text-body-sm font-bold text-on-surface">
        {masteryTooltipLabels[bucket.tier] ?? bucket.tier}
      </p>
      <p className="mt-1 text-mono-code text-xs text-on-surface-variant">
        {bucket.solved.toLocaleString()} solved
      </p>
    </div>
  );
}
