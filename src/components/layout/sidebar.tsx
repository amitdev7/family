"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  Tags,
  Repeat,
  BarChart3,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DataService } from "@/lib/data-service";
import { HouseholdMember } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses Ledger", icon: ReceiptText },
  { href: "/budgets", label: "Budget Planner", icon: PieChart },
  { href: "/recurring", label: "Recurring Bills", icon: Repeat },
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

  const handleOpenWhoAreYou = () => {
    window.dispatchEvent(new Event("open-who-are-you"));
  };

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

        {/* Navigation Items Matching image_20261014_111146.jpg */}
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

      {/* Bottom Section - Switch Member & Settings */}
      <div className="flex flex-col items-center gap-3">
        {/* Switch Profile Button */}
        <div className="group relative">
          <button
            type="button"
            onClick={handleOpenWhoAreYou}
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Switch User Profile"
          >
            <Users className="h-5 w-5 stroke-[1.8]" />
          </button>
          <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-black text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 border border-zinc-800">
            {currentUser?.display_name
              ? `Switch User (${currentUser.display_name})`
              : "Switch User"}
          </div>
        </div>

        {/* Settings Button */}
        <div className="group relative">
          <Link
            href="/settings"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200",
              pathname === "/settings"
                ? "bg-white text-black shadow-lg"
                : "text-zinc-400 hover:text-white hover:bg-white/10"
            )}
            title="Household Settings"
          >
            <Settings className="h-5 w-5 stroke-[1.8]" />
          </Link>
          <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-black text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 border border-zinc-800">
            Household Settings
          </div>
        </div>
      </div>
    </aside>
  );
}

