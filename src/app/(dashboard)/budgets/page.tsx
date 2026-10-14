"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Modal } from "@/components/ui/modal";
import { DataService } from "@/lib/data-service";
import { Budget, Category, Expense } from "@/lib/types";
import { formatINR } from "@/lib/formatters";
import { budgetFormSchema } from "@/lib/validations";
import { PieChart, Plus, ChevronDown } from "lucide-react";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("October 2026");
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [allBudgets, allCategories, expRes] = await Promise.all([
        DataService.getBudgets(),
        DataService.getCategories(),
        DataService.getExpenses({ pageSize: 1000 }),
      ]);
      setBudgets(allBudgets);
      setCategories(allCategories);
      setExpenses(expRes.expenses);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const overallBudget = useMemo(() => {
    return budgets.find((b) => b.category_id === null) || { amount: 90000 };
  }, [budgets]);

  // Calculations for categories
  const categoryBudgets = useMemo(() => {
    return categories.map((cat) => {
      const budgetObj = budgets.find((b) => b.category_id === cat.id);
      const allocated = budgetObj ? budgetObj.amount : 20000;
      const spent = expenses
        .filter((e) => e.category_id === cat.id)
        .reduce((sum, e) => sum + e.amount, 0);
      const percent = allocated > 0 ? (spent / allocated) * 100 : 0;
      return {
        ...cat,
        budgetObj,
        allocated,
        spent,
        percent,
        over: spent > allocated ? spent - allocated : 0,
      };
    });
  }, [categories, budgets, expenses]);

  const handleOpenAdjust = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
      setAmount(budget.amount.toString());
      setCategoryId(budget.category_id || "all");
    } else {
      setEditingBudget(null);
      setAmount("");
      setCategoryId("all");
    }
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const numAmount = parseFloat(amount);
    const parsed = budgetFormSchema.safeParse({
      amount: isNaN(numAmount) ? 0 : numAmount,
      category_id: categoryId === "all" ? null : categoryId,
      period: "monthly",
      period_start: "2026-10-01",
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message || "Invalid amount");
      return;
    }

    try {
      setIsSaving(true);
      if (editingBudget) {
        await DataService.updateBudget(editingBudget.id, parsed.data);
      } else {
        await DataService.setBudget(parsed.data);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save budget");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout title="Budget Planner" subtitle="Monthly limits & utilization tracking">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header Bar matching Figma */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-[#D4F835] text-black flex items-center justify-center font-bold shadow-xs">
              <PieChart className="h-5 w-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
              Budget Planner
            </h2>
          </div>

          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-card border border-border text-xs font-bold text-foreground shadow-2xs">
            <span>{selectedMonth}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>

        {/* Overall Household Budget Card */}
        <div className="rounded-[28px] bg-card border border-border p-6 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold text-muted-foreground">
              Overall Household Budget
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                {formatINR(overallBudget.amount)}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#D4F835] text-black font-extrabold text-[11px] shadow-2xs">
                Monthly Budget
              </span>
            </div>
          </div>

          {/* Budget Status Section matching Figma */}
          <div className="space-y-4 pt-2 border-t border-border/80">
            <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
              Budget Status
            </h3>

            {/* Essentials Row */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-foreground">Essentials</span>
                <span className="text-muted-foreground">
                  ₹52,140 / ₹60,000 • <span className="text-amber-500">86.9%</span>
                </span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: "86.9%" }} />
              </div>
              <span className="text-[10px] font-bold text-amber-500">
                Amber • 80-100%
              </span>
            </div>

            {/* Lifestyle Row */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-foreground">Lifestyle</span>
                <span className="text-muted-foreground">
                  ₹14,200 / ₹20,000 • <span className="text-emerald-500">71%</span>
                </span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "71%" }} />
              </div>
              <span className="text-[10px] font-bold text-emerald-500">
                Green • &lt;80%
              </span>
            </div>

            {/* Savings Row */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-foreground">Savings</span>
                <span className="text-muted-foreground">
                  ₹11,000 / ₹10,000 • <span className="text-red-500">110%</span>
                </span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: "100%" }} />
              </div>
              <span className="text-[10px] font-bold text-red-500">
                Red • &gt;100% • Over budget
              </span>
            </div>
          </div>
        </div>

        {/* Per-Category Breakdown matching Figma */}
        <div className="rounded-[28px] bg-card border border-border p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-foreground">
            Per-Category Breakdown
          </h3>

          <div className="space-y-4">
            {categoryBudgets.slice(0, 4).map((item) => {
              const barColor =
                item.percent >= 100
                  ? "bg-red-500"
                  : item.percent >= 80
                  ? "bg-amber-400"
                  : "bg-emerald-500";

              return (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${barColor}`} />
                      <span className="text-foreground">{item.name}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {formatINR(item.spent)} / {formatINR(item.allocated)}
                    </span>
                  </div>

                  <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${Math.min(100, item.percent)}%` }}
                    />
                  </div>

                  {item.over > 0 && (
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-red-500">
                        {formatINR(item.over)} over
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Adjust Budget Action Button matching Figma */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleOpenAdjust()}
              className="w-full py-3.5 px-4 rounded-full border border-border bg-card hover:bg-muted font-bold text-xs text-foreground transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
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
          title="Adjust Household Budget"
          maxWidth="sm"
        >
          <form onSubmit={handleSaveBudget} className="space-y-4 pt-2">
            {formError && (
              <p className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-xl font-bold">
                {formError}
              </p>
            )}

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Target Allocation (INR)
              </label>
              <input
                type="number"
                required
                placeholder="90000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-muted/60 border border-border text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-muted/60 border border-border text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              >
                <option value="all">Overall Monthly Budget</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-11 rounded-full border border-border bg-card text-foreground font-bold text-xs hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="h-11 rounded-full bg-[#D4F835] hover:bg-[#c5ea28] active:scale-98 text-black font-extrabold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
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
