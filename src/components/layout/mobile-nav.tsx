"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_3D_ICONS } from "@/lib/assets";

interface MobileNavProps {
  onAddExpenseClick?: () => void;
}

export function MobileNav({ onAddExpenseClick }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 h-16 bg-[#0E0E10] text-white rounded-[32px] px-3 flex items-center justify-around shadow-2xl border border-zinc-800/80 select-none">
      {/* 1. Home / Dashboard */}
      <Link
        href="/dashboard"
        className={cn(
          "flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold transition-all",
          pathname === "/dashboard"
            ? "text-[#E2F937] scale-105"
            : "text-zinc-400 hover:text-white opacity-80"
        )}
      >
        <div className="h-6 w-6 relative flex items-center justify-center mb-0.5">
          <Image
            src={NAV_3D_ICONS.dashboard}
            alt="Dashboard"
            width={22}
            height={22}
            className="object-contain"
          />
        </div>
        <span>Home</span>
      </Link>

      {/* 2. Expenses */}
      <Link
        href="/expenses"
        className={cn(
          "flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold transition-all",
          pathname.startsWith("/expenses")
            ? "text-[#E2F937] scale-105"
            : "text-zinc-400 hover:text-white opacity-80"
        )}
      >
        <div className="h-6 w-6 relative flex items-center justify-center mb-0.5">
          <Image
            src={NAV_3D_ICONS.expenses}
            alt="Expenses"
            width={22}
            height={22}
            className="object-contain"
          />
        </div>
        <span>Expenses</span>
      </Link>

      {/* 3. Center Elevated Quick Add Button */}
      <div className="-mt-7 flex flex-col items-center">
        <button
          type="button"
          onClick={onAddExpenseClick}
          aria-label="Quick Add Expense"
          className="flex h-13 w-13 items-center justify-center rounded-full bg-[#E2F937] text-black shadow-lg hover:bg-[#c5ea28] active:scale-95 transition-all cursor-pointer ring-4 ring-[#0E0E10]"
        >
          <Plus className="h-6 w-6 stroke-[3]" />
        </button>
        <span className="text-[9px] font-bold text-[#E2F937] mt-0.5">Quick Add</span>
      </div>

      {/* 4. Budgets */}
      <Link
        href="/budgets"
        className={cn(
          "flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold transition-all",
          pathname.startsWith("/budgets")
            ? "text-[#E2F937] scale-105"
            : "text-zinc-400 hover:text-white opacity-80"
        )}
      >
        <div className="h-6 w-6 relative flex items-center justify-center mb-0.5">
          <Image
            src={NAV_3D_ICONS.budgets}
            alt="Budgets"
            width={22}
            height={22}
            className="object-contain"
          />
        </div>
        <span>Budgets</span>
      </Link>

      {/* 5. Reports */}
      <Link
        href="/reports"
        className={cn(
          "flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold transition-all",
          pathname.startsWith("/reports")
            ? "text-[#E2F937] scale-105"
            : "text-zinc-400 hover:text-white opacity-80"
        )}
      >
        <div className="h-6 w-6 relative flex items-center justify-center mb-0.5">
          <Image
            src={NAV_3D_ICONS.reports}
            alt="Reports"
            width={22}
            height={22}
            className="object-contain"
          />
        </div>
        <span>Reports</span>
      </Link>
    </nav>
  );
}
