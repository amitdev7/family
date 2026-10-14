"use client";

import React, { useState, useEffect } from "react";
import { Plus, Check, Send } from "lucide-react";
import { DataService } from "@/lib/data-service";
import { HouseholdMember } from "@/lib/types";
import { formatINR } from "@/lib/formatters";

export function QuickTransferWidget() {
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [amount, setAmount] = useState("1000");
  const [sentSuccess, setSentSuccess] = useState<string | null>(null);

  useEffect(() => {
    DataService.getMembers().then((mems) => {
      setMembers(mems);
      if (mems.length > 0) {
        setSelectedMemberId(mems[0].id);
      }
    });

    const handleUpdate = () => {
      DataService.getMembers().then(setMembers);
    };
    window.addEventListener("household-user-changed", handleUpdate);
    return () => window.removeEventListener("household-user-changed", handleUpdate);
  }, []);

  const handleSend = () => {
    const target = members.find((m) => m.id === selectedMemberId);
    if (!target) return;

    setSentSuccess(`Transferred ${formatINR(Number(amount) || 1000)} to ${target.display_name}!`);
    setTimeout(() => setSentSuccess(null), 3000);
  };

  const handleOpenWhoAreYou = () => {
    window.dispatchEvent(new Event("open-who-are-you"));
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight mb-3">
          Quick transfer
        </h3>

        {/* Member Avatars Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {members.map((member) => {
            const isSelected = member.id === selectedMemberId;
            const initials = member.display_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelectedMemberId(member.id)}
                className={`relative h-12 w-12 rounded-full shrink-0 flex items-center justify-center font-bold text-xs text-white transition-all cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-offset-2 ring-black dark:ring-white scale-105"
                    : "opacity-85 hover:opacity-100"
                }`}
                style={{ backgroundColor: member.color || "#3B82F6" }}
                title={`${member.display_name} (${member.relationship || member.role})`}
              >
                <span>{initials}</span>
                {isSelected && (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-black text-white flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}

          {/* Dashed Add Member Button */}
          <button
            type="button"
            onClick={handleOpenWhoAreYou}
            className="h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/40 hover:border-foreground flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer"
            title="Add or invite family member"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Amount Input */}
        <div className="mt-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
              ₹
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
              className="w-full h-12 pl-9 pr-4 rounded-full bg-muted/60 border border-border text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
            />
          </div>
        </div>

        {sentSuccess && (
          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2 text-center animate-in fade-in">
            {sentSuccess}
          </p>
        )}
      </div>

      {/* Send Button */}
      <button
        type="button"
        onClick={handleSend}
        className="w-full mt-4 py-3.5 px-4 rounded-full bg-[#0E0E10] hover:bg-black/90 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
      >
        <Send className="h-3.5 w-3.5" />
        <span>Send</span>
      </button>
    </div>
  );
}
