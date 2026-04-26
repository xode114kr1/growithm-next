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

const masteryData = [
  { tier: "BRONZE", solved: 86, fill: "#c1c7cf" },
  { tier: "SILVER", solved: 132, fill: "#dde3eb" },
  { tier: "GOLD", solved: 156, fill: "#f4bf3a" },
  { tier: "PLATINUM", solved: 42, fill: "#a3cfcf" },
  { tier: "DIAMOND", solved: 19, fill: "#00daf3" },
  { tier: "RUBY", solved: 7, fill: "#ba1a1a" },
];

export default function GrowthMastery() {
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
    <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm md:col-span-12">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="mb-1 text-h3-ui text-on-background">Growth Mastery</h2>
          <p className="text-sm text-on-surface-variant">
            Problem distribution across six difficulty tiers.
          </p>
        </div>
      </div>
      <div className="h-80 min-w-0">
        {isMounted ? (
          <ResponsiveContainer height="100%" width="100%">
            <BarChart
              data={masteryData}
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
                {masteryData.map((entry) => (
                  <Cell fill={entry.fill} key={entry.tier} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-2xl bg-surface-container-low" />
        )}
      </div>
    </section>
  );
}
