"use client";

import React, { useState, useEffect } from "react";
import { Printer } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { DataService } from "@/lib/data-service";
import { HouseholdMember } from "@/lib/types";

// 3 Top Spenders from Figma image_20261014_111612.jpg center
const TOP_SPENDERS = [
  {
    name: "Joseph Mitchell",
    amount: "₹18,240",
    stat: "34% of total • +8.2% ↑",
    isUp: true,
    initial: "J",
    bg: "bg-amber-400 text-black",
  },
  {
    name: "Anya Sharma",
    amount: "₹12,920",
    stat: "24% of total • -3.1% ↗",
    isUp: false,
    initial: "A",
    bg: "bg-pink-400 text-white",
  },
  {
    name: "Rohit Sharma",
    amount: "₹9,520",
    stat: "18% of total • +2.4% ↑",
    isUp: true,
    initial: "R",
    bg: "bg-blue-500 text-white",
  },
];

// Monthly Comparison from Figma
const MONTHLY_COMPARISON = [
  { month: "July 2024", amount: "₹53,420", change: "+12.5% ↑", isUp: true, share: 42 },
  { month: "June 2024", amount: "₹47,500", change: "-5.2% ↓", isUp: false, share: 37 },
  { month: "May 2024", amount: "₹50,120", change: "+6.8% ↑", isUp: true, share: 39 },
];

// 4-Week Category Heatmap Matrix from Figma
// Colors: shades from light lime to dark olive/lime
const HEATMAP_ROWS = [
  {
    category: "Food & Dining",
    weeks: ["#c5ea28", "#84cc16", "#4d7c0f", "#0E0E10"],
  },
  {
    category: "Shopping",
    weeks: ["#bef264", "#a3e635", "#D4F835", "#84cc16"],
  },
  {
    category: "Utilities",
    weeks: ["#a3e635", "#D4F835", "#bef264", "#a3e635"],
  },
  {
    category: "Transport",
    weeks: ["#bef264", "#D4F835", "#a3e635", "#D4F835"],
  },
  {
    category: "Healthcare",
    weeks: ["#d9f99d", "#bef264", "#D4F835", "#ecfccb"],
  },
];

export default function ReportsPage() {
  const [members, setMembers] = useState<HouseholdMember[]>([]);

  useEffect(() => {
    DataService.getMembers().then(setMembers);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout title="Reports & Analytics">
      <div className="max-w-2xl mx-auto space-y-6 select-none">
        {/* Top Header matching Figma image_20261014_111612.jpg */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Reports &amp; Analytics
          </h2>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0E0E10] text-white hover:bg-zinc-800 text-xs font-bold cursor-pointer transition-colors shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Printable View</span>
          </button>
        </div>

        {/* Section 1: Top Spenders by Member matching Figma */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">
              Top Spenders by Member
            </h3>
            {members.length > 0 && (
              <span className="text-xs font-semibold text-muted-foreground">
                {members.length} members tracked
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TOP_SPENDERS.map((spender, i) => (
              <div
                key={i}
                className="rounded-[24px] bg-card border border-border/80 p-4 shadow-xs flex flex-col items-center text-center space-y-2 hover:border-border transition-colors"
              >
                {/* Circular Avatar */}
                <div
                  className={`h-13 w-13 rounded-full flex items-center justify-center font-bold text-base shadow-xs ${spender.bg}`}
                >
                  {spender.initial}
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-foreground leading-snug">
                    {spender.name}
                  </h4>
                  <div className="text-lg font-black text-foreground mt-0.5">
                    {spender.amount}
                  </div>
                </div>

                <p className="text-[10px] font-semibold text-muted-foreground">
                  {spender.stat}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Monthly Comparison Table matching Figma */}
        <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-foreground">
            Monthly Comparison
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/60 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  <th className="py-2.5 px-2">Month</th>
                  <th className="py-2.5 px-2">Amount</th>
                  <th className="py-2.5 px-2">Change</th>
                  <th className="py-2.5 px-2">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-semibold">
                {MONTHLY_COMPARISON.map((row, i) => (
                  <tr key={i} className="hover:bg-secondary/40">
                    <td className="py-3 px-2 text-foreground font-bold">{row.month}</td>
                    <td className="py-3 px-2 text-foreground font-mono font-bold">{row.amount}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-bold ${row.isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                          }`}
                      >
                        {row.change}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 text-[11px] font-mono">{row.share}%</span>
                        <div className="w-20 h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full bg-[#D4F835] rounded-full"
                            style={{ width: `${row.share}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Category Heatmap matching Figma */}
        <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-foreground">
            Category Heatmap
          </h3>

          <div className="space-y-3">
            {/* Column Headers */}
            <div className="grid grid-cols-5 text-center text-xs font-bold text-muted-foreground">
              <span className="text-left">Category</span>
              <span>W1</span>
              <span>W2</span>
              <span>W3</span>
              <span>W4</span>
            </div>

            {/* Rows */}
            {HEATMAP_ROWS.map((row, idx) => (
              <div key={idx} className="grid grid-cols-5 items-center gap-2 text-xs">
                <span className="font-bold text-foreground truncate pr-2">
                  {row.category}
                </span>
                {row.weeks.map((color, wIdx) => (
                  <div
                    key={wIdx}
                    className="h-9 rounded-xl transition-transform hover:scale-105 shadow-2xs cursor-pointer"
                    style={{ backgroundColor: color }}
                    title={`${row.category} Week ${wIdx + 1}`}
                  />
                ))}
              </div>
            ))}

            {/* Heatmap Legend */}
            <div className="flex items-center justify-end gap-3 pt-3 text-[11px] font-bold text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-3.5 w-3.5 rounded-md bg-[#d9f99d]" />
                <span>Low</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3.5 w-3.5 rounded-md bg-[#0E0E10]" />
                <span>High</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

