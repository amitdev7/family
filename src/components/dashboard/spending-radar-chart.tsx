"use client";

import React, { useState, useEffect } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface RadarItem {
  category: string;
  thisMonth: number;
  average: number;
}

const DEFAULT_RADAR_DATA: RadarItem[] = [
  { category: "Food", thisMonth: 120, average: 90 },
  { category: "Bills", thisMonth: 105, average: 95 },
  { category: "Sporting goods", thisMonth: 75, average: 85 },
  { category: "Home goods", thisMonth: 95, average: 110 },
  { category: "Clothing", thisMonth: 110, average: 80 },
  { category: "Other", thisMonth: 85, average: 90 },
];

export function SpendingRadarChart({ data }: { data?: RadarItem[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data && data.length > 0 ? data : DEFAULT_RADAR_DATA;

  if (!mounted) {
    return <div className="h-[220px] w-full bg-muted/20 animate-pulse rounded-2xl" />;
  }

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Header & Legend */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
          Spending
        </h3>

        <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#D4F835]" />
            <span className="text-foreground text-[11px]">This month</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-foreground/60" />
            <span className="text-muted-foreground text-[11px]">Average</span>
          </div>
        </div>
      </div>

      {/* Hexagonal Radar Chart */}
      <div className="h-[220px] w-full -my-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#e5e7eb" strokeDasharray="2 2" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: "#6b7280", fontSize: 11, fontWeight: 500 }}
            />
            {/* Average Curve */}
            <Radar
              name="Average"
              dataKey="average"
              stroke="#0E0E10"
              strokeWidth={1.5}
              fill="none"
            />
            {/* This Month Polygon in Lime */}
            <Radar
              name="This month"
              dataKey="thisMonth"
              stroke="#B8DC14"
              strokeWidth={2}
              fill="#D4F835"
              fillOpacity={0.75}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
