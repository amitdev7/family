"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Printer, TrendingUp, BarChart3 } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { DataService } from "@/lib/data-service";
import { HouseholdMember, DashboardMetrics, Category, Expense } from "@/lib/types";
import { formatINR } from "@/lib/formatters";
import Image from "next/image";
import { MEMBER_AVATARS } from "@/lib/assets";

const getMemberAvatar = (id?: string, name?: string) => {
  if (id && MEMBER_AVATARS[id]) return MEMBER_AVATARS[id];
  if (name) {
    const lower = name.toLowerCase();
    const found = Object.values(MEMBER_AVATARS).find(
      (a) => a.name.toLowerCase() === lower
    );
    if (found) return found;
  }
  return null;
};

const AVATAR_COLORS = [
  "bg-amber-400 text-black",
  "bg-pink-400 text-white",
  "bg-blue-500 text-white",
  "bg-emerald-500 text-white",
  "bg-purple-500 text-white",
];

export default function ReportsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [dashMetrics, mems, cats, expResult] = await Promise.all([
        DataService.getDashboardMetrics(),
        DataService.getMembers(),
        DataService.getCategories(),
        DataService.getExpenses(),
      ]);
      setMetrics(dashMetrics);
      setMembers(mems);
      setCategories(cats);
      setExpenses(expResult.expenses);
    } catch (err) {
      console.error("Failed to load reports data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener("expense-saved", handleUpdate);
    window.addEventListener("household-user-changed", handleUpdate);
    window.addEventListener("household-expense-updated", handleUpdate);

    return () => {
      window.removeEventListener("expense-saved", handleUpdate);
      window.removeEventListener("household-user-changed", handleUpdate);
      window.removeEventListener("household-expense-updated", handleUpdate);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // 1. Dynamic Top Spenders by Member
  const topSpenders = useMemo(() => {
    if (!metrics?.memberSpending) return [];
    return [...metrics.memberSpending].sort((a, b) => b.totalAmount - a.totalAmount);
  }, [metrics]);

  // 2. Dynamic Monthly Comparison Table (from real monthlyTrend)
  const monthlyComparison = useMemo(() => {
    if (!metrics?.monthlyTrend || metrics.monthlyTrend.length === 0) return [];
    const reversed = [...metrics.monthlyTrend].reverse();
    const totalAcross = reversed.reduce((sum, item) => sum + item.totalAmount, 0);

    return reversed.map((item, idx) => {
      const prev = reversed[idx + 1];
      let change = "—";
      let isUp = true;

      if (prev) {
        if (prev.totalAmount === 0 && item.totalAmount > 0) {
          change = "+100% ↑";
          isUp = true;
        } else if (prev.totalAmount === 0 && item.totalAmount === 0) {
          change = "0% —";
          isUp = true;
        } else if (prev.totalAmount > 0) {
          const diff = Math.round(((item.totalAmount - prev.totalAmount) / prev.totalAmount) * 100);
          change = diff >= 0 ? `+${diff}% ↑` : `${diff}% ↓`;
          isUp = diff >= 0;
        }
      }

      const share = totalAcross > 0 ? Math.round((item.totalAmount / totalAcross) * 100) : 0;

      return {
        month: item.label,
        amount: formatINR(item.totalAmount),
        rawAmount: item.totalAmount,
        change,
        isUp,
        share,
      };
    });
  }, [metrics]);

  // 3. Dynamic Category Heatmap (4-week breakdown of current month)
  const heatmapData = useMemo(() => {
    const now = new Date();
    const currentPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthExpenses = expenses.filter(
      (e) => !e.deleted_at && e.expense_date.startsWith(currentPrefix)
    );

    const activeCategories = categories.filter((c) => c.is_active).slice(0, 6);

    const rows = activeCategories.map((cat) => {
      const catExpenses = monthExpenses.filter((e) => e.category_id === cat.id);

      const weeks = [0, 0, 0, 0];
      for (const exp of catExpenses) {
        const day = parseInt(exp.expense_date.split("-")[2] || "1", 10);
        if (day <= 7) weeks[0] += exp.amount;
        else if (day <= 14) weeks[1] += exp.amount;
        else if (day <= 21) weeks[2] += exp.amount;
        else weeks[3] += exp.amount;
      }

      return {
        category: cat.name,
        color: cat.color,
        weeks,
      };
    });

    const maxSpend = Math.max(1, ...rows.flatMap((r) => r.weeks));

    const getHeatColor = (amount: number) => {
      if (amount <= 0) return "rgba(212, 248, 53, 0.08)";
      const ratio = amount / maxSpend;
      if (ratio < 0.25) return "#d9f99d";
      if (ratio < 0.5) return "#bef264";
      if (ratio < 0.75) return "#a3e635";
      return "#0E0E10";
    };

    return { rows, getHeatColor, maxSpend };
  }, [categories, expenses]);

  if (isLoading || !metrics) {
    return (
      <AppLayout title="Reports & Analytics">
        <div className="max-w-2xl mx-auto space-y-6 animate-pulse pb-12">
          <div className="h-10 w-48 rounded-xl bg-card border border-border/80" />
          <div className="h-44 rounded-[28px] bg-card border border-border/80" />
          <div className="h-64 rounded-[28px] bg-card border border-border/80" />
          <div className="h-64 rounded-[28px] bg-card border border-border/80" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Reports & Analytics">
      <div className="max-w-2xl mx-auto space-y-6 select-none pb-12">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Reports &amp; Analytics
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time household financial breakdown and historical trends
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0E0E10] text-white hover:bg-zinc-800 text-xs font-bold cursor-pointer transition-colors shadow-xs active:scale-95"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Printable View</span>
          </button>
        </div>

        {/* Section 1: Top Spenders by Member */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <span>Top Spenders by Member</span>
            </h3>
            {members.length > 0 && (
              <span className="text-xs font-semibold text-muted-foreground">
                {members.length} member{members.length === 1 ? "" : "s"} tracked
              </span>
            )}
          </div>

          {topSpenders.length === 0 ? (
            <div className="rounded-[24px] bg-card border border-border/80 p-8 text-center space-y-2">
              <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground/40" />
              <p className="text-xs font-bold text-muted-foreground">
                No transactions logged yet.
              </p>
              <p className="text-[11px] text-muted-foreground/80">
                Expenses recorded by household members will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {topSpenders.slice(0, 3).map((spender, i) => {
                const avatar = getMemberAvatar(spender.userId, spender.displayName);
                const colorClass = AVATAR_COLORS[i % AVATAR_COLORS.length];
                const initial = (spender.displayName || "M").slice(0, 1).toUpperCase();

                return (
                  <div
                    key={spender.userId || i}
                    className="rounded-[24px] bg-card border border-border/80 p-4 shadow-xs flex flex-col items-center text-center space-y-2 hover:border-border transition-colors"
                  >
                    {/* Circular Avatar */}
                    <div
                      className={`h-14 w-14 rounded-full flex items-center justify-center font-bold text-base shadow-xs overflow-hidden ${colorClass}`}
                    >
                      {avatar?.image ? (
                        <Image
                          src={avatar.image}
                          alt={spender.displayName}
                          width={56}
                          height={56}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span>{initial}</span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-foreground leading-snug truncate max-w-[150px]">
                        {spender.displayName}
                      </h4>
                      <div className="text-lg font-black text-foreground mt-0.5 font-mono">
                        {formatINR(spender.totalAmount)}
                      </div>
                    </div>

                    <p className="text-[10px] font-semibold text-muted-foreground">
                      {Math.round(spender.percentage)}% of total • {spender.count} txn{spender.count === 1 ? "" : "s"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Monthly Comparison Table */}
        <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-foreground">
              Monthly Comparison
            </h3>
            <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-[#D4F835]" />
              <span>Real Ledger Data</span>
            </span>
          </div>

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
                {monthlyComparison.map((row, i) => (
                  <tr key={i} className="hover:bg-secondary/40 transition-colors">
                    <td className="py-3 px-2 text-foreground font-bold">{row.month}</td>
                    <td className="py-3 px-2 text-foreground font-mono font-bold">{row.amount}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-bold ${row.change === "—"
                          ? "text-muted-foreground"
                          : row.isUp
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-500"
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
                            className="h-full bg-[#D4F835] rounded-full transition-all duration-300"
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

        {/* Section 3: Category Heatmap */}
        <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-foreground">
              Category Heatmap
            </h3>
            <span className="text-[11px] font-bold text-muted-foreground">
              Current Month (W1–W4)
            </span>
          </div>

          <div className="space-y-3">
            {/* Column Headers */}
            <div className="grid grid-cols-5 text-center text-xs font-bold text-muted-foreground">
              <span className="text-left">Category</span>
              <span>W1 (1-7)</span>
              <span>W2 (8-14)</span>
              <span>W3 (15-21)</span>
              <span>W4 (22+)</span>
            </div>

            {/* Rows */}
            {heatmapData.rows.length === 0 ? (
              <p className="text-center py-6 text-xs font-medium text-muted-foreground">
                No active categories found.
              </p>
            ) : (
              heatmapData.rows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-5 items-center gap-2 text-xs">
                  <span className="font-bold text-foreground truncate pr-2" title={row.category}>
                    {row.category}
                  </span>
                  {row.weeks.map((spend, wIdx) => {
                    const bg = heatmapData.getHeatColor(spend);
                    return (
                      <div
                        key={wIdx}
                        className="h-9 rounded-xl transition-all hover:scale-105 shadow-2xs cursor-pointer border border-border/40 flex items-center justify-center"
                        style={{ backgroundColor: bg }}
                        title={`${row.category} Week ${wIdx + 1}: ${formatINR(spend)}`}
                      >
                        {spend > 0 && (
                          <span
                            className={`text-[9px] font-mono font-bold ${bg === "#0E0E10" ? "text-white" : "text-black"
                              }`}
                          >
                            {spend >= 1000 ? `₹${Math.round(spend / 1000)}k` : `₹${Math.round(spend)}`}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}

            {/* Heatmap Legend */}
            <div className="flex items-center justify-between pt-3 text-[11px] font-bold text-muted-foreground border-t border-border/50">
              <span className="text-[10px] text-muted-foreground/80 font-normal">
                Intensity reflects relative weekly spend
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-3.5 w-3.5 rounded-md bg-[rgba(212,248,53,0.08)] border border-border/60" />
                  <span>₹0</span>
                </div>
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
      </div>
    </AppLayout>
  );
}
