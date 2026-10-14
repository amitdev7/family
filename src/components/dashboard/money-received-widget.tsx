"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Plus, Wallet, ChevronRight, X } from "lucide-react";
import { DataService } from "@/lib/data-service";
import { formatINR } from "@/lib/formatters";
import { Modal } from "@/components/ui/modal";
import { ReceivedMoney, HouseholdMember, Category } from "@/lib/types";

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

  const percentLeft = totalReceived > 0
    ? Math.max(0, Math.min(100, Math.round((moneyLeft / totalReceived) * 100)))
    : 0;

  const lastInflow = recentReceived[0];

  return (
    <>
      <div className="rounded-[28px] bg-gradient-to-b from-[#121216] via-[#0E0E10] to-[#0A0A0C] border border-zinc-800/80 p-6 shadow-2xl flex flex-col justify-between h-full select-none relative overflow-hidden group hover:border-[#D4F835]/40 transition-all duration-300">
        {/* Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#D4F835]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#D4F835]/20 transition-all" />

        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-[#D4F835] text-black flex items-center justify-center font-bold shadow-md">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Money Received
              </h3>
              <p className="text-[11px] font-semibold text-zinc-400">
                Inflow &amp; Cash Balance
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-[#D4F835]/15 text-[#D4F835] border border-[#D4F835]/30 text-[10px] font-extrabold uppercase tracking-wider">
            {percentLeft}% Left
          </span>
        </div>

        {/* Main Money Left Stat */}
        <div className="my-2 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Available Money Left
          </p>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl sm:text-4xl font-black tracking-tight ${moneyLeft >= 0 ? "text-[#D4F835]" : "text-rose-400"
                }`}
            >
              {formatINR(moneyLeft)}
            </span>
            <span className="text-xs font-semibold text-zinc-400">
              unspent
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full rounded-full bg-zinc-800/80 overflow-hidden mt-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${moneyLeft >= 0
                ? "bg-gradient-to-r from-emerald-400 to-[#D4F835]"
                : "bg-rose-500"
                }`}
              style={{ width: `${percentLeft}%` }}
            />
          </div>
        </div>

        {/* Dual Inflow & Outflow Pods */}
        <div className="grid grid-cols-2 gap-2.5 my-3">
          <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-zinc-400 block truncate">
                Received
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-white truncate block">
                {formatINR(totalReceived)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-zinc-400 block truncate">
                Spent
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-white truncate block">
                {formatINR(totalSpent)}
              </span>
            </div>
          </div>
        </div>

        {/* Last Provider Footnote */}
        {lastInflow ? (
          <div className="text-[11px] font-medium text-zinc-400 flex items-center justify-between pt-1">
            <span className="truncate">
              From <strong className="text-white">{lastInflow.from_member_name}</strong> ({lastInflow.relationship || "Family"})
            </span>
            <span className="font-bold text-white shrink-0 ml-2">
              +{formatINR(lastInflow.amount)}
            </span>
          </div>
        ) : (
          <div className="text-[11px] font-medium text-zinc-500 text-center py-0.5">
            Zero fake transactions • Record your first funds
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mt-3 pt-2 border-t border-zinc-800/60">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="py-2.5 px-3 rounded-full bg-[#D4F835] hover:bg-[#bce028] text-black text-xs font-black transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            <span>Receive Money</span>
          </button>

          <Link
            href="/budgets"
            className="py-2.5 px-3 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 text-center"
          >
            <span>Breakdown</span>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
          </Link>
        </div>
      </div>

      {/* Receive Money Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        hideCloseButton={true}
        className="p-6 sm:p-8 rounded-[32px] bg-card border-0 shadow-2xl max-h-[90vh] overflow-y-auto select-none"
      >
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#D4F835] text-black flex items-center justify-center font-bold">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight">
                Receive Money from Family
              </h3>
              <p className="text-xs text-muted-foreground font-semibold">
                Record pocket money, allowance, or funds given to you
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="h-8 w-8 rounded-full bg-secondary hover:bg-secondary/80 text-foreground flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Member Provider Picker */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Who gave you this money?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {members.map((m) => {
                const isSelected = fromMemberId === m.id || fromMemberId === m.user_id;
                return (
                  <button
                    key={m.id || m.user_id}
                    type="button"
                    onClick={() => setFromMemberId(m.id || m.user_id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2 ${isSelected
                      ? "border-[#D4F835] bg-[#D4F835]/15 text-foreground ring-1 ring-[#D4F835]"
                      : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary"
                      }`}
                  >
                    <div className="h-7 w-7 rounded-full bg-[#0E0E10] text-[#D4F835] dark:bg-white dark:text-black flex items-center justify-center text-xs font-black shrink-0">
                      {m.display_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {m.display_name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {m.relationship || "Member"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Amount Received (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-black text-foreground">
                ₹
              </span>
              <input
                type="number"
                step="1"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5000"
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-secondary/50 border border-border text-lg font-black text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              />
            </div>

            {/* Quick Amount Presets */}
            <div className="flex gap-2 mt-2">
              {[500, 1000, 2000, 5000, 10000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className="px-2.5 py-1 rounded-full bg-secondary text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/80 cursor-pointer transition-colors"
                >
                  +₹{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Category Scope */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              What can this money be spent on?
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835] cursor-pointer"
            >
              <option value="all">General / All Categories (Unrestricted)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method - Default to Cash */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Payment Method Received
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Cash", "UPI", "Bank Transfer"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${paymentMethod === method
                    ? "border-[#D4F835] bg-[#D4F835] text-black"
                    : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Purpose / Note */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Purpose / Note (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Monthly pocket money, college books, food..."
              className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
            />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-full py-3 rounded-full border border-border text-xs font-bold text-foreground hover:bg-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 rounded-full bg-[#D4F835] hover:bg-[#bce028] text-black text-xs font-black transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Record Funds"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
