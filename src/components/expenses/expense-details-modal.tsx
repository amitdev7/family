"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Expense } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/formatters";
import { Download, ExternalLink, Zap, Edit2, Trash2 } from "lucide-react";

interface ExpenseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
}

export function ExpenseDetailsModal({
  isOpen,
  onClose,
  expense,
  onEdit,
  onDelete,
}: ExpenseDetailsModalProps) {
  if (!expense) return null;

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="space-y-5 pt-1">
        {/* Top Header with Read-only pill */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-foreground">
            Expense Details
          </h3>
          <span className="px-3 py-1 rounded-full bg-[#D4F835] text-black font-extrabold text-[11px] uppercase tracking-wider">
            Read-only
          </span>
        </div>

        {/* Category & Date Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="h-12 w-12 rounded-2xl bg-[#D4F835] text-black flex items-center justify-center font-bold shadow-xs">
            <CategoryIcon name={expense.category?.icon || "ShoppingCart"} className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-lg text-foreground">
              {expense.category?.name || "Groceries"}
            </h4>
            <p className="text-xs text-muted-foreground font-medium">
              {formatDate(expense.expense_date)}
            </p>
          </div>
        </div>

        {/* Amount */}
        <div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Amount
          </span>
          <span className="text-3xl font-black text-foreground tracking-tight">
            {formatINR(expense.amount)}
          </span>
        </div>

        {/* Meta rows */}
        <div className="space-y-3 text-sm">
          {/* Category */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-muted-foreground">Category</span>
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <span className="h-6 w-6 rounded-lg bg-[#D4F835] text-black flex items-center justify-center text-xs">
                <CategoryIcon name={expense.category?.icon || "ShoppingCart"} className="h-3.5 w-3.5" />
              </span>
              <span>{expense.category?.name || "Groceries"}</span>
            </div>
          </div>

          {/* Paid by */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-muted-foreground">Paid by</span>
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <span
                className="h-6 w-6 rounded-full text-black font-extrabold text-[10px] flex items-center justify-center shadow-2xs"
                style={{ backgroundColor: expense.paid_by?.color || "#D4F835" }}
              >
                {expense.paid_by?.display_name ? expense.paid_by.display_name.charAt(0) : "A"}
              </span>
              <span>
                {expense.paid_by?.display_name || "Family Member"} ({expense.paid_by?.relationship || expense.paid_by?.role || "Member"})
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-muted-foreground">Payment Method</span>
            <span className="px-3 py-1 rounded-full bg-[#D4F835] text-black font-extrabold text-xs flex items-center gap-1 shadow-2xs">
              <Zap className="h-3 w-3 stroke-[3]" />
              <span>{expense.payment_method}</span>
            </span>
          </div>
        </div>

        {/* Receipt Breakdown Card matching Figma */}
        <div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
            Receipt
          </span>
          <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-border/70 pb-2">
              <span className="font-black text-foreground tracking-wider uppercase text-[11px]">
                {expense.description || "RECEIPT"}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Verified
              </span>
            </div>

            <div className="space-y-1 text-muted-foreground pt-1">
              <div className="flex items-center justify-between">
                <span>Items & Supplies</span>
                <span className="font-bold text-foreground">{formatINR(expense.amount)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/70 flex items-center justify-between font-black text-foreground">
              <span>Total</span>
              <span>{formatINR(expense.amount)}</span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => alert("Receipt document ready.")}
                className="px-3 py-1 rounded-full bg-card border border-border text-[11px] font-bold text-foreground hover:bg-muted flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View full receipt</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Notes */}
        {expense.notes && (
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Notes
            </span>
            <p className="text-xs text-foreground bg-muted/40 p-3 rounded-xl border border-border leading-relaxed">
              {expense.notes}
            </p>
          </div>
        )}

        {/* Bottom Actions: Close & Download PDF */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-full border border-border bg-card text-foreground font-bold text-xs hover:bg-muted transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="h-12 rounded-full bg-[#0E0E10] hover:bg-black/90 active:scale-98 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </button>
        </div>

        {/* Edit & Delete Shortcuts */}
        {(onEdit || onDelete) && (
          <div className="flex items-center justify-between pt-1">
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(expense)}
                className="text-xs font-bold text-destructive hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                <span>Delete</span>
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(expense)}
                className="text-xs font-bold text-foreground hover:underline flex items-center gap-1 ml-auto cursor-pointer"
              >
                <Edit2 className="h-3 w-3" />
                <span>Edit</span>
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
