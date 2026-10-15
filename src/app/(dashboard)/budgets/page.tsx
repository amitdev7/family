"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Plus,
  SlidersHorizontal,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Trash2,
  Calendar,
  User,
  Tag,
  X,
  CreditCard,
  Banknote,
  Send,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Modal } from "@/components/ui/modal";
import { DataService } from "@/lib/data-service";
import { Category, HouseholdMember, ReceivedMoney, MoneySummary } from "@/lib/types";
import { formatINR } from "@/lib/formatters";
import Image from "next/image";
import { CATEGORY_IMAGES, EMPTY_STATE_IMAGES, MEMBER_AVATARS, FEATURE_IMAGES } from "@/lib/assets";

const getMemberAvatar = (id?: string, name?: string) => {
  if (id && MEMBER_AVATARS[id]) return MEMBER_AVATARS[id];
  if (name) {
    const lower = name.toLowerCase();
    const found = Object.values(MEMBER_AVATARS).find(
      (a) => a.name.toLowerCase() === lower
    );
    if (found) return found;
  }
  return null;
};

const PRESET_AMOUNTS = [1000, 2000, 5000, 10000, 25000, 50000];

const ROLE_EMOJI_MAP: Record<string, string> = {
  Father: "👑",
  Mother: "🌸",
  Son: "🎓",
  Daughter: "🎨",
  Parent: "🏡",
  Child: "🧸",
  Admin: "⚡",
  Grandpa: "👴",
  Grandma: "👵",
};

export default function BudgetsPage() {
  const [summary, setSummary] = useState<MoneySummary | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [currentUser, setCurrentUser] = useState<HouseholdMember | null>(null);
  const [allReceived, setAllReceived] = useState<ReceivedMoney[]>([]);
  const [historyFilter, setHistoryFilter] = useState<"all" | "Cash" | "UPI" | "Bank Transfer">("all");

  // Category filter
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  // Receive Money Modal State
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [fromMemberId, setFromMemberId] = useState<string>("");
  const [customSenderName, setCustomSenderName] = useState<string>("");
  const [customRelationship, setCustomRelationship] = useState<string>("Father");
  const [amount, setAmount] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("general");
  // Default payment method is strictly "Cash" per user requirement
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "UPI" | "Bank Transfer" | "Card">("Cash");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set Budget Modal State
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [targetCategory, setTargetCategory] = useState<string>("all");
  const [targetBudgetAmount, setTargetBudgetAmount] = useState<string>("");
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  // Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [sum, cats, mems, received] = await Promise.all([
        DataService.getMoneySummary(),
        DataService.getCategories(),
        DataService.getMembers(),
        DataService.getReceivedMoney(),
      ]);
      setSummary(sum);
      setCategories(cats);
      setMembers(mems);
      setAllReceived(received);
      setCurrentUser(DataService.getCurrentUser());

      if (mems.length > 0 && !fromMemberId) {
        setFromMemberId(mems[0].user_id || mems[0].id);
      }
    } catch (err) {
      console.error("Failed to load budgets data:", err);
    }
  };

  useEffect(() => {
    loadData();

    const handleUserChanged = () => loadData();
    window.addEventListener("household-user-changed", handleUserChanged);
    return () => window.removeEventListener("household-user-changed", handleUserChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Receiving Money from a Family Member
  const handleReceiveMoneySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    try {
      setIsSubmitting(true);

      let senderName = customSenderName.trim();
      let senderRelation = customRelationship.trim();

      if (fromMemberId !== "other") {
        const found = members.find(
          (m) => m.id === fromMemberId || m.user_id === fromMemberId
        );
        if (found) {
          senderName = found.display_name;
          senderRelation = found.relationship || "Family Member";
        }
      }

      if (!senderName) senderName = "Family Member";

      await DataService.addReceivedMoney({
        from_member_id: fromMemberId !== "other" ? fromMemberId : undefined,
        from_member_name: senderName,
        relationship: senderRelation,
        amount: parsedAmount,
        category_id: categoryId === "general" ? undefined : categoryId,
        payment_method: paymentMethod, // Defaults to Cash
        date: date || new Date().toISOString().slice(0, 10),
        notes: notes.trim() || undefined,
      });

      // Reset form
      setAmount("");
      setNotes("");
      setCategoryId("general");
      setPaymentMethod("Cash");
      setIsReceiveModalOpen(false);

      setToastMsg(`Successfully recorded +₹${parsedAmount} received from ${senderName}!`);
      setTimeout(() => setToastMsg(null), 4000);

      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Deleting a received entry
  const handleDeleteReceived = async (id: string) => {
    if (confirm("Are you sure you want to delete this received money entry?")) {
      await DataService.deleteReceivedMoney(id);
      setToastMsg("Inflow record removed.");
      setTimeout(() => setToastMsg(null), 3000);
      await loadData();
    }
  };

  // Handle Adjusting Category Budget
  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(targetBudgetAmount);
    if (isNaN(val) || val <= 0) return;

    try {
      setIsSavingBudget(true);
      await DataService.setBudget({
        category_id: targetCategory === "all" ? null : targetCategory,
        amount: val,
      });
      setIsBudgetModalOpen(false);
      setTargetBudgetAmount("");
      setToastMsg("Budget target updated successfully!");
      setTimeout(() => setToastMsg(null), 3000);
      await loadData();
    } finally {
      setIsSavingBudget(false);
    }
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!summary?.byCategory) return [];
    if (selectedCategoryFilter === "all") return summary.byCategory;
    return summary.byCategory.filter((c) => c.categoryId === selectedCategoryFilter);
  }, [summary, selectedCategoryFilter]);

  // Filtered history entries
  const filteredHistory = useMemo(() => {
    if (historyFilter === "all") return allReceived;
    return allReceived.filter((entry) => (entry.payment_method || "Cash") === historyFilter);
  }, [allReceived, historyFilter]);

  // Overall calculations
  const totalReceived = summary?.totalReceived || 0;
  const totalSpent = summary?.totalSpent || 0;
  const moneyLeft = summary?.moneyLeft || 0;
  const spendPercent = totalReceived > 0 ? Math.min(Math.round((totalSpent / totalReceived) * 100), 100) : 0;
  const remainingPercent = totalReceived > 0 ? Math.max(Math.round((moneyLeft / totalReceived) * 100), 0) : 0;

  // Safe daily spend estimate
  const safeDailySpend = Math.max(0, Math.round(moneyLeft / 16));

  const activeUserRoleEmoji =
    ROLE_EMOJI_MAP[currentUser?.relationship || ""] ||
    ROLE_EMOJI_MAP[currentUser?.role || ""] ||
    "👑";

  return (
    <AppLayout title="Budget &amp; Inflow Planner">
      <div className="max-w-6xl mx-auto space-y-6 pb-16 select-none">
        {/* Floating Success Toast */}
        {toastMsg && (
          <div className="fixed top-20 right-6 z-50 p-3.5 px-5 rounded-2xl bg-[#0E0E10] text-[#D4F835] border border-[#D4F835]/40 shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#D4F835]" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Top Hero Banner in Obsidian Noir with Electric Lime & Live Pulse */}
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0E0E10] via-[#141418] to-[#1a1a22] border border-border/80 text-white p-6 sm:p-8 shadow-2xl card-hover-lift">
          {/* Ambient background glows */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#D4F835]/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar: Title, Active Member & Status Pill */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-14 w-14 rounded-2xl bg-[#D4F835] text-black font-black text-xl flex items-center justify-center shadow-lg shadow-[#D4F835]/20 shrink-0 transform transition-transform hover:scale-105 overflow-hidden">
                  {currentUser && (MEMBER_AVATARS[currentUser.user_id || currentUser.id || ""]?.image || getMemberAvatar(undefined, currentUser.display_name)?.image) ? (
                    <Image
                      src={
                        MEMBER_AVATARS[currentUser.user_id || currentUser.id || ""]?.image ||
                        getMemberAvatar(undefined, currentUser.display_name)!.image
                      }
                      alt={currentUser.display_name || "Active Member"}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <PieChart className="h-7 w-7 stroke-[2.2]" />
                  )}
                </div>
                <span
                  className="absolute -bottom-1 -right-1 text-sm bg-black/80 rounded-full p-0.5 border border-white/20 shadow-xs"
                  title={currentUser?.relationship || "Active User"}
                >
                  {activeUserRoleEmoji}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Family Budget &amp; Inflow Planner
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#D4F835]/20 text-[#D4F835] border border-[#D4F835]/40">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D4F835] animate-ping" />
                    Live Supabase Tracker
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                  Manage funds received from family members, category-level spending limits, and remaining balance.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center flex-wrap gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsReceiveModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#D4F835] hover:bg-[#c6ea27] text-black font-black text-xs sm:text-sm shadow-lg shadow-[#D4F835]/20 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>+ Receive Money</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBudgetModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer border border-white/10 shadow-xs active:scale-95"
              >
                <SlidersHorizontal className="h-4 w-4 text-[#D4F835]" />
                <span>Set Category Limit</span>
              </button>
            </div>
          </div>

          {/* 4 Hero Metric Cards: Received, Spent, Left, Safe Spend */}
          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-6">
            {/* 1. Total Received */}
            <div className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-4 transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Money Received
                </span>
                <div className="h-7 w-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ArrowDownLeft className="h-3.5 w-3.5 stroke-[2.5]" />
                </div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-black text-emerald-400 font-mono tracking-tight">
                +{formatINR(totalReceived)}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                From {summary?.byMember?.length || 0} family member{summary?.byMember?.length === 1 ? "" : "s"}
              </p>
            </div>

            {/* 2. Total Spent */}
            <div className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-4 transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Total Spent
                </span>
                <div className="h-7 w-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
                </div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-black text-rose-300 font-mono tracking-tight">
                -{formatINR(totalSpent)}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                {spendPercent}% of received funds utilized
              </p>
            </div>

            {/* 3. Money Left / Balance */}
            <div className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-4 transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Remaining Pool
                </span>
                <div className="h-7 w-7 rounded-xl bg-[#D4F835] text-black flex items-center justify-center font-bold">
                  <Wallet className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className={`mt-2 text-xl sm:text-2xl font-black font-mono tracking-tight ${moneyLeft >= 0 ? "text-[#D4F835]" : "text-rose-400"}`}>
                {formatINR(moneyLeft)}
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${moneyLeft >= 0 ? "bg-[#D4F835]" : "bg-rose-500"}`}
                  style={{ width: `${Math.min(remainingPercent, 100)}%` }}
                />
              </div>
            </div>

            {/* 4. Safe Daily Spend */}
            <div className="rounded-2xl bg-[#D4F835]/10 hover:bg-[#D4F835]/15 border border-[#D4F835]/30 p-4 transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#D4F835] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>Safe Daily Spend</span>
                </span>
                <div className="h-8 w-8 relative flex items-center justify-center shrink-0">
                  <Image
                    src={FEATURE_IMAGES.fuelGauge}
                    alt="Safe Daily Spend"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-black text-[#D4F835] font-mono tracking-tight">
                {formatINR(safeDailySpend)}/day
              </div>
              <p className="text-[11px] text-zinc-300 mt-1 font-semibold">
                {remainingPercent}% available surplus
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Family Contributors Breakdown ("Who gave money & how much") */}
        <div className="rounded-[28px] bg-card border border-border/80 p-6 sm:p-8 shadow-xs space-y-5 card-hover-lift">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                  <User className="h-5 w-5 text-[#D4F835]" />
                  <span>Family Money Contributions</span>
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {summary?.byMember?.length || 0} Members
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Breakdown of allowances and pocket money received from Father, Mother, and siblings
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsReceiveModalOpen(true)}
              className="px-4 py-2 rounded-full bg-[#0E0E10] text-white hover:bg-zinc-800 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
            >
              + Record Inflow
            </button>
          </div>

          {summary?.byMember && summary.byMember.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.byMember.map((m, idx) => {
                const colorPalette = [
                  "bg-amber-400 text-black",
                  "bg-[#D4F835] text-black",
                  "bg-blue-500 text-white",
                  "bg-purple-500 text-white",
                  "bg-emerald-500 text-white",
                ];
                const avatarBg = colorPalette[idx % colorPalette.length];
                const emoji = ROLE_EMOJI_MAP[m.relationship] || "👤";
                const memberAvatar = getMemberAvatar(m.memberId, m.memberName);

                return (
                  <div
                    key={m.memberId || idx}
                    className="p-4.5 rounded-2xl bg-secondary/40 border border-border/80 hover:border-[#D4F835]/60 transition-all space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`relative h-12 w-12 rounded-2xl ${avatarBg} flex items-center justify-center font-black text-base shadow-xs shrink-0 overflow-hidden`}>
                          {memberAvatar?.image ? (
                            <Image
                              src={memberAvatar.image}
                              alt={m.memberName}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <span>{m.memberName.charAt(0).toUpperCase()}</span>
                          )}
                          <span className="absolute -bottom-1 -right-1 text-xs bg-card rounded-full p-0.5 border border-border shadow-2xs">
                            {emoji}
                          </span>
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-foreground">
                            {m.memberName}
                          </p>
                          <span className="text-[11px] font-semibold text-muted-foreground">
                            {m.relationship || "Family Member"}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full bg-[#D4F835]/20 text-[#0E0E10] dark:text-[#D4F835] text-xs font-black">
                        {Math.round(m.percentage)}%
                      </span>
                    </div>

                    <div className="pt-1 flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Given This Month</span>
                      <span className="text-base sm:text-lg font-black text-foreground font-mono">
                        +{formatINR(m.amount)}
                      </span>
                    </div>

                    {/* Progress track */}
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-[#D4F835] rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(m.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-secondary/20 border border-dashed border-border text-center space-y-3 flex flex-col items-center">
              <div className="w-24 h-20 relative flex items-center justify-center mb-1">
                <Image
                  src={EMPTY_STATE_IMAGES.inflow}
                  alt="No money inflow recorded"
                  width={96}
                  height={80}
                  className="object-contain drop-shadow-md"
                />
              </div>
              <div>
                <p className="font-extrabold text-sm text-foreground">
                  No Family Money Inflow Recorded Yet
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Click the button below to record funds or an allowance from Amit, Ajay, or Chhotu. Cash is set as default!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReceiveModalOpen(true)}
                className="px-5 py-2.5 rounded-full bg-[#D4F835] hover:bg-[#c6ea27] text-black font-extrabold text-xs transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                + Record Received Money
              </button>
            </div>
          )}
        </div>

        {/* Section 2: Category Money Allocation & Remaining Report */}
        <div className="rounded-[28px] bg-card border border-border/80 p-6 sm:p-8 shadow-xs space-y-6 card-hover-lift">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                  <Tag className="h-5 w-5 text-[#D4F835]" />
                  <span>Category Allocation &amp; Remaining Balance</span>
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {summary?.byCategory?.length || 0} Categories
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select a category to view allocated funds vs. actual expenses and money left
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsBudgetModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto border border-border"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#D4F835]" />
              <span>Adjust Category Budget</span>
            </button>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategoryFilter === "all"
                  ? "bg-[#D4F835] text-black shadow-xs scale-102"
                  : "bg-secondary/70 text-muted-foreground hover:text-foreground"
              }`}
            >
              All Categories ({summary?.byCategory?.length || 0})
            </button>

            {summary?.byCategory?.map((cat) => (
              <button
                key={cat.categoryId}
                type="button"
                onClick={() => setSelectedCategoryFilter(cat.categoryId)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  selectedCategoryFilter === cat.categoryId
                    ? "bg-[#D4F835] text-black shadow-xs scale-102"
                    : "bg-secondary/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: cat.color || "#3b82f6" }}
                />
                <span>{cat.categoryName}</span>
              </button>
            ))}
          </div>

          {/* Category Cards Grid with Visual Fuel Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCategories.map((c) => {
              const allocated = c.allocated || 0;
              const spent = c.spent || 0;
              const left = c.left;
              const percentUsed = allocated > 0 ? Math.min(Math.round((spent / allocated) * 100), 100) : 0;
              const isOver = allocated > 0 ? spent > allocated : spent > 0 && allocated === 0;

              return (
                <div
                  key={c.categoryId}
                  className="p-5.5 rounded-2xl bg-secondary/30 border border-border/70 hover:border-[#D4F835]/70 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-11 w-11 rounded-2xl flex items-center justify-center font-bold text-lg shadow-2xs overflow-hidden border border-border/80 bg-secondary/80 shrink-0 relative"
                        style={{
                          backgroundColor: `${c.color || "#3b82f6"}25`,
                          color: c.color || "#3b82f6",
                        }}
                      >
                        {CATEGORY_IMAGES[c.categoryId] ? (
                          <Image
                            src={CATEGORY_IMAGES[c.categoryId]}
                            alt={c.categoryName}
                            width={36}
                            height={36}
                            className="object-contain p-0.5"
                          />
                        ) : (
                          c.icon || "🏷️"
                        )}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-foreground">
                          {c.categoryName}
                        </h4>
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {allocated > 0 ? `${percentUsed}% utilized` : "No specific limit"}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-black ${
                        isOver
                          ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          : left > 0
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {isOver ? "Over Budget ⚠️" : left > 0 ? `${formatINR(left)} Left 🟢` : "Zero Balance"}
                    </span>
                  </div>

                  {/* Numbers Grid: Allocated | Spent | Left */}
                  <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-card border border-border/60 text-center shadow-2xs">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Allocated
                      </p>
                      <p className="text-xs sm:text-sm font-black text-foreground font-mono mt-0.5">
                        {formatINR(allocated)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Spent
                      </p>
                      <p className="text-xs sm:text-sm font-black text-rose-500 font-mono mt-0.5">
                        {formatINR(spent)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Money Left
                      </p>
                      <p
                        className={`text-xs sm:text-sm font-black font-mono mt-0.5 ${
                          left >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                        }`}
                      >
                        {formatINR(left)}
                      </p>
                    </div>
                  </div>

                  {/* Dual Segmented Progress Bar */}
                  <div className="space-y-1">
                    <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isOver ? "bg-rose-500" : percentUsed > 80 ? "bg-amber-400" : "bg-[#D4F835]"
                        }`}
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                      <span>Spent: {formatINR(spent)}</span>
                      <span>Target: {formatINR(allocated)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCategories.length === 0 && (
            <div className="p-10 rounded-2xl bg-secondary/20 border border-dashed border-border text-center flex flex-col items-center justify-center gap-2">
              <div className="w-24 h-20 relative flex items-center justify-center mb-1">
                <Image
                  src={EMPTY_STATE_IMAGES.budgets}
                  alt="No budgets"
                  width={96}
                  height={80}
                  className="object-contain drop-shadow-md"
                />
              </div>
              <p className="font-bold text-sm text-foreground">No category budget targets found</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                No budget allocation is configured for this selection. Adjust or create category budget targets above.
              </p>
            </div>
          )}
        </div>

        {/* Section 3: Recent Money Received History Ledger with Filter Tabs */}
        <div className="rounded-[28px] bg-card border border-border/80 p-6 sm:p-8 shadow-xs space-y-5 card-hover-lift">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-emerald-500" />
                  <span>Recent Inflow History • Received Ledger</span>
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {allReceived.length} Records
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Every allowance or fund received from family members with payment method and notes
              </p>
            </div>

            {/* Filter Tabs for History */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-secondary/80 rounded-full p-1 border border-border">
              {(["all", "Cash", "UPI", "Bank Transfer"] as const).map((filterVal) => (
                <button
                  key={filterVal}
                  type="button"
                  onClick={() => setHistoryFilter(filterVal)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    historyFilter === filterVal
                      ? "bg-[#D4F835] text-black shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {filterVal === "all" ? "All" : filterVal === "Cash" ? "💵 Cash" : filterVal === "UPI" ? "⚡ UPI" : "🏦 Bank"}
                </button>
              ))}
            </div>
          </div>

          {filteredHistory.length > 0 ? (
            <div className="space-y-2.5">
              {filteredHistory.map((entry) => {
                const emoji = ROLE_EMOJI_MAP[entry.relationship || ""] || "👤";
                const isCash = !entry.payment_method || entry.payment_method === "Cash";
                const senderAvatar = getMemberAvatar(entry.from_member_id, entry.from_member_name);

                return (
                  <div
                    key={entry.id}
                    className="p-4 rounded-2xl bg-secondary/30 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-secondary/50 transition-all group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-11 w-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-lg shrink-0 shadow-2xs overflow-hidden relative">
                        {senderAvatar?.image ? (
                          <Image
                            src={senderAvatar.image}
                            alt={entry.from_member_name}
                            width={44}
                            height={44}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span>{emoji}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-foreground">
                            {entry.from_member_name}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary font-semibold text-muted-foreground">
                            {entry.relationship || "Family Member"}
                          </span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                            isCash
                              ? "bg-[#D4F835]/20 text-black dark:text-[#D4F835]"
                              : "bg-blue-500/15 text-blue-500"
                          }`}>
                            {isCash ? "💵 Cash" : "⚡ " + entry.payment_method}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{entry.date}</span>
                          </span>
                          {entry.notes && (
                            <span className="truncate max-w-xs text-foreground/80 font-medium">
                              • {entry.notes}
                            </span>
                          )}
                          {entry.category && (
                            <span className="text-primary font-bold">
                              [{entry.category.name}]
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Amount and Delete Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                      <div className="text-right">
                        <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          +{formatINR(entry.amount)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteReceived(entry.id)}
                        className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center text-muted-foreground text-xs rounded-2xl bg-secondary/20 border border-dashed border-border flex flex-col items-center justify-center gap-2">
              <div className="w-24 h-20 relative flex items-center justify-center mb-1">
                <Image
                  src={EMPTY_STATE_IMAGES.inflow}
                  alt="No inflow records"
                  width={96}
                  height={80}
                  className="object-contain drop-shadow-md"
                />
              </div>
              <p className="font-bold text-sm text-foreground">No inflow records matching this filter</p>
              <p className="text-xs text-muted-foreground">Switch payment filters or record money received from family members.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Receive Money from Family Member with Preset Pills & Visual Selector */}
      {isReceiveModalOpen && (
        <Modal
          isOpen={isReceiveModalOpen}
          onClose={() => setIsReceiveModalOpen(false)}
          maxWidth="md"
          hideCloseButton={true}
          className="p-6 sm:p-8 rounded-[32px] bg-card border-0 shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-5">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-[#D4F835] text-black flex items-center justify-center font-bold shadow-xs">
                <ArrowDownLeft className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-foreground">
                  Receive Money / Family Inflow
                </h3>
                <p className="text-xs text-muted-foreground">
                  Record funds received into the household pool
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsReceiveModalOpen(false)}
              className="h-8 w-8 rounded-full bg-secondary hover:bg-secondary/80 text-foreground flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleReceiveMoneySubmit} className="space-y-4.5">
            {/* Sender Selection */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Who gave this money? (Family Contributor)
              </label>
              <select
                value={fromMemberId}
                onChange={(e) => setFromMemberId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-secondary border border-border text-xs sm:text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.user_id || m.id}>
                    {ROLE_EMOJI_MAP[m.relationship || ""] || "👤"} {m.display_name} ({m.relationship || "Member"})
                  </option>
                ))}
                <option value="other">➕ Someone else / Custom Name</option>
              </select>
            </div>

            {/* Custom Sender Fields if selected */}
            {fromMemberId === "other" && (
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-secondary/50 border border-border/60 animate-in fade-in">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Papa, Chacha"
                    value={customSenderName}
                    onChange={(e) => setCustomSenderName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Father, Uncle"
                    value={customRelationship}
                    onChange={(e) => setCustomRelationship(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground"
                  />
                </div>
              </div>
            )}

            {/* Amount with Quick Preset Pills */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Amount Received (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-base font-black text-muted-foreground">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-secondary border border-border text-lg font-black text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
                />
              </div>

              {/* Preset Amount Chips */}
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-none py-0.5">
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    className="px-3 py-1 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-[11px] font-bold text-muted-foreground hover:text-foreground whitespace-nowrap cursor-pointer transition-colors"
                  >
                    +₹{val >= 1000 ? `${val / 1000}k` : val}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector (DEFAULT TO "Cash") */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Payment Method (Default: Cash)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["Cash", "UPI", "Bank Transfer", "Card"] as const).map((method) => {
                  const isSelected = paymentMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 border ${
                        isSelected
                          ? "bg-[#D4F835] text-black border-[#D4F835] shadow-xs"
                          : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {method === "Cash" && <Banknote className="h-4 w-4" />}
                      {method === "UPI" && <Send className="h-4 w-4" />}
                      {method === "Bank Transfer" && <Wallet className="h-4 w-4" />}
                      {method === "Card" && <CreditCard className="h-4 w-4" />}
                      <span className="truncate">{method}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Tagging */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Intended Category (Optional)
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-secondary border border-border text-xs sm:text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              >
                <option value="general">General Family Pool (No specific category)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Date Received
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-secondary border border-border text-xs font-semibold text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Notes / Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly allowance, grocery share"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-secondary border border-border text-xs font-semibold text-foreground"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsReceiveModalOpen(false)}
                className="flex-1 py-3 rounded-full border border-border text-xs sm:text-sm font-bold text-foreground hover:bg-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-full bg-[#D4F835] hover:bg-[#c6ea27] text-black font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Record Received Money"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 2: Adjust Monthly Category Budget */}
      {isBudgetModalOpen && (
        <Modal
          isOpen={isBudgetModalOpen}
          onClose={() => setIsBudgetModalOpen(false)}
          maxWidth="sm"
          hideCloseButton={true}
          className="p-6 rounded-[28px] bg-card border-0 shadow-2xl relative"
        >
          <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-4">
            <h3 className="text-lg font-bold text-foreground">
              Set Category Budget Target
            </h3>
            <button
              type="button"
              onClick={() => setIsBudgetModalOpen(false)}
              className="h-8 w-8 rounded-full bg-secondary hover:bg-secondary/80 text-foreground flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleBudgetSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Target Category
              </label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-secondary border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              >
                <option value="all">Overall Household Target</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Monthly Spending Limit (₹)
              </label>
              <input
                type="number"
                value={targetBudgetAmount}
                onChange={(e) => setTargetBudgetAmount(e.target.value)}
                placeholder="e.g. 25000"
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-secondary border border-border text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsBudgetModalOpen(false)}
                className="flex-1 py-2.5 rounded-full border border-border text-xs font-bold text-foreground hover:bg-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingBudget}
                className="flex-1 py-2.5 rounded-full bg-[#D4F835] hover:bg-[#c6ea27] text-black text-xs font-bold shadow-xs cursor-pointer"
              >
                {isSavingBudget ? "Saving..." : "Save Target"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}
