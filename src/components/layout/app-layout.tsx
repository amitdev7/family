"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Search, Bell, Sparkles } from "lucide-react";
import { DataService } from "@/lib/data-service";
import { HouseholdMember } from "@/lib/types";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import { WhoAreYouModal } from "@/components/layout/who-are-you-modal";

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

const NAV_LINKS = [
  { label: "Overview", href: "/dashboard" },
  { label: "Expenses", href: "/expenses" },
  { label: "Budgets", href: "/budgets" },
  { label: "Recurring", href: "/recurring" },
  { label: "Categories", href: "/categories" },
  { label: "Reports", href: "/reports" },
];

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
  const [showAlerts, setShowAlerts] = useState(false);
  const [currentUser, setCurrentUser] = useState<HouseholdMember | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setCurrentUser(DataService.getCurrentUser());
    const handleUserChanged = () => setCurrentUser(DataService.getCurrentUser());
    window.addEventListener("household-user-changed", handleUserChanged);
    return () => window.removeEventListener("household-user-changed", handleUserChanged);
  }, []);

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
  const userInitials = (currentUser?.display_name || "Amit Sharma")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="min-h-screen bg-[#E7DDF5] p-0 font-['Plus_Jakarta_Sans',sans-serif] text-[#0B0C0B] sm:p-6 lg:p-8 flex flex-col justify-center items-center antialiased selection:bg-[#C5A3FF] selection:text-[#2D2D2D]">
      {/* App Shell matching Figma Make specification */}
      <div className="app-shell min-h-screen w-full overflow-hidden bg-[#F5F5F4] sm:min-h-0 sm:max-w-[1240px] sm:rounded-[32px] sm:border sm:border-white sm:shadow-[0_22px_70px_rgba(0,0,0,.08)] flex flex-col">
        {/* Global Unified Header */}
        <header className="app-header flex h-[84px] items-center px-5 sm:px-8 border-b border-[#EBEBE8] bg-[#F5F5F4]/90 backdrop-blur-md sticky top-0 z-40">
          {/* User Profile Pill / Greeting */}
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-3 cursor-pointer text-left group"
          >
            <span className="size-10 text-xs bg-[#E2C7AD] text-[#5E4633] inline-flex shrink-0 items-center justify-center rounded-full font-bold ring-2 ring-white shadow-xs group-hover:scale-105 transition-transform">
              {userInitials}
            </span>
            <span className="hidden text-lg font-semibold tracking-[-.03em] sm:block">
              Hello, {currentUser?.display_name?.split(" ")[0] || "Amit"}
            </span>
          </button>

          {/* Center Navigation Capsule */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex bg-white/70 backdrop-blur-sm p-1 rounded-full border border-white/80 shadow-xs">
            {NAV_LINKS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-[11px] font-semibold transition-all ${isActive
                      ? "bg-[#C5A3FF] text-[#2D2D2D] shadow-xs font-bold"
                      : "text-[#959592] hover:text-black hover:bg-black/5"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Search, Notifications, + Add Expense */}
          <div className="relative ml-auto flex items-center gap-2">
            <button
              type="button"
              aria-label="Search"
              onClick={() => router.push("/expenses")}
              className="flex size-11 items-center justify-center rounded-full bg-white text-[#222] hover:scale-105 transition-all shadow-xs cursor-pointer border border-[#ECECE8]"
            >
              <Search className="w-4 h-4 stroke-[2]" />
            </button>

            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setShowAlerts(!showAlerts)}
              className="flex h-11 items-center gap-2 rounded-full bg-white px-4 text-xs font-bold shadow-xs border border-[#ECECE8] hover:scale-105 transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4 stroke-[2]" />
              <span className="size-1.5 rounded-full bg-[#E74E48]" />
              <span>4</span>
            </button>

            {!hideAddExpense && (
              <button
                type="button"
                onClick={handleAddExpense}
                className="hidden sm:flex items-center gap-2 rounded-full bg-[#2D2D2D] hover:bg-[#1F1F1F] text-white px-5 py-2.5 text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add expense</span>
              </button>
            )}

            {/* Notification Popover */}
            {showAlerts && (
              <div className="popover-in absolute right-0 top-14 z-50 w-72 rounded-2xl bg-white p-4 shadow-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#17201D]">Family reminders</div>
                  <span className="text-[10px] font-bold text-[#C5A3FF] bg-[#EEE5FF] px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <div className="mt-3 rounded-xl bg-[#F4F4F2] p-3 text-[11px] leading-relaxed text-[#6D6E69]">
                  Electricity bill of ₹3,640 is due in 2 days.
                </div>
                <div className="mt-2 rounded-xl bg-[#EEE5FF] p-3 text-[11px] leading-relaxed text-[#6E4CA8] font-medium">
                  Monthly budget is 55% utilized. ₹44,160 remaining.
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Inner Page Header (for non-dashboard pages or custom sub-routes) */}
        {!hideHeader && !isDashboard && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 sm:px-8 pt-6 pb-2 select-none">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-10 h-10 rounded-full bg-white border border-[#ECECE8] flex items-center justify-center text-[#2D2D2D] hover:bg-slate-50 active:scale-95 transition-all shadow-xs cursor-pointer"
                title="Go back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#17201D]">
                    {title}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-[#EEE5FF] text-[#6E4CA8] border border-[#C5A3FF]/40">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Sharma Vault</span>
                  </span>
                </div>
                {subtitle && (
                  <p className="text-xs text-[#7A807D] font-medium mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Custom page header actions */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              {headerActions}
            </div>
          </div>
        )}

        {/* Main Body Canvas */}
        <main className={`flex-1 w-full p-4 sm:p-6 lg:p-8 ${className}`}>
          {children}
        </main>

        {/* Mobile Sticky Bottom Navigation Dock */}
        <nav className="sticky bottom-0 z-30 flex items-center justify-around border-t border-[#E5E5E2] bg-white/95 p-3 backdrop-blur md:hidden">
          {NAV_LINKS.slice(0, 5).map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-2 text-[10px] font-bold transition-colors ${isActive ? "text-[#6E4CA8]" : "text-[#92938E] hover:text-black"
                  }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Identity Prompt Modal if needed */}
      <WhoAreYouModal />

      {/* Global Add Expense Modal */}
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
