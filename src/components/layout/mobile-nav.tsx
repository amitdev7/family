"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ReceiptText,
  Plus,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  onAddExpenseClick?: () => void;
}

export function MobileNav({ onAddExpenseClick }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-40 h-16 rounded-[28px] bg-[#0E0E10] text-white px-5 flex items-center justify-between shadow-[0_10px_35px_rgba(0,0,0,0.5)] border border-white/10 safe-area-bottom">
      {/* 1. Home / Dashboard */}
      <Link
        href="/dashboard"
        className={cn(
          "flex flex-col items-center justify-center w-12 text-[10px] font-medium transition-colors",
          pathname === "/dashboard"
            ? "text-[#D4F835] font-bold"
            : "text-[#8E8E93] hover:text-white"
        )}
      >
        <Home className="h-5 w-5 mb-0.5" />
        <span>Home</span>
      </Link>

      {/* 2. Expenses */}
      <Link
        href="/expenses"
        className={cn(
          "flex flex-col items-center justify-center w-12 text-[10px] font-medium transition-colors",
          pathname.startsWith("/expenses")
            ? "text-[#D4F835] font-bold"
            : "text-[#8E8E93] hover:text-white"
        )}
      >
        <ReceiptText className="h-5 w-5 mb-0.5" />
        <span>Expenses</span>
      </Link>

      {/* 3. Center Elevated Quick Add Button */}
      <div className="-mt-6 flex flex-col items-center">
        <button
          type="button"
          onClick={onAddExpenseClick}
          aria-label="Quick Add Expense"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4F835] text-black shadow-[0_6px_20px_rgba(212,248,53,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer focus:outline-none"
        >
          <Plus className="h-6 w-6 stroke-[3]" />
        </button>
        <span className="text-[9px] font-bold text-[#D4F835] mt-0.5">Quick Add</span>
      </div>

      {/* 4. Budgets */}
      <Link
        href="/budgets"
        className={cn(
          "flex flex-col items-center justify-center w-12 text-[10px] font-medium transition-colors",
          pathname.startsWith("/budgets")
            ? "text-[#D4F835] font-bold"
            : "text-[#8E8E93] hover:text-white"
        )}
      >
        <BarChart3 className="h-5 w-5 mb-0.5" />
        <span>Budgets</span>
      </Link>

      {/* 5. Settings */}
      <Link
        href="/settings"
        className={cn(
          "flex flex-col items-center justify-center w-12 text-[10px] font-medium transition-colors",
          pathname.startsWith("/settings")
            ? "text-[#D4F835] font-bold"
            : "text-[#8E8E93] hover:text-white"
        )}
      >
        <Settings className="h-5 w-5 mb-0.5" />
        <span>Settings</span>
      </Link>
    </nav>
  );
}
