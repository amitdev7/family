"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  Tags,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DataService } from "@/lib/data-service";
import { HouseholdMember } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses Ledger", icon: ReceiptText },
  { href: "/budgets", label: "Budget Planner", icon: PieChart },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/reports", label: "Reports & Analytics", icon: BarChart3 },
];

export function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<HouseholdMember | null>(null);

  useEffect(() => {
    setCurrentUser(DataService.getCurrentUser());
    const handleUpdate = () => setCurrentUser(DataService.getCurrentUser());
    window.addEventListener("household-user-changed", handleUpdate);
    return () => window.removeEventListener("household-user-changed", handleUpdate);
  }, []);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col w-[76px] sticky top-4 my-4 ml-4 h-[calc(100vh-2rem)] bg-[#0E0E10] text-white rounded-[38px] items-center py-6 justify-between shadow-2xl shrink-0 z-40 select-none",
        className
      )}
    >
      {/* Top Logo - Lime Ring / Crescent */}
      <div className="flex flex-col items-center gap-6">
        <Link
          href="/dashboard"
          className="group relative flex h-11 w-11 items-center justify-center"
          title="Our Home"
        >
          <div className="h-10 w-10 rounded-full border-[3px] border-[#D4F835] border-t-transparent flex items-center justify-center transition-transform group-hover:rotate-45">
            <div className="h-3.5 w-3.5 rounded-full bg-[#D4F835]" />
          </div>
        </Link>

        {/* Navigation Items (Recurring bills removed) */}
        <nav className="flex flex-col items-center gap-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200",
                    isActive
                      ? "bg-white text-black shadow-lg scale-105"
                      : "text-zinc-400 hover:text-white hover:bg-white/10"
                  )}
                  aria-label={item.label}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isActive ? "text-black stroke-[2.2]" : "stroke-[1.8]"
                    )}
                  />
                </Link>

                {/* Tooltip on Hover */}
                <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-black text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 border border-zinc-800">
                  {item.label}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section - Active Member Avatar Badge (Switch User & Household Settings removed) */}
      <div className="flex flex-col items-center">
        <div
          className="h-10 w-10 rounded-full bg-[#D4F835] text-black font-black text-sm flex items-center justify-center shadow-md select-none"
          title={currentUser?.display_name || "Active Member"}
        >
          {currentUser?.display_name?.slice(0, 1).toUpperCase() || "A"}
        </div>
      </div>
    </aside>
  );
}
