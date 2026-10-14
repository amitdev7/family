"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ShoppingBag, Utensils, Zap, Car, Film, CreditCard } from "lucide-react";
import { Expense } from "@/lib/types";
import { formatINR } from "@/lib/formatters";

interface RecentTransactionsWidgetProps {
  expenses: Expense[];
}

// Brand / Category visual styling matching Figma image_20261014_111016.jpg
const MERCHANT_META: Record<string, { bg: string; text: string; icon: any }> = {
  paypal: { bg: "bg-blue-100 text-blue-600", text: "Paypal", icon: CreditCard },
  twitch: { bg: "bg-purple-100 text-purple-600", text: "Twitch", icon: Film },
  airbnb: { bg: "bg-rose-100 text-rose-500", text: "Airbnb", icon: ShoppingBag },
  dribbble: { bg: "bg-pink-100 text-pink-500", text: "Dribbble", icon: ShoppingBag },
  dmart: { bg: "bg-emerald-100 text-emerald-600", text: "DMart", icon: ShoppingBag },
  swiggy: { bg: "bg-orange-100 text-orange-600", text: "Swiggy", icon: Utensils },
  airtel: { bg: "bg-red-100 text-red-600", text: "Airtel", icon: Zap },
  uber: { bg: "bg-zinc-100 text-zinc-900", text: "Uber", icon: Car },
};

function getMerchantMeta(description: string) {
  const descLower = description.toLowerCase();
  for (const key of Object.keys(MERCHANT_META)) {
    if (descLower.includes(key)) {
      return MERCHANT_META[key];
    }
  }
  return { bg: "bg-blue-100 text-blue-600", text: description.slice(0, 1), icon: CreditCard };
}

export function RecentTransactionsWidget({ expenses }: RecentTransactionsWidgetProps) {
  // If no expenses, fallback to standard demo list
  const displayExpenses = expenses.slice(0, 5);

  return (
    <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-lg text-foreground tracking-tight">
          Recent transactions
        </h3>
        <Link
          href="/expenses"
          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#0E0E10] text-white hover:bg-zinc-800 text-xs font-semibold transition-colors shadow-xs"
        >
          <span>View all</span>
          <ChevronRight className="h-3 w-3 stroke-[2.5]" />
        </Link>
      </div>

      {/* Rows */}
      <div className="space-y-4 flex-1">
        {displayExpenses.length === 0 ? (
          <p className="text-xs text-muted-foreground py-8 text-center">
            No transactions recorded yet.
          </p>
        ) : (
          displayExpenses.map((expense) => {
            const meta = getMerchantMeta(expense.description);
            const Icon = meta.icon;

            return (
              <div
                key={expense.id}
                className="flex items-center justify-between py-1 group hover:bg-accent/40 rounded-xl px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-10 w-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${meta.bg}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-foreground truncate leading-snug">
                      {expense.description}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {expense.expense_date} • {expense.paid_by?.display_name || "Family"}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span className="font-extrabold text-sm text-foreground">
                    - {formatINR(expense.amount)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

