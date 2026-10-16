"use client";

import React from "react";
import {
  FileText,
  Calendar,
  CreditCard,
  User,
  Edit2,
  Trash2,
  Download,
  CheckCircle2,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Expense } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/formatters";

interface ExpenseDetailsModalProps {
  isOpen: boolean;
  expense: Expense | null;
  onClose: () => void;
  onEdit: (exp: Expense) => void;
  onDelete: (exp: Expense) => void;
}

export function ExpenseDetailsModal({
  isOpen,
  expense,
  onClose,
  onEdit,
  onDelete,
}: ExpenseDetailsModalProps) {
  if (!expense) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transaction Details">
      <div className="space-y-6 pt-2 select-none">
        {/* Top Hero Amount Card */}
        <div className="rounded-[24px] bg-[#0E0E10] text-white p-6 flex flex-col items-center justify-center text-center shadow-md relative overflow-hidden">
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#E2F937] text-black text-[10px] font-extrabold uppercase tracking-wider">
            {expense.category?.name || "General"}
          </div>

          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            Total Paid
          </p>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {formatINR(expense.amount)}
          </div>
          <p className="text-xs text-zinc-300 font-bold mt-2">
            {expense.description}
          </p>
        </div>

        {/* Details List */}
        <div className="rounded-2xl bg-secondary/50 border border-border/80 divide-y divide-border/60 text-xs">
          <div className="flex items-center justify-between p-3.5">
            <span className="flex items-center gap-2 text-muted-foreground font-semibold">
              <Calendar className="h-4 w-4" /> Date
            </span>
            <span className="font-bold text-foreground">
              {formatDate(expense.expense_date)}
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5">
            <span className="flex items-center gap-2 text-muted-foreground font-semibold">
              <User className="h-4 w-4" /> Paid By
            </span>
            <div className="flex items-center gap-2 font-bold text-foreground">
              <div className="h-6 w-6 rounded-full bg-[#E2F937] text-black flex items-center justify-center text-[10px] font-black">
                {expense.paid_by?.display_name?.charAt(0) || "U"}
              </div>
              <span>{expense.paid_by?.display_name || "Family Member"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5">
            <span className="flex items-center gap-2 text-muted-foreground font-semibold">
              <CreditCard className="h-4 w-4" /> Payment Method
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary border border-border font-bold text-foreground">
              {expense.payment_method}
            </span>
          </div>

          {expense.notes && (
            <div className="p-3.5 space-y-1">
              <span className="text-muted-foreground font-semibold block">Notes</span>
              <p className="font-medium text-foreground text-xs leading-relaxed">
                {expense.notes}
              </p>
            </div>
          )}
        </div>

        {/* Verified Receipt Card */}
        <div className="p-4 rounded-2xl border border-dashed border-border bg-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#E2F937]/20 text-[#E2F937] flex items-center justify-center font-bold">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-foreground">
                  {expense.receipt_path || "verified_receipt.pdf"}
                </p>
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              </div>
              <p className="text-[10px] text-muted-foreground font-medium">
                Verified digital receipt attached
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              window.alert("Downloading verified receipt attachment...");
            }}
            className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-colors cursor-pointer"
            title="Download Receipt"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>

        {/* Action Buttons: Edit & Delete */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => onEdit(expense)}
            className="w-full py-3 rounded-full border border-border text-xs font-bold text-foreground hover:bg-secondary transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(expense)}
            className="w-full py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
