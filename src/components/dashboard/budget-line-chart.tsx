"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";
import { formatINR } from "@/lib/formatters";

const DEFAULT_BUDGET_LINE_DATA = [
  { date: "18 dec", amount: 3200 },
  { date: "25 dec", amount: 5000 },
  { date: "1 jan", amount: 800 },
  { date: "8 jan", amount: 3800 },
  { date: "15 jan", amount: 26590 },
  { date: "22 jan", amount: 6800 },
  { date: "29 jan", amount: 1200 },
  { date: "5 feb", amount: 4800 },
];

export function BudgetLineChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[220px] w-full bg-muted/20 animate-pulse rounded-2xl" />;
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-full bg-[#0E0E10] text-white px-3 py-1 shadow-xl text-xs font-bold border border-white/10 flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#D4F835]" />
          <span>{formatINR(payload[0].value)}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
          Budget
        </h3>

        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted/70 text-xs font-semibold text-foreground cursor-pointer hover:bg-muted transition-colors">
          <span>Month</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>

      {/* Chart */}
      <div className="h-[220px] w-full -ml-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DEFAULT_BUDGET_LINE_DATA} margin={{ top: 25, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="budgetLimeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4F835" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#D4F835" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#0E0E10"
              strokeWidth={2}
              fill="url(#budgetLimeGradient)"
              activeDot={{
                r: 6,
                fill: "#D4F835",
                stroke: "#0E0E10",
                strokeWidth: 2.5,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
