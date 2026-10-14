"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { SpendingTrendChart } from "@/components/dashboard/spending-trend-chart";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { DataService } from "@/lib/data-service";
import { Expense, Category, HouseholdMember, Budget } from "@/lib/types";
import { formatINR, formatPercent } from "@/lib/formatters";
import {
  calculateTotalSpending,
  calculateCategorySpending,
  calculateMemberSpending,
  calculateMonthlyTrend,
  comparePeriodsSpending,
} from "@/lib/calculations/financials";

type ReportPeriod = "this_month" | "last_month" | "this_year";

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>("this_month");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [expRes, cats, mems, budgs] = await Promise.all([
          DataService.getExpenses({ pageSize: 1000 }),
          DataService.getCategories(),
          DataService.getMembers(),
          DataService.getBudgets(),
        ]);
        setExpenses(expRes.expenses);
        setCategories(cats);
        setMembers(mems);
        setBudgets(budgs);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter expenses by period
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (period === "this_month") {
        return e.expense_date.startsWith("2026-10");
      } else if (period === "last_month") {
        return e.expense_date.startsWith("2026-09");
      } else if (period === "this_year") {
        return e.expense_date.startsWith("2026");
      }
      return true;
    });
  }, [expenses, period]);

  // Previous period expenses for comparison
  const previousPeriodExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (period === "this_month") {
        return e.expense_date.startsWith("2026-09");
      } else if (period === "last_month") {
        return e.expense_date.startsWith("2026-08");
      } else if (period === "this_year") {
        return e.expense_date.startsWith("2025");
      }
      return false;
    });
  }, [expenses, period]);

  const currentTotal = calculateTotalSpending(filteredExpenses);
  const previousTotal = calculateTotalSpending(previousPeriodExpenses);
  const comparison = comparePeriodsSpending(currentTotal, previousTotal);

  // Daily average
  const daysInPeriod = period === "this_year" ? 287 : 30;
  const dailyAverage = currentTotal / daysInPeriod;

  // Highest expense
  const highestExpense = filteredExpenses.reduce(
    (max, e) => (e.amount > (max?.amount || 0) ? e : max),
    null as Expense | null
  );

  // Category breakdown
  const categoryBudgetsMap: Record<string, number> = {};
  budgets.forEach((b) => {
    if (b.category_id) categoryBudgetsMap[b.category_id] = b.amount;
  });
  const categorySpending = calculateCategorySpending(filteredExpenses, categories, categoryBudgetsMap);

  // Member breakdown
  const memberSpending = calculateMemberSpending(filteredExpenses, members);

  // Monthly trend for last 6 months
  const monthlyTrend = calculateMonthlyTrend(expenses, 6);

  const handleExportCSV = () => {
    const csvContent = DataService.exportExpensesToCSV(filteredExpenses);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Our_Home_Analytics_Report_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <AppLayout title="Financial Reports & Analytics" subtitle="Loading analytics...">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 animate-pulse mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-card border border-border" />
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Financial Reports & Analytics"
      subtitle="In-depth breakdown of household cash flow, category distribution, and member contributions"
    >
      {/* Top Filter and Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
            className="w-48 h-9 text-xs font-semibold"
          >
            <option value="this_month">This Month (October 2026)</option>
            <option value="last_month">Last Month (September 2026)</option>
            <option value="this_year">Full Year (2026)</option>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="gap-1.5 text-xs font-semibold"
        >
          <Download className="h-4 w-4" />
          <span>Export Analytics Report (CSV)</span>
        </Button>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-5">
          <span className="text-xs text-muted-foreground uppercase tracking-wider block">
            Period Total Spend
          </span>
          <div className="text-2xl font-extrabold text-foreground mt-2">
            {formatINR(currentTotal)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {comparison.isIncrease ? (
              <span className="inline-flex items-center gap-0.5 text-destructive font-semibold">
                <TrendingUp className="h-3.5 w-3.5" />
                +{formatPercent(comparison.percentChange)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
                <TrendingDown className="h-3.5 w-3.5" />
                -{formatPercent(comparison.percentChange)}
              </span>
            )}
            <span className="text-muted-foreground">vs previous period</span>
          </div>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-muted-foreground uppercase tracking-wider block">
            Daily Average Spend
          </span>
          <div className="text-2xl font-extrabold text-foreground mt-2">
            {formatINR(dailyAverage)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Average per day in this period
          </p>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-muted-foreground uppercase tracking-wider block">
            Highest Expense
          </span>
          <div className="text-2xl font-extrabold text-foreground mt-2">
            {formatINR(highestExpense?.amount || 0)}
          </div>
          <p className="text-xs text-muted-foreground mt-2 truncate">
            {highestExpense ? highestExpense.description : "None"}
          </p>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-muted-foreground uppercase tracking-wider block">
            Total Transactions
          </span>
          <div className="text-2xl font-extrabold text-foreground mt-2">
            {filteredExpenses.length}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Recorded by household members
          </p>
        </Card>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Spending Over Time</CardTitle>
            <CardDescription>Monthly expense trend across the past 6 billing cycles</CardDescription>
          </CardHeader>
          <CardContent>
            <SpendingTrendChart data={monthlyTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Share of spending per expense category</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={categorySpending} />
          </CardContent>
        </Card>
      </div>

      {/* Tables Breakdown: Category Breakdown & Member Contributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Table */}
        <Card>
          <CardHeader>
            <CardTitle>Category-Wise Breakdown</CardTitle>
            <CardDescription>Detailed allocation across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60">
              {categorySpending.map((cat) => (
                <div key={cat.categoryId} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="font-semibold text-foreground text-sm">{cat.categoryName}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-foreground text-sm block">{formatINR(cat.totalAmount)}</span>
                    <span className="text-muted-foreground">{formatPercent(cat.percentage)} of total</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Family Member Contribution Table */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Family Member</CardTitle>
            <CardDescription>Who incurred expenses for the household</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {memberSpending.map((member) => (
                <div key={member.userId} className="p-3.5 rounded-xl border border-border bg-card/60">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={member.displayName} src={member.avatarUrl} size="sm" />
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{member.displayName}</h4>
                        <span className="text-[11px] text-muted-foreground">
                          {member.count} transactions recorded
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-foreground text-sm">{formatINR(member.totalAmount)}</span>
                      <span className="text-[11px] text-muted-foreground block">{formatPercent(member.percentage)}</span>
                    </div>
                  </div>

                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${member.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

