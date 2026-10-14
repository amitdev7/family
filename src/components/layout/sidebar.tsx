"use client";

import React from "react";
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
  Home,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: ReceiptText },
  { href: "/budgets", label: "Budgets", icon: PieChart },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/recurring", label: "Recurring Bills", icon: Repeat },
  { href: "/reports", label: "Reports & Analytics", icon: BarChart3 },
  { href: "/settings", label: "Household Settings", icon: Settings },
];

export function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col w-64 bg-card border-r border-border shrink-0 select-none min-h-screen",
        className
      )}
    >
      {/* Brand & Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border/80 gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Home className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight text-foreground flex items-center gap-1.5">
            Our Home
          </span>
          <p className="text-[11px] text-muted-foreground font-medium truncate leading-none">
            Every expense. Total clarity.
          </p>
        </div>
      </div>

      {/* Navigation links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          Management
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Household Profile Footer */}
      <div className="p-4 border-t border-border/80">
        <div className="p-3 rounded-xl bg-secondary/60 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Users className="h-4 w-4" />
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-foreground truncate">The Sharma Residence</p>
            <p className="text-[11px] text-muted-foreground truncate">4 Active Members</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
