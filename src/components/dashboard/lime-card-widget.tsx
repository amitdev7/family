"use client";

import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  Lock,
  Unlock,
  Wifi,
} from "lucide-react";
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
  const [showFullNumber, setShowFullNumber] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const cardNumber = "4532 9423 8812 0628";
  const maskedNumber = "•••• •••• •••• 9423";

  const handleCopy = () => {
    navigator.clipboard?.writeText(cardNumber.replace(/\s+/g, ""));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: (y / (rect.height / 2)) * -6,
      y: (x / (rect.width / 2)) * 6,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs flex flex-col justify-between h-full select-none card-hover-lift">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg text-foreground tracking-tight">
            Virtual Family Card
          </h3>
          <span
            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border transition-colors ${isFrozen
              ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              }`}
          >
            {isFrozen ? "Frozen ❄️" : "Active ⚡"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowFullNumber(!showFullNumber)}
          className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title={showFullNumber ? "Hide card number" : "Show card number"}
        >
          {showFullNumber ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Layered Card Stack with 3D Tilt */}
      <div className="relative pt-3 mb-4" style={{ perspective: "800px" }}>
        {/* Peeking Background Card: Platina */}
        <div className="absolute top-0 left-3 right-3 h-14 rounded-2xl bg-[#E5E7EB] dark:bg-zinc-800 text-muted-foreground px-4 py-2 flex items-center justify-between text-xs font-semibold shadow-xs">
          <span className="font-bold">Platina Primary</span>
          <span className="font-mono">₹500.25</span>
        </div>

        {/* Foreground Electric Lime VISA Card */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleCopy}
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 0.15s ease-out",
          }}
          className={`relative z-10 rounded-[24px] p-5.5 text-black shadow-xl hover:shadow-2xl cursor-pointer group overflow-hidden border border-black/10 ${isFrozen
            ? "bg-gradient-to-br from-zinc-300 via-zinc-400 to-zinc-500 text-zinc-900"
            : "bg-gradient-to-br from-[#D4F835] via-[#cbf02d] to-[#bde520]"
            }`}
          title="Click to copy card number"
        >
          {/* Subtle card grain / glare overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none opacity-60" />

          {/* Card Top Row: Name, Wi-Fi wave & Metallic EMV Chip */}
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="font-black text-base tracking-tight">
                {cardName}
              </span>
              <Wifi className="h-4 w-4 rotate-90 stroke-[2.5] opacity-80" />
            </div>

            {/* Realistic EMV Metallic Smart Chip */}
            <div className="h-7.5 w-10 rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-yellow-500 border border-amber-600/40 p-1 flex items-center justify-center shadow-xs">
              <div className="w-full h-full border border-amber-700/30 rounded-xs grid grid-cols-3 grid-rows-2 gap-0.5">
                <div className="border-r border-b border-amber-700/30" />
                <div className="border-r border-b border-amber-700/30 bg-amber-400/40" />
                <div className="border-b border-amber-700/30" />
                <div className="border-r border-amber-700/30" />
                <div className="border-r border-amber-700/30 bg-amber-400/40" />
                <div />
              </div>
            </div>
          </div>

          {/* Balance Amount */}
          <div className="my-2 relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-black/70">
              Available Limit
            </span>
            <div className="text-2xl sm:text-3xl font-black tracking-tight font-mono leading-tight">
              {formatINR(balance)}
            </div>
          </div>

          {/* Card Bottom Row: Card Number, Expiry, CVV & VISA */}
          <div className="pt-3 mt-2 border-t border-black/15 flex items-center justify-between relative z-10">
            <div>
              <div className="font-mono font-bold text-xs sm:text-sm tracking-wider">
                {showFullNumber ? cardNumber : maskedNumber}
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono mt-0.5 text-black/80 font-bold">
                <span>EXP: 06/28</span>
                <span>CVV: {showFullNumber ? "724" : "•••"}</span>
                {isCopied && (
                  <span className="text-black bg-white px-1.5 py-0.5 rounded-full text-[9px] font-extrabold shadow-xs animate-in fade-in">
                    Copied!
                  </span>
                )}
              </div>
            </div>

            {/* VISA Logo with Metallic Tag */}
            <div className="flex flex-col items-end">
              <span className="font-black italic text-xl tracking-tighter leading-none text-black">
                VISA
              </span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-black/60">
                Signature
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Details Breakdown with Clean Visuals */}
      <div className="space-y-2 py-1 text-xs font-semibold">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Card Holder</span>
          <span className="text-foreground font-bold">Amit Sharma (Admin)</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Credit limit</span>
          <span className="text-foreground font-bold font-mono">
            {formatINR(creditLimit)}
          </span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Credit used</span>
          <span className="text-foreground font-bold font-mono">
            {formatINR(creditUsed)}
          </span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Daily online spend</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
            Unlimited
          </span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button
          type="button"
          onClick={() => setIsFrozen(!isFrozen)}
          className={`py-2.5 rounded-full font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border ${isFrozen
            ? "bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20"
            : "bg-secondary text-foreground border-border hover:bg-secondary/80"
            }`}
        >
          {isFrozen ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
          <span>{isFrozen ? "Unfreeze" : "Freeze Card"}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onAddCardClick) onAddCardClick();
            else handleCopy();
          }}
          className="py-2.5 rounded-full bg-[#0E0E10] text-white hover:bg-zinc-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
        >
          {isCopied ? <Check className="h-3.5 w-3.5 text-[#D4F835]" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{isCopied ? "Copied" : "Copy Details"}</span>
        </button>
      </div>
    </div>
  );
}
