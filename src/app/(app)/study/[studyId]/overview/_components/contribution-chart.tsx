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

import { useMounted } from "@/hooks/use-mounted";
import { chartColors } from "@/utils/color";

type Contribution = {
  name: string;
  score: number;
};

export default function ContributionChart({
  data,
}: {
  data: Contribution[];
}) {
  const isMounted = useMounted();
  const chartData = useMemo(() => data.slice(0, 4), [data]);

  return (
    <div className="h-72 min-w-0">
      {isMounted ? (
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
              formatter={(value) => [`${Number(value).toLocaleString()} XP`, "기여도"]}
            />
            <Bar
              background={{ fill: chartColors.barBackground, radius: 8 }}
              dataKey="score"
              fill={chartColors.contributionBar}
              radius={[0, 8, 8, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full rounded-xl bg-surface-container-low" />
      )}
    </div>
  );
}
