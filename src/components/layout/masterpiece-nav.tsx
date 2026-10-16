"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  CreditCard,
  FileText,
  Download,
  Lock,
  ShoppingBag,
  ClipboardList,
  Users,
  Bell,
  Globe,
  ChevronDown,
  Check,
  Plus,
} from "lucide-react";
import { DataService } from "@/lib/data-service";
import { HouseholdMember } from "@/lib/types";
import {
  Language,
  getSavedLanguage,
  saveLanguage,
} from "@/lib/translations";
import { MEMBER_AVATARS, FLAG_IMAGES } from "@/lib/assets";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/expenses", label: "Expenses" },
  { href: "/budgets", label: "Budgets" },
  { href: "/categories", label: "Categories" },
  { href: "/reports", label: "Reports" },
];

interface MasterpieceNavProps {
  onAddExpenseClick?: () => void;
}

export function MasterpieceNav({ onAddExpenseClick }: MasterpieceNavProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<HouseholdMember | null>(null);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>("en");
  const [allMembers, setAllMembers] = useState<HouseholdMember[]>([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const syncState = () => {
    setCurrentUser(DataService.getCurrentUser());
    setCurrentLang(getSavedLanguage());
    DataService.getMembers().then((mems) => {
      if (mems && Array.isArray(mems)) {
        setAllMembers(mems);
      }
    });
  };

  useEffect(() => {
    syncState();
    const handleUserChanged = () => syncState();
    const handleLangChanged = () => setCurrentLang(getSavedLanguage());
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

  const handleSwitchUser = (userId: string) => {
    DataService.selectActiveUser(userId);
    setIsUserMenuOpen(false);
  };

  const avatarInfo = currentUser ? MEMBER_AVATARS[currentUser.user_id || currentUser.id || ""] : null;
  const flagSrc = FLAG_IMAGES[currentLang];

  return (
    <>
      {/* DESKTOP & TABLET TOP FLOATING ISLAND BAR */}
      <header className="w-full flex items-center justify-between h-14 mb-4 select-none">
        {/* LEFT: BRAND LOGO */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 group transition-transform active:scale-95"
            title="Family"
          >
            <div className="w-8 h-8 rounded-xl bg-[#111827] flex items-center justify-center shadow-md p-1 border border-white/10 group-hover:border-[#E2F937]/50 transition-colors">
              <Image
                src="/logo.svg"
                alt="Family Logo"
                width={22}
                height={22}
                className="object-contain"
                priority
              />
            </div>
            <span className="font-extrabold text-[17px] tracking-tight text-slate-900 dark:text-white">
              Family
            </span>
          </Link>

          {/* Split View Icon Button */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("toggle-split-inspector"))}
            className="w-7 h-7 rounded-full border border-slate-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:text-black hover:border-slate-400 active:scale-90 transition-all shadow-2xs"
            title="Toggle Split View"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
        </div>

        {/* CENTER: FLOATING DARK ISLAND CAPSULE */}
        <nav className="hidden lg:flex items-center bg-[#16171B] border border-white/10 rounded-full p-1 gap-1 shadow-xl">
          {/* Card Icon */}
          <div className="w-7 h-7 rounded-full bg-[#252830] flex items-center justify-center text-slate-400 ml-0.5">
            <CreditCard className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>

          {/* Navigation Links */}
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 active:scale-95 flex items-center gap-1.5 ${isActive
                  ? "bg-[#E2F937] text-slate-950 font-extrabold shadow-[0_0_14px_rgba(226,249,55,0.4)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                {isActive && <span className="text-[14px] leading-none">•</span>}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: UTILITY ICONS & PROFILE PILL */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 6 Circular Utility Buttons (Desktop) */}
          <div className="hidden xl:flex items-center gap-1.5">
            <Link
              href="/expenses"
              className="w-7 h-7 rounded-full border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-800/90 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-slate-300 transition-all active:scale-90 shadow-2xs"
              title="Documents & Receipts"
            >
              <FileText className="w-3.5 h-3.5 stroke-[2]" />
            </Link>
            <Link
              href="/reports"
              className="w-7 h-7 rounded-full border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-800/90 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-slate-300 transition-all active:scale-90 shadow-2xs"
              title="Export Statement"
            >
              <Download className="w-3.5 h-3.5 stroke-[2]" />
            </Link>
            <button
              type="button"
              onClick={() => alert("Family Vault is secure and encrypted.")}
              className="w-7 h-7 rounded-full border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-800/90 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-slate-300 transition-all active:scale-90 shadow-2xs"
              title="Secure Vault"
            >
              <Lock className="w-3.5 h-3.5 stroke-[2]" />
            </button>
            <Link
              href="/categories"
              className="w-7 h-7 rounded-full border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-800/90 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-slate-300 transition-all active:scale-90 shadow-2xs"
              title="Category Breakdown"
            >
              <ShoppingBag className="w-3.5 h-3.5 stroke-[2]" />
            </Link>
            <Link
              href="/budgets"
              className="w-7 h-7 rounded-full border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-800/90 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-slate-300 transition-all active:scale-90 shadow-2xs"
              title="Household Budgets"
            >
              <ClipboardList className="w-3.5 h-3.5 stroke-[2]" />
            </Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-who-are-you"))}
              className="w-7 h-7 rounded-full border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-800/90 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-slate-300 transition-all active:scale-90 shadow-2xs"
              title="Household Members"
            >
              <Users className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </div>

          {/* Notification Bell */}
          <div
            className="w-7 h-7 rounded-full border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-800/90 flex items-center justify-center text-slate-600 dark:text-zinc-300 relative cursor-pointer active:scale-90 transition-transform shadow-2xs"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5 stroke-[2]" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
          </div>

          {/* Language Selector Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsLangMenuOpen(!isLangMenuOpen);
                setIsUserMenuOpen(false);
              }}
              className="h-7 px-2.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-800/90 flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-zinc-200 hover:border-slate-300 transition-all active:scale-95 shadow-2xs"
              title="Switch Language"
            >
              {flagSrc ? (
                <div className="w-4 h-4 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={flagSrc}
                    alt={currentLang}
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                </div>
              ) : (
                <Globe className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="hidden sm:inline">
                {currentLang === "hi"
                  ? "हिन्दी"
                  : currentLang === "hinglish"
                    ? "Hinglish"
                    : "EN"}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Language Dropdown */}
            <AnimatePresence>
              {isLangMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute right-0 mt-2 w-40 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 shadow-2xl z-50"
                >
                  <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Language
                  </div>
                  {[
                    { id: "en", label: "English", flag: FLAG_IMAGES.en },
                    { id: "hi", label: "हिन्दी", flag: FLAG_IMAGES.hi },
                    { id: "hinglish", label: "Hinglish", flag: FLAG_IMAGES.hinglish },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSwitchLanguage(item.id as Language)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${currentLang === item.id
                        ? "bg-[#E2F937] text-slate-950"
                        : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={item.flag}
                          alt={item.label}
                          width={16}
                          height={16}
                          className="rounded-full object-contain"
                        />
                        <span>{item.label}</span>
                      </div>
                      {currentLang === item.id && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ACTIVE USER PROFILE PILL */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsUserMenuOpen(!isUserMenuOpen);
                setIsLangMenuOpen(false);
              }}
              className="flex items-center gap-2 bg-white/95 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full py-1 px-2.5 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all active:scale-95"
              title="Active Profile"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-[#E2F937] text-black font-extrabold text-[10px] flex items-center justify-center shrink-0 border border-black/10">
                {avatarInfo?.image ? (
                  <Image
                    src={avatarInfo.image}
                    alt={currentUser?.display_name || "User"}
                    width={24}
                    height={24}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span>{currentUser?.display_name?.slice(0, 1) || "A"}</span>
                )}
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                {currentUser?.display_name || "Amit"}
              </span>
              {avatarInfo?.roleBadge && (
                <div className="w-3.5 h-3.5 relative shrink-0">
                  <Image
                    src={avatarInfo.roleBadge}
                    alt="Role"
                    width={14}
                    height={14}
                    className="object-contain"
                  />
                </div>
              )}
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 shadow-2xl z-50 text-slate-900 dark:text-zinc-100"
                >
                  <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Switch Household Member
                  </div>
                  {allMembers.map((m) => {
                    const isSelected = (currentUser?.user_id || currentUser?.id) === (m.user_id || m.id);
                    const mAvatar = MEMBER_AVATARS[m.user_id || m.id || ""];

                    return (
                      <button
                        key={m.id || m.user_id}
                        type="button"
                        onClick={() => handleSwitchUser(m.id || m.user_id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${isSelected
                          ? "bg-[#E2F937] text-slate-950"
                          : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 shrink-0">
                            {mAvatar?.image ? (
                              <Image
                                src={mAvatar.image}
                                alt={m.display_name}
                                width={20}
                                height={20}
                                className="object-cover"
                              />
                            ) : null}
                          </div>
                          <span>{m.display_name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    );
                  })}
                  <div className="border-t border-slate-100 dark:border-zinc-800 mt-2 pt-1.5 px-2.5 text-[10px] text-slate-400">
                    3 Household Members (Offline Local Vault)
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM FLOATING DOCK */}
      <div className="lg:hidden fixed bottom-4 left-0 right-0 z-50 px-4 pointer-events-none flex justify-center">
        <nav className="pointer-events-auto bg-[#16171B]/95 backdrop-blur-xl border border-white/10 rounded-full px-2 py-1.5 flex items-center gap-1 shadow-2xl">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-tight transition-all duration-200 active:scale-90 flex items-center gap-1 ${isActive
                  ? "bg-[#E2F937] text-slate-950 shadow-[0_0_12px_rgba(226,249,55,0.4)]"
                  : "text-slate-400 hover:text-white"
                  }`}
              >
                {isActive && <span className="text-[12px] leading-none">•</span>}
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Quick Add CTA */}
          {onAddExpenseClick && (
            <button
              type="button"
              onClick={onAddExpenseClick}
              className="w-7 h-7 rounded-full bg-[#E2F937] text-black flex items-center justify-center font-bold shadow-md active:scale-90 transition-transform ml-1"
              title="Add Expense"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </nav>
      </div>
    </>
  );
}
