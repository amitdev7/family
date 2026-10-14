"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Plus,
  SlidersHorizontal,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Trash2,
  Calendar,
  User,
  Tag,
  X,
  CreditCard,
  Banknote,
  Send,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Modal } from "@/components/ui/modal";
import { DataService } from "@/lib/data-service";
import { Category, HouseholdMember, ReceivedMoney } from "@/lib/types";
import { formatINR } from "@/lib/formatters";

interface MoneySummary {
  totalReceived: number;
  totalSpent: number;
  moneyLeft: number;
  byMember: {
    memberId: string;
    memberName: string;
    relationship: string;
    amount: number;
    percentage: number;
  }[];
  byCategory: {
    categoryId: string;
    categoryName: string;
    color: string;
    icon: string;
    allocated: number;
    spent: number;
    left: number;
  }[];
  recentReceived: ReceivedMoney[];
}

const PRESET_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

export default function BudgetsPage() {
  const [summary, setSummary] = useState<MoneySummary | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [allReceived, setAllReceived] = useState<ReceivedMoney[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Category filter
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  // Receive Money Modal State
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [fromMemberId, setFromMemberId] = useState<string>("");
  const [customSenderName, setCustomSenderName] = useState<string>("");
  const [customRelationship, setCustomRelationship] = useState<string>("Father");
  const [amount, setAmount] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("general");
  // Default payment method is strictly "Cash" per user requirement
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "UPI" | "Bank Transfer" | "Card">("Cash");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set Budget Modal State
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [targetCategory, setTargetCategory] = useState<string>("all");
  const [targetBudgetAmount, setTargetBudgetAmount] = useState<string>("");
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sum, cats, mems, received] = await Promise.all([
        DataService.getMoneySummary(),
        DataService.getCategories(),
        DataService.getMembers(),
        DataService.getReceivedMoney(),
      ]);
      setSummary(sum);
      setCategories(cats);
      setMembers(mems);
      setAllReceived(received);

      if (mems.length > 0 && !fromMemberId) {
        setFromMemberId(mems[0].user_id || mems[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Receiving Money from a Family Member
  const handleReceiveMoneySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    try {
      setIsSubmitting(true);

      let senderName = customSenderName.trim();
      let senderRelation = customRelationship.trim();

      if (fromMemberId !== "other") {
        const found = members.find(
          (m) => m.id === fromMemberId || m.user_id === fromMemberId
        );
        if (found) {
          senderName = found.display_name;
          senderRelation = found.relationship || "Family Member";
        }
      }

      if (!senderName) senderName = "Family Member";

      await DataService.addReceivedMoney({
        from_member_id: fromMemberId !== "other" ? fromMemberId : undefined,
        from_member_name: senderName,
        relationship: senderRelation,
        amount: parsedAmount,
        category_id: categoryId === "general" ? undefined : categoryId,
        payment_method: paymentMethod, // Defaults to Cash
        date: date || new Date().toISOString().slice(0, 10),
        notes: notes.trim() || undefined,
      });

      // Reset form
      setAmount("");
      setNotes("");
      setCategoryId("general");
      setPaymentMethod("Cash");
      setIsReceiveModalOpen(false);

      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Deleting a received entry
  const handleDeleteReceived = async (id: string) => {
    if (confirm("Are you sure you want to delete this received money entry?")) {
      await DataService.deleteReceivedMoney(id);
      await loadData();
    }
  };

  // Handle Adjusting Category Budget
  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(targetBudgetAmount);
    if (isNaN(val) || val <= 0) return;

    try {
      setIsSavingBudget(true);
      await DataService.setBudget({
        category_id: targetCategory === "all" ? null : targetCategory,
        amount: val,
      });
      setIsBudgetModalOpen(false);
      setTargetBudgetAmount("");
      await loadData();
    } finally {
      setIsSavingBudget(false);
    }
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!summary?.byCategory) return [];
    if (selectedCategoryFilter === "all") return summary.byCategory;
    return summary.byCategory.filter((c) => c.categoryId === selectedCategoryFilter);
  }, [summary, selectedCategoryFilter]);

  // Overall calculations
  const totalReceived = summary?.totalReceived || 0;
  const totalSpent = summary?.totalSpent || 0;
  const moneyLeft = summary?.moneyLeft || 0;
  const spendPercent = totalReceived > 0 ? Math.min(Math.round((totalSpent / totalReceived) * 100), 100) : 0;
  const remainingPercent = totalReceived > 0 ? Math.max(Math.round((moneyLeft / totalReceived) * 100), 0) : 0;

  return (
    <AppLayout title="Budget &amp; Inflow Planner">
      <div className="max-w-5xl mx-auto space-y-6 pb-12 select-none">
        {/* Top Header Card in Obsidian Noir (#0E0E10) with Lime (#D4F835) Accent */}
        <div className="rounded-[28px] bg-[#0E0E10] text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-[#D4F835] text-black flex items-center justify-center font-black shadow-md shrink-0">
              <PieChart className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Family Budget &amp; Inflow Tracker
                </h2>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#D4F835]/20 text-[#D4F835] text-[10px] font-extrabold uppercase tracking-wider">
                  Real-Time
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                Track money received from family members, category spending, and remaining balance
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsReceiveModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#D4F835] hover:bg-[#c6ea27] text-black font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>+ Receive Money</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBudgetModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Set Limit</span>
            </button>
          </div>
        </div>

        {/* 3 Hero Metric Cards: Inflow, Outflow, Balance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Total Received */}
          <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Money Received
              </span>
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-black text-foreground tracking-tight">
                {formatINR(totalReceived)}
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                From {summary?.byMember?.length || 0} family contributor{summary?.byMember?.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Inflow pool active</span>
              <span>100% Funded</span>
            </div>
          </div>

          {/* 2. Total Spent */}
          <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Spent
              </span>
              <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-black text-foreground tracking-tight">
                {formatINR(totalSpent)}
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Actual household expenses this month
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
              <span>{spendPercent}% of received funds spent</span>
            </div>
          </div>

          {/* 3. Available Money Left (Glowing Noir & Lime) */}
          <div className="rounded-[28px] bg-[#0E0E10] text-white p-6 shadow-xl relative overflow-hidden flex flex-col justify-between border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Money Left / Balance
              </span>
              <div className="h-9 w-9 rounded-xl bg-[#D4F835] text-black flex items-center justify-center font-bold">
                <Wallet className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4">
              <div className={`text-3xl font-black tracking-tight ${moneyLeft >= 0 ? "text-[#D4F835]" : "text-rose-400"}`}>
                {formatINR(moneyLeft)}
              </div>
              <p className="text-xs text-zinc-400 mt-1 font-medium">
                {moneyLeft >= 0
                  ? `${remainingPercent}% of family funds remaining to spend`
                  : "Expenses exceed funds received from family"}
              </p>
            </div>

            {/* Visual Progress Bar */}
            <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${moneyLeft >= 0 ? "bg-[#D4F835]" : "bg-rose-500"}`}
                  style={{ width: `${Math.min(remainingPercent, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-extrabold text-zinc-400">
                <span>{moneyLeft >= 0 ? "Surplus Safe" : "Deficit"}</span>
                <span className="text-[#D4F835]">{remainingPercent}% Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Family Contributors Breakdown ("Who gave money & how much") */}
        <div className="rounded-[28px] bg-card border border-border/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-[#D4F835]" />
                <span>Family Contributions • Who Gave Money</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Breakdown of funds received from Father, Mother, Siblings, and other members
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsReceiveModalOpen(true)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>+ Record New Inflow</span>
            </button>
          </div>

          {summary?.byMember && summary.byMember.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.byMember.map((m, idx) => {
                const colorPalette = [
                  "bg-amber-400 text-black",
                  "bg-[#D4F835] text-black",
                  "bg-blue-500 text-white",
                  "bg-purple-500 text-white",
                  "bg-emerald-500 text-white",
                ];
                const avatarBg = colorPalette[idx % colorPalette.length];

                return (
                  <div
                    key={m.memberId || idx}
                    className="p-4 rounded-2xl bg-secondary/30 border border-border/60 hover:border-border transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-11 w-11 rounded-full ${avatarBg} flex items-center justify-center font-extrabold text-sm shadow-2xs`}>
                          {m.memberName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-foreground">
                            {m.memberName}
                          </p>
                          <span className="text-[11px] font-semibold text-muted-foreground">
                            {m.relationship}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold">
                        {Math.round(m.percentage)}%
                      </span>
                    </div>

                    <div className="pt-1 flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Contributed</span>
                      <span className="text-base font-black text-foreground font-mono">
                        {formatINR(m.amount)}
                      </span>
                    </div>

                    {/* Progress track */}
                    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(m.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-secondary/20 border border-dashed border-border text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Banknote className="h-6 w-6" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-foreground">
                  No Family Money Inflow Recorded Yet
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Click the button below to record an allowance or money received from Father, Mother, or any family member. Default method is Cash!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReceiveModalOpen(true)}
                className="px-5 py-2.5 rounded-full bg-[#D4F835] hover:bg-[#c6ea27] text-black font-extrabold text-xs transition-colors cursor-pointer"
              >
                + Record Received Money
              </button>
            </div>
          )}
        </div>

        {/* Section: Category Money Allocation & Remaining Report */}
        <div className="rounded-[28px] bg-card border border-border/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                <span>Category Allocation &amp; Remaining Balance</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose a category to view allocated funds vs. actual expenses and money left
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsBudgetModalOpen(true)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Adjust Category Budget</span>
            </button>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategoryFilter === "all"
                  ? "bg-[#0E0E10] text-white dark:bg-[#D4F835] dark:text-black shadow-xs"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              All Categories ({summary?.byCategory?.length || 0})
            </button>

            {summary?.byCategory?.map((cat) => (
              <button
                key={cat.categoryId}
                type="button"
                onClick={() => setSelectedCategoryFilter(cat.categoryId)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  selectedCategoryFilter === cat.categoryId
                    ? "bg-[#0E0E10] text-white dark:bg-[#D4F835] dark:text-black shadow-xs"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: cat.color || "#3b82f6" }}
                />
                <span>{cat.categoryName}</span>
              </button>
            ))}
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCategories.map((c) => {
              const allocated = c.allocated || 0;
              const spent = c.spent || 0;
              const left = c.left;
              const percentUsed = allocated > 0 ? Math.min(Math.round((spent / allocated) * 100), 100) : 0;
              const isOver = allocated > 0 ? spent > allocated : spent > 0 && allocated === 0;

              return (
                <div
                  key={c.categoryId}
                  className="p-5 rounded-2xl bg-secondary/30 border border-border/60 hover:border-border transition-all space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-base shadow-2xs"
                        style={{
                          backgroundColor: `${c.color || "#3b82f6"}20`,
                          color: c.color || "#3b82f6",
                        }}
                      >
                        {c.icon || "🏷️"}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-foreground">
                          {c.categoryName}
                        </h4>
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {allocated > 0 ? `${percentUsed}% used` : "No specific allocation"}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                        isOver
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : left > 0
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {isOver ? "Over Budget" : left > 0 ? `${formatINR(left)} Left` : "Zero Balance"}
                    </span>
                  </div>

                  {/* Numbers Grid: Allocated | Spent | Left */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-card border border-border/50 text-center">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Allocated
                      </p>
                      <p className="text-xs sm:text-sm font-extrabold text-foreground font-mono mt-0.5">
                        {formatINR(allocated)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Spent
                      </p>
                      <p className="text-xs sm:text-sm font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                        {formatINR(spent)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Money Left
                      </p>
                      <p
                        className={`text-xs sm:text-sm font-extrabold font-mono mt-0.5 ${
                          left >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {formatINR(left)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver ? "bg-rose-500" : percentUsed > 80 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCategories.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-xs">
              No category data available. Add expenses or allocations to view this category report.
            </div>
          )}
        </div>

        {/* Section: Recent Money Received History Ledger */}
        <div className="rounded-[28px] bg-card border border-border/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                <Banknote className="h-5 w-5 text-emerald-500" />
                <span>Recent Inflow History • Received Ledger</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Every allowance or fund received from family members with payment method and notes
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsReceiveModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-xs font-bold text-foreground transition-colors cursor-pointer"
            >
              + Add Entry
            </button>
          </div>

          {allReceived.length > 0 ? (
            <div className="space-y-2.5">
              {allReceived.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-2xl bg-secondary/30 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black shrink-0">
                      <ArrowDownLeft className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-foreground">
                          {entry.from_member_name}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary font-semibold text-muted-foreground">
                          {entry.relationship || "Family Member"}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#D4F835]/15 text-[#86a010] dark:text-[#D4F835] font-extrabold">
                          {entry.payment_method || "Cash"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{entry.date}</span>
                        </span>
                        {entry.notes && (
                          <span className="truncate max-w-xs text-foreground/80">
                            • {entry.notes}
                          </span>
                        )}
                        {entry.category && (
                          <span className="text-primary font-semibold">
                            [{entry.category.name}]
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount and Delete Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                    <div className="text-right">
                      <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        +{formatINR(entry.amount)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteReceived(entry.id)}
                      className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground text-xs rounded-2xl bg-secondary/20 border border-dashed border-border">
              No money inflow logged yet. Use the &quot;+ Receive Money&quot; button to record cash or digital allowances from your family!
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Receive Money from Family Member */}
      {isReceiveModalOpen && (
        <Modal
          isOpen={isReceiveModalOpen}
          onClose={() => setIsReceiveModalOpen(false)}
          maxWidth="md"
          hideCloseButton={true}
          className="p-6 sm:p-8 rounded-[28px] bg-card border-0 shadow-2xl relative"
        >
          {/* Custom Header with single close button (NO double X bug!) */}
          <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[#D4F835] text-black flex items-center justify-center font-bold shadow-xs">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-foreground">
                  Receive Money / Allowance
                </h3>
                <p className="text-xs text-muted-foreground">
                  Record funds received from a family member into the household pool
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsReceiveModalOpen(false)}
              className="h-8 w-8 rounded-full bg-secondary hover:bg-secondary/80 text-foreground flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleReceiveMoneySubmit} className="space-y-4">
            {/* Sender Selection */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Who gave this money? (Family Member)
              </label>
              <select
                value={fromMemberId}
                onChange={(e) => setFromMemberId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-secondary border border-border text-xs sm:text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.user_id || m.id}>
                    {m.display_name} ({m.relationship || "Member"})
                  </option>
                ))}
                <option value="other">+ Someone else / Custom Name</option>
              </select>
            </div>

            {/* Custom Sender Fields if selected */}
            {fromMemberId === "other" && (
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-secondary/50 border border-border/60">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Papa, Didi"
                    value={customSenderName}
                    onChange={(e) => setCustomSenderName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Father, Uncle"
                    value={customRelationship}
                    onChange={(e) => setCustomRelationship(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground"
                  />
                </div>
              </div>
            )}

            {/* Amount with Quick Preset Pills */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Amount Received (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-sm font-extrabold text-muted-foreground">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-secondary border border-border text-base font-black text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
                />
              </div>

              {/* Preset Amount Chips */}
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-none py-0.5">
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    className="px-2.5 py-1 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-[11px] font-bold text-muted-foreground hover:text-foreground whitespace-nowrap cursor-pointer transition-colors"
                  >
                    +₹{val >= 1000 ? `${val / 1000}k` : val}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector (DEFAULT TO "Cash") */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Payment Method (Default: Cash)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["Cash", "UPI", "Bank Transfer", "Card"] as const).map((method) => {
                  const isSelected = paymentMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 border ${
                        isSelected
                          ? "bg-[#0E0E10] text-[#D4F835] border-black dark:bg-[#D4F835] dark:text-black dark:border-[#D4F835] shadow-xs"
                          : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {method === "Cash" && <Banknote className="h-4 w-4" />}
                      {method === "UPI" && <Send className="h-4 w-4" />}
                      {method === "Bank Transfer" && <Wallet className="h-4 w-4" />}
                      {method === "Card" && <CreditCard className="h-4 w-4" />}
                      <span className="truncate">{method}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Tagging */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Allocate to Category (Optional)
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-secondary border border-border text-xs sm:text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              >
                <option value="general">General Family Pool (No specific category)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Date Received
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-secondary border border-border text-xs font-semibold text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Notes / Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly allowance, grocery share"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-secondary border border-border text-xs font-semibold text-foreground"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsReceiveModalOpen(false)}
                className="flex-1 py-3 rounded-full border border-border text-xs sm:text-sm font-bold text-foreground hover:bg-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-full bg-[#D4F835] hover:bg-[#c6ea27] text-black font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Record Received Money"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 2: Adjust Monthly Category Budget */}
      {isBudgetModalOpen && (
        <Modal
          isOpen={isBudgetModalOpen}
          onClose={() => setIsBudgetModalOpen(false)}
          maxWidth="sm"
          hideCloseButton={true}
          className="p-6 rounded-[28px] bg-card border-0 shadow-2xl relative"
        >
          <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-4">
            <h3 className="text-lg font-bold text-foreground">
              Set Category Budget Target
            </h3>
            <button
              type="button"
              onClick={() => setIsBudgetModalOpen(false)}
              className="h-8 w-8 rounded-full bg-secondary hover:bg-secondary/80 text-foreground flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleBudgetSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Target Category
              </label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-secondary border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              >
                <option value="all">Overall Household Target</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Monthly Spending Limit (₹)
              </label>
              <input
                type="number"
                value={targetBudgetAmount}
                onChange={(e) => setTargetBudgetAmount(e.target.value)}
                placeholder="e.g. 25000"
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-secondary border border-border text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsBudgetModalOpen(false)}
                className="flex-1 py-2.5 rounded-full border border-border text-xs font-bold text-foreground hover:bg-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingBudget}
                className="flex-1 py-2.5 rounded-full bg-[#D4F835] hover:bg-[#c6ea27] text-black text-xs font-bold shadow-xs cursor-pointer"
              >
                {isSavingBudget ? "Saving..." : "Save Target"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}
