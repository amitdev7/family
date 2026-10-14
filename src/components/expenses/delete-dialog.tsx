"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { formatINR } from "@/lib/formatters";

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  expenseDescription: string;
  expenseAmount: number;
  categoryName?: string;
}

export function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  expenseDescription,
  expenseAmount,
  categoryName,
}: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

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
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Expense">
      <div className="space-y-6 pt-2 select-none">
        {/* Warning Icon Badge */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="h-14 w-14 rounded-full bg-[#D4F835] text-black flex items-center justify-center font-black text-2xl shadow-lg animate-pulse">
            !
          </div>
          <h3 className="text-lg font-black text-foreground tracking-tight">
            Delete This Transaction?
          </h3>
          <p className="text-xs font-medium text-muted-foreground max-w-xs leading-relaxed">
            This action cannot be undone. Are you sure you want to remove this record from your household ledger?
          </p>
        </div>

        {/* Expense Summary Card */}
        <div className="p-4 rounded-2xl bg-secondary/50 border border-border/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-foreground">{expenseDescription}</p>
            {categoryName && (
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {categoryName}
              </span>
            )}
          </div>
          <span className="text-base font-black text-foreground">
            {formatINR(expenseAmount)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full py-3 rounded-full border border-border text-xs font-bold text-foreground hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              "Deleting..."
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
