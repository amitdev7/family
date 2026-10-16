"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  CreditCard,
  Banknote,
  Zap,
  Building,
  Check,
  CheckCircle2,
  Receipt,
  ArrowRight,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import { Expense, HouseholdMember } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/formatters";
import { MEMBER_AVATARS } from "@/lib/assets";

interface MasterpieceDarkBentoProps {
  expenses: Expense[];
  members: HouseholdMember[];
  onExpenseClick?: (expense: Expense) => void;
}

export function MasterpieceDarkBento({
  expenses,
  members,
  onExpenseClick,
}: MasterpieceDarkBentoProps) {
  const [activeTab, setActiveTab] = useState<"all" | "groceries" | "recent">("recent");

  const fallbackExpenses: Expense[] = [
    {
      id: "exp-001",
      household_id: "hh-default",
      category_id: "cat-groceries",
      amount: 4200,
      description: "Nature's Basket Groceries",
      expense_date: new Date(Date.now() - 2 * 3600000).toISOString(),
      paid_by_user_id: "usr-amit",
      created_by_user_id: "usr-amit",
      payment_method: "UPI",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: "Weekly organic veggies and fruits",
    },
    {
      id: "exp-002",
      household_id: "hh-default",
      category_id: "cat-dining",
      amount: 1850,
      description: "Zomato Gourmet Dinner",
      expense_date: new Date(Date.now() - 14 * 3600000).toISOString(),
      paid_by_user_id: "usr-ajay",
      created_by_user_id: "usr-ajay",
      payment_method: "Credit Card",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: "Family weekend dinner",
    },
    {
      id: "exp-003",
      household_id: "hh-default",
      category_id: "cat-transport",
      amount: 2500,
      description: "Indian Oil Petrol & Fuel",
      expense_date: new Date(Date.now() - 28 * 3600000).toISOString(),
      paid_by_user_id: "usr-amit",
      created_by_user_id: "usr-amit",
      payment_method: "Cash",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: "Full tank for family car",
    },
    {
      id: "exp-004",
      household_id: "hh-default",
      category_id: "cat-utilities",
      amount: 1299,
      description: "Airtel Fiber Broadband",
      expense_date: new Date(Date.now() - 48 * 3600000).toISOString(),
      paid_by_user_id: "usr-chhotu",
      created_by_user_id: "usr-chhotu",
      payment_method: "UPI",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: "Monthly Gigabit fiber bill",
    },
    {
      id: "exp-005",
      household_id: "hh-default",
      category_id: "cat-healthcare",
      amount: 850,
      description: "Apollo Pharmacy First Aid",
      expense_date: new Date(Date.now() - 72 * 3600000).toISOString(),
      paid_by_user_id: "usr-ajay",
      created_by_user_id: "usr-ajay",
      payment_method: "Net Banking",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: "Multivitamins & medicines",
    },
  ];

  const sourceExpenses = expenses.length > 0 ? expenses : fallbackExpenses;
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [isSettled, setIsSettled] = useState(false);
  const [settledFeedback, setSettledFeedback] = useState(false);

  // Filter expenses according to tab
  const filteredExpenses = sourceExpenses.filter((e) => {
    const title = e.description || "";
    if (activeTab === "groceries") {
      return (
        e.category_id?.toLowerCase().includes("grocer") ||
        title.toLowerCase().includes("grocer") ||
        title.toLowerCase().includes("food")
      );
    }
    if (activeTab === "recent") {
      return true;
    }
    return true;
  });

  const displayList = filteredExpenses.slice(0, 6);

  // Fallback demo expense if list is empty
  const defaultDemoExpense: Expense = {
    id: "exp-default",
    household_id: "hh-default",
    category_id: "cat-groceries",
    amount: 4200,
    description: "Nature's Basket Groceries",
    expense_date: new Date().toISOString(),
    paid_by_user_id: "usr-amit",
    created_by_user_id: "usr-amit",
    payment_method: "UPI",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    notes: "Organic vegetables, sourdough, almond milk & fresh fruits for the week.",
  };

  const selectedExpense =
    (selectedExpenseId ? sourceExpenses.find((e) => e.id === selectedExpenseId) : null) ||
    displayList[0] ||
    defaultDemoExpense;

  const paidById =
    selectedExpense.paid_by_user_id ||
    (typeof selectedExpense.paid_by === "object"
      ? selectedExpense.paid_by?.user_id || selectedExpense.paid_by?.id
      : selectedExpense.paid_by);

  const paidByMember = members.find(
    (m) => (m.user_id || m.id) === paidById
  );

  // 3-way split calculation
  const totalAmount = selectedExpense.amount || 4200;
  const splitAmount = Math.round((totalAmount / 3) * 100) / 100;

  const handleSettleSplit = () => {
    setIsSettled(true);
    setSettledFeedback(true);
    setTimeout(() => {
      setSettledFeedback(false);
    }, 3500);
  };

  const getPaymentBadge = (method?: string) => {
    const m = (method || "upi").toLowerCase();
    if (m.includes("cash")) {
      return {
        label: "Cash",
        icon: Banknote,
        bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      };
    }
    if (m.includes("card")) {
      return {
        label: "Card",
        icon: CreditCard,
        bg: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      };
    }
    if (m.includes("bank")) {
      return {
        label: "Bank",
        icon: Building,
        bg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      };
    }
    return {
      label: "UPI",
      icon: Zap,
      bg: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    };
  };

  return (
    <div className="w-full bg-[#16171B] text-white rounded-[28px] sm:rounded-[36px] p-4 sm:p-7 shadow-2xl border border-white/10 relative overflow-hidden">
      {/* Top Header with Organic Cutout Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 select-none">
        {/* Cutout Notch Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-full border border-white/10 self-start">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              activeTab === "all"
                ? "bg-white text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Expenses ({sourceExpenses.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("groceries")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              activeTab === "groceries"
                ? "bg-white text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Groceries (3)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("recent")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "recent"
                ? "bg-[#E2F937] text-slate-950 shadow-[0_0_15px_rgba(226,249,55,0.4)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
            <span>Recent Outflow ({displayList.length})</span>
          </button>
        </div>

        {/* Right Sort / Filter Indicator */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 self-end sm:self-auto">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Sort: Live Chronological</span>
        </div>
      </div>

      {/* Main Dual-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        {/* Left Column: Transaction Stream (7 cols) */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-400 px-2 pb-1">
            <span>Transaction Stream</span>
            <span>Amount</span>
          </div>

          <div className="space-y-2">
            {displayList.map((item) => {
              const isSelected = item.id === selectedExpense.id;
              const itemPaidById =
                item.paid_by_user_id ||
                (typeof item.paid_by === "object"
                  ? item.paid_by?.user_id || item.paid_by?.id
                  : item.paid_by);

              const itemMember = members.find(
                (m) => (m.user_id || m.id) === itemPaidById
              );
              const itemAvatar = MEMBER_AVATARS[itemPaidById || "usr-amit"];
              const payBadge = getPaymentBadge(item.payment_method);
              const PayIcon = payBadge.icon;
              const itemTitle = item.description || "Expense";

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedExpenseId(item.id);
                    onExpenseClick?.(item);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 border ${
                    isSelected
                      ? "bg-[#5E778A] text-white border-white/30 shadow-lg scale-[1.01]"
                      : "bg-white/5 hover:bg-white/10 text-slate-200 border-white/5"
                  }`}
                >
                  {/* Left: Avatar & Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-white/15">
                        {itemAvatar?.image ? (
                          <Image
                            src={itemAvatar.image}
                            alt={itemAvatar.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs">
                            {itemMember?.display_name?.[0] || "U"}
                          </div>
                        )}
                      </div>
                      {itemAvatar?.roleBadge && (
                        <div className="w-4 h-4 absolute -bottom-1 -right-1">
                          <Image
                            src={itemAvatar.roleBadge}
                            alt="Role"
                            width={16}
                            height={16}
                            className="object-contain"
                          />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="font-extrabold text-sm truncate leading-tight">
                        {itemTitle}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] opacity-75">
                          {formatDate(item.expense_date)}
                        </span>
                        <span className="text-[10px] opacity-40">•</span>
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${payBadge.bg}`}
                        >
                          <PayIcon className="w-2.5 h-2.5" />
                          <span>{payBadge.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Selected Indicator */}
                  <div className="text-right shrink-0">
                    <div className="text-base font-black tracking-tight">
                      {formatINR(item.amount)}
                    </div>
                    <div className="text-[10px] font-bold opacity-75 mt-0.5">
                      3-Way Split
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep-Dive Split Inspector Card (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-[#6E889C] text-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xl border border-white/20 flex flex-col justify-between h-full relative overflow-hidden">
            {/* Inspector Header */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-white/80 pb-3 border-b border-white/15">
                <div className="flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5" />
                  <span>REF #{selectedExpense.id.slice(0, 7).toUpperCase()}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                  Equal 3-Way Split
                </span>
              </div>

              {/* Title & Total */}
              <div className="py-4">
                <h4 className="text-xl font-black tracking-tight leading-tight">
                  {selectedExpense.description || "Expense"}
                </h4>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-2xl sm:text-3xl font-black tracking-tight">
                    {formatINR(totalAmount)}
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-full text-xs font-bold">
                    <span>Paid by</span>
                    <span className="font-extrabold text-[#E2F937]">
                      {paidByMember?.display_name || "Amit"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3-Way Equal Allocation Breakdown Cards */}
              <div className="space-y-2 mt-1">
                {/* 1. Amit */}
                <div className="bg-white/15 backdrop-blur-xs rounded-xl p-2.5 flex items-center justify-between border border-white/15">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-white/20 shrink-0">
                      <Image
                        src={MEMBER_AVATARS["usr-amit"].image}
                        alt="Amit"
                        width={28}
                        height={28}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">
                        Amit (Admin)
                      </div>
                      <div className="text-[10px] text-white/75">
                        Paid upfront • 33.3%
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black">
                      {formatINR(splitAmount)}
                    </div>
                    <span className="text-[9px] font-bold text-emerald-300">
                      Settled
                    </span>
                  </div>
                </div>

                {/* 2. Ajay */}
                <div className="bg-white/15 backdrop-blur-xs rounded-xl p-2.5 flex items-center justify-between border border-white/15">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-white/20 shrink-0">
                      <Image
                        src={MEMBER_AVATARS["usr-ajay"].image}
                        alt="Ajay"
                        width={28}
                        height={28}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">
                        Ajay (Member)
                      </div>
                      <div className="text-[10px] text-white/75">
                        Owes to Amit • 33.3%
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black">
                      {formatINR(splitAmount)}
                    </div>
                    <span
                      className={`text-[9px] font-bold ${
                        isSettled ? "text-emerald-300" : "text-[#E2F937]"
                      }`}
                    >
                      {isSettled ? "Settled" : "Pending"}
                    </span>
                  </div>
                </div>

                {/* 3. Chhotu */}
                <div className="bg-white/15 backdrop-blur-xs rounded-xl p-2.5 flex items-center justify-between border border-white/15">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-white/20 shrink-0">
                      <Image
                        src={MEMBER_AVATARS["usr-chhotu"].image}
                        alt="Chhotu"
                        width={28}
                        height={28}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">
                        Chhotu (Junior)
                      </div>
                      <div className="text-[10px] text-white/75">
                        Vault Covered • 33.3%
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black">
                      {formatINR(splitAmount)}
                    </div>
                    <span className="text-[9px] font-bold text-emerald-300">
                      Covered
                    </span>
                  </div>
                </div>

                {/* Hatched Pattern Card */}
                <div className="hatched-card-pattern rounded-xl p-3 border border-white/20 flex items-center justify-between cursor-pointer hover:border-white/40 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-bold text-white/90">
                    <Plus className="w-4 h-4 text-[#E2F937]" />
                    <span>Attach Receipt & Note</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/60">Optional</span>
                </div>
              </div>
            </div>

            {/* Inspector Settlement Bottom Footer */}
            <div className="pt-4 mt-4 border-t border-white/20 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/70 block">
                  Net Settlement
                </span>
                <span className="text-lg font-black tracking-tight">
                  {formatINR(splitAmount)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSettleSplit}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E2F937] text-slate-950 font-black text-xs shadow-lg hover:bg-[#d6ed2f] active:scale-95 transition-all cursor-pointer group"
              >
                {isSettled ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Split Settled!</span>
                  </>
                ) : (
                  <>
                    <span>Settle Split</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Settlement Toast Animation */}
            {settledFeedback && (
              <div className="absolute inset-x-4 bottom-4 bg-[#16171B] text-white p-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
                <CheckCircle2 className="w-5 h-5 text-[#E2F937] shrink-0" />
                <div className="text-xs font-bold">
                  <div>Split marked settled across all 3 members!</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    Ledger balanced in local offline vault.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
