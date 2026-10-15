"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, CheckCircle2 } from "lucide-react";
import { HouseholdMember } from "@/lib/types";
import { MEMBER_AVATARS, FEATURE_IMAGES } from "@/lib/assets";

interface QuickTransferWidgetProps {
  members?: HouseholdMember[];
  onAddExpenseClick?: () => void;
}

const DEMO_AVATARS = [
  { id: "usr-amit", name: "Amit", role: "Admin", emoji: "👑" },
  { id: "usr-ajay", name: "Ajay", role: "Member", emoji: "🌸" },
  { id: "usr-chhotu", name: "Chhotu", role: "Member", emoji: "🧸" },
];

const PRESET_AMOUNTS = ["500", "1000", "2000", "5000"];

export function QuickTransferWidget({
  members,
  onAddExpenseClick,
}: QuickTransferWidgetProps) {
  const [selectedId, setSelectedId] = useState<string>(() => members?.[0]?.user_id || "usr-amit");
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
      ? members.map((m) => {
        const match = DEMO_AVATARS.find((a) => a.id === m.user_id);
        const avatarInfo = MEMBER_AVATARS[m.user_id];
        return {
          id: m.user_id,
          name: m.display_name,
          role: m.relationship || (m.role === "admin" ? "Admin" : "Member"),
          emoji: match?.emoji || avatarInfo?.emoji || "👤",
          image: avatarInfo?.image,
          initial: m.display_name.slice(0, 1).toUpperCase(),
        };
      })
      : DEMO_AVATARS.map((d) => ({
        ...d,
        image: MEMBER_AVATARS[d.id]?.image,
        initial: d.name.slice(0, 1),
      }));

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

        {/* Avatars Row with 3D Character Avatars */}
        <div className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none">
          {displayList.slice(0, 5).map((person) => {
            const isSelected = person.id === selectedId;

            return (
              <div key={person.id} className="flex flex-col items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedId(person.id)}
                  className={`relative flex h-14 w-14 rounded-2xl items-center justify-center p-0.5 transition-all cursor-pointer ${isSelected
                    ? "ring-3 ring-[#D4F835] ring-offset-2 ring-offset-card scale-105 shadow-md bg-secondary/80"
                    : "hover:scale-105 opacity-85 hover:opacity-100 bg-secondary/30"
                    }`}
                  title={`${person.name} (${person.role})`}
                >
                  <div className="w-full h-full rounded-[14px] overflow-hidden flex items-center justify-center bg-secondary/50">
                    {person.image ? (
                      <Image
                        src={person.image}
                        alt={person.name}
                        width={56}
                        height={56}
                        className="object-cover"
                      />
                    ) : (
                      <span className="font-black text-sm">{person.initial}</span>
                    )}
                  </div>

                  <span className="absolute -bottom-1 -right-1 text-xs bg-card rounded-full p-0.5 border border-border shadow-2xs">
                    {person.emoji}
                  </span>

                  {isSelected && (
                    <div className="absolute -top-1.5 -left-1.5 h-4 w-4 rounded-full bg-[#D4F835] text-black flex items-center justify-center shadow-xs">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
                <span className="text-[11px] font-bold text-foreground truncate max-w-[56px] text-center">
                  {person.name}
                </span>
              </div>
            );
          })}
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
              className={`flex-1 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${amount === val
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
          className="w-full py-3 rounded-full bg-[#0E0E10] text-white hover:bg-zinc-800 font-bold text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs disabled:opacity-50 active:scale-98"
        >
          {isSending ? (
            <span>Sending to {selectedPerson.name}...</span>
          ) : (
            <>
              <div className="w-5 h-5 relative shrink-0">
                <Image
                  src={FEATURE_IMAGES.transferBeam}
                  alt="Transfer"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
              <span>Send ₹{amount || 0} to {selectedPerson.name}</span>
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
