"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Expense } from "@/lib/types";
import { formatINR } from "@/lib/formatters";
import { Trash2 } from "lucide-react";

interface DeleteExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  expense: Expense | null;
}

export function DeleteExpenseDialog({
  isOpen,
  onClose,
  onConfirm,
  expense,
}: DeleteExpenseDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!expense) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="text-center pt-2 pb-1">
        {/* Lime Exclamation Badge */}
        <div className="h-12 w-12 rounded-full bg-[#D4F835] text-black font-black text-xl flex items-center justify-center mx-auto mb-3 shadow-xs">
          !
        </div>

        <h3 className="text-xl font-extrabold text-foreground mb-2">
          Delete Expense
        </h3>

        <p className="text-sm font-bold text-foreground mb-1">
          Are you sure you want to delete this expense?
        </p>

        <p className="text-xs text-muted-foreground px-2">
          This action cannot be undone. The expense of{" "}
          <strong className="text-foreground">{formatINR(expense.amount)}</strong> for{" "}
          <strong className="text-foreground">{expense.description}</strong> will be permanently deleted.
        </p>

        {/* Buttons matching Figma */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="h-11 rounded-full border border-border bg-card text-foreground font-bold text-xs hover:bg-muted transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-11 rounded-full bg-[#0E0E10] hover:bg-black/90 active:scale-98 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <span>{isDeleting ? "Deleting..." : "Delete"}</span>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
