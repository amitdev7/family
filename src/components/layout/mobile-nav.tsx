"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ReceiptText,
  Plus,
  PieChart,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  onAddExpenseClick?: () => void;
}

export function MobileNav({ onAddExpenseClick }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-border bg-card/95 backdrop-blur-md px-3 flex items-center justify-around safe-area-bottom">
      {/* 1. Dashboard */}
      <Link
        href="/dashboard"
        className={cn(
          "flex flex-col items-center justify-center w-14 py-1 text-[10px] font-medium transition-colors",
          pathname === "/dashboard"
            ? "text-primary font-bold"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutDashboard className="h-5 w-5 mb-0.5" />
        <span>Home</span>
      </Link>

      {/* 2. Expenses */}
      <Link
        href="/expenses"
        className={cn(
          "flex flex-col items-center justify-center w-14 py-1 text-[10px] font-medium transition-colors",
          pathname.startsWith("/expenses")
            ? "text-primary font-bold"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <ReceiptText className="h-5 w-5 mb-0.5" />
        <span>Expenses</span>
      </Link>

      {/* 3. Center Add Button */}
      <div className="-mt-5">
        <button
          type="button"
          onClick={onAddExpenseClick}
          aria-label="Add new expense"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary-hover active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>
      </div>

      {/* 4. Budgets */}
      <Link
        href="/budgets"
        className={cn(
          "flex flex-col items-center justify-center w-14 py-1 text-[10px] font-medium transition-colors",
          pathname.startsWith("/budgets")
            ? "text-primary font-bold"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <PieChart className="h-5 w-5 mb-0.5" />
        <span>Budgets</span>
      </Link>

      {/* 5. Settings */}
      <Link
        href="/settings"
        className={cn(
          "flex flex-col items-center justify-center w-14 py-1 text-[10px] font-medium transition-colors",
          pathname.startsWith("/settings")
            ? "text-primary font-bold"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Settings className="h-5 w-5 mb-0.5" />
        <span>Settings</span>
      </Link>
    </nav>
  );
}

