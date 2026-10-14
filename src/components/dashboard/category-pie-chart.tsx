"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CategorySpending } from "@/lib/types";
import { formatINR, formatPercent } from "@/lib/formatters";

interface CategoryPieChartProps {
  data: CategorySpending[];
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[260px] w-full bg-muted/20 animate-pulse rounded-xl" />;
  }

  // Filter out zero spend categories and take top 6 + other
  const activeCategories = data.filter((c) => c.totalAmount > 0);
  const displayData = activeCategories.slice(0, 6);

  if (activeCategories.length > 6) {
    const otherAmount = activeCategories.slice(6).reduce((sum, c) => sum + c.totalAmount, 0);
    const overallTotal = activeCategories.reduce((sum, c) => sum + c.totalAmount, 0);
    displayData.push({
      categoryId: "other-grouped",
      categoryName: "Remaining Categories",
      icon: "HelpCircle",
      color: "#94a3b8",
      totalAmount: otherAmount,
      percentage: overallTotal > 0 ? Math.round((otherAmount / overallTotal) * 1000) / 10 : 0,
    });
  }

  if (displayData.length === 0) {
    return (
      <div className="h-[260px] flex items-center justify-center text-xs text-muted-foreground">
        No spending recorded for this period
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as CategorySpending;
      return (
        <div className="rounded-xl border border-border bg-card p-3 shadow-lg text-xs">
          <p className="font-semibold text-foreground">{item.categoryName}</p>
          <p className="text-primary font-bold text-sm mt-0.5">{formatINR(item.totalAmount)}</p>
          <p className="text-muted-foreground text-[11px] mt-0.5">{formatPercent(item.percentage)} of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[260px] w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={displayData}
            dataKey="totalAmount"
            nameKey="categoryName"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
          >
            {displayData.map((entry) => (
              <Cell key={entry.categoryId} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
