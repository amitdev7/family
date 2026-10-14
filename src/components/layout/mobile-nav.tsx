"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ReceiptText,
  Plus,
  BarChart2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  onAddExpenseClick?: () => void;
}

export function MobileNav({ onAddExpenseClick }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 h-16 bg-[#0E0E10] text-white rounded-[32px] px-3 flex items-center justify-around shadow-2xl border border-zinc-800/80 select-none">
      {/* 1. Home */}
      <Link
        href="/dashboard"
        className={cn(
          "flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold transition-colors",
          pathname === "/dashboard"
            ? "text-[#D4F835]"
            : "text-zinc-400 hover:text-white"
        )}
      >
        <Home className={cn("h-5 w-5 mb-0.5", pathname === "/dashboard" ? "stroke-[2.5]" : "stroke-[1.8]")} />
        <span>Home</span>
      </Link>

      {/* 2. Expenses */}
      <Link
        href="/expenses"
        className={cn(
          "flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold transition-colors",
          pathname.startsWith("/expenses")
            ? "text-[#D4F835]"
            : "text-zinc-400 hover:text-white"
        )}
      >
        <ReceiptText className={cn("h-5 w-5 mb-0.5", pathname.startsWith("/expenses") ? "stroke-[2.5]" : "stroke-[1.8]")} />
        <span>Expenses</span>
      </Link>

      {/* 3. Center Elevated Quick Add Button matching Figma */}
      <div className="-mt-7 flex flex-col items-center">
        <button
          type="button"
          onClick={onAddExpenseClick}
          aria-label="Quick Add Expense"
          className="flex h-13 w-13 items-center justify-center rounded-full bg-[#D4F835] text-black shadow-lg hover:bg-[#c5ea28] active:scale-95 transition-all cursor-pointer ring-4 ring-[#0E0E10]"
        >
          <Plus className="h-6 w-6 stroke-[3]" />
        </button>
        <span className="text-[9px] font-bold text-[#D4F835] mt-0.5">Quick Add</span>
      </div>

      {/* 4. Budgets */}
      <Link
        href="/budgets"
        className={cn(
          "flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold transition-colors",
          pathname.startsWith("/budgets")
            ? "text-[#D4F835]"
            : "text-zinc-400 hover:text-white"
        )}
      >
        <BarChart2 className={cn("h-5 w-5 mb-0.5", pathname.startsWith("/budgets") ? "stroke-[2.5]" : "stroke-[1.8]")} />
        <span>Budgets</span>
      </Link>

      {/* 5. Settings */}
      <Link
        href="/settings"
        className={cn(
          "flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold transition-colors",
          pathname.startsWith("/settings")
            ? "text-[#D4F835]"
            : "text-zinc-400 hover:text-white"
        )}
      >
        <Settings className={cn("h-5 w-5 mb-0.5", pathname.startsWith("/settings") ? "stroke-[2.5]" : "stroke-[1.8]")} />
        <span>Settings</span>
      </Link>
    </nav>
  );
}

