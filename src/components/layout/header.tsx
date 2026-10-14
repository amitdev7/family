"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ShieldAlert, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
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

  useEffect(() => {
    setIsDemo(!isSupabaseConfigured());
    setCurrentUser(DataService.getCurrentUser());
    DataService.getMembers().then(setMembers);
  }, []);

  const handleSwitchUser = (member: HouseholdMember) => {
    DataService.switchDemoUser(member.user_id);
    setCurrentUser(member);
    setIsUserMenuOpen(false);
    window.dispatchEvent(new Event("household-user-changed"));
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-border bg-card/85 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground hidden sm:block">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
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
            className="gap-1.5 font-semibold text-xs sm:text-sm px-3 sm:px-4"
          >
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </Button>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Family Member Switcher / Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="User profile and switcher"
          >
            <Avatar
              name={currentUser?.display_name || "User"}
              size="sm"
            />
            <span className="hidden md:inline text-xs font-semibold text-foreground max-w-[100px] truncate">
              {currentUser?.display_name?.split(" ")[0]}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:inline" />
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 text-foreground shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-border/60">
                <p className="text-xs font-semibold truncate">{currentUser?.display_name}</p>
                <p className="text-[11px] text-muted-foreground capitalize">
                  Role: {currentUser?.role}
                </p>
              </div>

              {/* Multi-member switcher for testing */}
              <div className="py-1">
                <p className="px-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Switch Active Member
                </p>
                {members.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSwitchUser(m)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-accent transition-colors ${m.user_id === currentUser?.user_id ? "font-bold text-primary bg-primary/10" : "text-foreground"
                      }`}
                  >
                    <span>{m.display_name}</span>
                    <span className="text-[10px] text-muted-foreground capitalize">({m.role})</span>
                  </button>
                ))}
              </div>

              <div className="pt-1 mt-1 border-t border-border/60">
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

