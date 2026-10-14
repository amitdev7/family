"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface BudgetLineChartProps {
  dataPoints?: Array<{ date: string; amount: number }>;
}

const DEFAULT_POINTS = [
  { date: "18 dec", amount: 3200 },
  { date: "25 dec", amount: 4900 },
  { date: "1 jan", amount: 200 },
  { date: "8 jan", amount: 3800 },
  { date: "15 jan", amount: 5900 },
  { date: "22 jan", amount: 6800 },
  { date: "29 jan", amount: 4800 },
];

export function BudgetLineChart({ dataPoints = DEFAULT_POINTS }: BudgetLineChartProps) {
  const [selectedPointIndex, setSelectedPointIndex] = useState<number>(4); // Highlight 15 jan / peak
  const [selectedPeriod, setSelectedPeriod] = useState("Month");

  const width = 340;
  const height = 180;
  const paddingLeft = 32;
  const paddingRight = 16;
  const paddingTop = 36;
  const paddingBottom = 28;

  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;
  const maxVal = 7000;

  // Compute (x, y) coordinates for each point
  const points = dataPoints.map((p, i) => {
    const x = paddingLeft + (i / (dataPoints.length - 1)) * innerWidth;
    const y = paddingTop + innerHeight - (p.amount / maxVal) * innerHeight;
    return { ...p, x, y };
  });

  // Generate smooth cubic bezier SVG path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = (current.x + next.x) / 2;
    pathD += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }

  const activePoint = points[selectedPointIndex] || points[3];

  return (
    <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs flex flex-col justify-between h-full select-none">
      {/* Header matching Figma image_20261014_111154.jpg */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-foreground tracking-tight">
          Budget
        </h3>

        {/* Dropdown Pill */}
        <button
          type="button"
          onClick={() => setSelectedPeriod((prev) => (prev === "Month" ? "Week" : "Month"))}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 text-foreground text-xs font-semibold hover:bg-secondary cursor-pointer transition-colors shadow-2xs"
        >
          <span>{selectedPeriod}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>

      {/* Line Graph */}
      <div className="relative w-full flex items-center justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
        >
          {/* Horizontal Grid lines (0 to 7k) */}
          {[0, 1000, 2000, 3000, 4000, 5000, 6000, 7000].map((val) => {
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

          {/* Smooth Spline Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#0E0E10"
            strokeWidth="2"
            strokeLinecap="round"
            className="dark:stroke-white transition-all duration-300"
          />

          {/* Interactive clickable points */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="4"
              fill="transparent"
              className="cursor-pointer"
              onClick={() => setSelectedPointIndex(i)}
            />
          ))}

          {/* Highlight Dot: Electric Lime with Black Ring matching Figma */}
          <circle
            cx={activePoint.x}
            cy={activePoint.y}
            r="6"
            fill="#D4F835"
            stroke="#0E0E10"
            strokeWidth="2.5"
            className="transition-all duration-300 filter drop-shadow-xs"
          />

          {/* X-Axis Date Labels */}
          {points.map((pt, i) => (
            <text
              key={i}
              x={pt.x}
              y={height - 6}
              textAnchor="middle"
              className={`text-[9px] font-semibold select-none cursor-pointer ${i === selectedPointIndex
                ? "fill-foreground font-bold"
                : "fill-muted-foreground"
                }`}
              onClick={() => setSelectedPointIndex(i)}
            >
              {pt.date}
            </text>
          ))}
        </svg>

        {/* Noir Tooltip Bubble with arrow pointing to highlighted dot */}
        <div
          className="absolute z-20 pointer-events-none transition-all duration-300 -translate-x-1/2"
          style={{
            left: `${(activePoint.x / width) * 100}%`,
            top: `${Math.max(0, (activePoint.y / height) * 100 - 30)}%`,
          }}
        >
          <div className="relative px-3 py-1 rounded-xl bg-[#0E0E10] text-white text-[11px] font-extrabold shadow-xl whitespace-nowrap">
            ₹26,590.40
            {/* Arrow beak */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-4 border-transparent border-t-[#0E0E10]" />
          </div>
        </div>
      </div>
    </div>
  );
}

