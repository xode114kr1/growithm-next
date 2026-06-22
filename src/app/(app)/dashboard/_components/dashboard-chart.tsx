"use client";

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

import type { ProblemTierBucket } from "@/types/problem";
import { chartColors, problemTierChartColors } from "@/utils/color";

import { masteryTooltipLabels } from "../constants";

export default function DashboardChart({
  mastery,
  solvedCount,
}: {
  mastery: ProblemTierBucket[];
  solvedCount: number;
}) {
  return (
    <section className="app-card p-6 md:col-span-12 lg:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="section-title mb-1">티어별 문제 분포</h2>
        </div>
        <div className="sm:text-right">
          <p className="text-label-caps text-on-surface-variant">해결한 문제</p>
          <p className="mt-1 text-xl font-bold text-on-surface">
            {solvedCount.toLocaleString()}개
          </p>
        </div>
      </div>
      <div className="h-80 min-w-0">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart
            data={mastery}
            margin={{ bottom: 0, left: -20, right: 8, top: 8 }}
          >
            <CartesianGrid stroke={chartColors.grid} vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="tier"
              tick={{
                fill: chartColors.axisPrimary,
                fontSize: 12,
                fontWeight: 700,
              }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              tick={{ fill: chartColors.axisMuted, fontSize: 12 }}
              tickLine={false}
            />
            <Tooltip
              content={<MasteryTooltip />}
              cursor={{ fill: chartColors.grid }}
            />
            <Bar dataKey="solved" radius={[10, 10, 0, 0]}>
              {mastery.map((entry) => (
                <Cell
                  fill={problemTierChartColors[entry.tier]}
                  key={entry.tier}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function MasteryTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: ProblemTierBucket }>;
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
        {bucket.solved.toLocaleString()}개
      </p>
    </div>
  );
}
