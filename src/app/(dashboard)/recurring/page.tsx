"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Modal } from "@/components/ui/modal";
import { DataService } from "@/lib/data-service";
import { RecurringExpense, Category, HouseholdMember, PaymentMethod } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/formatters";
import { Calendar, Wifi, Tv, Home, Mic, Plus, CheckCircle2, AlertCircle } from "lucide-react";

export default function RecurringExpensesPage() {
  const [recurringList, setRecurringList] = useState<RecurringExpense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allActiveToggle, setAllActiveToggle] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // New Recurring Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paidByUserId, setPaidByUserId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [recs, cats, mems] = await Promise.all([
        DataService.getRecurringExpenses(),
        DataService.getCategories(),
        DataService.getMembers(),
      ]);
      setRecurringList(recs);
      setCategories(cats);
      setMembers(mems);
      if (cats.length > 0) setCategoryId(cats[0].id);
      if (mems.length > 0) setPaidByUserId(mems[0].user_id);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeCount = recurringList.filter((r) => r.is_active).length;
  const pausedCount = recurringList.length - activeCount;

  const handleRecordNow = async (bill?: RecurringExpense) => {
    const target = bill || recurringList[0];
    if (!target) return;

    try {
      await DataService.addExpense({
        amount: target.amount,
        description: target.description,
        category_id: target.category_id,
        expense_date: new Date().toISOString().split("T")[0],
        paid_by_user_id: target.paid_by_user_id || DataService.getCurrentUser().user_id,
        created_by_user_id: DataService.getCurrentUser().user_id,
        payment_method: target.payment_method || "UPI",
        notes: "Recorded from Recurring Bills",
      });
      setToast(`Recorded bill: ${target.description} for ${formatINR(target.amount)}!`);
      setTimeout(() => setToast(null), 3500);
    } catch {
      setToast("Failed to record bill.");
    }
  };

  const handleToggleActive = async (bill: RecurringExpense) => {
    await DataService.toggleRecurringStatus(bill.id);
    loadData();
  };

  const handleCreateRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    try {
      setIsSaving(true);
      await DataService.addRecurringExpense({
        description: description.trim(),
        amount: parseFloat(amount),
        category_id: categoryId,
        frequency: "monthly",
        start_date: new Date().toISOString().split("T")[0],
        paid_by_user_id: paidByUserId,
        payment_method: "UPI",
      });
      setIsModalOpen(false);
      setDescription("");
      setAmount("");
      loadData();
      setToast("Recurring bill created!");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout title="Recurring Bills" subtitle="Fixed utilities, rents, and active subscriptions">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header Bar matching Figma */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-[#D4F835] text-black flex items-center justify-center font-bold shadow-xs">
              <Calendar className="h-5 w-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
              Recurring Bills
            </h2>
          </div>

          {/* Toggle All Active */}
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <span>All active</span>
            <button
              type="button"
              onClick={() => setAllActiveToggle(!allActiveToggle)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                allActiveToggle ? "bg-[#D4F835]" : "bg-muted"
              }`}
            >
              <div
                className={`h-5 w-5 rounded-full bg-black transition-transform absolute top-0.5 left-0.5 ${
                  allActiveToggle ? "translate-x-5" : "translate-x-0 bg-muted-foreground"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Black Status Pill matching Figma */}
        <div className="px-5 py-3 rounded-full bg-[#0E0E10] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm text-center">
          <span>{activeCount} Active</span>
          <span>•</span>
          <span>{pausedCount} Paused</span>
          <span>•</span>
          <span className="text-[#D4F835]">Next bill in 2 days</span>
        </div>

        {toast && (
          <div className="p-3.5 rounded-2xl bg-[#D4F835]/15 border border-[#D4F835]/30 text-foreground font-bold text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#D4F835]" />
            <span>{toast}</span>
          </div>
        )}

        {/* Recurring Bill Cards matching Figma */}
        <div className="space-y-4">
          {recurringList.map((item, idx) => {
            const isFiber = item.description.toLowerCase().includes("broadband") || item.description.toLowerCase().includes("airtel");
            const isStream = item.description.toLowerCase().includes("netflix") || item.description.toLowerCase().includes("spotify");
            const isRent = item.description.toLowerCase().includes("rent") || item.description.toLowerCase().includes("apartment");

            const iconClass = isFiber
              ? "bg-[#0E0E10] text-white"
              : isStream
              ? "bg-[#E50914] text-white"
              : isRent
              ? "bg-[#10B981] text-white"
              : "bg-muted text-foreground";

            const Icon = isFiber ? Wifi : isStream ? Tv : isRent ? Home : Calendar;

            return (
              <div
                key={item.id}
                className="rounded-[28px] bg-card border border-border p-6 shadow-xs flex flex-col justify-between space-y-4 transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Brand Icon & Title */}
                  <div className="flex items-center gap-3.5">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold shadow-xs ${iconClass}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-foreground leading-tight">
                        {item.description}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.category?.name || "Broadband"} • Monthly
                      </p>
                    </div>
                  </div>

                  {/* Right: Amount */}
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                      {formatINR(item.amount)}
                    </span>
                  </div>
                </div>

                {/* Footer: Due Countdown & Active/Paused Status */}
                <div className="flex items-center justify-between pt-2 border-t border-border/70 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Next due: {formatDate(item.next_occurrence)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(item)}
                    className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                      item.is_active
                        ? "bg-[#D4F835] text-black shadow-2xs"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.is_active ? "Active" : "Paused"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions: Record Now Black Button matching Figma */}
        <div className="pt-2 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => handleRecordNow()}
            className="w-full h-14 rounded-full bg-[#0E0E10] hover:bg-black/90 active:scale-98 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Mic className="h-4 w-4 text-[#D4F835]" />
            <span>Record Now</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full h-11 rounded-full border border-border bg-card hover:bg-muted font-bold text-xs text-foreground transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Add New Recurring Bill</span>
          </button>
        </div>
      </div>

      {/* Add Recurring Bill Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Recurring Bill"
          maxWidth="sm"
        >
          <form onSubmit={handleCreateRecurring} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Description
              </label>
              <input
                type="text"
                required
                placeholder="e.g. JioFiber Broadband"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-muted/60 border border-border text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Amount (INR)
              </label>
              <input
                type="number"
                required
                placeholder="999"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-muted/60 border border-border text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-11 rounded-full border border-border bg-card text-foreground font-bold text-xs hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="h-11 rounded-full bg-[#D4F835] hover:bg-[#c5ea28] active:scale-98 text-black font-extrabold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Add Bill"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}
