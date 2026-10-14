"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { DashboardHeroBanner } from "@/components/dashboard/dashboard-hero-banner";
import { RecentTransactionsWidget } from "@/components/dashboard/recent-transactions-widget";
import { SpendingRadarChart } from "@/components/dashboard/spending-radar-chart";
import { QuickTransferWidget } from "@/components/dashboard/quick-transfer-widget";
import { LimeCardWidget } from "@/components/dashboard/lime-card-widget";
import { BudgetLineChart } from "@/components/dashboard/budget-line-chart";
import { MoneyReceivedWidget } from "@/components/dashboard/money-received-widget";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import { DataService } from "@/lib/data-service";
import { DashboardMetrics, HouseholdMember, MoneySummary } from "@/lib/types";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [currentUser, setCurrentUser] = useState<HouseholdMember | null>(null);
  const [moneySummary, setMoneySummary] = useState<MoneySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [dashData, mems, summary] = await Promise.all([
        DataService.getDashboardMetrics(),
        DataService.getMembers(),
        DataService.getMoneySummary(),
      ]);
      setMetrics(dashData);
      setMembers(mems);
      setMoneySummary(summary);
      setCurrentUser(DataService.getCurrentUser());
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
    window.addEventListener("household-expense-updated", handleDataChange);
    window.addEventListener("open-add-expense", () => setIsAddExpenseOpen(true));

    return () => {
      window.removeEventListener("expense-saved", handleDataChange);
      window.removeEventListener("household-user-changed", handleDataChange);
      window.removeEventListener("household-expense-updated", handleDataChange);
    };
  }, []);

  if (isLoading || !metrics) {
    return (
      <AppLayout title="Dashboard">
        <div className="space-y-6 animate-pulse">
          <div className="h-48 rounded-[32px] bg-card border border-border/80" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-84 rounded-[28px] bg-card border border-border/80" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const { recentExpenses, categorySpending } = metrics;
  const totalBalance = 85230.2;
  const totalReceived = moneySummary?.totalReceived ?? 32500;
  const totalSpent = moneySummary?.totalSpent ?? 18450;
  const moneyLeft = moneySummary?.moneyLeft ?? 14050;

  return (
    <AppLayout
      title="Dashboard"
      onAddExpenseClick={() => setIsAddExpenseOpen(true)}
    >
      <div className="space-y-6">
        {/* Dynamic Welcome & Live Financial Pulse Hero Banner */}
        <DashboardHeroBanner
          currentUser={currentUser}
          totalBalance={totalBalance}
          totalReceived={totalReceived}
          totalSpent={totalSpent}
          moneyLeft={moneyLeft}
          onAddExpenseClick={() => setIsAddExpenseOpen(true)}
          onReceiveMoneyClick={() => {
            // Dispatch event to open receive money modal in widget or navigate
            const widgetBtn = document.querySelector<HTMLButtonElement>("button:has(span:contains('+ Receive'))");
            if (widgetBtn) {
              widgetBtn.click();
            } else {
              window.location.href = "/budgets";
            }
          }}
          onSwitchUserClick={() => window.dispatchEvent(new Event("open-who-are-you"))}
        />

        {/* 6-Card High-Fidelity 1:1 Responsive Figma Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {/* 1. Recent Transactions Card with Category Tabs & Receipt Modal */}
          <div className="min-h-[380px]">
            <RecentTransactionsWidget expenses={recentExpenses} />
          </div>

          {/* 2. Spending Radar & Donut Chart Card */}
          <div className="min-h-[380px]">
            <SpendingRadarChart categorySpending={categorySpending} />
          </div>

          {/* 3. Quick Transfer Pod with Avatars & Preset Chips */}
          <div className="min-h-[380px]">
            <QuickTransferWidget
              members={members}
              onAddExpenseClick={() => setIsAddExpenseOpen(true)}
              onAddMemberClick={() => window.dispatchEvent(new Event("open-who-are-you"))}
            />
          </div>

          {/* 4. Electric Lime Virtual VISA Card with 3D Tilt & Masking */}
          <div className="min-h-[380px]">
            <LimeCardWidget
              balance={totalBalance}
              creditLimit={22000}
              creditUsed={0}
              cardName={currentUser?.display_name?.split(" ")[0] || "Household"}
            />
          </div>

          {/* 5. Budget Line Chart Card with Area Gradient & Scrubber */}
          <div className="min-h-[380px]">
            <BudgetLineChart />
          </div>

          {/* 6. Money Received & Remaining Fuel Gauge Widget */}
          <div className="min-h-[380px]">
            <MoneyReceivedWidget onRefresh={loadData} />
          </div>
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
