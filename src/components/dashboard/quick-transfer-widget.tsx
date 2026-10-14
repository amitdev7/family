"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Check, Send } from "lucide-react";
import { HouseholdMember } from "@/lib/types";
import { formatINR } from "@/lib/formatters";

interface QuickTransferWidgetProps {
  members?: HouseholdMember[];
  onAddMemberClick?: () => void;
  onAddExpenseClick?: () => void;
}

const DEMO_AVATARS = [
  { id: "1", name: "Priya", bg: "bg-blue-400 text-white", initial: "P" },
  { id: "2", name: "Aarav", bg: "bg-amber-400 text-black", initial: "A" },
  { id: "3", name: "Diya", bg: "bg-pink-400 text-white", initial: "D" },
  { id: "4", name: "Ramesh", bg: "bg-emerald-400 text-black", initial: "R" },
  { id: "5", name: "Sunita", bg: "bg-purple-400 text-white", initial: "S" },
];

export function QuickTransferWidget({
  members,
  onAddMemberClick,
  onAddExpenseClick,
}: QuickTransferWidgetProps) {
  const [selectedId, setSelectedId] = useState<string>("1");
  const [amount, setAmount] = useState<string>("1000");
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const displayList = members && members.length > 0
    ? members.map((m, idx) => ({
      id: m.user_id,
      name: m.display_name.split(" ")[0],
      bg: DEMO_AVATARS[idx % DEMO_AVATARS.length].bg,
      initial: m.display_name.slice(0, 1).toUpperCase(),
    }))
    : DEMO_AVATARS;

  const handleSend = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSuccessMsg(`Sent ₹${amount} successfully!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }, 600);
  };

  return (
    <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs flex flex-col justify-between h-full select-none">
      {/* Title */}
      <div>
        <h3 className="font-bold text-lg text-foreground tracking-tight mb-5">
          Quick transfer
        </h3>

        {/* Avatars Row matching Figma image_20261014_111150.jpg */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {displayList.slice(0, 5).map((person) => {
            const isSelected = person.id === selectedId;

            return (
              <button
                key={person.id}
                type="button"
                onClick={() => setSelectedId(person.id)}
                className={`relative flex h-12 w-12 rounded-full items-center justify-center font-bold text-sm shrink-0 transition-transform cursor-pointer ${person.bg} ${isSelected
                  ? "ring-3 ring-black dark:ring-white scale-105 shadow-md"
                  : "hover:scale-105 opacity-90"
                  }`}
                title={person.name}
              >
                <span>{person.initial}</span>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-black text-white flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}

          {/* Dashed Add Circle */}
          <button
            type="button"
            onClick={() => {
              if (onAddMemberClick) onAddMemberClick();
              else window.dispatchEvent(new Event("open-who-are-you"));
            }}
            className="flex h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/60 hover:border-foreground items-center justify-center text-muted-foreground hover:text-foreground shrink-0 transition-colors cursor-pointer"
            title="Invite or add family member"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Amount Input Pill matching Figma */}
      <div className="my-4">
        <div className="flex items-center rounded-full bg-secondary/60 border border-border/80 px-5 py-2.5 focus-within:ring-2 focus-within:ring-[#D4F835] focus-within:bg-card transition-all">
          <span className="text-muted-foreground font-semibold text-sm mr-2">₹</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="w-full bg-transparent text-sm font-bold text-foreground focus:outline-none"
          />
        </div>
        {successMsg && (
          <p className="text-[11px] text-emerald-600 font-bold mt-1 text-center animate-in fade-in">
            {successMsg}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={handleSend}
          disabled={isSending}
          className="w-full py-3 rounded-full bg-[#0E0E10] text-white hover:bg-zinc-800 font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
        >
          <span>{isSending ? "Sending..." : "Send"}</span>
          <Send className="h-3.5 w-3.5" />
        </button>

        <div className="flex items-center gap-2">
          <Link
            href="/expenses"
            className="flex-1 py-2 rounded-full bg-secondary/80 hover:bg-secondary text-foreground text-xs font-semibold text-center transition-colors truncate"
          >
            View all &gt;
          </Link>
          <button
            type="button"
            onClick={() => {
              if (onAddExpenseClick) onAddExpenseClick();
              else window.dispatchEvent(new Event("open-add-expense"));
            }}
            className="flex-1 py-2 rounded-full bg-secondary/80 hover:bg-secondary text-foreground text-xs font-semibold text-center transition-colors truncate cursor-pointer"
          >
            + Add new card
          </button>
        </div>
      </div>
    </div>
  );
}

