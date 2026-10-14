"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Expense } from "@/lib/types";
import { formatINR, formatDate, formatDateTime } from "@/lib/formatters";
import { Edit2, Trash2, Calendar, CreditCard, User, FileText } from "lucide-react";

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Expense Details"
      description={`Transaction ID: ${expense.id}`}
      maxWidth="md"
    >
      <div className="space-y-6 pt-2">
        {/* Amount & Description Hero */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ backgroundColor: expense.category?.color || "#16a34a" }}
            >
              <CategoryIcon name={expense.category?.icon || "ShoppingCart"} className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">{expense.description}</h3>
              <p className="text-xs text-muted-foreground">{expense.category?.name || "General"}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-primary tracking-tight">
              {formatINR(expense.amount)}
            </span>
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-card">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="text-muted-foreground block text-[11px]">Expense Date</span>
              <span className="font-medium text-foreground">{formatDate(expense.expense_date)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-card">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="text-muted-foreground block text-[11px]">Payment Method</span>
              <Badge variant="outline" className="mt-0.5 font-normal text-[11px]">
                {expense.payment_method}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-card">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="text-muted-foreground block text-[11px]">Paid By</span>
              <span className="font-medium text-foreground">
                {expense.paid_by?.display_name || "Family Member"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-card">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="text-muted-foreground block text-[11px]">Recorded At</span>
              <span className="font-medium text-foreground">{formatDateTime(expense.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {expense.notes && (
          <div className="p-3.5 rounded-lg border border-border bg-muted/20">
            <span className="text-xs font-semibold text-muted-foreground block mb-1">
              Notes & Memo
            </span>
            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
              {expense.notes}
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {onDelete ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onDelete(expense)}
              className="gap-1.5 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </Button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            {onEdit && (
              <Button
                type="button"
                size="sm"
                onClick={() => onEdit(expense)}
                className="gap-1.5 text-xs"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Expense</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
