"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ShoppingBag,
  Utensils,
  Zap,
  Car,
  Film,
  CreditCard,
  Banknote,
  Calendar,
  User,
  CheckCircle2,
} from "lucide-react";
import { Expense } from "@/lib/types";
import { formatINR } from "@/lib/formatters";
import { Modal } from "@/components/ui/modal";
import Image from "next/image";
import { CATEGORY_IMAGES, EMPTY_STATE_IMAGES } from "@/lib/assets";

interface RecentTransactionsWidgetProps {
  expenses: Expense[];
}

const CATEGORY_TABS = [
  { id: "all", label: "All" },
  { id: "food", label: "🍕 Food" },
  { id: "bills", label: "💡 Bills" },
  { id: "shopping", label: "🛍️ Shop" },
  { id: "transport", label: "🚗 Travel" },
];

const MERCHANT_META: Record<
  string,
  { bg: string; text: string; icon: any; emoji: string; colorHex: string }
> = {
  paypal: { bg: "bg-blue-500/15 text-blue-500", text: "Paypal", icon: CreditCard, emoji: "💳", colorHex: "#3b82f6" },
  twitch: { bg: "bg-purple-500/15 text-purple-500", text: "Twitch", icon: Film, emoji: "🎮", colorHex: "#a855f7" },
  airbnb: { bg: "bg-rose-500/15 text-rose-500", text: "Airbnb", icon: ShoppingBag, emoji: "🏡", colorHex: "#f43f5e" },
  dribbble: { bg: "bg-pink-500/15 text-pink-500", text: "Dribbble", icon: ShoppingBag, emoji: "🎨", colorHex: "#ec4899" },
  dmart: { bg: "bg-emerald-500/15 text-emerald-500", text: "DMart", icon: ShoppingBag, emoji: "🛒", colorHex: "#10b981" },
  swiggy: { bg: "bg-orange-500/15 text-orange-500", text: "Swiggy", icon: Utensils, emoji: "🍕", colorHex: "#f97316" },
  airtel: { bg: "bg-red-500/15 text-red-500", text: "Airtel", icon: Zap, emoji: "📶", colorHex: "#ef4444" },
  uber: { bg: "bg-zinc-500/15 text-zinc-900 dark:text-zinc-100", text: "Uber", icon: Car, emoji: "🚕", colorHex: "#71717a" },
  groceries: { bg: "bg-emerald-500/15 text-emerald-500", text: "Groceries", icon: ShoppingBag, emoji: "🥬", colorHex: "#10b981" },
  vegetables: { bg: "bg-green-500/15 text-green-500", text: "Vegetables", icon: ShoppingBag, emoji: "🥦", colorHex: "#22c55e" },
  fuel: { bg: "bg-amber-500/15 text-amber-500", text: "Fuel", icon: Car, emoji: "⛽", colorHex: "#f59e0b" },
  medicine: { bg: "bg-cyan-500/15 text-cyan-500", text: "Pharmacy", icon: ShoppingBag, emoji: "💊", colorHex: "#06b6d4" },
};

function getMerchantMeta(description: string) {
  const descLower = description.toLowerCase();
  for (const key of Object.keys(MERCHANT_META)) {
    if (descLower.includes(key)) {
      return MERCHANT_META[key];
    }
  }
  return {
    bg: "bg-[#D4F835]/20 text-[#0E0E10] dark:text-[#D4F835]",
    text: description.slice(0, 1).toUpperCase(),
    icon: Banknote,
    emoji: "💵",
    colorHex: "#D4F835",
  };
}

export function RecentTransactionsWidget({ expenses }: RecentTransactionsWidgetProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Filter expenses by activeTab
  const filtered = expenses.filter((e) => {
    if (activeTab === "all") return true;
    const desc = e.description.toLowerCase();
    const catName = e.category?.name?.toLowerCase() || "";
    if (activeTab === "food") return desc.includes("food") || desc.includes("swiggy") || desc.includes("restaurant") || catName.includes("food");
    if (activeTab === "bills") return desc.includes("airtel") || desc.includes("bill") || desc.includes("wifi") || desc.includes("electricity") || catName.includes("bill");
    if (activeTab === "shopping") return desc.includes("dmart") || desc.includes("groceries") || desc.includes("shopping") || catName.includes("shopping");
    if (activeTab === "transport") return desc.includes("uber") || desc.includes("fuel") || desc.includes("petrol") || catName.includes("transport");
    return true;
  });

  const displayExpenses = filtered.slice(0, 5);

  return (
    <>
      <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs flex flex-col justify-between h-full select-none card-hover-lift">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-foreground tracking-tight">
                Recent Transactions
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {expenses.length}
              </span>
            </div>

            <Link
              href="/expenses"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#0E0E10] text-white hover:bg-zinc-800 text-xs font-semibold transition-colors shadow-xs"
            >
              <span>View all</span>
              <ChevronRight className="h-3 w-3 stroke-[2.5]" />
            </Link>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${isActive
                    ? "bg-[#D4F835] text-black shadow-xs scale-102"
                    : "bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Transaction Rows */}
        <div className="space-y-2 flex-1 my-2">
          {displayExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <div className="w-24 h-20 relative mb-2 flex items-center justify-center">
                <Image
                  src={EMPTY_STATE_IMAGES.expenses}
                  alt="No transactions"
                  width={96}
                  height={80}
                  className="object-contain drop-shadow-md"
                />
              </div>
              <p className="text-xs font-semibold">No transactions found for this filter.</p>
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className="text-xs font-bold text-[#D4F835] underline mt-1 cursor-pointer"
              >
                Reset filter
              </button>
            </div>
          ) : (
            displayExpenses.map((expense) => {
              const meta = getMerchantMeta(expense.description);
              const catImg = CATEGORY_IMAGES[expense.category_id];
              const Icon = meta.icon;
              const isCash = !expense.payment_method || expense.payment_method === "Cash";

              return (
                <div
                  key={expense.id}
                  onClick={() => setSelectedExpense(expense)}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-secondary/60 transition-all cursor-pointer group border border-transparent hover:border-border/60"
                  title="Click to view full receipt"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-11 w-11 rounded-2xl flex items-center justify-center text-base shrink-0 shadow-2xs relative bg-secondary/80 overflow-hidden"
                    >
                      {catImg ? (
                        <Image
                          src={catImg}
                          alt={expense.description}
                          width={38}
                          height={38}
                          className="object-contain"
                        />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-bold text-sm text-foreground truncate group-hover:text-[#D4F835] transition-colors leading-snug">
                        {expense.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                        <span>{expense.expense_date}</span>
                        <span>•</span>
                        <span className="font-medium text-foreground/80 truncate">
                          {expense.paid_by?.display_name?.split(" ")[0] || "Family"}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-secondary font-mono">
                          {isCash ? "💵 Cash" : "⚡ " + (expense.payment_method || "UPI")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <div className="font-black text-sm text-foreground font-mono">
                      - {formatINR(expense.amount)}
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground group-hover:underline">
                      Receipt &gt;
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info pill */}
        <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
          <span>Priority: Cash transactions first</span>
          <span className="text-foreground font-bold">Safe Ledger</span>
        </div>
      </div>

      {/* Interactive Transaction Receipt Modal */}
      {selectedExpense && (
        <Modal
          isOpen={!!selectedExpense}
          onClose={() => setSelectedExpense(null)}
          title="Transaction Receipt"
        >
          <div className="p-4 sm:p-6 space-y-5">
            {/* Amount Banner */}
            <div className="rounded-3xl bg-gradient-to-br from-[#0E0E10] to-[#1a1a20] text-white p-6 text-center shadow-xl border border-white/10 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#D4F835]/20 rounded-full blur-2xl" />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4F835]/20 text-[#D4F835] text-xs font-bold mb-2">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Verified Transaction</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                {formatINR(selectedExpense.amount)}
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {selectedExpense.description}
              </p>
            </div>

            {/* Receipt Details Grid */}
            <div className="rounded-2xl bg-secondary/50 border border-border p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Date
                </span>
                <span className="font-bold text-foreground">{selectedExpense.expense_date}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Paid By
                </span>
                <span className="font-bold text-foreground">
                  {selectedExpense.paid_by?.display_name || "Family Member"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground font-semibold">Payment Method</span>
                <span className="font-bold text-foreground font-mono">
                  {selectedExpense.payment_method || "Cash"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground font-semibold">Category</span>
                <span className="font-bold text-foreground">
                  {selectedExpense.category?.name || "General"}
                </span>
              </div>

              {selectedExpense.notes && (
                <div className="pt-1">
                  <span className="text-muted-foreground font-semibold block mb-1">Notes:</span>
                  <p className="text-foreground bg-card p-2 rounded-xl text-xs">
                    {selectedExpense.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/expenses"
                onClick={() => setSelectedExpense(null)}
                className="flex-1 py-3 rounded-full bg-[#0E0E10] text-white hover:bg-zinc-800 font-bold text-xs text-center transition-colors shadow-xs"
              >
                Open in Full Ledger
              </Link>
              <button
                type="button"
                onClick={() => setSelectedExpense(null)}
                className="px-5 py-3 rounded-full bg-secondary text-foreground hover:bg-secondary/80 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
