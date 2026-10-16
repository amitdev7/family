"use client";

import React from "react";
import Image from "next/image";
import { TrendingUp, ShieldCheck } from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { MEMBER_AVATARS } from "@/lib/assets";

interface MasterpieceVelocityCardProps {
  totalBalance: number;
  totalSpent: number;
  runwayMonths?: number;
  monthlyTrendPct?: number;
  onMemberClick?: (memberId: string) => void;
  selectedMemberId?: string | null;
}

export function MasterpieceVelocityCard({
  totalBalance,
  totalSpent,
  runwayMonths = 2.8,
  monthlyTrendPct = 12.4,
  onMemberClick,
  selectedMemberId,
}: MasterpieceVelocityCardProps) {
  // Members with avatars & spent shares
  const members = [
    {
      id: "usr-amit",
      name: "Amit",
      role: "Admin",
      avatar: MEMBER_AVATARS["usr-amit"],
      position: "left-[24%]",
      share: "₹18,500",
    },
    {
      id: "usr-ajay",
      name: "Ajay",
      role: "Member",
      avatar: MEMBER_AVATARS["usr-ajay"],
      position: "left-[52%]",
      share: "₹14,200",
    },
    {
      id: "usr-chhotu",
      name: "Chhotu",
      role: "Junior",
      avatar: MEMBER_AVATARS["usr-chhotu"],
      position: "left-[80%]",
      share: "₹9,800",
    },
  ];

  return (
    <div className="bg-white dark:bg-[#16171B] rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 border border-slate-200/90 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col justify-between transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] relative overflow-hidden group">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#E2F937] ring-4 ring-[#E2F937]/30 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-slate-500 dark:text-zinc-400">
              Household Balance & Velocity
            </h3>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-black border border-emerald-200/70 dark:border-emerald-800/50 shadow-2xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{monthlyTrendPct}% vs last mo</span>
          </div>
        </div>

        {/* 3 Core Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {/* 1. Total Balance */}
          <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-3.5 border border-slate-100 dark:border-white/5">
            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-400 block mb-1">
              Total Household Balance
            </span>
            <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {formatINR(totalBalance > 0 ? totalBalance : 142500)}
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5">
              <ShieldCheck className="w-3 h-3" />
              <span>Full Family Vault Active</span>
            </span>
          </div>

          {/* 2. Spent this Month */}
          <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-3.5 border border-slate-100 dark:border-white/5">
            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-400 block mb-1">
              Spent this Month
            </span>
            <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {formatINR(totalSpent > 0 ? totalSpent : 42500)}
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 mt-0.5 block">
              34 family transactions
            </span>
          </div>

          {/* 3. Runway */}
          <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-3.5 border border-slate-100 dark:border-white/5">
            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-400 block mb-1">
              Financial Runway
            </span>
            <div className="text-xl sm:text-2xl font-black tracking-tight text-[#16171B] dark:text-[#E2F937] flex items-baseline gap-1">
              <span>{runwayMonths.toFixed(1)}</span>
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">months</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 mt-0.5 block">
              Optimal burn stability
            </span>
          </div>
        </div>
      </div>

      {/* Velocity Timeline with Segmented Hazard Track & Member Avatars */}
      <div className="mt-2 pt-3 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-zinc-400 mb-2">
          <span>Spend Velocity Timeline</span>
          <span className="text-slate-900 dark:text-white font-extrabold">Q4 Active Forecast</span>
        </div>

        {/* Hazard Striped Track */}
        <div className="relative py-4">
          {/* The Striped Hazard Track */}
          <div className="h-5 w-full rounded-full striped-hazard-track shadow-inner relative flex items-center px-1 border border-black/10">
            {/* Progress overlay */}
            <div
              className="h-3 rounded-full bg-[#16171B]/80 dark:bg-black/60 backdrop-blur-xs transition-all duration-700"
              style={{ width: "68%" }}
            />
          </div>

          {/* Member Floating Avatars sitting directly on the timeline */}
          <div className="relative w-full h-0">
            {members.map((m) => {
              const isSelected = selectedMemberId === m.id;
              return (
                <div
                  key={m.id}
                  className={`absolute -top-7 ${m.position} -translate-x-1/2 flex flex-col items-center group/avatar cursor-pointer z-10 transition-transform duration-200 active:scale-95`}
                  onClick={() => onMemberClick?.(m.id)}
                >
                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 pointer-events-none mb-1 bg-[#16171B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap border border-white/10 flex items-center gap-1">
                    <span>{m.name}:</span>
                    <span className="text-[#E2F937] font-black">{m.share}</span>
                  </div>

                  {/* Avatar Bubble */}
                  <div
                    className={`w-9 h-9 rounded-full overflow-hidden bg-[#E2F937] p-0.5 shadow-md border-2 transition-all ${
                      isSelected
                        ? "border-[#16171B] dark:border-white ring-4 ring-[#E2F937]"
                        : "border-white dark:border-[#16171B] group-hover/avatar:scale-110"
                    }`}
                  >
                    {m.avatar?.image ? (
                      <Image
                        src={m.avatar.image}
                        alt={m.name}
                        width={36}
                        height={36}
                        className="object-cover rounded-full"
                      />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center font-black text-xs text-black">
                        {m.name[0]}
                      </span>
                    )}
                  </div>

                  {/* Role Icon */}
                  {m.avatar?.roleBadge && (
                    <div className="w-3.5 h-3.5 -mt-2 relative z-20">
                      <Image
                        src={m.avatar.roleBadge}
                        alt={m.role}
                        width={14}
                        height={14}
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Month labels under the track */}
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-2 mt-3">
          <span>Sep</span>
          <span className="text-slate-900 dark:text-[#E2F937] font-extrabold">Oct (Current)</span>
          <span>Nov</span>
          <span>Dec</span>
        </div>
      </div>
    </div>
  );
}
