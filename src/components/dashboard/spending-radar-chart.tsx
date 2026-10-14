"use client";

import React, { useState } from "react";
import { formatINR } from "@/lib/formatters";

interface SpendingRadarChartProps {
  categorySpending?: Array<{
    categoryId: string;
    categoryName: string;
    totalAmount: number;
  }>;
}

const DEFAULT_AXES = [
  { label: "Food", current: 85, avg: 65, amount: 24500 },
  { label: "Bills", current: 90, avg: 85, amount: 16800 },
  { label: "Sporting goods", current: 60, avg: 70, amount: 5200 },
  { label: "Home goods", current: 75, avg: 55, amount: 8400 },
  { label: "Clothing", current: 80, avg: 75, amount: 10200 },
  { label: "Other", current: 70, avg: 60, amount: 4800 },
];

export function SpendingRadarChart({ categorySpending }: SpendingRadarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Map incoming categorySpending or use DEFAULT_AXES
  const axes = DEFAULT_AXES.map((axis, i) => {
    if (categorySpending && categorySpending[i]) {
      const match = categorySpending[i];
      const maxAmount = 30000;
      const normalized = Math.min(95, Math.max(30, (match.totalAmount / maxAmount) * 100));
      return {
        label: match.categoryName,
        current: normalized,
        avg: Math.min(90, Math.max(35, normalized * 0.85)),
        amount: match.totalAmount,
      };
    }
    return axis;
  });

  const size = 260;
  const center = size / 2;
  const radius = 95;

  // Angles for 6 vertices (starting top, Food)
  // i = 0 => -90 deg
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
    <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs flex flex-col justify-between h-full select-none">
      {/* Header with Legend matching Figma image_20261014_111151.jpg */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-lg text-foreground tracking-tight">
          Spending
        </h3>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#D4F835]" />
            <span className="text-muted-foreground font-medium">This month</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-foreground inline-block" />
            <span className="text-muted-foreground font-medium">Average</span>
          </div>
        </div>
      </div>

      {/* Hexagonal Radar Graph */}
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

          {/* Average Baseline (Black line contour) */}
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
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4.5"
                fill="#0E0E10"
                className="cursor-pointer transition-transform hover:scale-150"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}

          {/* Axis Labels */}
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
                className="text-[11px] font-semibold fill-muted-foreground select-none"
              >
                {axis.label}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIndex !== null && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#0E0E10] text-white text-xs font-semibold shadow-lg">
            {axes[hoveredIndex].label}: {formatINR(axes[hoveredIndex].amount)}
          </div>
        )}
      </div>
    </div>
  );
}

