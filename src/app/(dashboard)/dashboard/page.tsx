"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { MasterpieceVelocityCard } from "@/components/dashboard/masterpiece-velocity-card";
import { MasterpieceCashWalletCard } from "@/components/dashboard/masterpiece-cash-wallet-card";
import { MasterpieceFilterBar } from "@/components/dashboard/masterpiece-filter-bar";
import { MasterpieceDarkBento } from "@/components/dashboard/masterpiece-dark-bento";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import { DataService } from "@/lib/data-service";
import { DashboardMetrics, HouseholdMember, MoneySummary, Expense } from "@/lib/types";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [moneySummary, setMoneySummary] = useState<MoneySummary | null>(null);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Filters
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [dashData, mems, summary, expList] = await Promise.all([
        DataService.getDashboardMetrics(),
        DataService.getMembers(),
        DataService.getMoneySummary(),
        DataService.getExpenses(),
      ]);
      setMetrics(dashData);
      setMembers(mems);
      setMoneySummary(summary);
      setAllExpenses(expList.expenses);
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
      window.removeEventListener("open-add-expense", () => setIsAddExpenseOpen(true));
    };
  }, []);

  // Filtered expenses list
  const filteredExpenses = allExpenses.filter((e) => {
    if (selectedMemberId && (e.paid_by !== selectedMemberId)) return false;
    if (
      selectedCategory &&
      !e.category_id?.toLowerCase().includes(selectedCategory.toLowerCase()) &&
      !e.title.toLowerCase().includes(selectedCategory.toLowerCase())
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchNotes = e.notes?.toLowerCase().includes(q);
      const matchAmount = e.amount.toString().includes(q);
      if (!matchTitle && !matchNotes && !matchAmount) return false;
    }
    return true;
  });

  const uniqueCategories = Array.from(
    new Set(allExpenses.map((e) => e.category_id || "general"))
  );

  const totalReceived = moneySummary?.totalReceived ?? 85000;
  const totalSpent = moneySummary?.totalSpent ?? 42500;
  const totalBalance = moneySummary?.moneyLeft ?? 142500;
  const runwayMonths = totalSpent > 0 ? (totalBalance / totalSpent) : 2.8;

  if (isLoading && !metrics) {
    return (
      <AppLayout title="Dashboard">
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="h-64 rounded-[28px] bg-slate-200 dark:bg-white/5" />
            <div className="h-64 rounded-[28px] bg-slate-200 dark:bg-white/5" />
          </div>
          <div className="h-12 rounded-full bg-slate-200 dark:bg-white/5" />
          <div className="h-96 rounded-[32px] bg-slate-200 dark:bg-white/5" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Dashboard"
      subtitle="Household Financial Velocity & Expense Hub"
      onAddExpenseClick={() => setIsAddExpenseOpen(true)}
    >
      <div className="space-y-5">
        {/* UPPER BENTO SECTION: Two Masterpiece Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Card 1: Household Balance & Spend Velocity (7 cols) */}
          <div className="lg:col-span-7">
            <MasterpieceVelocityCard
              totalBalance={totalBalance}
              totalSpent={totalSpent}
              runwayMonths={runwayMonths}
              selectedMemberId={selectedMemberId}
              onMemberClick={(id) => {
                setSelectedMemberId(selectedMemberId === id ? null : id);
              }}
            />
          </div>

          {/* Card 2: Available Family Cash & Mini Payment Cards (5 cols) */}
          <div className="lg:col-span-5">
            <MasterpieceCashWalletCard
              availableCash={totalReceived > 0 ? totalReceived : 85000}
              onTransferClick={() => setIsAddExpenseOpen(true)}
              onAddFundsClick={() => setIsAddExpenseOpen(true)}
            />
          </div>
        </div>

        {/* MIDDLE SECTION: Interactive Filter Pills Bar */}
        <MasterpieceFilterBar
          members={members}
          selectedMemberId={selectedMemberId}
          onSelectMember={setSelectedMemberId}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={uniqueCategories}
        />

        {/* LOWER SECTION: Signature Dark Bento Container (#16171B) */}
        <MasterpieceDarkBento
          expenses={filteredExpenses.length > 0 ? filteredExpenses : allExpenses}
          members={members}
        />
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
