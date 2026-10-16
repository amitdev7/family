"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  UploadCloud,
  Zap,
  Banknote,
  CreditCard,
  Building,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";
import { Expense, Category, HouseholdMember } from "@/lib/types";
import { DataService } from "@/lib/data-service";
import { PAYMENT_3D_ICONS } from "@/lib/assets";

interface ExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (expense: Expense) => void;
  expenseToEdit?: Expense | null;
  initialExpense?: Expense | null;
}

const PAYMENT_METHOD_PILLS = [
  { name: "Cash", image: PAYMENT_3D_ICONS.cash, label: "Cash (Default)" },
  { name: "UPI", image: PAYMENT_3D_ICONS.upi, label: "UPI" },
  { name: "Credit Card", image: PAYMENT_3D_ICONS.card, label: "Credit Card" },
  { name: "Debit Card", image: PAYMENT_3D_ICONS.card, label: "Debit Card" },
  { name: "Net Banking", image: PAYMENT_3D_ICONS.bank, label: "Net Banking" },
];

const PRESET_EXPENSE_AMOUNTS = [100, 250, 500, 1000, 2000, 5000];

export function ExpenseDialog({
  isOpen,
  onClose,
  onSaved,
  expenseToEdit,
  initialExpense,
}: ExpenseDialogProps) {
  const activeExpense = expenseToEdit || initialExpense;

  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<HouseholdMember[]>([]);

  // Form fields matching Figma image_20261014_111601.jpg
  const [amount, setAmount] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [paidByUserId, setPaidByUserId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [expenseDate, setExpenseDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [receiptFile, setReceiptFile] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    DataService.getCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0 && !categoryId) setCategoryId(cats[0].id);
    });
    DataService.getMembers().then((mems) => {
      setMembers(mems);
      const curr = DataService.getCurrentUser();
      if (!paidByUserId) setPaidByUserId(curr?.user_id || mems[0]?.user_id || "");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeExpense) {
      setAmount(activeExpense.amount.toString());
      setDescription(activeExpense.description);
      setCategoryId(activeExpense.category_id);
      setPaidByUserId(activeExpense.paid_by_user_id);
      setPaymentMethod(activeExpense.payment_method);
      setExpenseDate(activeExpense.expense_date);
      setNotes(activeExpense.notes || "");
      setReceiptFile(activeExpense.receipt_path || null);
    } else {
      setAmount("");
      setDescription("");
      setExpenseDate(new Date().toISOString().slice(0, 10));
      setNotes("");
      setReceiptFile(null);
      setPaymentMethod("Cash");
    }
    setError(null);
  }, [activeExpense, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (!description.trim()) {
      setError("Please enter a description");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      let saved: Expense;
      if (activeExpense) {
        saved = await DataService.updateExpense(activeExpense.id, {
          amount: numAmount,
          description: description.trim(),
          category_id: categoryId,
          paid_by_user_id: paidByUserId,
          payment_method: paymentMethod,
          expense_date: expenseDate,
          notes: notes.trim() || null,
          receipt_path: receiptFile,
        });
      } else {
        saved = await DataService.addExpense({
          amount: numAmount,
          description: description.trim(),
          category_id: categoryId,
          paid_by_user_id: paidByUserId,
          payment_method: paymentMethod,
          expense_date: expenseDate,
          notes: notes.trim() || null,
          receipt_path: receiptFile,
        });
      }

      if (onSaved) onSaved(saved);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save expense");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedMember = members.find((m) => m.user_id === paidByUserId);
  const initials = selectedMember?.display_name
    ? selectedMember.display_name.slice(0, 2).toUpperCase()
    : "AS";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      hideCloseButton={true}
      className="p-6 sm:p-8 rounded-[32px] bg-card border-0 shadow-2xl max-h-[90vh] overflow-y-auto select-none"
    >
      {/* Header matching Figma image_20261014_111601.jpg */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-foreground tracking-tight">
          Expense Dialog
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Amount (INR) Input matching Figma */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">
            Amount (INR)
          </label>
          <div className="flex items-center px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border focus-within:ring-2 focus-within:ring-[#E2F937] focus-within:bg-card">
            <span className="text-base font-extrabold text-foreground mr-2">₹</span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="w-full bg-transparent text-base font-extrabold text-foreground focus:outline-none"
            />
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {PRESET_EXPENSE_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val.toString())}
                className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-bold text-[11px] transition-colors cursor-pointer"
              >
                +₹{val >= 1000 ? `${val / 1000}k` : val}
              </button>
            ))}
          </div>
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">
            Category
          </label>
          <div className="relative">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#E2F937] cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Weekly groceries from supermarket"
            required
            className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#E2F937]"
          />
        </div>

        {/* Paid by Dropdown with Initial Circle matching Figma */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">
            Paid by
          </label>
          <div className="relative">
            <select
              value={paidByUserId}
              onChange={(e) => setPaidByUserId(e.target.value)}
              className="w-full appearance-none pl-12 pr-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#E2F937] cursor-pointer"
            >
              {members.map((m) => (
                <option key={m.id} value={m.user_id}>
                  {m.display_name} ({m.relationship || (m.role === "admin" ? "Admin" : "Member")})
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[#E2F937] text-black font-bold text-[10px] flex items-center justify-center pointer-events-none">
              {initials}
            </div>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Payment Method Pills matching Figma */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">
            Payment Method
          </label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHOD_PILLS.map((pill) => {
              const isSelected = paymentMethod === pill.name;

              return (
                <button
                  key={pill.name}
                  type="button"
                  onClick={() => setPaymentMethod(pill.name)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${isSelected
                    ? "bg-[#E2F937] text-black shadow-xs ring-2 ring-black/10 scale-102"
                    : "bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                >
                  {pill.image && (
                    <Image
                      src={pill.image}
                      alt={pill.label}
                      width={16}
                      height={16}
                      className="object-contain"
                    />
                  )}
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Row */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">
            Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#E2F937]"
            />
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Receipt Upload Dropzone matching Figma */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">
            Receipt
          </label>
          <div
            onClick={() => setReceiptFile(receiptFile ? null : "attached_receipt.pdf")}
            className="rounded-2xl border-2 border-dashed border-[#E2F937] bg-[#E2F937]/5 hover:bg-[#E2F937]/10 p-4 text-center cursor-pointer transition-colors"
          >
            <div className="flex flex-col items-center justify-center">
              <UploadCloud className="h-6 w-6 text-[#E2F937] mb-1" />
              <p className="font-bold text-xs text-foreground">
                {receiptFile ? `Receipt attached: ${receiptFile}` : "Upload receipt"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                PDF, JPG or PNG • Max 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Add optional notes..."
            className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#E2F937]"
          />
        </div>

        {/* Save Black Pill Button matching Figma */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 rounded-full bg-[#0E0E10] text-white hover:bg-zinc-800 font-extrabold text-sm transition-colors cursor-pointer shadow-md disabled:opacity-50"
          >
            {isSaving ? "Saving Expense..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

