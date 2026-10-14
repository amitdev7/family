"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { formatINR } from "@/lib/formatters";

interface LimeCardWidgetProps {
  balance?: number;
  creditLimit?: number;
  creditUsed?: number;
  cardName?: string;
  onAddCardClick?: () => void;
}

export function LimeCardWidget({
  balance = 85230.2,
  creditLimit = 22000,
  creditUsed = 0,
  cardName = "Household",
  onAddCardClick,
}: LimeCardWidgetProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText("4532 9423 8812 0628");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs flex flex-col justify-between h-full select-none">
      {/* Layered Card Stack matching Figma image_20261014_111145.jpg */}
      <div className="relative pt-4 mb-4">
        {/* Peeking Background Card: Platina */}
        <div className="absolute top-0 left-3 right-3 h-14 rounded-2xl bg-[#E5E7EB] dark:bg-zinc-800 text-muted-foreground px-4 py-2 flex items-center justify-between text-xs font-semibold shadow-xs">
          <span>Platina</span>
          <span>₹500.25</span>
        </div>

        {/* Foreground Electric Lime VISA Card */}
        <div
          onClick={handleCopy}
          className="relative z-10 rounded-[22px] bg-[#D4F835] text-black p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
          title="Click to copy card number"
        >
          {/* Card Top Row: Name & EMV Chip */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-extrabold text-base tracking-tight">
              {cardName}
            </span>

            {/* Realistic EMV Metallic Smart Chip */}
            <div className="h-7 w-9 rounded-md bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-400 border border-amber-500/30 flex items-center justify-center shadow-2xs">
              <div className="h-4 w-6 border-t border-b border-amber-600/40 grid grid-cols-2 gap-1">
                <div className="border-r border-amber-600/40" />
                <div />
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-black tracking-tight">
              {formatINR(balance)}
            </div>
            {isCopied && (
              <span className="text-[10px] font-bold text-black uppercase tracking-wider">
                Copied number!
              </span>
            )}
          </div>

          {/* Card Bottom Row: Masked Number, Expiry & VISA Logo */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-black/10">
            <div className="flex items-center gap-3 font-mono font-bold text-xs tracking-wider">
              <span>*9423</span>
              <span className="text-[11px] font-sans font-semibold">06/28</span>
            </div>

            {/* Bold VISA Logo */}
            <span className="font-black italic text-lg tracking-tighter leading-none">
              VISA
            </span>
          </div>
        </div>
      </div>

      {/* Credit Details Breakdown matching Figma */}
      <div className="space-y-2 py-2 text-xs font-semibold">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Credit limit</span>
          <span className="text-foreground font-bold">{formatINR(creditLimit)}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Credit used</span>
          <span className="text-foreground font-bold">{formatINR(creditUsed)}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Currency</span>
          <span className="text-foreground font-bold">INR</span>
        </div>
      </div>

      {/* Bottom Button matching Figma */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => {
            if (onAddCardClick) onAddCardClick();
            else alert("Add new payment card integration");
          }}
          className="w-full py-3 rounded-full bg-[#0E0E10] text-white hover:bg-zinc-800 font-bold text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add new card</span>
        </button>
      </div>
    </div>
  );
}

