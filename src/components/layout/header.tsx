"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  User as UserIcon,
  ChevronDown,
  ArrowLeftRight,
  Plus,
  ShieldCheck,
  LogOut,
  UserCheck,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(true);

  const syncUserData = () => {
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

  const handleOpenWhoAreYou = () => {
    setIsUserMenuOpen(false);
    window.dispatchEvent(new Event("open-who-are-you"));
  };

  const handleSwitchUser = (member: HouseholdMember) => {
    DataService.selectActiveUser(member.user_id);
    setCurrentUser(member);
    setIsUserMenuOpen(false);
  };

  const initials = currentUser
    ? currentUser.display_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AS";

  return (
    <header className="sticky top-0 z-30 h-20 w-full bg-background/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between gap-3">
      {/* Title & Filter */}
      <div className="flex items-center gap-3 min-w-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground hidden lg:block truncate">
              {subtitle}
            </p>
          )}
        </div>

        {/* Financial Filter Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-card border border-border text-xs font-semibold text-foreground shadow-2xs hover:bg-muted/80 cursor-pointer select-none transition-colors">
          <span>Financial</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Button on Desktop */}
        {onAddExpenseClick && (
          <button
            type="button"
            onClick={onAddExpenseClick}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white dark:bg-[#D4F835] dark:text-black text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-sm"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        )}

        {/* Active Member Pill & Profile Switcher */}
        {currentUser && (
          <div className="flex items-center bg-[#0E0E10] text-white rounded-full p-1 pl-1.5 pr-1 gap-2 border border-black/10 shadow-sm">
            <div
              className="h-7 w-7 rounded-full text-black font-extrabold flex items-center justify-center text-[11px] shrink-0 shadow-xs"
              style={{ backgroundColor: currentUser.color || "#D4F835" }}
            >
              {initials}
            </div>
            <span className="text-xs font-semibold text-white truncate max-w-[80px] sm:max-w-[130px] hidden xs:inline">
              {currentUser.display_name}
            </span>
            <button
              type="button"
              onClick={handleOpenWhoAreYou}
              className="bg-[#D4F835] hover:bg-[#c5ea28] active:scale-95 text-black px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer select-none shadow-xs"
              title="Switch Family Profile"
            >
              <span>Switch Profile</span>
              <ArrowLeftRight className="h-3 w-3 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Notification Bell */}
        <button
          type="button"
          onClick={() => setHasUnreadAlerts(false)}
          className="relative h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors shadow-2xs"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {hasUnreadAlerts && (
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card animate-pulse" />
          )}
        </button>

        {/* User Menu Trigger / Avatar */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors shadow-2xs"
            aria-label="User menu"
          >
            <UserIcon className="h-4 w-4" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-[24px] bg-card border border-border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="p-3 border-b border-border/80">
                <p className="text-xs font-bold text-foreground truncate">{currentUser?.display_name}</p>
                <p className="text-[11px] text-muted-foreground">{currentUser?.relationship || currentUser?.role} • {currentUser?.user_id}</p>
              </div>

              <div className="py-2">
                <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Switch Member
                </p>
                {members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSwitchUser(m)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className="h-5 w-5 rounded-full text-[10px] font-bold flex items-center justify-center text-black"
                        style={{ backgroundColor: m.color || "#D4F835" }}
                      >
                        {m.display_name.charAt(0)}
                      </div>
                      <span className="truncate">{m.display_name} ({m.relationship || m.role})</span>
                    </div>
                    {m.user_id === currentUser?.user_id && (
                      <UserCheck className="h-3.5 w-3.5 text-[#D4F835]" />
                    )}
                  </button>
                ))}

                <button
                  onClick={handleOpenWhoAreYou}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-black text-white dark:bg-[#D4F835] dark:text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Who are you? (Add / Select)</span>
                </button>
              </div>

              <div className="pt-2 border-t border-border/80 flex items-center justify-between px-2">
                <span className="text-[11px] font-medium text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
