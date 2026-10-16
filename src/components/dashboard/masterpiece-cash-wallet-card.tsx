"use client";

import React, { useState } from "react";
import {
  CreditCard,
  ArrowRight,
  Plus,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";

interface MasterpieceCashWalletCardProps {
  availableCash?: number;
  onTransferClick?: () => void;
  onAddFundsClick?: () => void;
}

export function MasterpieceCashWalletCard({
  availableCash = 85000,
  onTransferClick,
  onAddFundsClick,
}: MasterpieceCashWalletCardProps) {
  const [activeCardIndex, setActiveCardIndex] = useState(1);
  const [transferToast, setTransferToast] = useState(false);

  const cards = [
    {
      id: "hdfc",
      title: "HDFC Priority",
      last4: "4443",
      type: "Bank Account",
      balance: "₹50,000",
      bgColor: "bg-gradient-to-br from-slate-900 to-slate-800 text-white",
      borderColor: "border-slate-700/60",
      pillBg: "bg-white/10 text-white",
    },
    {
      id: "cash",
      title: "Cash in Hand",
      last4: "VAULT",
      type: "Physical Liquid",
      balance: "₹35,000",
      bgColor: "bg-[#E2F937] text-slate-950",
      borderColor: "border-black/15",
      pillBg: "bg-black/10 text-black font-extrabold",
    },
    {
      id: "upi",
      title: "UPI FastPay",
      last4: "7122",
      type: "Instant VPA",
      balance: "₹12,450",
      bgColor: "bg-gradient-to-br from-indigo-900 to-slate-900 text-white",
      borderColor: "border-indigo-700/50",
      pillBg: "bg-white/10 text-white",
    },
  ];

  const handleQuickTransfer = () => {
    if (onTransferClick) {
      onTransferClick();
    } else {
      setTransferToast(true);
      setTimeout(() => setTransferToast(false), 3000);
    }
  };

  return (
    <div className="bg-white dark:bg-[#16171B] rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 border border-slate-200/90 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col justify-between transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] relative overflow-hidden group">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-white" />
            <h3 className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-slate-500 dark:text-zinc-400">
              Available Family Cash
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 dark:text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>3 Instruments Ready</span>
          </div>
        </div>

        {/* Main Big Cash Display */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 dark:text-white">
            {formatINR(availableCash)}
          </span>
          <span className="text-xs font-bold text-slate-400 dark:text-zinc-400">
            Instant Liquidity
          </span>
        </div>

        {/* 3 Mini Payment Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-4">
          {cards.map((c, idx) => {
            const isSelected = activeCardIndex === idx;

            return (
              <div
                key={c.id}
                onClick={() => setActiveCardIndex(idx)}
                className={`${c.bgColor} ${c.borderColor} border rounded-2xl p-3 flex flex-col justify-between h-28 relative cursor-pointer transition-all duration-200 shadow-sm active:scale-95 ${isSelected
                  ? "ring-2 ring-offset-2 ring-slate-900 dark:ring-[#E2F937] dark:ring-offset-[#16171B] scale-[1.02]"
                  : "opacity-85 hover:opacity-100"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.pillBg}`}>
                    {c.type}
                  </span>
                  <CreditCard className="w-3.5 h-3.5 opacity-70" />
                </div>

                <div>
                  <div className="text-[11px] font-bold opacity-80 leading-tight">
                    {c.title}
                  </div>
                  <div className="text-sm font-black tracking-tight mt-0.5">
                    {c.balance}
                  </div>
                </div>

                <div className="text-[9px] font-mono tracking-widest opacity-60">
                  •••• {c.last4}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-zinc-400">
          <Zap className="w-4 h-4 text-[#E2F937] fill-[#E2F937]" />
          <span>Zero-fee internal splits</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Add Funds */}
          {onAddFundsClick && (
            <button
              type="button"
              onClick={onAddFundsClick}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/20 active:scale-90 transition-all cursor-pointer"
              title="Add Funds"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}

          {/* Transfer Now Pill Button */}
          <button
            type="button"
            onClick={handleQuickTransfer}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#16171B] dark:bg-white text-white dark:text-slate-950 font-black text-xs shadow-md hover:bg-black dark:hover:bg-slate-100 active:scale-95 transition-all cursor-pointer group/btn"
          >
            <span>Transfer now</span>
            <div className="w-5 h-5 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center group-hover/btn:translate-x-0.5 transition-transform">
              <ArrowRight className="w-3 h-3 stroke-[3]" />
            </div>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {transferToast && (
        <div className="absolute bottom-4 left-4 right-4 bg-[#16171B] text-white p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xl border border-white/20 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#E2F937]" />
          <span>Internal family liquidity synced to Cash in Hand!</span>
        </div>
      )}
    </div>
  );
}

