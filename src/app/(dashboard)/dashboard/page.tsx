"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { RecentTransactionsWidget } from "@/components/dashboard/recent-transactions-widget";
import { SpendingRadarChart } from "@/components/dashboard/spending-radar-chart";
import { QuickTransferWidget } from "@/components/dashboard/quick-transfer-widget";
import { LimeCardWidget } from "@/components/dashboard/lime-card-widget";
import { BudgetLineChart } from "@/components/dashboard/budget-line-chart";
import { PromoCard } from "@/components/dashboard/promo-card";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import { DataService } from "@/lib/data-service";
import { DashboardMetrics, Expense } from "@/lib/types";
import { CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
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
    window.addEventListener("household-expense-updated", handleDataChange);
    window.addEventListener("household-user-changed", handleDataChange);

    return () => {
      window.removeEventListener("expense-saved", handleDataChange);
      window.removeEventListener("household-expense-updated", handleDataChange);
      window.removeEventListener("household-user-changed", handleDataChange);
    };
  }, []);

  const handleExpenseSaved = (saved: Expense) => {
    setActionSuccess(`Recorded ₹${saved.amount} for "${saved.description}"`);
    loadData();
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <AppLayout
      title="Dashboard"
      subtitle="Sharma Family • Lime & Noir Design System"
      onAddExpenseClick={() => setIsAddExpenseOpen(true)}
    >
      {/* Toast Feedback Banner */}
      {actionSuccess && (
        <div className="mb-6 p-4 rounded-[20px] bg-[#D4F835]/15 border border-[#D4F835]/30 text-foreground text-sm font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-black dark:text-[#D4F835] shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-xs font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main 6-Card Grid matching Figma High-Fidelity Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Recent Transactions */}
        <div className="rounded-[28px] bg-card border border-border p-6 shadow-xs flex flex-col justify-between min-h-[340px]">
          {isLoading || !metrics ? (
            <div className="h-full bg-muted/20 animate-pulse rounded-2xl" />
          ) : (
            <RecentTransactionsWidget expenses={metrics.recentExpenses} />
          )}
        </div>

        {/* Card 2: Spending Radar Chart */}
        <div className="rounded-[28px] bg-card border border-border p-6 shadow-xs flex flex-col justify-between min-h-[340px]">
          <SpendingRadarChart />
        </div>

        {/* Card 3: Quick Transfer / Member Settlement */}
        <div className="rounded-[28px] bg-card border border-border p-6 shadow-xs flex flex-col justify-between min-h-[340px]">
          <QuickTransferWidget />
        </div>

        {/* Card 4: Lime VISA Card Widget */}
        <div className="rounded-[28px] bg-card border border-border p-6 shadow-xs flex flex-col justify-between min-h-[360px]">
          <LimeCardWidget
            balance={metrics?.totalSpentThisMonth ? 85230.2 - metrics.totalSpentThisMonth : 85230.2}
            onAddCardClick={() => setIsAddExpenseOpen(true)}
          />
        </div>

        {/* Card 5: Budget Line Chart */}
        <div className="rounded-[28px] bg-card border border-border p-6 shadow-xs flex flex-col justify-between min-h-[360px]">
          <BudgetLineChart />
        </div>

        {/* Card 6: Tip / Promo Card */}
        <div className="rounded-[28px] shadow-xs min-h-[360px]">
          <PromoCard />
        </div>
      </div>

      {/* Add / Edit Expense Dialog */}
      {isAddExpenseOpen && (
        <ExpenseDialog
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
          onSaved={handleExpenseSaved}
        />
      )}
    </AppLayout>
  );
}
