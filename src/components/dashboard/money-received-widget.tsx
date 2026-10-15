"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Wallet,
  Banknote,
  CheckCircle2,
} from "lucide-react";
import { DataService } from "@/lib/data-service";
import { formatINR } from "@/lib/formatters";
import { Modal } from "@/components/ui/modal";
import { ReceivedMoney, HouseholdMember, Category } from "@/lib/types";
import Image from "next/image";
import { EMPTY_STATE_IMAGES, MEMBER_AVATARS } from "@/lib/assets";

interface MoneyReceivedWidgetProps {
  onRefresh?: () => void;
}

export function MoneyReceivedWidget({ onRefresh }: MoneyReceivedWidgetProps) {
  const [totalReceived, setTotalReceived] = useState<number>(0);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [moneyLeft, setMoneyLeft] = useState<number>(0);
  const [recentReceived, setRecentReceived] = useState<ReceivedMoney[]>([]);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Add Received Money Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fromMemberId, setFromMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    const [summary, mems, cats] = await Promise.all([
      DataService.getMoneySummary(),
      DataService.getMembers(),
      DataService.getCategories(),
    ]);
    setTotalReceived(summary.totalReceived);
    setTotalSpent(summary.totalSpent);
    setMoneyLeft(summary.moneyLeft);
    setRecentReceived(summary.recentReceived);
    setMembers(mems);
    setCategories(cats);
    if (mems.length > 0 && !fromMemberId) {
      setFromMemberId(mems[0].id || mems[0].user_id);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    try {
      setIsSaving(true);
      const chosenMember = members.find(
        (m) => m.id === fromMemberId || m.user_id === fromMemberId
      );
      const current = DataService.getCurrentUser();

      await DataService.addReceivedMoney({
        from_member_id: fromMemberId || (members[0]?.user_id ?? "mem-1"),
        from_member_name: chosenMember?.display_name || "Family Member",
        relationship: chosenMember?.relationship || "Father",
        to_member_id: current.user_id,
        to_member_name: current.display_name,
        amount: val,
        date: new Date().toISOString().slice(0, 10),
        category_id: selectedCategoryId === "all" ? null : selectedCategoryId,
        notes: notes.trim() || "Allowance / Pocket Money",
        payment_method: paymentMethod,
      });

      setIsModalOpen(false);
      setAmount("");
      setNotes("");
      loadData();
      if (onRefresh) onRefresh();
    } finally {
      setIsSaving(false);
    }
  };

  const percentLeft =
    totalReceived > 0
      ? Math.max(0, Math.min(100, Math.round((moneyLeft / totalReceived) * 100)))
      : 0;


  return (
    <>
      <div className="rounded-[28px] bg-gradient-to-b from-[#141418] via-[#0E0E10] to-[#0A0A0C] border border-zinc-800 p-6 shadow-2xl flex flex-col justify-between h-full select-none relative overflow-hidden group card-hover-lift">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#D4F835]/15 rounded-full blur-3xl pointer-events-none group-hover:bg-[#D4F835]/25 transition-all" />

        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[#D4F835] text-black flex items-center justify-center font-bold shadow-xs">
                <Wallet className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-lg text-white tracking-tight">
                Money Received
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D4F835] text-black font-extrabold text-xs hover:bg-[#c5ea28] transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span>+ Receive</span>
            </button>
          </div>

          {/* Subtitle */}
          <p className="text-xs text-zinc-400 relative z-10 mb-4">
            Family member pocket money &amp; expense allowance tracker
          </p>
        </div>

        {/* Fuel Gauge Card */}
        <div className="relative z-10 p-4 rounded-2xl bg-white/5 border border-white/10 my-2 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Remaining Balance
            </span>
            <span
              className={`text-xs font-black px-2 py-0.5 rounded-full ${percentLeft > 40
                ? "bg-[#D4F835]/20 text-[#D4F835]"
                : percentLeft > 20
                  ? "bg-amber-400/20 text-amber-300"
                  : "bg-rose-500/20 text-rose-400"
                }`}
            >
              {percentLeft}% Left
            </span>
          </div>

          {/* Money Left Big Text */}
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            {formatINR(moneyLeft)}
          </div>

          {/* Dual Fuel Gauge Progress Bar */}
          <div className="space-y-1">
            <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden flex">
              <div
                className={`h-full transition-all duration-700 ${percentLeft > 40
                  ? "bg-[#D4F835]"
                  : percentLeft > 20
                    ? "bg-amber-400"
                    : "bg-rose-500"
                  }`}
                style={{ width: `${percentLeft}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-semibold pt-0.5">
              <span>Spent: {formatINR(totalSpent)}</span>
              <span>Total Inflow: {formatINR(totalReceived)}</span>
            </div>
          </div>
        </div>

        {/* Recent Inflow Mini Feed */}
        <div className="relative z-10 space-y-2 my-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            <span>Recent Inflows</span>
            <Link
              href="/budgets"
              className="text-[#D4F835] hover:underline normal-case text-xs"
            >
              View planner &gt;
            </Link>
          </div>

          {recentReceived.length === 0 ? (
            <div className="py-2 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-16 relative mb-1 flex items-center justify-center">
                <Image
                  src={EMPTY_STATE_IMAGES.inflow}
                  alt="No money received"
                  width={80}
                  height={64}
                  className="object-contain drop-shadow-md"
                />
              </div>
              <p className="text-[11px] text-zinc-400">
                No received money logged yet.
              </p>
            </div>
          ) : (
            recentReceived.slice(0, 2).map((item) => {
              const avatar =
                (item.from_member_id ? MEMBER_AVATARS[item.from_member_id] : null) ||
                Object.values(MEMBER_AVATARS).find(
                  (a) => a.name.toLowerCase() === item.from_member_name?.toLowerCase()
                );
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-lg overflow-hidden bg-white/10 shrink-0 relative flex items-center justify-center">
                      {avatar?.image ? (
                        <Image
                          src={avatar.image}
                          alt={item.from_member_name}
                          width={28}
                          height={28}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-xs">{avatar?.emoji || "👤"}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-xs truncate max-w-[120px]">
                        {item.from_member_name}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {item.date} • {item.payment_method || "Cash"}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-black text-emerald-400 text-xs">
                    +{formatINR(item.amount)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Info */}
        <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400 font-semibold">
          <span className="flex items-center gap-1">
            <Banknote className="h-3 w-3 text-[#D4F835]" />
            <span>Cash prioritized</span>
          </span>
          <Link href="/budgets" className="text-white hover:text-[#D4F835] font-bold">
            Budget Center &gt;
          </Link>
        </div>
      </div>

      {/* Receive Money Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Log Received Money from Family"
        >
          <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                Money received will be added to your balance and tracked against household spending.
              </span>
            </div>

            {/* From Family Member */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Received From Family Member
              </label>
              <select
                value={fromMemberId}
                onChange={(e) => setFromMemberId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-secondary border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.display_name} ({m.relationship || m.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Intended Category */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Intended Category (Optional)
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-secondary border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              >
                <option value="all">General / Pocket Money</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Amount Received (₹)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full px-4 py-2.5 rounded-2xl bg-secondary border border-border text-base font-black text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              />
            </div>

            {/* Payment Method - Cash Default */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Payment Method (Default: Cash)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Cash", "UPI", "Bank"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${paymentMethod === method
                      ? "bg-[#D4F835] text-black border-transparent shadow-xs"
                      : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
                      }`}
                  >
                    {method === "Cash" ? "💵 Cash" : method === "UPI" ? "⚡ UPI" : "🏦 Bank"}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes / Reason */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Notes / Purpose (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Monthly allowance, grocery money, gift"
                className="w-full px-4 py-2 rounded-2xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3 rounded-full bg-[#0E0E10] text-white hover:bg-zinc-800 font-bold text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? "Saving..." : "+ Record Received Money"}
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-3 rounded-full bg-secondary text-foreground hover:bg-secondary/80 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
