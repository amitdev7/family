"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  TrendingUp,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { formatINR } from "@/lib/formatters";
import { HouseholdMember } from "@/lib/types";
import { MEMBER_AVATARS, FEATURE_IMAGES } from "@/lib/assets";

interface DashboardHeroBannerProps {
  currentUser: HouseholdMember | null;
  totalBalance?: number;
  totalReceived?: number;
  totalSpent?: number;
  moneyLeft?: number;
  onAddExpenseClick: () => void;
  onReceiveMoneyClick: () => void;
}

export function DashboardHeroBanner({
  currentUser,
  totalBalance = 0,
  totalReceived = 0,
  totalSpent = 0,
  moneyLeft = 0,
  onAddExpenseClick,
  onReceiveMoneyClick,
}: DashboardHeroBannerProps) {

  const [greeting, setGreeting] = useState("Good day");
  const [greetingEmoji, setGreetingEmoji] = useState("✨");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();

      if (hour >= 4 && hour < 12) {
        setGreeting("Good morning");
        setGreetingEmoji("☀️");
      } else if (hour >= 12 && hour < 17) {
        setGreeting("Good afternoon");
        setGreetingEmoji("🌤️");
      } else if (hour >= 17 && hour < 22) {
        setGreeting("Good evening");
        setGreetingEmoji("🌇");
      } else {
        setGreeting("Good night");
        setGreetingEmoji("🌙");
      }

      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );

      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const safeToSpendDaily = Math.max(0, Math.round(moneyLeft / 16));

  const roleEmojiMap: Record<string, string> = {
    Father: "👑",
    Mother: "🌸",
    Son: "🎓",
    Daughter: "🎨",
    Parent: "🏡",
    Child: "🧸",
    Admin: "⚡",
  };

  const memberRoleEmoji =
    roleEmojiMap[currentUser?.relationship || ""] ||
    roleEmojiMap[currentUser?.role || ""] ||
    "👤";

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0E0E10] via-[#141418] to-[#1a1a22] border border-border/80 text-white p-5 sm:p-7 shadow-2xl card-hover-lift select-none">
      {/* Ambient background glows */}
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#D4F835]/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Dynamic Greeting & Real-time Status */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3.5">
          {/* Avatar with Status Ring */}
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl overflow-hidden bg-[#D4F835] text-black font-black text-lg flex items-center justify-center shadow-lg shadow-[#D4F835]/20 shrink-0 transform transition-transform hover:scale-105 relative">
              {currentUser && MEMBER_AVATARS[currentUser.user_id]?.image ? (
                <Image
                  src={MEMBER_AVATARS[currentUser.user_id].image}
                  alt={currentUser.display_name}
                  width={56}
                  height={56}
                  className="object-cover"
                />
              ) : (
                <span>{currentUser?.display_name?.slice(0, 1) || "A"}</span>
              )}
            </div>
            <span
              className="absolute -bottom-1 -right-1 text-sm bg-black/80 rounded-full p-0.5 border border-white/20 shadow-xs"
              title={currentUser?.relationship || "Active User"}
            >
              {memberRoleEmoji}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-zinc-400">
                {greeting}, {currentUser?.display_name?.split(" ")[0] || "Amit"} {greetingEmoji}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#D4F835]/20 text-[#D4F835] border border-[#D4F835]/40">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D4F835] animate-ping" />
                Live Household Hub
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Family Financial Overview
            </h2>
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex items-center flex-wrap gap-2.5 sm:self-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300">
            <Calendar className="h-3.5 w-3.5 text-[#D4F835]" />
            <span>{currentDate || "Today"}</span>
            <span className="text-white/20">•</span>
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            <span>{currentTime || "Live"}</span>
          </div>
        </div>
      </div>

      {/* Middle Row: 4 Metric Cards */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6">
        {/* Metric 1: Total Family Balance */}
        <div className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-4 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <span>Net Balance</span>
            </span>
            <div className="h-7 w-7 rounded-xl bg-[#D4F835]/20 text-[#D4F835] flex items-center justify-center">
              <Wallet className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-2xl font-black text-white tracking-tight font-mono">
            {formatINR(totalBalance)}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 mt-1">
            <TrendingUp className="h-3 w-3" />
            <span>{totalBalance >= 0 ? "Safe Positive Liquidity" : "Deficit Warning"}</span>
          </div>
        </div>

        {/* Metric 2: Money Received */}
        <div className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-4 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Received (Inflow)
            </span>
            <div className="h-7 w-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-2xl font-black text-emerald-400 tracking-tight font-mono">
            +{formatINR(totalReceived)}
          </div>
          <div className="text-[11px] font-semibold text-zinc-400 mt-1">
            From family transfers
          </div>
        </div>

        {/* Metric 3: Total Spent */}
        <div className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-4 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Total Spent
            </span>
            <div className="h-7 w-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-2xl font-black text-rose-300 tracking-tight font-mono">
            -{formatINR(totalSpent)}
          </div>
          <div className="text-[11px] font-semibold text-zinc-400 mt-1">
            Default Cash/UPI paid
          </div>
        </div>

        {/* Metric 4: Safe-to-Spend Daily Limit */}
        <div className="rounded-2xl bg-[#D4F835]/10 hover:bg-[#D4F835]/15 border border-[#D4F835]/30 p-4 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#D4F835] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>Safe Daily Spend</span>
            </span>
            <div className="h-8 w-8 relative flex items-center justify-center">
              <Image
                src={FEATURE_IMAGES.fuelGauge}
                alt="Fuel Gauge"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-2xl font-black text-[#D4F835] tracking-tight font-mono">
            {formatINR(safeToSpendDaily)}/day
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-300 mt-1">
            <CheckCircle2 className="h-3 w-3 text-[#D4F835]" />
            <span>{formatINR(moneyLeft)} safe balance</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Quick Action Buttons */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <div className="w-5 h-5 relative shrink-0">
            <Image
              src={FEATURE_IMAGES.securityShield}
              alt="Security Shield"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
          <span>Real-time Supabase Cloud Sync • Cash Priority Active</span>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={onReceiveMoneyClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer border border-white/20 shadow-xs active:scale-95"
          >
            <ArrowDownLeft className="h-3.5 w-3.5 text-[#D4F835]" />
            <span>Receive Money</span>
          </button>

          <button
            type="button"
            onClick={onAddExpenseClick}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#D4F835] hover:bg-[#c5ea28] text-black text-xs font-black transition-all cursor-pointer shadow-lg shadow-[#D4F835]/20 active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>+ Add Expense</span>
          </button>

          <Link
            href="/budgets"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors shadow-xs"
          >
            <span>Budget Plan</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
