"use client";

import React, { useState } from "react";
import { MasterpieceNav } from "@/components/layout/masterpiece-nav";
import { WhoAreYouModal } from "@/components/layout/who-are-you-modal";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import { cn } from "@/lib/utils";
import { ArrowLeft, Plus, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onAddExpenseClick?: () => void;
  className?: string;
  hideHeader?: boolean;
  headerActions?: React.ReactNode;
  hideAddExpense?: boolean;
}

export function AppLayout({
  children,
  title,
  subtitle,
  onAddExpenseClick,
  className = "",
  hideHeader = false,
  headerActions,
  hideAddExpense = false,
}: AppLayoutProps) {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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
    window.dispatchEvent(new Event("expense-saved"));
  };

  const isDashboard = pathname === "/dashboard";

  return (
    <div className="min-h-screen bg-[#E5EDF4] dark:bg-[#090A0C] p-2 sm:p-3 md:p-5 flex flex-col font-sans text-slate-900 dark:text-zinc-100 antialiased selection:bg-[#E2F937] selection:text-black">
      {/* Outer Double-Bezel Frame */}
      <div className="flex-1 bg-[#EEF3F8] dark:bg-[#111317] rounded-[24px] sm:rounded-[36px] p-3 sm:p-5 md:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-200/80 dark:border-white/5 flex flex-col min-h-[calc(100vh-1.5rem)]">

        {/* Top Masterpiece Island Navbar */}
        <MasterpieceNav onAddExpenseClick={handleAddExpense} />

        {/* Dynamic Page Header */}
        {!hideHeader && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pt-1 select-none">
            <div className="flex items-center gap-3">
              {!isDashboard && (
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800/90 border border-slate-200/80 dark:border-zinc-700/80 flex items-center justify-center text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-xs cursor-pointer"
                  title="Go back"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                    {title}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E2F937]/35 text-slate-900 dark:text-[#E2F937] border border-[#E2F937]/70 shadow-2xs">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Live Vault</span>
                  </span>
                </div>
                {subtitle && (
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Top Right Quick Actions */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              {headerActions}
              {!hideAddExpense && (
                <button
                  type="button"
                  onClick={handleAddExpense}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#E2F937] text-slate-950 font-black text-xs shadow-[0_4px_16px_rgba(226,249,55,0.45)] hover:bg-[#d6ed2f] hover:shadow-[0_6px_22px_rgba(226,249,55,0.6)] active:scale-95 transition-all cursor-pointer border border-black/10"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>+ Add Expense</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Workspace Canvas */}
        <main className={cn("flex-1 w-full max-w-7xl mx-auto pb-20 lg:pb-6", className)}>
          {children}
        </main>
      </div>

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

