"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  ChevronDown,
  Bell,
  Check,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { DataService } from "@/lib/data-service";
import { HouseholdMember } from "@/lib/types";
import {
  Language,
  getSavedLanguage,
  saveLanguage,
  TRANSLATIONS,
} from "@/lib/translations";
import {
  MEMBER_AVATARS,
  FLAG_IMAGES,
} from "@/lib/assets";

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

  const avatarInfo = currentUser ? MEMBER_AVATARS[currentUser.user_id] : null;
  const flagSrc = FLAG_IMAGES[currentLang];
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-border/80 bg-card/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 select-none">
      {/* Title & Subtitle */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <Link
          href="/dashboard"
          className="md:hidden h-8 w-8 relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden hover:scale-105 transition-transform"
          title="Family"
        >
          <Image
            src="/logo.svg"
            alt="Family"
            width={32}
            height={32}
            className="object-contain"
            priority
          />
        </Link>
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
        {/* Language Selector Pill with 3D Flag */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsLangMenuOpen(!isLangMenuOpen);
              setIsUserMenuOpen(false);
            }}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-secondary/80 hover:bg-secondary text-foreground text-xs font-bold transition-colors cursor-pointer border border-border/60"
            title="Choose Language"
          >
            {flagSrc ? (
              <div className="w-5 h-5 relative shrink-0">
                <Image
                  src={flagSrc}
                  alt={currentLang}
                  width={20}
                  height={20}
                  className="rounded-full object-contain"
                />
              </div>
            ) : (
              <Globe className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="hidden sm:inline">
              {currentLang === "hi"
                ? "हिन्दी"
                : currentLang === "hinglish"
                  ? "Hinglish"
                  : "English"}
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-border bg-card p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Select Language
              </div>
              <button
                type="button"
                onClick={() => handleSwitchLanguage("en")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${currentLang === "en"
                  ? "bg-[#E2F937] text-black"
                  : "hover:bg-secondary text-foreground"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={FLAG_IMAGES.en}
                    alt="English"
                    width={18}
                    height={18}
                    className="rounded-full object-contain"
                  />
                  <span>English</span>
                </div>
                {currentLang === "en" && (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleSwitchLanguage("hi")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${currentLang === "hi"
                  ? "bg-[#E2F937] text-black"
                  : "hover:bg-secondary text-foreground"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={FLAG_IMAGES.hi}
                    alt="Hindi"
                    width={18}
                    height={18}
                    className="rounded-full object-contain"
                  />
                  <span>हिन्दी</span>
                </div>
                {currentLang === "hi" && (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleSwitchLanguage("hinglish")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${currentLang === "hinglish"
                  ? "bg-[#E2F937] text-black"
                  : "hover:bg-secondary text-foreground"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={FLAG_IMAGES.hinglish}
                    alt="Hinglish"
                    width={18}
                    height={18}
                    className="rounded-full object-contain"
                  />
                  <span>Hinglish</span>
                </div>
                {currentLang === "hinglish" && (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Active Member Badge with 3D Character Avatar */}
        <div className="hidden md:flex items-center bg-[#0E0E10] text-white rounded-full py-1 px-3 gap-2 shadow-xs border border-zinc-800">
          <div className="h-7 w-7 rounded-full overflow-hidden bg-[#E2F937] text-black font-bold text-[10px] flex items-center justify-center shrink-0 relative">
            {avatarInfo?.image ? (
              <Image
                src={avatarInfo.image}
                alt={currentUser?.display_name || "User"}
                width={28}
                height={28}
                className="object-cover"
              />
            ) : (
              <span>{currentUser?.display_name?.slice(0, 1) || "A"}</span>
            )}
          </div>
          <span className="text-xs font-bold text-zinc-200 truncate max-w-[120px]">
            {currentUser?.display_name || "Amit"}
          </span>
          {avatarInfo?.roleBadge && (
            <div className="w-4 h-4 relative shrink-0">
              <Image
                src={avatarInfo.roleBadge}
                alt="Role"
                width={16}
                height={16}
                className="object-contain"
              />
            </div>
          )}
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
            className="gap-1.5 font-bold text-xs sm:text-sm px-3 sm:px-4 h-9 rounded-full bg-[#E2F937] text-black hover:bg-[#c5ea28] shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden xs:inline">{t.addExpense}</span>
            <span className="xs:hidden">Add</span>
          </Button>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Family Member Avatar Dropdown with 3D Avatar */}
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
            <div className="h-8 w-8 rounded-full overflow-hidden ring-1 ring-border bg-card flex items-center justify-center relative">
              {avatarInfo?.image ? (
                <Image
                  src={avatarInfo.image}
                  alt={currentUser?.display_name || "User"}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              ) : (
                <span className="text-xs font-black">
                  {currentUser?.display_name?.slice(0, 1) || "A"}
                </span>
              )}
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:inline" />
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-border bg-card p-3 text-foreground shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 pb-2 border-b border-border/60">
                <div className="h-11 w-11 rounded-2xl overflow-hidden bg-secondary relative shrink-0">
                  {avatarInfo?.image ? (
                    <Image
                      src={avatarInfo.image}
                      alt={currentUser?.display_name || "User"}
                      width={44}
                      height={44}
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-black truncate">
                      {currentUser?.display_name || "Amit"}
                    </p>
                    {avatarInfo?.roleBadge && (
                      <div className="w-4 h-4 relative shrink-0">
                        <Image
                          src={avatarInfo.roleBadge}
                          alt="Role"
                          width={16}
                          height={16}
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-[9px] py-0 px-1.5 mt-0.5 rounded-full bg-[#E2F937] text-black font-black"
                  >
                    {currentUser?.role === "admin" ? "Admin" : "Member"}
                  </Badge>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Active Household Profile
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
