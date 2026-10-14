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
import { DashboardMetrics, HouseholdMember } from "@/lib/types";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [data, mems] = await Promise.all([
        DataService.getDashboardMetrics(),
        DataService.getMembers(),
      ]);
      setMetrics(data);
      setMembers(mems);
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
    window.addEventListener("open-add-expense", () => setIsAddExpenseOpen(true));

    return () => {
      window.removeEventListener("expense-saved", handleDataChange);
      window.removeEventListener("household-user-changed", handleDataChange);
    };
  }, []);

  if (isLoading || !metrics) {
    return (
      <AppLayout title="Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-[28px] bg-card border border-border/80" />
          ))}
        </div>
      </AppLayout>
    );
  }

  const { recentExpenses, categorySpending } = metrics;

  return (
    <AppLayout
      title="Dashboard"
      onAddExpenseClick={() => setIsAddExpenseOpen(true)}
    >
      {/* 6-Card High-Fidelity 1:1 Figma Grid matching image_20261014_111030.jpg */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {/* 1. Recent Transactions Card */}
        <div className="min-h-[360px]">
          <RecentTransactionsWidget expenses={recentExpenses} />
        </div>

        {/* 2. Spending Radar Chart Card */}
        <div className="min-h-[360px]">
          <SpendingRadarChart categorySpending={categorySpending} />
        </div>

        {/* 3. Quick Transfer Pod */}
        <div className="min-h-[360px]">
          <QuickTransferWidget
            members={members}
            onAddExpenseClick={() => setIsAddExpenseOpen(true)}
          />
        </div>

        {/* 4. Green VISA Card Widget */}
        <div className="min-h-[360px]">
          <LimeCardWidget
            balance={85230.2}
            creditLimit={22000}
            creditUsed={0}
            cardName="Household"
          />
        </div>

        {/* 5. Budget Line Chart Card */}
        <div className="min-h-[360px]">
          <BudgetLineChart />
        </div>

        {/* 6. How to reduce expenses by 25%? Promo Card */}
        <div className="min-h-[360px]">
          <PromoCard />
        </div>
      </div>

      {/* Global Quick Add Expense Dialog */}
      {isAddExpenseOpen && (
        <ExpenseDialog
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
          onSaved={() => {
            setIsAddExpenseOpen(false);
            loadData();
          }}
        />
      )}
    </AppLayout>
  );
}

