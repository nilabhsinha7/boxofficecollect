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
import { Snapshot } from "@/lib/types";
import { formatCompactCurrency, formatDate } from "@/lib/utils";

export function BoxOfficeChart({
  snapshots,
  metricType,
  color,
  title
}: {
  snapshots: Snapshot[];
  metricType: "daily" | "cumulative";
  color: string;
  title: string;
}) {
  const data = snapshots
    .filter((entry) => entry.metricType === metricType)
    .map((entry) => ({
      date: entry.date,
      label: formatDate(entry.date),
      amount: entry.amount
    }));

  if (data.length === 0) {
    return (
      <div className="rounded-[28px] border border-black/5 bg-white/82 p-6 shadow-panel">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/45">{metricType}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">{title}</h3>
        <div className="mt-6 rounded-[24px] border border-dashed border-black/10 bg-[#f7f4ee] px-5 py-10 text-center">
          <p className="text-sm font-medium text-ink">No chart data available</p>
          <p className="mt-2 text-sm leading-6 text-ink/58">This view will populate once box office snapshots are available for the selected metric.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-black/5 bg-white/82 p-5 shadow-panel sm:p-6">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/45">{metricType}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">{title}</h3>
      </div>
      <div className="h-64 sm:h-72">
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
            <Line
              type="monotone"
              dataKey="amount"
              stroke={color}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
