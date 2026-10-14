"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  ShieldAlert,
  LogOut,
  ChevronDown,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataService } from "@/lib/data-service";
import { HouseholdMember } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/client";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onAddExpenseClick?: () => void;
}

export function Header({ title, subtitle, onAddExpenseClick }: HeaderProps) {
  const [currentUser, setCurrentUser] = useState<HouseholdMember | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  const syncUserData = () => {
    setIsDemo(!isSupabaseConfigured());
    setCurrentUser(DataService.getCurrentUser());
    DataService.getMembers().then(setMembers);
  };

  useEffect(() => {
    syncUserData();

    const handleUserChanged = () => {
      syncUserData();
    };

    window.addEventListener("household-user-changed", handleUserChanged);
    return () => {
      window.removeEventListener("household-user-changed", handleUserChanged);
    };
  }, []);



  const initials = currentUser?.display_name
    ? currentUser.display_name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "AS";

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-border/80 bg-card/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 select-none">
      {/* Title & Subtitle + Financial Pill */}
      <div className="flex items-center gap-3 min-w-0">
        <div>
          <h1 className="text-base sm:text-xl font-bold tracking-tight text-foreground leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground hidden sm:block truncate">
              {subtitle}
            </p>
          )}
        </div>

        {/* Financial Dropdown Pill from Figma image_20261014_111553.jpg */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 text-foreground text-xs font-semibold hover:bg-secondary cursor-pointer transition-colors shadow-2xs">
          <span>Financial</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Supabase status indicator badge */}
        {isDemo && (
          <div
            title="Running with interactive demo family data. Configure .env.local to link your Supabase database."
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Interactive Demo</span>
          </div>
        )}

        {/* Active Member Badge */}
        <div className="hidden md:flex items-center bg-[#0E0E10] text-white rounded-full py-1.5 px-3.5 gap-2 shadow-xs border border-zinc-800">
          <div className="h-5 w-5 rounded-full bg-[#D4F835] text-black font-bold text-[9px] flex items-center justify-center shrink-0">
            {initials}
          </div>
          <span className="text-xs font-bold text-zinc-200 truncate max-w-[120px]">
            {currentUser?.display_name || "Amit"}
          </span>
        </div>

        {/* Notification Bell with Red Dot */}
        <div
          className="relative h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-foreground transition-colors"
          title="Notifications & Family Updates"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-card" />
        </div>

        {/* Quick Add Expense Button */}
        {onAddExpenseClick && (
          <Button
            type="button"
            onClick={onAddExpenseClick}
            size="sm"
            className="gap-1.5 font-bold text-xs sm:text-sm px-3 sm:px-4 h-9 rounded-full bg-[#D4F835] text-black hover:bg-[#c5ea28] shadow-xs"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden xs:inline">Add Expense</span>
            <span className="xs:hidden">Add</span>
          </Button>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Family Member Avatar Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-1.5 p-1 rounded-full hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            aria-label="User profile and switcher"
          >
            <Avatar
              name={currentUser?.display_name || "User"}
              size="sm"
              className="ring-1 ring-border"
            />
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:inline" />
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-card p-2 text-foreground shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-border/60">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold truncate">{currentUser?.display_name}</p>
                  {currentUser?.relationship && (
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 rounded-full">
                      {currentUser.relationship}
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground capitalize mt-0.5">
                  Role: {currentUser?.role}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">
                  UID: {currentUser?.user_id}
                </p>
              </div>

              <div className="pt-1 mt-1 border-t border-border/60">
                <Link
                  href="/login"
                  className="w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

