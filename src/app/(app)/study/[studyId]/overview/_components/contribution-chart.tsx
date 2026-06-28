"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { StudyContributionItem } from "@/types/study";
import { chartColors } from "@/utils/color";

export default function ContributionChart({
  data,
}: {
  data: StudyContributionItem[];
}) {
  const chartData = useMemo(() => data.slice(0, 4), [data]);
  const topContributorCount = chartData.length;

  return (
    <section className="app-card p-6 xl:col-span-2">
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h2 className="section-title">기여도 분석</h2>
          <p className="text-body-sm text-slate-500">스터디원별 풀이 기여도</p>
        </div>
        <span className="text-label-caps text-slate-400">
          상위 {topContributorCount}명
        </span>
      </div>
      <div className="h-72 min-w-0">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ bottom: 4, left: 20, right: 18, top: 4 }}
          >
            <CartesianGrid horizontal={false} stroke={chartColors.grid} />
            <XAxis
              axisLine={false}
              domain={[0, 80000]}
              tick={{ fill: chartColors.axisMuted, fontSize: 12 }}
              tickCount={5}
              tickLine={false}
              type="number"
            />
            <YAxis
              axisLine={false}
              dataKey="name"
              tick={{
                fill: chartColors.axisStrong,
                fontSize: 12,
                fontWeight: 700,
              }}
              tickLine={false}
              type="category"
              width={96}
            />
            <Tooltip
              contentStyle={{
                border: `1px solid ${chartColors.tooltipBorder}`,
                borderRadius: "12px",
                boxShadow: "0 18px 45px rgb(59 101 102 / 14%)",
              }}
              cursor={{ fill: chartColors.grid }}
              formatter={(value) => [
                `${Number(value).toLocaleString()} XP`,
                "기여도",
              ]}
            />
            <Bar
              background={{ fill: chartColors.barBackground, radius: 8 }}
              dataKey="score"
              fill={chartColors.contributionBar}
              radius={[0, 8, 8, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
