"use client";

import React, { useState } from "react";
import { formatINR } from "@/lib/formatters";
import { PieChart as PieIcon, Activity } from "lucide-react";

interface SpendingRadarChartProps {
  categorySpending?: Array<{
    categoryId: string;
    categoryName: string;
    totalAmount: number;
  }>;
}

const DEFAULT_AXES = [
  { label: "Food", current: 0, avg: 0, amount: 0, emoji: "🍕", color: "#D4F835" },
  { label: "Bills", current: 0, avg: 0, amount: 0, emoji: "💡", color: "#38bdf8" },
  { label: "Shopping", current: 0, avg: 0, amount: 0, emoji: "🛍️", color: "#f43f5e" },
  { label: "Transport", current: 0, avg: 0, amount: 0, emoji: "🚗", color: "#a855f7" },
  { label: "Health", current: 0, avg: 0, amount: 0, emoji: "🩺", color: "#fb923c" },
  { label: "Other", current: 0, avg: 0, amount: 0, emoji: "📦", color: "#10b981" },
];

export function SpendingRadarChart({ categorySpending }: SpendingRadarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"radar" | "donut">("radar");

  // Map incoming categorySpending or use 0 defaults
  const axes = DEFAULT_AXES.map((axis, i) => {
    if (categorySpending && categorySpending[i] && categorySpending[i].totalAmount > 0) {
      const match = categorySpending[i];
      const maxAmount = Math.max(1, ...categorySpending.map((c) => c.totalAmount));
      const normalized = Math.min(95, Math.max(15, (match.totalAmount / maxAmount) * 100));
      return {
        ...axis,
        label: match.categoryName,
        current: normalized,
        avg: Math.round(normalized * 0.8),
        amount: match.totalAmount,
      };
    }
    return {
      ...axis,
      current: 0,
      avg: 0,
      amount: 0,
    };
  });

  const totalSpentAll = axes.reduce((acc, curr) => acc + curr.amount, 0);

  const size = 260;
  const center = size / 2;
  const radius = 95;

  // Angles for 6 vertices (starting top, Food)
  const getCoordinates = (index: number, valuePercent: number) => {
    const angle = (Math.PI * 2 / 6) * index - Math.PI / 2;
    const r = (valuePercent / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Generate web polygon points
  const getPolygonPoints = (levelPercent: number) => {
    return Array.from({ length: 6 })
      .map((_, i) => {
        const { x, y } = getCoordinates(i, levelPercent);
        return `${x},${y}`;
      })
      .join(" ");
  };

  // Current month lime polygon path
  const currentPoints = axes
    .map((axis, i) => {
      const { x, y } = getCoordinates(i, axis.current);
      return `${x},${y}`;
    })
    .join(" ");

  // Average line polygon path
  const avgPoints = axes
    .map((axis, i) => {
      const { x, y } = getCoordinates(i, axis.avg);
      return `${x},${y}`;
    })
    .join(" ");

  // Label coordinates (further out)
  const getLabelCoordinates = (index: number) => {
    const angle = (Math.PI * 2 / 6) * index - Math.PI / 2;
    const r = radius + 24;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  return (
    <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs flex flex-col justify-between h-full select-none card-hover-lift">
      {/* Header with View Mode Switcher */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg text-foreground tracking-tight">
            Spending Radar
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4F835]/20 text-black dark:text-[#D4F835]">
            Analytics
          </span>
        </div>

        {/* View Switcher Pill */}
        <div className="flex items-center bg-secondary/80 rounded-full p-1 border border-border/60">
          <button
            type="button"
            onClick={() => setViewMode("radar")}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              viewMode === "radar"
                ? "bg-[#D4F835] text-black shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Radar View"
          >
            <Activity className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("donut")}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              viewMode === "donut"
                ? "bg-[#D4F835] text-black shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Donut Breakdown View"
          >
            <PieIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs py-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#D4F835]" />
            <span className="text-muted-foreground font-medium text-[11px]">This month</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-foreground inline-block" />
            <span className="text-muted-foreground font-medium text-[11px]">Average baseline</span>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold text-foreground">
          Total: {formatINR(totalSpentAll)}
        </span>
      </div>

      {/* Graph Area */}
      {viewMode === "radar" ? (
        <div className="relative flex items-center justify-center py-2">
          <svg width={size} height={size} className="overflow-visible">
            {/* Concentric Hexagon Grid Levels */}
            {[25, 50, 75, 100].map((level) => (
              <polygon
                key={level}
                points={getPolygonPoints(level)}
                fill="none"
                stroke="currentColor"
                className="text-border/60"
                strokeWidth="0.8"
              />
            ))}

            {/* Radial Axis Lines */}
            {Array.from({ length: 6 }).map((_, i) => {
              const { x, y } = getCoordinates(i, 100);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="currentColor"
                  className="text-border/50"
                  strokeWidth="0.8"
                />
              );
            })}

            {/* Electric Lime Polygon Fill (This Month) */}
            <polygon
              points={currentPoints}
              fill="#D4F835"
              fillOpacity="0.88"
              stroke="#C5EA28"
              strokeWidth="1.5"
              className="filter drop-shadow-sm transition-all duration-300"
            />

            {/* Average Baseline (Contour line) */}
            <polygon
              points={avgPoints}
              fill="none"
              stroke="#0E0E10"
              strokeWidth="1.5"
              className="dark:stroke-white transition-all duration-300"
            />

            {/* Interactive Vertex Dots */}
            {axes.map((axis, i) => {
              const { x, y } = getCoordinates(i, axis.current);
              const isHovered = hoveredIndex === i;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={isHovered ? "6" : "4.5"}
                  fill={isHovered ? "#D4F835" : "#0E0E10"}
                  stroke={isHovered ? "#0E0E10" : "none"}
                  strokeWidth={isHovered ? "2" : "0"}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}

            {/* Axis Labels with Emojis */}
            {axes.map((axis, i) => {
              const { x, y } = getLabelCoordinates(i);
              const isTop = i === 0;
              const isBottom = i === 3;
              const isRight = i === 1 || i === 2;
              const textAnchor = isTop || isBottom ? "middle" : isRight ? "start" : "end";

              return (
                <text
                  key={i}
                  x={x}
                  y={y + (isTop ? -4 : isBottom ? 8 : 4)}
                  textAnchor={textAnchor}
                  className="text-[11px] font-bold fill-muted-foreground select-none cursor-pointer hover:fill-foreground"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {axis.emoji} {axis.label}
                </text>
              );
            })}
          </svg>

          {/* Hover Tooltip */}
          {hoveredIndex !== null && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-[#0E0E10] text-white text-xs font-bold shadow-xl border border-white/10 z-20 animate-in fade-in zoom-in-95">
              <span>{axes[hoveredIndex].emoji} {axes[hoveredIndex].label}: </span>
              <span className="text-[#D4F835] font-mono">{formatINR(axes[hoveredIndex].amount)}</span>
              <span className="text-zinc-400 text-[10px] ml-1">
                ({Math.round((axes[hoveredIndex].amount / totalSpentAll) * 100)}%)
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Donut Breakdown View */
        <div className="py-2 space-y-3">
          <div className="space-y-2">
            {axes.map((cat, idx) => {
              const pct = Math.round((cat.amount / totalSpentAll) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-foreground">
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground">{formatINR(cat.amount)}</span>
                      <span className="w-8 text-right font-bold text-foreground">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground text-center font-semibold">
        {viewMode === "radar"
          ? "Hover vertices to view category proportions"
          : "6 top household categories tracked this billing cycle"}
      </div>
    </div>
  );
}
