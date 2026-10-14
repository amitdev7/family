"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ReceiptText,
  PieChart,
  Tags,
  Repeat,
  BarChart3,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/expenses", label: "Expenses", icon: ReceiptText },
  { href: "/budgets", label: "Budgets", icon: PieChart },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/recurring", label: "Recurring Bills", icon: Repeat },
  { href: "/reports", label: "Reports & Analytics", icon: BarChart3 },
];

export function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();

  const handleOpenWhoAreYou = () => {
    window.dispatchEvent(new Event("open-who-are-you"));
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col items-center justify-between w-20 shrink-0 py-6 my-4 ml-4 select-none bg-[#0E0E10] text-white rounded-[32px] shadow-2xl z-30 transition-all",
        className
      )}
      style={{ height: "calc(100vh - 2rem)" }}
    >
      {/* Top: Glowing Neon Lime Brand Ring */}
      <div className="flex flex-col items-center gap-6">
        <Link
          href="/dashboard"
          className="group relative flex items-center justify-center h-12 w-12 rounded-full transition-transform active:scale-95"
          title="Sharma Residence Finances"
        >
          {/* Lime circular ring icon matching Figma */}
          <div className="h-10 w-10 rounded-full border-[3px] border-[#D4F835] flex items-center justify-center relative transition-all group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(212,248,53,0.5)]">
            <div className="absolute top-0 right-0 h-2 w-2 bg-[#0E0E10] transform translate-x-0.5 -translate-y-0.5" />
          </div>
        </Link>

        {/* Main Navigation Icons */}
        <nav className="flex flex-col items-center gap-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center justify-center h-11 w-11 rounded-full transition-all duration-200",
                    isActive
                      ? "bg-white text-black shadow-md scale-105"
                      : "text-[#8E8E93] hover:text-white hover:bg-white/10"
                  )}
                  aria-label={item.label}
                >
                  <Icon className="h-5 w-5 stroke-[2.2]" />
                </Link>

                {/* Floating Tooltip */}
                <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-black text-white text-[11px] font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity whitespace-nowrap shadow-xl z-50 border border-white/10">
                  {item.label}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions: Help & Settings */}
      <div className="flex flex-col items-center gap-3">
        {/* Switch Profile / Who are you shortcut */}
        <div className="relative group">
          <button
            type="button"
            onClick={handleOpenWhoAreYou}
            className="flex items-center justify-center h-11 w-11 rounded-full text-[#8E8E93] hover:text-white hover:bg-white/10 transition-colors"
            title="Who are you? (Switch Profile)"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-black text-white text-[11px] font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity whitespace-nowrap shadow-xl z-50 border border-white/10">
            Switch Profile
          </div>
        </div>

        {/* Settings */}
        <div className="relative group">
          <Link
            href="/settings"
            className={cn(
              "flex items-center justify-center h-11 w-11 rounded-full transition-all duration-200",
              pathname === "/settings"
                ? "bg-white text-black shadow-md scale-105"
                : "text-[#8E8E93] hover:text-white hover:bg-white/10"
            )}
            aria-label="Household Settings"
          >
            <Settings className="h-5 w-5 stroke-[2.2]" />
          </Link>
          <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-black text-white text-[11px] font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity whitespace-nowrap shadow-xl z-50 border border-white/10">
            Household Settings
          </div>
        </div>
      </div>
    </aside>
  );
}
