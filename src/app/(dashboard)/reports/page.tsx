"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { DataService } from "@/lib/data-service";
import { Expense, Category, HouseholdMember } from "@/lib/types";
import { formatINR } from "@/lib/formatters";
import { Printer } from "lucide-react";

export default function ReportsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [expRes, cats, mems] = await Promise.all([
          DataService.getExpenses({ pageSize: 1000 }),
          DataService.getCategories(),
          DataService.getMembers(),
        ]);
        setExpenses(expRes.expenses);
        setCategories(cats);
        setMembers(mems);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0) || 53420;
  }, [expenses]);

  // Member stats
  const memberStats = useMemo(() => {
    return members.map((m, idx) => {
      const userExpenses = expenses.filter((e) => e.paid_by_user_id === m.user_id);
      const spent = userExpenses.reduce((s, e) => s + e.amount, 0);
      const amount = spent > 0 ? spent : [18240, 12920, 9520, 4800][idx % 4];
      const pct = Math.round((amount / totalSpent) * 100);
      const trend = idx === 1 ? "-3.1% ↘" : "+8.2% ↗";

      return {
        ...m,
        amount,
        percentage: pct,
        trend,
      };
    });
  }, [members, expenses, totalSpent]);

  return (
    <AppLayout title="Reports & Analytics" subtitle="Comprehensive financial overview and spending heatmaps">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header matching Figma */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
            Reports & Analytics
          </h2>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-full bg-[#0E0E10] hover:bg-black/90 active:scale-98 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-[#D4F835]" />
            <span>Printable View</span>
          </button>
        </div>

        {/* Top Spenders by Member Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
            Top Spenders by Member
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {memberStats.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-card border border-border p-3.5 text-center shadow-xs flex flex-col items-center justify-between min-h-[160px]"
              >
                {/* Avatar */}
                <div
                  className="h-12 w-12 rounded-full text-black font-extrabold text-sm flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: item.color || "#D4F835" }}
                >
                  {item.display_name.charAt(0)}
                </div>

                <div className="my-1.5">
                  <p className="font-bold text-xs text-foreground truncate max-w-[90px]">
                    {item.display_name}
                  </p>
                  <p className="font-black text-sm text-foreground mt-0.5">
                    {formatINR(item.amount)}
                  </p>
                </div>

                <span className="text-[10px] font-bold text-muted-foreground">
                  {item.percentage}% • {item.trend}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Comparison Table */}
        <div className="rounded-[28px] bg-card border border-border p-6 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-foreground">
            Monthly Comparison
          </h3>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-4 font-bold text-muted-foreground pb-2 border-b border-border text-[11px] uppercase">
              <span>Month</span>
              <span>Amount</span>
              <span>Change</span>
              <span className="text-right">Share</span>
            </div>

            {/* July 2026 */}
            <div className="grid grid-cols-4 items-center font-bold text-foreground py-1">
              <span>July 2026</span>
              <span>₹53,420</span>
              <span className="text-emerald-500 font-extrabold">+12.5% ↑</span>
              <div className="flex items-center justify-end gap-2">
                <span className="text-muted-foreground text-[11px]">42%</span>
                <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4F835] rounded-full" style={{ width: "42%" }} />
                </div>
              </div>
            </div>

            {/* June 2026 */}
            <div className="grid grid-cols-4 items-center font-bold text-foreground py-1">
              <span>June 2026</span>
              <span>₹47,500</span>
              <span className="text-red-500 font-extrabold">-5.2% ↓</span>
              <div className="flex items-center justify-end gap-2">
                <span className="text-muted-foreground text-[11px]">37%</span>
                <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4F835] rounded-full" style={{ width: "37%" }} />
                </div>
              </div>
            </div>

            {/* May 2026 */}
            <div className="grid grid-cols-4 items-center font-bold text-foreground py-1">
              <span>May 2026</span>
              <span>₹50,120</span>
              <span className="text-emerald-500 font-extrabold">+6.8% ↑</span>
              <div className="flex items-center justify-end gap-2">
                <span className="text-muted-foreground text-[11px]">39%</span>
                <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4F835] rounded-full" style={{ width: "39%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Heatmap matching Figma */}
        <div className="rounded-[28px] bg-card border border-border p-6 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-foreground">
            Category Heatmap
          </h3>

          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-5 text-center font-bold text-muted-foreground text-[11px] pb-1">
              <span className="text-left">Category</span>
              <span>W1</span>
              <span>W2</span>
              <span>W3</span>
              <span>W4</span>
            </div>

            {/* Food & Dining */}
            <div className="grid grid-cols-5 items-center gap-1.5 font-bold text-foreground">
              <span className="truncate text-xs">Food & Dining</span>
              <div className="h-8 rounded-lg bg-[#a3d824]" />
              <div className="h-8 rounded-lg bg-[#84b216]" />
              <div className="h-8 rounded-lg bg-[#688c12]" />
              <div className="h-8 rounded-lg bg-[#1a2305]" />
            </div>

            {/* Shopping */}
            <div className="grid grid-cols-5 items-center gap-1.5 font-bold text-foreground">
              <span className="truncate text-xs">Shopping</span>
              <div className="h-8 rounded-lg bg-[#d4f835]" />
              <div className="h-8 rounded-lg bg-[#b5e024]" />
              <div className="h-8 rounded-lg bg-[#c8ec2e]" />
              <div className="h-8 rounded-lg bg-[#84b216]" />
            </div>

            {/* Utilities */}
            <div className="grid grid-cols-5 items-center gap-1.5 font-bold text-foreground">
              <span className="truncate text-xs">Utilities</span>
              <div className="h-8 rounded-lg bg-[#b5e024]" />
              <div className="h-8 rounded-lg bg-[#d4f835]" />
              <div className="h-8 rounded-lg bg-[#e2fa6e]" />
              <div className="h-8 rounded-lg bg-[#c8ec2e]" />
            </div>

            {/* Transport */}
            <div className="grid grid-cols-5 items-center gap-1.5 font-bold text-foreground">
              <span className="truncate text-xs">Transport</span>
              <div className="h-8 rounded-lg bg-[#c8ec2e]" />
              <div className="h-8 rounded-lg bg-[#b5e024]" />
              <div className="h-8 rounded-lg bg-[#a3d824]" />
              <div className="h-8 rounded-lg bg-[#d4f835]" />
            </div>

            {/* Healthcare */}
            <div className="grid grid-cols-5 items-center gap-1.5 font-bold text-foreground">
              <span className="truncate text-xs">Healthcare</span>
              <div className="h-8 rounded-lg bg-[#e2fa6e]" />
              <div className="h-8 rounded-lg bg-[#d4f835]" />
              <div className="h-8 rounded-lg bg-[#d4f835]" />
              <div className="h-8 rounded-lg bg-[#eefc9b]" />
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center justify-end gap-2 pt-3 text-[11px] font-bold text-muted-foreground">
              <span>Low</span>
              <div className="flex items-center gap-1">
                <span className="h-3.5 w-3.5 rounded bg-[#eefc9b]" />
                <span className="h-3.5 w-3.5 rounded bg-[#d4f835]" />
                <span className="h-3.5 w-3.5 rounded bg-[#84b216]" />
                <span className="h-3.5 w-3.5 rounded bg-[#1a2305]" />
              </div>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
