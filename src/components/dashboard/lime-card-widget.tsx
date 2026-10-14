"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { formatINR } from "@/lib/formatters";

interface LimeCardWidgetProps {
  balance?: number;
  creditLimit?: number;
  creditUsed?: number;
  currency?: string;
  onAddCardClick?: () => void;
}

export function LimeCardWidget({
  balance = 85230.2,
  creditLimit = 220000,
  creditUsed = 0,
  currency = "INR",
  onAddCardClick,
}: LimeCardWidgetProps) {
  const [activeTab, setActiveTab] = useState<"universal" | "platina">("universal");

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Stacked Card Presentation */}
      <div className="relative pt-3">
        {/* Platina Background Tab */}
        <div
          onClick={() => setActiveTab(activeTab === "universal" ? "platina" : "universal")}
          className="w-[92%] mx-auto h-12 -mb-8 rounded-t-2xl bg-muted/80 border-t border-x border-border/80 px-4 pt-2 flex items-center justify-between text-xs font-semibold text-muted-foreground cursor-pointer transition-transform hover:-translate-y-1"
        >
          <span>Platina</span>
          <span>₹50,000.00</span>
        </div>

        {/* Foreground Electric Lime Card */}
        <div className="relative rounded-2xl bg-[#D4F835] text-black p-5 shadow-md border border-[#c2e424] overflow-hidden">
          {/* Subtle noise/pattern accent */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold tracking-tight">Household</span>

            {/* Sim / EMV Chip */}
            <div className="h-7 w-9 rounded-md bg-stone-300 border border-stone-400/60 flex items-center justify-center p-0.5 shadow-2xs">
              <div className="w-full h-full border border-stone-400/80 rounded-[3px] grid grid-cols-2 gap-0.5 p-0.5">
                <div className="bg-stone-400/40 rounded-[1px]" />
                <div className="bg-stone-400/40 rounded-[1px]" />
                <div className="bg-stone-400/40 rounded-[1px]" />
                <div className="bg-stone-400/40 rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* Balance Amount */}
          <div className="my-3">
            <span className="text-2xl sm:text-3xl font-black tracking-tight">
              {formatINR(balance)}
            </span>
          </div>

          {/* Masked Card Number & VISA Brand */}
          <div className="flex items-center justify-between mt-4 pt-2 border-t border-black/10 text-xs font-bold">
            <span className="tracking-widest font-mono text-[11px] sm:text-xs">
              *9423 &nbsp;06/28
            </span>
            <span className="font-extrabold italic text-sm tracking-wider">
              VISA
            </span>
          </div>
        </div>
      </div>

      {/* Credit & Currency Details */}
      <div className="space-y-2 py-3 px-1 text-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Credit limit</span>
          <span className="font-bold text-foreground">{formatINR(creditLimit)}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Credit used</span>
          <span className="font-bold text-foreground">{formatINR(creditUsed)}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Currency</span>
          <span className="font-bold text-foreground">{currency}</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onAddCardClick}
        className="w-full py-3 px-4 rounded-full bg-[#0E0E10] hover:bg-black/90 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        <span>+ Add new card</span>
      </button>
    </div>
  );
}
