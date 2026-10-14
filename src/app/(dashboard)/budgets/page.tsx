"use client";

import React, { useState, useEffect } from "react";
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Wallet,
  PiggyBank,
  Edit2,
  Trash2,
  Info,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Modal } from "@/components/ui/modal";
import { CategoryIcon } from "@/components/ui/category-icon";
import { EmptyState } from "@/components/ui/empty-state";
import { DataService } from "@/lib/data-service";
import { Budget, Category, Expense } from "@/lib/types";
import { formatINR, formatPercent } from "@/lib/formatters";
import { budgetFormSchema } from "@/lib/validations";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("2026-10-01");
  const [isLoading, setIsLoading] = useState(true);

  // Budget Edit/Add Modal
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

  // Compute overall budget & spent
  const overallBudget = budgets.find((b) => b.category_id === null)?.amount || 0;
  const overallSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const overallRemaining = Math.max(0, overallBudget - overallSpent);
  const overallUtilPercent = overallBudget > 0 ? (overallSpent / overallBudget) * 100 : 0;

  // Category specific spent map
  const categorySpentMap: Record<string, number> = {};
  expenses.forEach((e) => {
    categorySpentMap[e.category_id] = (categorySpentMap[e.category_id] || 0) + e.amount;
  });

  // Filter category budgets
  const categoryBudgets = budgets.filter((b) => b.category_id !== null);

  const openAddModal = (existing?: Budget) => {
    setFormError(null);
    if (existing) {
      setEditingBudget(existing);
      setAmount(existing.amount.toString());
      setCategoryId(existing.category_id || "all");
    } else {
      setEditingBudget(null);
      setAmount("");
      setCategoryId(categories[0]?.id || "all");
    }
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validation = budgetFormSchema.safeParse({
      amount,
      category_id: categoryId === "all" ? null : categoryId,
      period_start: selectedMonth,
    });

    if (!validation.success) {
      setFormError(validation.error.issues[0]?.message || "Invalid budget input");
      return;
    }

    try {
      setIsSaving(true);
      await DataService.saveBudget({
        id: editingBudget?.id,
        category_id: categoryId === "all" ? null : categoryId,
        amount: validation.data.amount,
        period_start: selectedMonth,
      });
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || "Failed to save budget");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (confirm("Are you sure you want to remove this budget limit?")) {
      await DataService.deleteBudget(id);
      loadData();
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Household Budgets" subtitle="Loading monthly budget limits...">
        <div className="h-44 rounded-2xl bg-card border border-border animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Household Budgets"
      subtitle="Monthly spending boundaries to keep family expenses on track"
    >
      {/* Top Action & Month Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-48 h-9 text-xs font-semibold"
          >
            <option value="2026-10-01">October 2026 (Current)</option>
            <option value="2026-09-01">September 2026</option>
            <option value="2026-08-01">August 2026</option>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => openAddModal()}
            className="gap-1.5 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Set Budget Limit</span>
          </Button>
        </div>
      </div>

      {/* Household Total Budget Hero Card */}
      <Card className="mb-8 p-6 bg-linear-to-br from-card to-secondary/30 border-primary/20 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="border-primary/30 text-primary">
                Overall Household Cap
              </Badge>
              {overallSpent > overallBudget && overallBudget > 0 && (
                <Badge variant="destructive" className="gap-1 text-[11px]">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Budget Exceeded</span>
                </Badge>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {formatINR(overallBudget)}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Total monthly expenditure limit set for all family members
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 md:border-l md:border-border/80 md:pl-8">
            <div>
              <span className="text-xs text-muted-foreground block">Actual Spend</span>
              <span className="text-xl font-bold text-foreground">{formatINR(overallSpent)}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Remaining</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatINR(overallRemaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-6 pt-4 border-t border-border/60 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Utilization: <strong className="text-foreground">{formatPercent(overallUtilPercent)}</strong></span>
            <span>{formatINR(overallSpent)} of {formatINR(overallBudget)}</span>
          </div>
          <Progress value={overallUtilPercent} className="h-3" />
        </div>
      </Card>

      {/* Category Budgets Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Category Spending Limits</h3>
            <p className="text-xs text-muted-foreground">Track granular limits per category</p>
          </div>
        </div>

        {categoryBudgets.length === 0 ? (
          <EmptyState
            icon={PieChart}
            title="No category budgets set"
            description="Create category limits (e.g. Groceries ₹20,000, Dining ₹10,000) to keep specific expenses under control."
            action={
              <Button onClick={() => openAddModal()} size="sm" className="gap-2 font-semibold">
                <Plus className="h-4 w-4" />
                <span>Add Category Limit</span>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBudgets.map((b) => {
              const cat = b.category || categories.find((c) => c.id === b.category_id);
              const spent = categorySpentMap[b.category_id || ""] || 0;
              const remaining = Math.max(0, b.amount - spent);
              const utilPercent = b.amount > 0 ? (spent / b.amount) * 100 : 0;
              const isOver = spent > b.amount;
              const isApproaching = utilPercent >= 80 && !isOver;

              return (
                <Card
                  key={b.id}
                  className={`p-5 transition-shadow hover:shadow-md border ${isOver ? "border-destructive/50 bg-destructive/5" : "border-border"
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-2xs shrink-0"
                        style={{ backgroundColor: cat?.color || "#124334" }}
                      >
                        <CategoryIcon name={cat?.icon || "Tags"} className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{cat?.name}</h4>
                        <span className="text-xs text-muted-foreground">Limit: {formatINR(b.amount)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openAddModal(b)}
                        className="p-1 rounded text-muted-foreground hover:text-foreground"
                        title="Edit Limit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBudget(b.id)}
                        className="p-1 rounded text-destructive/80 hover:text-destructive"
                        title="Delete Limit"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Status alert pill */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Spent: <strong className="text-foreground">{formatINR(spent)}</strong>
                    </span>
                    {isOver ? (
                      <Badge variant="destructive" className="text-[10px]">Over Limit</Badge>
                    ) : isApproaching ? (
                      <Badge variant="warning" className="text-[10px]">Approaching 80%</Badge>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                        {formatINR(remaining)} left
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2">
                    <Progress value={utilPercent} />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Set / Edit Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBudget ? "Update Budget Limit" : "Set New Budget Limit"}
        description="Define spending thresholds for your household"
        maxWidth="sm"
      >
        <form onSubmit={handleSaveBudget} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Budget Target
            </label>
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={Boolean(editingBudget)}
            >
              <option value="all">Overall Household Budget (Total)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} Limit
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Budget Amount (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-muted-foreground">₹</span>
              <Input
                type="number"
                step="100"
                min="0"
                placeholder="50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-base font-semibold"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Save Budget
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
