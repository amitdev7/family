"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ShieldAlert, LogOut, ChevronDown, UserCheck } from "lucide-react";
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

  const handleSwitchUser = (member: HouseholdMember) => {
    DataService.selectActiveUser(member.user_id);
    setCurrentUser(member);
    setIsUserMenuOpen(false);
  };

  const handleOpenWhoAreYou = () => {
    setIsUserMenuOpen(false);
    window.dispatchEvent(new Event("open-who-are-you"));
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-border bg-card/85 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
      {/* Title & Subtitle */}
      <div className="min-w-0">
        <h1 className="text-base sm:text-xl font-bold tracking-tight text-foreground leading-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground hidden sm:block truncate">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Supabase status indicator badge */}
        {isDemo && (
          <div
            title="Running with interactive demo family data. Configure .env.local to link your Supabase database."
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Interactive Demo</span>
          </div>
        )}

        {/* Quick Add Expense Button */}
        {onAddExpenseClick && (
          <Button
            type="button"
            onClick={onAddExpenseClick}
            size="sm"
            className="gap-1.5 font-semibold text-xs sm:text-sm px-2.5 sm:px-4 h-8 sm:h-9"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden xs:inline">Add Expense</span>
            <span className="xs:hidden">Add</span>
          </Button>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Family Member Switcher / Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-xl hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="User profile and switcher"
          >
            <Avatar
              name={currentUser?.display_name || "User"}
              size="sm"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-foreground max-w-[110px] truncate leading-tight">
                {currentUser?.display_name}
              </span>
              {currentUser?.relationship && (
                <span className="text-[10px] text-muted-foreground font-medium">
                  {currentUser.relationship}
                </span>
              )}
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:inline" />
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card p-2 text-foreground shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-border/60">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold truncate">{currentUser?.display_name}</p>
                  {currentUser?.relationship && (
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
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

              {/* Action: Open Who Are You / Add Member */}
              <div className="py-1 border-b border-border/60">
                <button
                  type="button"
                  onClick={handleOpenWhoAreYou}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 text-primary bg-primary/5 hover:bg-primary/10 transition-colors font-semibold"
                >
                  <UserCheck className="h-4 w-4 shrink-0" />
                  <span>Who are you? (Switch/Add)</span>
                </button>
              </div>

              {/* Multi-member fast list */}
              <div className="py-1 max-h-48 overflow-y-auto">
                <p className="px-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Quick Switch Family Member
                </p>
                {members.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSwitchUser(m)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-accent transition-colors ${m.user_id === currentUser?.user_id
                      ? "font-bold text-primary bg-primary/10"
                      : "text-foreground"
                      }`}
                  >
                    <span className="truncate">{m.display_name}</span>
                    <span className="text-[10px] text-muted-foreground capitalize shrink-0 ml-1">
                      ({m.relationship || m.role})
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-1 mt-1 border-t border-border/60">
                <Link
                  href="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 text-foreground hover:bg-muted transition-colors"
                >
                  <span>Household Settings</span>
                </Link>
                <Link
                  href="/login"
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 text-destructive hover:bg-destructive/10 transition-colors"
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
