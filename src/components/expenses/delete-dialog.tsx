"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Expense } from "@/lib/types";
import { formatINR } from "@/lib/formatters";
import { AlertTriangle } from "lucide-react";

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Expense"
      description="This transaction will be moved to the household archive."
      maxWidth="sm"
    >
      <div className="space-y-4 pt-2">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-destructive/10 text-destructive text-xs border border-destructive/20">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            Are you sure you want to delete <strong className="font-semibold text-foreground">&ldquo;{expense.description}&rdquo;</strong> for <strong className="font-semibold text-foreground">{formatINR(expense.amount)}</strong>?
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete Expense
          </Button>
        </div>
      </div>
    </Modal>
  );
}
