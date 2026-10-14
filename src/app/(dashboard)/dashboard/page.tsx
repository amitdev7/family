"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Wallet,
  PiggyBank,
  ArrowRight,
  Plus,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { CategoryIcon } from "@/components/ui/category-icon";
import { SpendingTrendChart } from "@/components/dashboard/spending-trend-chart";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import { DataService } from "@/lib/data-service";
import { DashboardMetrics, Expense, RecurringExpense } from "@/lib/types";
import { formatINR, formatCompactINR, formatPercent, formatDate } from "@/lib/formatters";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await DataService.getDashboardMetrics();
      setMetrics(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleDataChange = () => {
      loadData();
    };

    window.addEventListener("expense-saved", handleDataChange);
    window.addEventListener("household-user-changed", handleDataChange);

    return () => {
      window.removeEventListener("expense-saved", handleDataChange);
      window.removeEventListener("household-user-changed", handleDataChange);
    };
  }, []);

  const handleRecordRecurring = async (rec: RecurringExpense) => {
    try {
      await DataService.recordRecurringPayment(rec.id);
      setActionSuccess(`Recorded payment of ${formatINR(rec.amount)} for ${rec.description}`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert("Failed to record recurring bill: " + err.message);
    }
  };

  if (isLoading || !metrics) {
    return (
      <AppLayout title="Household Overview" subtitle="Real-time financial status of your home">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-card border border-border/80" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 h-80 rounded-2xl bg-card border border-border/80" />
          <div className="h-80 rounded-2xl bg-card border border-border/80" />
        </div>
      </AppLayout>
    );
  }

  const {
    totalSpentThisMonth,
    totalSpentThisYear,
    monthlyBudget,
    budgetRemaining,
    budgetUtilizationPercent,
    transactionCountThisMonth,
    recentExpenses,
    categorySpending,
    memberSpending,
    monthlyTrend,
    upcomingRecurring,
  } = metrics;

  return (
    <AppLayout
      title="Household Overview"
      subtitle="The Sharma Residence • October 2026 Finances"
    >
      {/* Toast feedback banner */}
      {actionSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Spent this Month */}
        <Card className="p-5 relative overflow-hidden border-border/90 hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Spent This Month
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {formatINR(totalSpentThisMonth)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span>{transactionCountThisMonth} transactions recorded</span>
            </p>
          </div>
        </Card>

        {/* Metric 2: Monthly Household Budget */}
        <Card className="p-5 relative overflow-hidden border-border/90 hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Monthly Budget
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {formatINR(monthlyBudget)}
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Utilization</span>
                <span className="font-semibold text-foreground">
                  {formatPercent(budgetUtilizationPercent)}
                </span>
              </div>
              <Progress value={budgetUtilizationPercent} />
            </div>
          </div>
        </Card>

        {/* Metric 3: Budget Remaining */}
        <Card className="p-5 relative overflow-hidden border-border/90 hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Remaining Budget
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {formatINR(budgetRemaining)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {budgetRemaining > 0 ? "Under budget for October" : "Budget threshold reached"}
            </p>
          </div>
        </Card>

        {/* Metric 4: Annual Spend to Date */}
        <Card className="p-5 relative overflow-hidden border-border/90 hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Yearly Spending (2026)
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {formatCompactINR(totalSpentThisYear)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {formatINR(totalSpentThisYear)} total
            </p>
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Chart 1: Monthly Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Spending Trend</CardTitle>
              <CardDescription>Monthly household expenses over the past 6 months</CardDescription>
            </div>
            <Link href="/reports">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                <span>View Full Reports</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <SpendingTrendChart data={monthlyTrend} />
          </CardContent>
        </Card>

        {/* Chart 2: Category Breakdown */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Category Share</CardTitle>
              <CardDescription>Where funds were allocated this month</CardDescription>
            </div>
            <Link href="/categories">
              <Button variant="ghost" size="sm" className="text-xs p-1 h-auto text-primary">
                Manage
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={categorySpending} />

            {/* Top 3 categories quick summary */}
            <div className="mt-3 space-y-2 pt-3 border-t border-border/60">
              {categorySpending.slice(0, 3).map((cat) => (
                <div key={cat.categoryId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="font-medium text-foreground truncate">{cat.categoryName}</span>
                  </div>
                  <span className="font-bold text-foreground shrink-0">{formatINR(cat.totalAmount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Family Members Breakdown & Upcoming Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Family Member Spend Cards */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Expenses by Member</CardTitle>
            <CardDescription>Who paid what this month across the family</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {memberSpending.map((member) => (
              <div key={member.userId} className="p-3 rounded-xl border border-border/80 bg-card/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={member.displayName} src={member.avatarUrl} size="md" />
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-tight">
                      {member.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.count} transactions • {formatPercent(member.percentage)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-foreground">
                    {formatINR(member.totalAmount)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Recurring Bills */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Upcoming Recurring Bills</CardTitle>
              <CardDescription>Scheduled utilities, rent, and household subscriptions</CardDescription>
            </div>
            <Link href="/recurring">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                <span>View All Bills</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingRecurring.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No pending bills due soon.</p>
            ) : (
              <div className="space-y-3">
                {upcomingRecurring.map((bill) => (
                  <div
                    key={bill.id}
                    className="p-3.5 rounded-xl border border-border/80 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: bill.category?.color || "#124334" }}
                      >
                        <CategoryIcon name={bill.category?.icon || "Repeat"} className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-foreground">{bill.description}</h4>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {bill.frequency}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Due on: <span className="font-medium text-foreground">{formatDate(bill.next_occurrence)}</span> • Default payer: {bill.paid_by?.display_name || "Family"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                      <span className="text-base font-bold text-foreground">
                        {formatINR(bill.amount)}
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRecordRecurring(bill)}
                        className="gap-1.5 text-xs font-semibold shrink-0"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Record as Paid</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Recent Expenses List */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Latest transactions recorded by household members</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsAddExpenseOpen(true)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Plus className="h-4 w-4" />
              <span>Add Expense</span>
            </Button>
            <Link href="/expenses">
              <Button variant="outline" size="sm" className="text-xs">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/60">
            {recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-muted/30 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 truncate">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0"
                    style={{ backgroundColor: expense.category?.color || "#124334" }}
                  >
                    <CategoryIcon name={expense.category?.icon || "Receipt"} className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {expense.description}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span>{formatDate(expense.expense_date)}</span>
                      <span>•</span>
                      <span>{expense.category?.name}</span>
                      <span>•</span>
                      <span>Paid by {expense.paid_by?.display_name?.split(" ")[0]} via {expense.payment_method}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-foreground">
                    {formatINR(expense.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Expense Dialog */}
      <ExpenseDialog
        isOpen={isAddExpenseOpen || Boolean(expenseToEdit)}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setExpenseToEdit(null);
        }}
        onSaved={() => {
          loadData();
        }}
        expenseToEdit={expenseToEdit}
      />
    </AppLayout>
  );
}
