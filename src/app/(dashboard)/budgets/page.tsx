"use client";

import React, { useState, useEffect } from "react";
import {
  PieChart,
  ChevronDown,
  Plus,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Modal } from "@/components/ui/modal";
import { DataService } from "@/lib/data-service";
import { Budget, Category, Expense } from "@/lib/types";
import { formatINR } from "@/lib/formatters";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string>("all");
  const [budgetAmount, setBudgetAmount] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [bList, cList, expRes] = await Promise.all([
        DataService.getBudgets(),
        DataService.getCategories(),
        DataService.getExpenses({ pageSize: 1000 }),
      ]);
      setBudgets(bList);
      setCategories(cList);
      setExpenses(expRes.expenses);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const overallBudget = budgets.find((b) => b.category_id === null)?.amount || 90000;
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetAmount);
    if (isNaN(val) || val <= 0) return;

    try {
      setIsSaving(true);
      await DataService.setBudget({
        category_id: selectedCatId === "all" ? null : selectedCatId,
        amount: val,
      });
      setIsModalOpen(false);
      setBudgetAmount("");
      loadData();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout title="Budget Planner">
      <div className="max-w-2xl mx-auto space-y-6 select-none">
        {/* Top Header Card matching Figma image_20261014_111556.jpg */}
        <div className="rounded-[28px] bg-[#0E0E10] text-white p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#D4F835] text-black flex items-center justify-center font-bold shadow-xs">
              <PieChart className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              Budget Planner
            </h2>
          </div>

          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-800 text-xs font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-700 transition-colors">
            <span>October 2024</span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          </div>
        </div>

        {/* Overall Household Budget Card */}
        <div className="rounded-[28px] bg-card border border-border/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Overall Household Budget
              </p>
              <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mt-1">
                {formatINR(overallBudget)}
              </div>
            </div>

            <span className="inline-block px-3 py-1 rounded-full bg-[#D4F835] text-black text-xs font-bold shadow-2xs">
              Monthly Budget
            </span>
          </div>

          {/* Budget Status (50/30/20 Framework) */}
          <div className="space-y-4 pt-2">
            <h4 className="font-extrabold text-sm text-foreground">
              Budget Status
            </h4>

            {/* Essentials */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">Essentials</span>
                <span className="text-muted-foreground">₹52,140 / ₹60,000 • 86.9%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "86.9%" }} />
              </div>
              <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                Amber • 80-100%
              </p>
            </div>

            {/* Lifestyle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">Lifestyle</span>
                <span className="text-muted-foreground">₹14,200 / ₹20,000 • 71%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "71%" }} />
              </div>
              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Green • &lt;80%
              </p>
            </div>

            {/* Savings */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">Savings</span>
                <span className="text-muted-foreground">₹11,000 / ₹10,000 • 110%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: "100%" }} />
              </div>
              <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                Red • &gt;100% • Over budget
              </p>
            </div>
          </div>
        </div>

        {/* Per-Category Breakdown matching Figma */}
        <div className="rounded-[28px] bg-card border border-border/80 p-6 sm:p-8 shadow-xs space-y-5">
          <h4 className="font-extrabold text-base text-foreground">
            Per-Category Breakdown
          </h4>

          <div className="space-y-4">
            {/* Food & Dining */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-foreground">Food & Dining</span>
                </div>
                <span className="text-foreground font-mono">₹24,500 / ₹25,000</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "98%" }} />
              </div>
            </div>

            {/* Transport */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="text-foreground">Transport</span>
                </div>
                <span className="text-foreground font-mono">₹16,800 / ₹18,000</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "93%" }} />
              </div>
            </div>

            {/* Entertainment (Over budget) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span className="text-foreground">Entertainment</span>
                </div>
                <span className="text-foreground font-mono">₹10,840 / ₹7,000</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: "100%" }} />
              </div>
              <p className="text-[11px] font-bold text-rose-500 text-right">
                ₹3,840 over
              </p>
            </div>
          </div>

          {/* Adjust Budget Pill Button */}
          <div className="pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full py-3 rounded-full border border-border text-xs sm:text-sm font-bold text-foreground hover:bg-secondary transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>+ Adjust Budget</span>
            </button>
          </div>
        </div>
      </div>

      {/* Adjust Budget Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          maxWidth="sm"
          className="p-6 rounded-[28px] bg-card border-0 shadow-2xl"
        >
          <h3 className="text-lg font-bold text-foreground mb-4">
            Adjust Monthly Budget
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Target Category
              </label>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              >
                <option value="all">Overall Monthly Budget</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Monthly Limit (₹)
              </label>
              <input
                type="number"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="e.g. 50000"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary border border-border text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-full border border-border text-xs font-bold text-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-full bg-[#D4F835] hover:bg-[#c5ea28] text-black text-xs font-bold shadow-xs cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save Budget"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}

