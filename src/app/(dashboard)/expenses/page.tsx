"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronDown,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Edit2,
  CreditCard,
  Banknote,
  Zap,
  Building,
  Receipt,
  X,
  CheckCircle2,
  User,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import { ExpenseDetailsModal } from "@/components/expenses/expense-details-modal";
import { DeleteDialog } from "@/components/expenses/delete-dialog";
import { DataService } from "@/lib/data-service";
import { Expense, Category, HouseholdMember } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/formatters";
import Image from "next/image";
import {
  CATEGORY_IMAGES,
  EMPTY_STATE_IMAGES,
  MEMBER_AVATARS,
  NAV_3D_ICONS,
  METRIC_3D_ICONS,
  PAYMENT_3D_ICONS,
} from "@/lib/assets";

// Rich Category Visual Mapping
const CATEGORY_META_MAP: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  groceries: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/30",
  },
  food: {
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-500/30",
  },
  dining: {
    bg: "bg-orange-500/10 dark:bg-orange-500/20",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-500/30",
  },
  transport: {
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-500/30",
  },
  utilities: {
    bg: "bg-yellow-500/10 dark:bg-yellow-500/20",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-500/30",
  },
  bills: {
    bg: "bg-yellow-500/10 dark:bg-yellow-500/20",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-500/30",
  },
  shopping: {
    bg: "bg-pink-500/10 dark:bg-pink-500/20",
    text: "text-pink-700 dark:text-pink-400",
    border: "border-pink-500/30",
  },
  healthcare: {
    bg: "bg-teal-500/10 dark:bg-teal-500/20",
    text: "text-teal-700 dark:text-teal-400",
    border: "border-teal-500/30",
  },
  health: {
    bg: "bg-teal-500/10 dark:bg-teal-500/20",
    text: "text-teal-700 dark:text-teal-400",
    border: "border-teal-500/30",
  },
  entertainment: {
    bg: "bg-purple-500/10 dark:bg-purple-500/20",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-500/30",
  },
  education: {
    bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    text: "text-indigo-700 dark:text-indigo-400",
    border: "border-indigo-500/30",
  },
  travel: {
    bg: "bg-sky-500/10 dark:bg-sky-500/20",
    text: "text-sky-700 dark:text-sky-400",
    border: "border-sky-500/30",
  },
  personal: {
    bg: "bg-violet-500/10 dark:bg-violet-500/20",
    text: "text-violet-700 dark:text-violet-400",
    border: "border-violet-500/30",
  },
};

function getCategoryMeta(catName?: string) {
  const name = (catName || "").toLowerCase();
  for (const [key, meta] of Object.entries(CATEGORY_META_MAP)) {
    if (name.includes(key)) return meta;
  }
  return {
    bg: "bg-lime-500/10 dark:bg-lime-500/20",
    text: "text-lime-700 dark:text-lime-400",
    border: "border-lime-500/30",
  };
}

function getPaymentBadge(method: string) {
  const m = method.toLowerCase();
  if (m.includes("cash")) {
    return {
      label: "Cash",
      icon: Banknote,
      className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    };
  }
  if (m.includes("upi")) {
    return {
      label: "UPI",
      icon: Zap,
      className: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
    };
  }
  if (m.includes("credit")) {
    return {
      label: "Credit Card",
      icon: CreditCard,
      className: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
    };
  }
  if (m.includes("debit")) {
    return {
      label: "Debit Card",
      icon: CreditCard,
      className: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    };
  }
  if (m.includes("bank") || m.includes("net")) {
    return {
      label: "Net Banking",
      icon: Building,
      className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    };
  }
  return {
    label: method,
    icon: CreditCard,
    className: "bg-secondary text-foreground border-border",
  };
}

const PAYMENT_METHOD_FILTER_TABS = [
  { id: "all", label: "All Methods", image: NAV_3D_ICONS.expenses },
  { id: "Cash", label: "Cash (Default)", image: PAYMENT_3D_ICONS.cash },
  { id: "UPI", label: "UPI", image: PAYMENT_3D_ICONS.upi },
  { id: "Credit Card", label: "Credit Card", image: PAYMENT_3D_ICONS.card },
  { id: "Debit Card", label: "Debit Card", image: PAYMENT_3D_ICONS.card },
  { id: "Net Banking", label: "Net Banking", image: PAYMENT_3D_ICONS.bank },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Global Ledger Statistics
  const [stats, setStats] = useState({
    totalSpent: 0,
    cashSpent: 0,
    thisMonthSpent: 0,
    totalTransactions: 0,
    avgSpent: 0,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMember, setSelectedMember] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">("date_desc");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // Toast notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Compute overall stats from all expenses
  const refreshStats = useCallback(async () => {
    try {
      const res = await DataService.getExpenses({ pageSize: 10000 });
      const all = res.expenses;
      const currentYearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

      let total = 0;
      let cash = 0;
      let thisMonth = 0;

      for (const exp of all) {
        total += exp.amount;
        if (exp.payment_method?.toLowerCase().includes("cash")) {
          cash += exp.amount;
        }
        if (exp.expense_date?.startsWith(currentYearMonth)) {
          thisMonth += exp.amount;
        }
      }

      setStats({
        totalSpent: total,
        cashSpent: cash,
        thisMonthSpent: thisMonth,
        totalTransactions: all.length,
        avgSpent: all.length > 0 ? Math.round(total / all.length) : 0,
      });
    } catch (err) {
      console.error("Failed to refresh expense stats:", err);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await DataService.getExpenses({
        search: search.trim() || undefined,
        categoryId: selectedCategory === "all" ? undefined : selectedCategory,
        paidByUserId: selectedMember === "all" ? undefined : selectedMember,
        paymentMethod: selectedMethod === "all" ? undefined : selectedMethod,
        sortBy,
        page,
        pageSize,
      });
      setExpenses(res.expenses);
      setTotalCount(res.totalCount);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory, selectedMember, selectedMethod, sortBy, page, pageSize]);

  useEffect(() => {
    DataService.getCategories().then(setCategories);
    DataService.getMembers().then(setMembers);
    refreshStats();
  }, [refreshStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listen for real-time household events
  useEffect(() => {
    const handleSync = () => {
      loadData();
      refreshStats();
    };

    window.addEventListener("expense-saved", handleSync);
    window.addEventListener("household-expense-updated", handleSync);
    window.addEventListener("open-add-expense", () => setIsAddOpen(true));

    return () => {
      window.removeEventListener("expense-saved", handleSync);
      window.removeEventListener("household-expense-updated", handleSync);
    };
  }, [loadData, refreshStats]);

  const handleExportCSV = () => {
    const csv = DataService.exportExpensesToCSV(expenses);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported transactions to CSV successfully!");
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const hasActiveFilters = Boolean(
    search.trim() || selectedCategory !== "all" || selectedMember !== "all" || selectedMethod !== "all" || sortBy !== "date_desc"
  );

  const resetAllFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedMember("all");
    setSelectedMethod("all");
    setSortBy("date_desc");
    setPage(1);
    showToast("Filters reset to default");
  };

  // Relative date label helper
  const getRelativeDateBadge = (dateStr: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (dateStr === today) return "Today";
    if (dateStr === yesterday) return "Yesterday";
    return null;
  };

  return (
    <AppLayout
      title="Expenses Ledger"
      subtitle="Real-time household outflows, merchant records & payment splits"
      onAddExpenseClick={() => setIsAddOpen(true)}
      headerActions={
        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white dark:bg-[#16171B] hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200/80 dark:border-white/10 font-bold text-xs transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export CSV</span>
        </button>
      }
    >
      <div className="space-y-6 select-none max-w-7xl mx-auto pb-12">
        {/* Floating Notification Toast */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-[#16171B] text-[#E2F937] border border-[#E2F937]/40 shadow-2xl text-xs font-black tracking-wide animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#E2F937]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 2. 4 Metric Cards: Total Spent, Cash Spent, This Month, Average Per Expense */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Spent */}
          <div className="rounded-[28px] bg-white dark:bg-[#16171B] border border-slate-200/80 dark:border-white/10 p-5 shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Total Expenses
              </span>
              <div className="h-9 w-9 relative flex items-center justify-center shrink-0">
                <Image
                  src={METRIC_3D_ICONS.spent}
                  alt="Total Expenses"
                  width={34}
                  height={34}
                  className="object-contain drop-shadow"
                />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                {formatINR(stats.totalSpent)}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">
                {stats.totalTransactions} recorded transaction{stats.totalTransactions === 1 ? "" : "s"}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              <span>Lifetime Outflow</span>
              <span>All Members</span>
            </div>
          </div>

          {/* Card 2: Cash Expenses (Default Focus) */}
          <div className="rounded-[28px] bg-white dark:bg-[#16171B] border-2 border-[#E2F937]/50 dark:border-[#E2F937]/30 p-5 shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-[#E2F937]">
                Cash Spent (Default)
              </span>
              <div className="h-9 w-9 relative flex items-center justify-center shrink-0">
                <Image
                  src={PAYMENT_3D_ICONS.cash}
                  alt="Cash Spent"
                  width={34}
                  height={34}
                  className="object-contain drop-shadow"
                />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-[#E2F937] tracking-tight">
                {formatINR(stats.cashSpent)}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">
                {stats.totalSpent > 0
                  ? `${Math.round((stats.cashSpent / stats.totalSpent) * 100)}% of household outflows`
                  : "0% of outflows"}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Physical Cash</span>
              <span>Verified Ledger</span>
            </div>
          </div>

          {/* Card 3: This Month Outflow */}
          <div className="rounded-[28px] bg-white dark:bg-[#16171B] border border-slate-200/80 dark:border-white/10 p-5 shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                This Month
              </span>
              <div className="h-9 w-9 relative flex items-center justify-center shrink-0">
                <Image
                  src={METRIC_3D_ICONS.wallet}
                  alt="This Month"
                  width={34}
                  height={34}
                  className="object-contain drop-shadow"
                />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                {formatINR(stats.thisMonthSpent)}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">
                Current billing cycle
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              <span>Active Month</span>
              <span>
                {new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* Card 4: Average Per Transaction */}
          <div className="rounded-[28px] bg-white dark:bg-[#16171B] border border-slate-200/80 dark:border-white/10 p-5 shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Avg. Ticket Size
              </span>
              <div className="h-9 w-9 relative flex items-center justify-center shrink-0">
                <Image
                  src={METRIC_3D_ICONS.fuelGauge}
                  alt="Avg Ticket Size"
                  width={34}
                  height={34}
                  className="object-contain drop-shadow"
                />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                {formatINR(stats.avgSpent)}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">
                Per expense transaction
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
              <span>Normal Distribution</span>
              <span>Smart Safe Zone</span>
            </div>
          </div>
        </div>

        {/* 3. Payment Method Filter Tabs Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PAYMENT_METHOD_FILTER_TABS.map((tab) => {
            const isSelected = selectedMethod === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedMethod(tab.id);
                  setPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${isSelected
                  ? "bg-[#E2F937] text-black shadow-md shadow-[#E2F937]/20 border-transparent font-extrabold scale-102"
                  : "bg-white dark:bg-[#16171B] border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  }`}
              >
                {tab.image && (
                  <Image
                    src={tab.image}
                    alt={tab.label}
                    width={18}
                    height={18}
                    className="object-contain"
                  />
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4. Search and Dropdown Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search merchant, notes, or amount..."
              className="w-full pl-11 pr-10 py-2.5 rounded-full bg-white dark:bg-[#16171B] border border-slate-200/80 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#E2F937] shadow-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Dropdown Pill */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="appearance-none pl-4 pr-8 py-2.5 rounded-full bg-white dark:bg-[#16171B] border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E2F937] shadow-xs"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Member Dropdown Pill */}
            <div className="relative">
              <select
                value={selectedMember}
                onChange={(e) => {
                  setSelectedMember(e.target.value);
                  setPage(1);
                }}
                className="appearance-none pl-4 pr-8 py-2.5 rounded-full bg-white dark:bg-[#16171B] border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E2F937] shadow-xs"
              >
                <option value="all">All Family Members</option>
                {members.map((m) => (
                  <option key={m.id} value={m.user_id}>
                    {m.display_name} ({m.relationship || (m.role === "admin" ? "Admin" : "Member")})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  setPage(1);
                }}
                className="appearance-none pl-4 pr-8 py-2.5 rounded-full bg-white dark:bg-[#16171B] border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E2F937] shadow-xs"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="amount_desc">Highest Amount</option>
                <option value="amount_asc">Lowest Amount</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Reset Filters Pill */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* 5. Desktop Ledger Table (md:block) */}
        <div className="hidden md:block rounded-[28px] bg-white dark:bg-[#16171B] border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-white/10 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900/60">
                  <th className="py-4 px-6">DATE</th>
                  <th className="py-4 px-6">MERCHANT &amp; DETAILS</th>
                  <th className="py-4 px-6">CATEGORY</th>
                  <th className="py-4 px-6">PAID BY</th>
                  <th className="py-4 px-6">PAYMENT METHOD</th>
                  <th className="py-4 px-6 text-right">AMOUNT</th>
                  <th className="py-4 px-6 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-sm text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="h-6 w-6 rounded-full border-2 border-[#E2F937] border-t-transparent animate-spin" />
                        <span>Loading transactions from Supabase...</span>
                      </div>
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-sm text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <div className="w-28 h-20 relative flex items-center justify-center mb-1">
                          <Image
                            src={EMPTY_STATE_IMAGES.expenses}
                            alt="No expenses"
                            width={112}
                            height={80}
                            className="object-contain drop-shadow-md"
                          />
                        </div>
                        <p className="font-bold text-foreground">No matching expenses found</p>
                        <p className="text-xs text-muted-foreground">
                          Try adjusting your search criteria, category or payment method filter.
                        </p>
                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={resetAllFilters}
                            className="mt-2 px-4 py-1.5 rounded-full bg-[#E2F937] text-black text-xs font-bold"
                          >
                            Reset All Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => {
                    const categoryMeta = getCategoryMeta(expense.category?.name);
                    const paymentBadge = getPaymentBadge(expense.payment_method);
                    const relativeBadge = getRelativeDateBadge(expense.expense_date);

                    return (
                      <tr
                        key={expense.id}
                        className="group hover:bg-secondary/30 transition-colors"
                      >
                        {/* Date */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-foreground">
                              {formatDate(expense.expense_date)}
                            </span>
                            {relativeBadge && (
                              <span className="text-[10px] font-extrabold text-[#E2F937] bg-black/60 dark:bg-black/90 px-2 py-0.5 rounded-full w-fit mt-1">
                                {relativeBadge}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Merchant & Details */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-10 w-10 rounded-2xl flex items-center justify-center text-base shrink-0 shadow-2xs border border-border/80 bg-secondary/80 overflow-hidden"
                            >
                              {CATEGORY_IMAGES[expense.category_id] ? (
                                <Image
                                  src={CATEGORY_IMAGES[expense.category_id]}
                                  alt={expense.description}
                                  width={34}
                                  height={34}
                                  className="object-contain"
                                />
                              ) : (
                                <Receipt className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>

                            <div className="flex flex-col max-w-[220px]">
                              <span className="font-black text-sm text-foreground truncate">
                                {expense.description}
                              </span>
                              {expense.notes && (
                                <span className="text-[11px] text-muted-foreground truncate font-medium">
                                  {expense.notes}
                                </span>
                              )}
                              {expense.receipt_path && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                                  <Receipt className="h-3 w-3" /> Receipt attached
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${categoryMeta.bg} ${categoryMeta.text} ${categoryMeta.border}`}
                          >
                            <span>{expense.category?.name || "General"}</span>
                          </span>
                        </td>

                        {/* Paid By */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full overflow-hidden bg-[#E2F937] text-black font-black text-xs flex items-center justify-center shrink-0 shadow-xs relative">
                              {MEMBER_AVATARS[expense.paid_by?.user_id || ""]?.image ? (
                                <Image
                                  src={MEMBER_AVATARS[expense.paid_by?.user_id || ""].image}
                                  alt={expense.paid_by?.display_name || "Member"}
                                  width={28}
                                  height={28}
                                  className="object-cover"
                                />
                              ) : (
                                <span>{expense.paid_by?.display_name?.slice(0, 1).toUpperCase() || "M"}</span>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-foreground">
                                {expense.paid_by?.display_name || "Family Member"}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-semibold">
                                {expense.paid_by?.relationship || "Member"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Payment Method */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          {(() => {
                            const Icon = paymentBadge.icon;
                            return (
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${paymentBadge.className}`}
                              >
                                <Icon className="h-3.5 w-3.5" />
                                <span>{paymentBadge.label}</span>
                              </span>
                            );
                          })()}
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <span className="font-black text-base text-rose-600 dark:text-rose-400">
                            - {formatINR(expense.amount)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedExpense(expense)}
                              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpenseToEdit(expense)}
                              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
                              title="Edit Expense"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpenseToDelete(expense)}
                              className="p-2 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-all cursor-pointer"
                              title="Delete Expense"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="py-4 px-6 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 bg-slate-50/50 dark:bg-zinc-900/30">
            <div>
              Showing {expenses.length > 0 ? (page - 1) * pageSize + 1 : 0}-
              {Math.min(page * pageSize, totalCount)} of {totalCount} transactions
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === page;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-xs transition-all cursor-pointer ${isActive
                      ? "bg-[#E2F937] text-black shadow-md shadow-[#E2F937]/20 scale-105"
                      : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer transition-colors"
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 6. Mobile Cards View (md:hidden) */}
        <div className="md:hidden space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-slate-500 dark:text-zinc-400">
              <div className="h-6 w-6 rounded-full border-2 border-[#E2F937] border-t-transparent animate-spin mx-auto mb-2" />
              Loading expenses...
            </div>
          ) : expenses.length === 0 ? (
            <div className="rounded-[28px] bg-white dark:bg-[#16171B] border border-slate-200/80 dark:border-white/10 p-8 text-center text-sm text-slate-500 dark:text-zinc-400 flex flex-col items-center justify-center">
              <div className="w-24 h-18 relative mb-2 flex items-center justify-center">
                <Image
                  src={EMPTY_STATE_IMAGES.expenses}
                  alt="No expenses"
                  width={96}
                  height={72}
                  className="object-contain drop-shadow-md"
                />
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-xs">No matching expenses found</p>
            </div>
          ) : (
            expenses.map((expense) => {
              const categoryMeta = getCategoryMeta(expense.category?.name);
              const paymentBadge = getPaymentBadge(expense.payment_method);
              const catImg = CATEGORY_IMAGES[expense.category_id];

              return (
                <div
                  key={expense.id}
                  className="rounded-[24px] bg-white dark:bg-[#16171B] border border-slate-200/80 dark:border-white/10 p-4.5 shadow-xs space-y-3.5"
                >
                  {/* Top row: Category icon, merchant & amount */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-11 w-11 rounded-2xl flex items-center justify-center text-lg shrink-0 border border-border/80 bg-secondary/80 overflow-hidden"
                      >
                        {catImg ? (
                          <Image
                            src={catImg}
                            alt={expense.description}
                            width={36}
                            height={36}
                            className="object-contain"
                          />
                        ) : (
                          <Receipt className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-foreground">
                          {expense.description}
                        </h4>
                        <p className="text-xs text-muted-foreground font-medium">
                          {formatDate(expense.expense_date)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-base text-rose-600 dark:text-rose-400">
                        - {formatINR(expense.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Middle row: Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50 text-xs">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${categoryMeta.bg} ${categoryMeta.text} ${categoryMeta.border}`}
                    >
                      <span>{expense.category?.name || "General"}</span>
                    </span>

                    {(() => {
                      const Icon = paymentBadge.icon;
                      return (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${paymentBadge.className}`}
                        >
                          <Icon className="h-3 w-3" />
                          <span>{paymentBadge.label}</span>
                        </span>
                      );
                    })()}

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary text-foreground font-semibold text-[11px]">
                      <div className="h-4 w-4 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
                        {MEMBER_AVATARS[expense.paid_by?.user_id || ""]?.image ? (
                          <Image
                            src={MEMBER_AVATARS[expense.paid_by?.user_id || ""].image}
                            alt={expense.paid_by?.display_name || "Member"}
                            width={16}
                            height={16}
                            className="object-cover"
                          />
                        ) : (
                          <User className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <span>{expense.paid_by?.display_name || "Member"}</span>
                    </span>
                  </div>

                  {/* Action buttons footer */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/50">
                    <button
                      type="button"
                      onClick={() => setSelectedExpense(expense)}
                      className="px-3 py-1.5 rounded-full bg-secondary text-xs font-bold text-foreground hover:bg-secondary/80 transition-colors"
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpenseToEdit(expense)}
                      className="px-3 py-1.5 rounded-full bg-secondary text-xs font-bold text-foreground hover:bg-secondary/80 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpenseToDelete(expense)}
                      className="px-3 py-1.5 rounded-full bg-rose-500/10 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Mobile pagination */}
          <div className="py-3 flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded-full bg-card border border-border disabled:opacity-30"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded-full bg-card border border-border disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* 7. Expense Modals */}
        {isAddOpen && (
          <ExpenseDialog
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            onSaved={(savedExp) => {
              setIsAddOpen(false);
              loadData();
              refreshStats();
              showToast(`✓ Logged expense of ${formatINR(savedExp.amount)}!`);
            }}
          />
        )}

        {expenseToEdit && (
          <ExpenseDialog
            isOpen={Boolean(expenseToEdit)}
            initialExpense={expenseToEdit}
            onClose={() => setExpenseToEdit(null)}
            onSaved={(updatedExp) => {
              setExpenseToEdit(null);
              loadData();
              refreshStats();
              showToast(`✓ Updated expense of ${formatINR(updatedExp.amount)}!`);
            }}
          />
        )}

        {selectedExpense && (
          <ExpenseDetailsModal
            isOpen={Boolean(selectedExpense)}
            expense={selectedExpense}
            onClose={() => setSelectedExpense(null)}
            onEdit={(exp) => {
              setSelectedExpense(null);
              setExpenseToEdit(exp);
            }}
            onDelete={(exp) => {
              setSelectedExpense(null);
              setExpenseToDelete(exp);
            }}
          />
        )}

        {expenseToDelete && (
          <DeleteDialog
            isOpen={Boolean(expenseToDelete)}
            expenseDescription={expenseToDelete.description}
            expenseAmount={expenseToDelete.amount}
            categoryName={expenseToDelete.category?.name || "General"}
            onClose={() => setExpenseToDelete(null)}
            onConfirm={async () => {
              await DataService.deleteExpense(expenseToDelete.id);
              setExpenseToDelete(null);
              loadData();
              refreshStats();
              showToast(`✓ Deleted expense: ${expenseToDelete.description}`);
            }}
          />
        )}
      </div>
    </AppLayout>
  );
}
