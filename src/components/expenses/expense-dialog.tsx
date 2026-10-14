"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Expense, Category, HouseholdMember, PaymentMethod } from "@/lib/types";
import { DataService } from "@/lib/data-service";
import { expenseFormSchema } from "@/lib/validations";
import { Upload, AlertCircle, Zap, Banknote, CreditCard, Landmark, Check } from "lucide-react";

interface ExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (expense: Expense) => void;
  expenseToEdit?: Expense | null;
}

const PAYMENT_METHOD_OPTIONS: { id: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { id: "UPI", label: "UPI", icon: Zap },
  { id: "Cash", label: "Cash", icon: Banknote },
  { id: "Credit Card", label: "Credit Card", icon: CreditCard },
  { id: "Debit Card", label: "Debit Card", icon: CreditCard },
  { id: "Net Banking", label: "Net Banking", icon: Landmark },
];

export function ExpenseDialog({
  isOpen,
  onClose,
  onSaved,
  expenseToEdit,
}: ExpenseDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [expenseDate, setExpenseDate] = useState<string>("");
  const [paidByUserId, setPaidByUserId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    DataService.getCategories().then((cats) => {
      setCategories(cats);
      if (!categoryId && cats.length > 0) {
        setCategoryId(cats[0].id);
      }
    });
    DataService.getMembers().then((mems) => {
      setMembers(mems);
      if (!paidByUserId && mems.length > 0) {
        setPaidByUserId(DataService.getCurrentUser().user_id || mems[0].user_id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount.toString());
      setDescription(expenseToEdit.description);
      setCategoryId(expenseToEdit.category_id);
      setExpenseDate(expenseToEdit.expense_date);
      setPaidByUserId(expenseToEdit.paid_by_user_id);
      setPaymentMethod(expenseToEdit.payment_method);
      setNotes(expenseToEdit.notes || "");
      setReceiptFileName(expenseToEdit.receipt_path || null);
    } else {
      setAmount("");
      setDescription("");
      const today = new Date().toISOString().split("T")[0];
      setExpenseDate(today);
      setPaymentMethod("UPI");
      setNotes("");
      setReceiptFileName(null);
    }
  }, [expenseToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const numAmount = parseFloat(amount);
    const validation = expenseFormSchema.safeParse({
      amount: isNaN(numAmount) ? 0 : numAmount,
      description: description.trim(),
      category_id: categoryId,
      expense_date: expenseDate,
      paid_by_user_id: paidByUserId,
      payment_method: paymentMethod,
      notes: notes.trim() || undefined,
      receipt_path: receiptFileName || undefined,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsLoading(true);
      let result: Expense;
      if (expenseToEdit) {
        result = await DataService.updateExpense(expenseToEdit.id, validation.data);
      } else {
        result = await DataService.addExpense({
          amount: validation.data.amount,
          description: validation.data.description,
          category_id: validation.data.category_id,
          expense_date: validation.data.expense_date,
          paid_by_user_id: validation.data.paid_by_user_id,
          created_by_user_id: DataService.getCurrentUser().user_id,
          payment_method: validation.data.payment_method,
          notes: validation.data.notes,
          receipt_path: validation.data.receipt_path,
        });
      }
      if (onSaved) {
        onSaved(result);
      }
      onClose();
    } catch (err: unknown) {
      setErrors({ form: err instanceof Error ? err.message : "Failed to save expense. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, receipt: "File size exceeds 10MB limit." }));
        return;
      }
      setReceiptFileName(file.name);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expenseToEdit ? "Edit Expense" : "Expense Dialog"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {errors.form && (
          <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Amount (INR) */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">
            Amount (INR) <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
              ₹
            </span>
            <input
              type="number"
              step="any"
              required
              placeholder="1,250.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-12 pl-8 pr-4 rounded-xl bg-muted/60 border border-border text-base font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
            />
          </div>
          {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">
            Category <span className="text-destructive">*</span>
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-muted/60 border border-border text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category_id && <p className="text-xs text-destructive mt-1">{errors.category_id}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">
            Description <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Weekly groceries from supermarket"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-muted/60 border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
          />
          {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
        </div>

        {/* Paid by */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">
            Paid by <span className="text-destructive">*</span>
          </label>
          <select
            value={paidByUserId}
            onChange={(e) => setPaidByUserId(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-muted/60 border border-border text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
          >
            {members.map((member) => (
              <option key={member.id} value={member.user_id}>
                {member.display_name} ({member.relationship || member.role})
              </option>
            ))}
          </select>
          {errors.paid_by_user_id && <p className="text-xs text-destructive mt-1">{errors.paid_by_user_id}</p>}
        </div>

        {/* Payment Method Pills matching Figma */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">
            Payment Method
          </label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHOD_OPTIONS.map((opt) => {
              const isSelected = paymentMethod === opt.id;
              const Icon = opt.icon;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentMethod(opt.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#D4F835] text-black shadow-xs ring-1 ring-[#c2e424]"
                      : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">
            Date
          </label>
          <input
            type="date"
            required
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-muted/60 border border-border text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
          />
        </div>

        {/* Receipt Upload */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">
            Receipt
          </label>
          <label className="border-2 border-dashed border-[#D4F835]/80 hover:border-[#D4F835] bg-[#D4F835]/5 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
            <Upload className="h-6 w-6 text-foreground mb-1" />
            <span className="text-xs font-bold text-foreground">
              {receiptFileName ? receiptFileName : "Upload receipt"}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              PDF, JPG or PNG • Max 5MB
            </span>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleReceiptChange}
            />
          </label>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">
            Notes
          </label>
          <textarea
            rows={2}
            placeholder="Added milk, vegetables, fruits for the week..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 rounded-xl bg-muted/60 border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 h-12 rounded-full bg-[#0E0E10] hover:bg-black/85 active:scale-98 text-white font-extrabold text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </form>
    </Modal>
  );
}
