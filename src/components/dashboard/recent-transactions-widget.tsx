"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Expense } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/formatters";
import { ExpenseDetailsModal } from "@/components/expenses/expense-details-modal";
import { ShoppingCart, Utensils, Wifi, Zap, Car, Receipt } from "lucide-react";

interface RecentTransactionsWidgetProps {
  expenses: Expense[];
}

// Icon and color mapper for popular Indian merchants
function getMerchantMeta(description: string, categoryName?: string) {
  const desc = description.toLowerCase();
  if (desc.includes("dmart") || desc.includes("grocery")) {
    return {
      name: "DMart",
      sub: "Groceries",
      color: "bg-[#2563EB] text-white",
      icon: ShoppingCart,
    };
  }
  if (desc.includes("swiggy") || desc.includes("zomato") || desc.includes("dinner") || desc.includes("lunch")) {
    return {
      name: "Swiggy",
      sub: "Food & Dining",
      color: "bg-[#F97316] text-white",
      icon: Utensils,
    };
  }
  if (desc.includes("airtel") || desc.includes("wifi") || desc.includes("broadband") || desc.includes("fiber")) {
    return {
      name: "Airtel",
      sub: "Broadband",
      color: "bg-[#EF4444] text-white",
      icon: Wifi,
    };
  }
  if (desc.includes("zepto") || desc.includes("blinkit") || desc.includes("quick")) {
    return {
      name: "Zepto",
      sub: "Quick Commerce",
      color: "bg-[#8B5CF6] text-white",
      icon: Zap,
    };
  }
  if (desc.includes("uber") || desc.includes("ola") || desc.includes("petrol") || desc.includes("fuel")) {
    return {
      name: "Uber",
      sub: "Transport",
      color: "bg-[#0E0E10] text-white",
      icon: Car,
    };
  }
  return {
    name: description,
    sub: categoryName || "Expense",
    color: "bg-muted text-foreground",
    icon: Receipt,
  };
}

export function RecentTransactionsWidget({ expenses }: RecentTransactionsWidgetProps) {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const displayList = expenses.slice(0, 5);

  return (
    <>
      <div className="flex flex-col h-full justify-between">
        {/* Header with "View all >" pill button */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
            Recent transactions
          </h3>

          <Link
            href="/expenses"
            className="px-3.5 py-1.5 rounded-full bg-[#0E0E10] hover:bg-black/85 text-white text-xs font-bold transition-all active:scale-95 flex items-center gap-1 shadow-2xs"
          >
            <span>View all</span>
            <span>&gt;</span>
          </Link>
        </div>

        {/* Transaction Rows */}
        <div className="space-y-3 flex-1 overflow-y-auto">
          {displayList.map((exp) => {
            const meta = getMerchantMeta(exp.description, exp.category?.name);
            const Icon = meta.icon;

            return (
              <button
                key={exp.id}
                type="button"
                onClick={() => setSelectedExpense(exp)}
                className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-muted/70 transition-colors text-left cursor-pointer group"
              >
                {/* Left: Icon & Merchant Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${meta.color} transition-transform group-hover:scale-105`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 truncate">
                    <p className="font-extrabold text-sm text-foreground truncate">
                      {meta.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {formatDate(exp.expense_date)} • {exp.payment_method}
                    </p>
                  </div>
                </div>

                {/* Right: Amount */}
                <div className="text-right shrink-0 ml-3">
                  <span className="text-sm sm:text-base font-black text-foreground tracking-tight">
                    - {formatINR(exp.amount)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expense Inspection Modal */}
      {selectedExpense && (
        <ExpenseDetailsModal
          expense={selectedExpense}
          isOpen={!!selectedExpense}
          onClose={() => setSelectedExpense(null)}
        />
      )}
    </>
  );
}
