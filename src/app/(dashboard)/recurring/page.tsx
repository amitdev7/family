"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Repeat,
  Plus,
  CheckCircle2,
  Calendar,
  Edit2,
  PlayCircle,
  PauseCircle,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { CategoryIcon } from "@/components/ui/category-icon";
import { EmptyState } from "@/components/ui/empty-state";
import { DataService } from "@/lib/data-service";
import { RecurringExpense, Category, HouseholdMember, PAYMENT_METHODS, PaymentMethod } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/formatters";
import { recurringExpenseFormSchema } from "@/lib/validations";

type RecurrenceType = "weekly" | "monthly" | "quarterly" | "yearly";

export default function RecurringExpensesPage() {
  const [recurringList, setRecurringList] = useState<RecurringExpense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringExpense | null>(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [frequency, setFrequency] = useState<RecurrenceType>("monthly");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [paidByUserId, setPaidByUserId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [formError, setFormError] = useState<string | null>(null);
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
      if (!categoryId && cats.length > 0) setCategoryId(cats[0].id);
      if (!paidByUserId && mems.length > 0) setPaidByUserId(mems[0].user_id);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, paidByUserId]);

  useEffect(() => {
    loadData();
    const handleUserChanged = () => loadData();
    window.addEventListener("household-user-changed", handleUserChanged);
    return () => window.removeEventListener("household-user-changed", handleUserChanged);
  }, [loadData]);

  const openModal = (existing?: RecurringExpense) => {
    setFormError(null);
    if (existing) {
      setEditingItem(existing);
      setDescription(existing.description);
      setAmount(existing.amount.toString());
      setCategoryId(existing.category_id);
      setFrequency(existing.frequency);
      setStartDate(existing.start_date);
      setPaidByUserId(existing.paid_by_user_id);
      setPaymentMethod(existing.payment_method);
    } else {
      setEditingItem(null);
      setDescription("");
      setAmount("");
      setCategoryId(categories[0]?.id || "");
      setFrequency("monthly");
      setStartDate(new Date().toISOString().split("T")[0]);
      setPaidByUserId(members[0]?.user_id || "");
      setPaymentMethod("UPI");
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validation = recurringExpenseFormSchema.safeParse({
      amount,
      description,
      category_id: categoryId,
      frequency,
      start_date: startDate,
      paid_by_user_id: paidByUserId,
      payment_method: paymentMethod,
    });

    if (!validation.success) {
      setFormError(validation.error.issues[0]?.message || "Invalid input");
      return;
    }

    try {
      setIsSaving(true);
      await DataService.saveRecurringExpense({
        id: editingItem?.id,
        ...validation.data,
        next_occurrence: editingItem?.next_occurrence || startDate,
        is_active: editingItem ? editingItem.is_active : true,
        paid_by_user_id: validation.data.paid_by_user_id,
        created_by_user_id: DataService.getCurrentUser().user_id,
      });
      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save recurring bill");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecordPayment = async (rec: RecurringExpense) => {
    try {
      const exp = await DataService.recordRecurringPayment(rec.id);
      setActionSuccess(`Recorded ${formatINR(exp.amount)} for ${rec.description}. Next cycle set to ${rec.next_occurrence}`);
      setTimeout(() => setActionSuccess(null), 5000);
      loadData();
    } catch (err: unknown) {
      alert("Failed: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const toggleStatus = async (rec: RecurringExpense) => {
    rec.is_active = !rec.is_active;
    await DataService.saveRecurringExpense(rec);
    loadData();
  };

  return (
    <AppLayout
      title="Recurring Expenses & Bills"
      subtitle="Automated reminders and scheduled bills for rent, utilities, and subscriptions"
    >
      {/* Toast Feedback */}
      {actionSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground">
            {recurringList.filter((r) => r.is_active).length} Active Scheduled Bills
          </h3>
        </div>

        <Button
          size="sm"
          onClick={() => openModal()}
          className="gap-1.5 text-xs font-semibold"
        >
          <Plus className="h-4 w-4" />
          <span>New Recurring Bill</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-card border border-border" />
          ))}
        </div>
      ) : recurringList.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No recurring expenses configured"
          description="Add repeating bills like apartment rent, electricity, broadband, or mobile recharge to never miss a due date."
          action={
            <Button onClick={() => openModal()} size="sm" className="gap-2 font-semibold">
              <Plus className="h-4 w-4" />
              <span>Add Recurring Bill</span>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {recurringList.map((rec) => (
            <Card
              key={rec.id}
              className={`p-4 transition-all hover:border-primary/40 ${!rec.is_active ? "opacity-60 bg-muted/20" : ""
                }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-xs shrink-0 mt-0.5"
                    style={{ backgroundColor: rec.category?.color || "#124334" }}
                  >
                    <CategoryIcon name={rec.category?.icon || "Repeat"} className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-base text-foreground">{rec.description}</h4>
                      <Badge variant="outline" className="text-[10px] capitalize font-medium">
                        {rec.frequency}
                      </Badge>
                      {rec.is_active ? (
                        <Badge variant="success" className="text-[10px]">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Paused</Badge>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Next Due: <strong className="text-foreground">{formatDate(rec.next_occurrence)}</strong>
                      </span>
                      <span>•</span>
                      <span>Category: {rec.category?.name}</span>
                      <span>•</span>
                      <span>Payer: {rec.paid_by?.display_name || "Family"} via {rec.payment_method}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-border/60">
                  <span className="text-xl font-extrabold text-foreground">
                    {formatINR(rec.amount)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {rec.is_active && (
                      <Button
                        size="sm"
                        onClick={() => handleRecordPayment(rec)}
                        className="gap-1.5 text-xs font-semibold"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Record as Paid</span>
                      </Button>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleStatus(rec)}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title={rec.is_active ? "Pause" : "Resume"}
                    >
                      {rec.is_active ? (
                        <PauseCircle className="h-4 w-4" />
                      ) : (
                        <PlayCircle className="h-4 w-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => openModal(rec)}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Recurring Bill Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Recurring Bill" : "Configure Scheduled Bill"}
        description="Set recurring schedule and payment details"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Bill Description <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. Monthly Rent, BESCOM Electricity, Airtel Fiber"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Amount (₹ INR) <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-muted-foreground">₹</span>
                <Input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Recurrence Frequency <span className="text-destructive">*</span>
              </label>
              <Select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecurrenceType)}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Category <span className="text-destructive">*</span>
              </label>
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Start / Next Date <span className="text-destructive">*</span>
              </label>
              <Input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Default Payer <span className="text-destructive">*</span>
              </label>
              <Select
                value={paidByUserId}
                onChange={(e) => setPaidByUserId(e.target.value)}
              >
                {members.map((m) => (
                  <option key={m.id} value={m.user_id}>
                    {m.display_name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Payment Method
              </label>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Save Recurring Bill
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}

