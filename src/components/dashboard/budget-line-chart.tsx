"use client";

import React, { useState } from "react";
import { ChevronDown, TrendingUp } from "lucide-react";
import { formatINR } from "@/lib/formatters";

interface BudgetLineChartProps {
  dataPoints?: Array<{ date: string; amount: number }>;
}

const DEFAULT_POINTS_MONTH = [
  { date: "Week 1", amount: 0 },
  { date: "Week 2", amount: 0 },
  { date: "Week 3", amount: 0 },
  { date: "Week 4", amount: 0 },
];

const DEFAULT_POINTS_WEEK = [
  { date: "Mon", amount: 0 },
  { date: "Tue", amount: 0 },
  { date: "Wed", amount: 0 },
  { date: "Thu", amount: 0 },
  { date: "Fri", amount: 0 },
  { date: "Sat", amount: 0 },
  { date: "Sun", amount: 0 },
];

export function BudgetLineChart({ dataPoints }: BudgetLineChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"Month" | "Week">("Month");
  const [hoveredIndex, setHoveredIndex] = useState<number>(4);

  const activePoints = dataPoints || (selectedPeriod === "Month" ? DEFAULT_POINTS_MONTH : DEFAULT_POINTS_WEEK);

  const width = 340;
  const height = 180;
  const paddingLeft = 32;
  const paddingRight = 16;
  const paddingTop = 36;
  const paddingBottom = 28;

  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;
  const maxVal = selectedPeriod === "Month" ? 7000 : 5000;

  // Compute (x, y) coordinates
  const points = activePoints.map((p, i) => {
    const x = paddingLeft + (i / (activePoints.length - 1)) * innerWidth;
    const y = paddingTop + innerHeight - (p.amount / maxVal) * innerHeight;
    return { ...p, x, y };
  });

  // Smooth cubic bezier path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = (current.x + next.x) / 2;
    pathD += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }

  // Area path for gradient fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + innerHeight} L ${points[0].x} ${paddingTop + innerHeight} Z`;

  const activePoint = points[hoveredIndex] || points[3];

  return (
    <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs flex flex-col justify-between h-full select-none card-hover-lift">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg text-foreground tracking-tight">
            Budget Spending Curve
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Safe Zone
          </span>
        </div>

        {/* Period Dropdown Toggle */}
        <button
          type="button"
          onClick={() => setSelectedPeriod((prev) => (prev === "Month" ? "Week" : "Month"))}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80 cursor-pointer transition-colors shadow-2xs border border-border/60"
        >
          <span>{selectedPeriod}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>

      {/* Subtitle with Trend Indicator */}
      <div className="flex items-center justify-between text-xs py-1">
        <span className="text-muted-foreground text-[11px]">
          Target Ceiling: <strong className="text-foreground">{formatINR(maxVal)}</strong>
        </span>
        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          <span>Real-time Active Ledger</span>
        </span>
      </div>

      {/* Line Graph with SVG Area Gradient and Scrubber */}
      <div className="relative w-full flex items-center justify-center my-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id="budgetAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4F835" stopOpacity="0.45" />
              <stop offset="85%" stopColor="#D4F835" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 1000, 2000, 3000, 4000, 5000, 6000, 7000]
            .filter((v) => v <= maxVal)
            .map((val) => {
              const y = paddingTop + innerHeight - (val / maxVal) * innerHeight;
              return (
                <g key={val}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="currentColor"
                    className="text-border/40"
                    strokeDasharray="2 3"
                    strokeWidth="0.8"
                  />
                  <text
                    x={paddingLeft - 6}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] fill-muted-foreground font-medium select-none"
                  >
                    {val === 0 ? "0" : `${val / 1000}k`}
                  </text>
                </g>
              );
            })}

          {/* Gradient Area Fill */}
          <path d={areaD} fill="url(#budgetAreaGradient)" />

          {/* Smooth Spline Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#0E0E10"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="dark:stroke-white transition-all duration-300"
          />

          {/* Vertical Guideline at active hovered point */}
          <line
            x1={activePoint.x}
            y1={paddingTop}
            x2={activePoint.x}
            y2={paddingTop + innerHeight}
            stroke="#D4F835"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            className="transition-all duration-150"
          />

          {/* Clickable and Hoverable Points */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="6"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
            />
          ))}

          {/* Highlight Dot: Electric Lime with Black Ring */}
          <circle
            cx={activePoint.x}
            cy={activePoint.y}
            r="6.5"
            fill="#D4F835"
            stroke="#0E0E10"
            strokeWidth="2.5"
            className="transition-all duration-150 filter drop-shadow-md"
          />

          {/* X-Axis Date Labels */}
          {points.map((pt, i) => (
            <text
              key={i}
              x={pt.x}
              y={height - 6}
              textAnchor="middle"
              className={`text-[9px] font-bold select-none cursor-pointer transition-colors ${
                i === hoveredIndex ? "fill-[#0E0E10] dark:fill-[#D4F835]" : "fill-muted-foreground"
              }`}
              onMouseEnter={() => setHoveredIndex(i)}
            >
              {pt.date}
            </text>
          ))}
        </svg>

        {/* Noir Tooltip Bubble tracking the active dot */}
        <div
          className="absolute z-20 pointer-events-none transition-all duration-200 -translate-x-1/2"
          style={{
            left: `${(activePoint.x / width) * 100}%`,
            top: `${Math.max(0, (activePoint.y / height) * 100 - 32)}%`,
          }}
        >
          <div className="relative px-3 py-1 rounded-xl bg-[#0E0E10] text-white text-[11px] font-black shadow-2xl whitespace-nowrap border border-white/10">
            <span>{activePoint.date}: </span>
            <span className="text-[#D4F835] font-mono">{formatINR(activePoint.amount)}</span>
            {/* Arrow beak */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-4 border-transparent border-t-[#0E0E10]" />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground text-center font-semibold">
        Hover along the curve to inspect daily household expenses
      </div>
    </div>
  );
}
