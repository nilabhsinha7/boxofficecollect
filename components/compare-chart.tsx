"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { MovieWithTotals } from "@/lib/types";
import { formatCompactCurrency, formatDate } from "@/lib/utils";

export function CompareChart({
  left,
  right,
  metricType,
  title
}: {
  left: MovieWithTotals;
  right: MovieWithTotals;
  metricType: "daily" | "cumulative";
  title: string;
}) {
  const leftSeries = left.snapshots.filter((entry) => entry.metricType === metricType);
  const rightSeries = right.snapshots.filter((entry) => entry.metricType === metricType);
  const length = Math.max(leftSeries.length, rightSeries.length);

  const data = Array.from({ length }, (_, index) => ({
    label: `Day ${index + 1}`,
    [left.movie.title]: leftSeries[index]?.amount ?? null,
    [right.movie.title]: rightSeries[index]?.amount ?? null
  }));

  if (data.length === 0) {
    return (
      <div className="rounded-[28px] border border-black/5 bg-white/82 p-6 shadow-panel">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/45">{metricType}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">{title}</h3>
        <div className="mt-6 rounded-[24px] border border-dashed border-black/10 bg-[#f7f4ee] px-5 py-10 text-center">
          <p className="text-sm font-medium text-ink">No comparison data available</p>
          <p className="mt-2 text-sm leading-6 text-ink/58">Pick two titles with seeded theatrical run data to compare their pacing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-black/5 bg-white/82 p-5 shadow-panel sm:p-6">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/45">{metricType}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">{title}</h3>
        <p className="mt-2 text-sm text-ink/55">
          Relative run pace aligned by day of release rather than calendar date.
        </p>
      </div>
      <div className="mb-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.24em] text-ink/58">
        <span className="rounded-full bg-[#faf2ec] px-3 py-1 text-ember">{left.movie.title}</span>
        <span className="rounded-full bg-[#f3f7f4] px-3 py-1 text-sage">{right.movie.title}</span>
        <span className="rounded-full bg-[#f7f4ee] px-3 py-1 text-ink/50">Updated {formatDate(left.totals.updatedAt)}</span>
      </div>
      <div className="h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid vertical={false} className="chart-grid" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "rgba(16,23,37,0.54)", fontSize: 11 }}
              minTickGap={30}
            />
            <YAxis
              tickFormatter={(value) => formatCompactCurrency(value)}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "rgba(16,23,37,0.54)", fontSize: 11 }}
              width={64}
            />
            <Tooltip
              formatter={(value: number) => formatCompactCurrency(value)}
              labelFormatter={(label) => label}
              contentStyle={{
                borderRadius: 18,
                border: "1px solid rgba(16,23,37,0.08)",
                boxShadow: "0 18px 40px rgba(16,23,37,0.1)",
                backgroundColor: "rgba(255,255,255,0.96)"
              }}
            />
            <Line type="monotone" dataKey={left.movie.title} stroke="#db6a3b" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey={right.movie.title} stroke="#5d7a68" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
