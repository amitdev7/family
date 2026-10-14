"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { WhoAreYouModal } from "@/components/layout/who-are-you-modal";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onAddExpenseClick?: () => void;
  className?: string;
}

export function AppLayout({
  children,
  title,
  subtitle,
  onAddExpenseClick,
  className = "",
}: AppLayoutProps) {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const handleAddExpense = () => {
    if (onAddExpenseClick) {
      onAddExpenseClick();
    } else {
      setIsAddExpenseOpen(true);
    }
  };

  const handleExpenseSaved = () => {
    setIsAddExpenseOpen(false);
    window.dispatchEvent(new Event("household-expense-updated"));
  };

  return (
    <div className="min-h-screen bg-background flex flex-row">
      {/* Desktop & Tablet Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={title}
          subtitle={subtitle}
          onAddExpenseClick={handleAddExpense}
        />

        <main className={cn("flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8", className)}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav onAddExpenseClick={handleAddExpense} />

      {/* Identity Prompt Modal: automatically displays if user has not yet identified themselves */}
      <WhoAreYouModal />

      {/* Global Quick Add Expense Dialog */}
      {isAddExpenseOpen && (
        <ExpenseDialog
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
          onSaved={handleExpenseSaved}
        />
      )}
    </div>
  );
}
