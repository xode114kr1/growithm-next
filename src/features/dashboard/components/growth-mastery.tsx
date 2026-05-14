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
                contentStyle={{
                  border: "1px solid #c0c8c8",
                  borderRadius: "12px",
                  boxShadow: "0 18px 45px rgb(59 101 102 / 14%)",
                }}
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
