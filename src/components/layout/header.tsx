"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  ChevronDown,
  Bell,
  Globe,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataService } from "@/lib/data-service";
import { HouseholdMember } from "@/lib/types";
import {
  Language,
  getSavedLanguage,
  saveLanguage,
  TRANSLATIONS,
} from "@/lib/translations";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onAddExpenseClick?: () => void;
}

export function Header({ title, subtitle, onAddExpenseClick }: HeaderProps) {
  const [currentUser, setCurrentUser] = useState<HouseholdMember | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>("en");

  const syncUserData = () => {
    setCurrentUser(DataService.getCurrentUser());
    setCurrentLang(getSavedLanguage());
  };

  useEffect(() => {
    syncUserData();

    const handleUserChanged = () => {
      syncUserData();
    };

    const handleLangChanged = () => {
      setCurrentLang(getSavedLanguage());
    };

    window.addEventListener("household-user-changed", handleUserChanged);
    window.addEventListener("language-changed", handleLangChanged);
    return () => {
      window.removeEventListener("household-user-changed", handleUserChanged);
      window.removeEventListener("language-changed", handleLangChanged);
    };
  }, []);

  const handleSwitchLanguage = (lang: Language) => {
    saveLanguage(lang);
    setCurrentLang(lang);
    setIsLangMenuOpen(false);
  };

  const initials = currentUser?.display_name
    ? currentUser.display_name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "AM";

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-border/80 bg-card/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 select-none">
      {/* Title & Subtitle */}
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

        {/* Financial Dropdown Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 text-foreground text-xs font-semibold hover:bg-secondary cursor-pointer transition-colors shadow-2xs">
          <span>Financial</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Language Selector Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsLangMenuOpen(!isLangMenuOpen);
              setIsUserMenuOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-secondary/80 hover:bg-secondary text-foreground text-xs font-bold transition-colors cursor-pointer border border-border/60"
            title="Choose Language"
          >
            <Globe className="h-3.5 w-3.5 text-[#D4F835]" />
            <span className="hidden sm:inline">
              {currentLang === "hi"
                ? "🇮🇳 हिन्दी"
                : currentLang === "hinglish"
                ? "💬 Hinglish"
                : "🇬🇧 English"}
            </span>
            <span className="sm:hidden">
              {currentLang === "hi"
                ? "🇮🇳"
                : currentLang === "hinglish"
                ? "💬"
                : "🇬🇧"}
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-border bg-card p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Language
              </div>
              <button
                type="button"
                onClick={() => handleSwitchLanguage("en")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                  currentLang === "en"
                    ? "bg-[#D4F835] text-black"
                    : "hover:bg-secondary text-foreground"
                }`}
              >
                <span>🇬🇧 English</span>
                {currentLang === "en" && (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleSwitchLanguage("hi")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                  currentLang === "hi"
                    ? "bg-[#D4F835] text-black"
                    : "hover:bg-secondary text-foreground"
                }`}
              >
                <span>🇮🇳 हिन्दी</span>
                {currentLang === "hi" && (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleSwitchLanguage("hinglish")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                  currentLang === "hinglish"
                    ? "bg-[#D4F835] text-black"
                    : "hover:bg-secondary text-foreground"
                }`}
              >
                <span>💬 Hinglish</span>
                {currentLang === "hinglish" && (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Active Member Badge */}
        <div className="hidden md:flex items-center bg-[#0E0E10] text-white rounded-full py-1.5 px-3.5 gap-2 shadow-xs border border-zinc-800">
          <div className="h-5 w-5 rounded-full bg-[#D4F835] text-black font-bold text-[9px] flex items-center justify-center shrink-0">
            {initials}
          </div>
          <span className="text-xs font-bold text-zinc-200 truncate max-w-[120px]">
            {currentUser?.display_name || "Amit"}
          </span>
        </div>

        {/* Notification Bell */}
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
            className="gap-1.5 font-bold text-xs sm:text-sm px-3 sm:px-4 h-9 rounded-full bg-[#D4F835] text-black hover:bg-[#c5ea28] shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden xs:inline">{t.addExpense}</span>
            <span className="xs:hidden">Add</span>
          </Button>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Family Member Avatar Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsUserMenuOpen(!isUserMenuOpen);
              setIsLangMenuOpen(false);
            }}
            className="flex items-center gap-1.5 p-1 rounded-full hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            aria-label="User profile"
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
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card p-3 text-foreground shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-extrabold truncate">
                  {currentUser?.display_name || "Amit"}
                </p>
                <Badge
                  variant="secondary"
                  className="text-[10px] py-0 px-2 rounded-full bg-[#D4F835] text-black font-black"
                >
                  {currentUser?.role === "admin" ? "Admin" : "Member"}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Household Member Profile
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
