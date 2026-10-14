"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Expense, Category, HouseholdMember, PAYMENT_METHODS, PaymentMethod } from "@/lib/types";
import { DataService } from "@/lib/data-service";
import { expenseFormSchema } from "@/lib/validations";
import { Upload, AlertCircle, FileText } from "lucide-react";

interface ExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (expense: Expense) => void;
  expenseToEdit?: Expense | null;
}

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
      setReceiptFileName(expenseToEdit.receipt_path ? "Attached Receipt" : null);
    } else {
      setAmount("");
      setDescription("");
      setExpenseDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setReceiptFileName(null);
      if (members.length > 0) {
        setPaidByUserId(DataService.getCurrentUser().user_id || members[0].user_id);
      }
      if (categories.length > 0) {
        setCategoryId(categories[0].id);
      }
      setPaymentMethod("UPI");
    }
    setErrors({});
  }, [expenseToEdit, isOpen, members, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      amount,
      description,
      category_id: categoryId,
      expense_date: expenseDate,
      paid_by_user_id: paidByUserId,
      payment_method: paymentMethod,
      notes: notes || undefined,
      receipt_path: receiptFileName ? "mock-receipt.pdf" : undefined,
    };

    const validation = expenseFormSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
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
      title={expenseToEdit ? "Edit Expense" : "Record New Expense"}
      description="Add transaction details to keep your household finances accurate and updated."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Amount & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Amount (₹ INR) <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-muted-foreground">₹</span>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`pl-8 text-base font-semibold ${errors.amount ? "border-destructive focus-visible:ring-destructive" : ""}`}
                autoFocus={!expenseToEdit}
              />
            </div>
            {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Expense Date <span className="text-destructive">*</span>
            </label>
            <Input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className={errors.expense_date ? "border-destructive" : ""}
            />
            {errors.expense_date && <p className="text-xs text-destructive mt-1">{errors.expense_date}</p>}
          </div>
        </div>

        {/* Description / Title */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Description / Item Name <span className="text-destructive">*</span>
          </label>
          <Input
            type="text"
            placeholder="e.g. DMart Monthly Provisions, BESCOM Bill, Dining"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={errors.description ? "border-destructive" : ""}
          />
          {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
        </div>

        {/* Category & Payment Method Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Category <span className="text-destructive">*</span>
            </label>
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={errors.category_id ? "border-destructive" : ""}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
            {errors.category_id && <p className="text-xs text-destructive mt-1">{errors.category_id}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Payment Method <span className="text-destructive">*</span>
            </label>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Paid By Family Member */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Paid By Family Member <span className="text-destructive">*</span>
          </label>
          <Select
            value={paidByUserId}
            onChange={(e) => setPaidByUserId(e.target.value)}
            className={errors.paid_by_user_id ? "border-destructive" : ""}
          >
            {members.map((member) => (
              <option key={member.id} value={member.user_id}>
                {member.display_name} ({member.relationship || member.role})
              </option>
            ))}
          </Select>
          {errors.paid_by_user_id && <p className="text-xs text-destructive mt-1">{errors.paid_by_user_id}</p>}
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Notes (Optional)
          </label>
          <Textarea
            rows={2}
            placeholder="Add store location, invoice number, or extra context..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Optional Receipt Upload */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Receipt Attachment (Optional)
          </label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium transition-colors">
              <Upload className="h-4 w-4 text-primary" />
              <span>{receiptFileName ? "Change File" : "Upload Receipt"}</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleReceiptChange}
              />
            </label>
            {receiptFileName && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                <FileText className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="truncate max-w-[200px]">{receiptFileName}</span>
                <button
                  type="button"
                  onClick={() => setReceiptFileName(null)}
                  className="text-destructive hover:underline text-[11px] ml-1"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          {errors.receipt && <p className="text-xs text-destructive mt-1">{errors.receipt}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {expenseToEdit ? "Save Changes" : "Record Expense"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
