"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Check, Send, CheckCircle2 } from "lucide-react";
import { HouseholdMember } from "@/lib/types";

interface QuickTransferWidgetProps {
  members?: HouseholdMember[];
  onAddMemberClick?: () => void;
  onAddExpenseClick?: () => void;
}

const DEMO_AVATARS = [
  { id: "1", name: "Priya", role: "Mother", emoji: "🌸", bg: "bg-blue-500 text-white", initial: "P" },
  { id: "2", name: "Aarav", role: "Son", emoji: "🎓", bg: "bg-amber-400 text-black", initial: "A" },
  { id: "3", name: "Diya", role: "Daughter", emoji: "🎨", bg: "bg-pink-500 text-white", initial: "D" },
  { id: "4", name: "Ramesh", role: "Grandpa", emoji: "👴", bg: "bg-emerald-500 text-white", initial: "R" },
  { id: "5", name: "Sunita", role: "Grandma", emoji: "👵", bg: "bg-purple-500 text-white", initial: "S" },
];

const PRESET_AMOUNTS = ["500", "1000", "2000", "5000"];

export function QuickTransferWidget({
  members,
  onAddMemberClick,
  onAddExpenseClick,
}: QuickTransferWidgetProps) {
  const [selectedId, setSelectedId] = useState<string>(() => members?.[0]?.user_id || "1");
  const [amount, setAmount] = useState<string>("1000");
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (members && members.length > 0 && !members.some((m) => m.user_id === selectedId)) {
      setSelectedId(members[0].user_id);
    }
  }, [members, selectedId]);

  const displayList =
    members && members.length > 0
      ? members.map((m, idx) => ({
          id: m.user_id,
          name: m.display_name.split(" ")[0],
          role: m.relationship || m.role || "Member",
          emoji:
            m.relationship === "Father"
              ? "👑"
              : m.relationship === "Mother"
              ? "🌸"
              : m.relationship === "Son"
              ? "🎓"
              : m.relationship === "Daughter"
              ? "🎨"
              : "👤",
          bg: DEMO_AVATARS[idx % DEMO_AVATARS.length].bg,
          initial: m.display_name.slice(0, 1).toUpperCase(),
        }))
      : DEMO_AVATARS;

  const selectedPerson = displayList.find((p) => p.id === selectedId) || displayList[0];

  const handleSend = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSuccessMsg(`Sent ₹${amount} to ${selectedPerson.name} (${selectedPerson.role})!`);
      setTimeout(() => setSuccessMsg(null), 3500);
    }, 500);
  };

  return (
    <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs flex flex-col justify-between h-full select-none card-hover-lift">
      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-foreground tracking-tight">
              Quick Transfer
            </h3>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#D4F835] text-black">
              Zero Fee
            </span>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            Family Instant Pay
          </span>
        </div>

        {/* Avatars Row with Relationship Emojis & Online Indicators */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {displayList.slice(0, 5).map((person) => {
            const isSelected = person.id === selectedId;

            return (
              <div key={person.id} className="flex flex-col items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedId(person.id)}
                  className={`relative flex h-13 w-13 rounded-2xl items-center justify-center font-black text-sm transition-all cursor-pointer ${
                    person.bg
                  } ${
                    isSelected
                      ? "ring-3 ring-[#D4F835] ring-offset-2 ring-offset-card scale-105 shadow-md"
                      : "hover:scale-105 opacity-85 hover:opacity-100"
                  }`}
                  title={`${person.name} (${person.role})`}
                >
                  <span>{person.initial}</span>
                  <span className="absolute -bottom-1 -right-1 text-xs bg-card rounded-full p-0.5 border border-border shadow-2xs">
                    {person.emoji}
                  </span>
                  {isSelected && (
                    <div className="absolute -top-1.5 -left-1.5 h-4 w-4 rounded-full bg-black text-[#D4F835] flex items-center justify-center border border-white/20">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
                <span className="text-[11px] font-bold text-foreground truncate max-w-[54px] text-center">
                  {person.name}
                </span>
              </div>
            );
          })}

          {/* Add / Invite Circle */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onAddMemberClick) onAddMemberClick();
                else window.dispatchEvent(new Event("open-who-are-you"));
              }}
              className="flex h-13 w-13 rounded-2xl border-2 border-dashed border-border hover:border-foreground items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer hover:bg-secondary"
              title="Add or Switch family member"
            >
              <Plus className="h-5 w-5" />
            </button>
            <span className="text-[11px] font-semibold text-muted-foreground text-center">
              + New
            </span>
          </div>
        </div>
      </div>

      {/* Preset Amount Chips & Input */}
      <div className="my-3 space-y-2">
        <div className="flex items-center gap-1.5 justify-between">
          {PRESET_AMOUNTS.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(val)}
              className={`flex-1 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                amount === val
                  ? "bg-[#D4F835] text-black border-transparent shadow-xs"
                  : "bg-secondary/60 text-muted-foreground border-border hover:bg-secondary"
              }`}
            >
              ₹{val}
            </button>
          ))}
        </div>

        <div className="flex items-center rounded-2xl bg-secondary/60 border border-border px-4 py-2.5 focus-within:ring-2 focus-within:ring-[#D4F835] focus-within:bg-card transition-all">
          <span className="text-muted-foreground font-bold text-base mr-2">₹</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter custom amount"
            className="w-full bg-transparent text-sm font-black text-foreground focus:outline-none"
          />
          <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
            To: {selectedPerson.name}
          </span>
        </div>

        {successMsg && (
          <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleSend}
          disabled={isSending}
          className="w-full py-3 rounded-full bg-[#0E0E10] text-white hover:bg-zinc-800 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 active:scale-98"
        >
          {isSending ? (
            <span>Sending to {selectedPerson.name}...</span>
          ) : (
            <>
              <span>Send ₹{amount || 0} to {selectedPerson.name}</span>
              <Send className="h-3.5 w-3.5 text-[#D4F835]" />
            </>
          )}
        </button>

        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/expenses"
            className="flex-1 py-2 rounded-full bg-secondary text-foreground hover:bg-secondary/80 font-semibold text-center transition-colors truncate"
          >
            Transactions &gt;
          </Link>
          <button
            type="button"
            onClick={() => {
              if (onAddExpenseClick) onAddExpenseClick();
              else window.dispatchEvent(new Event("open-add-expense"));
            }}
            className="flex-1 py-2 rounded-full bg-secondary text-foreground hover:bg-secondary/80 font-semibold text-center transition-colors truncate cursor-pointer"
          >
            + Log Expense
          </button>
        </div>
      </div>
    </div>
  );
}
