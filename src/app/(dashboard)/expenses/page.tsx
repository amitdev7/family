"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronDown,
  Download,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  ShoppingBag,
  Utensils,
  Zap,
  Car,
  HeartPulse,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import { ExpenseDetailsModal } from "@/components/expenses/expense-details-modal";
import { DeleteDialog } from "@/components/expenses/delete-dialog";
import { DataService } from "@/lib/data-service";
import { Expense, Category, HouseholdMember } from "@/lib/types";
import { formatINR } from "@/lib/formatters";

const MERCHANT_ICONS: Record<string, { bg: string; text: string; icon: any }> = {
  groceries: { bg: "bg-emerald-100 text-emerald-600", text: "Groceries", icon: ShoppingBag },
  food: { bg: "bg-orange-100 text-orange-600", text: "Food & Dining", icon: Utensils },
  transport: { bg: "bg-blue-100 text-blue-600", text: "Transport", icon: Car },
  utilities: { bg: "bg-red-100 text-red-600", text: "Utilities", icon: Zap },
  shopping: { bg: "bg-pink-100 text-pink-600", text: "Shopping", icon: ShoppingBag },
  healthcare: { bg: "bg-teal-100 text-teal-600", text: "Healthcare", icon: HeartPulse },
};

function getCategoryIcon(catName?: string) {
  const name = (catName || "").toLowerCase();
  for (const key of Object.keys(MERCHANT_ICONS)) {
    if (name.includes(key)) {
      return MERCHANT_ICONS[key];
    }
  }
  return { bg: "bg-lime-100 text-lime-700", text: catName || "Other", icon: ShoppingBag };
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters matching Figma
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMember, setSelectedMember] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await DataService.getExpenses({
        search: search.trim() || undefined,
        categoryId: selectedCategory === "all" ? undefined : selectedCategory,
        paidByUserId: selectedMember === "all" ? undefined : selectedMember,
        paymentMethod: selectedMethod === "all" ? undefined : selectedMethod,
        page,
        pageSize,
      });
      setExpenses(res.expenses);
      setTotalCount(res.totalCount);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory, selectedMember, selectedMethod, page, pageSize]);

  useEffect(() => {
    DataService.getCategories().then(setCategories);
    DataService.getMembers().then(setMembers);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportCSV = () => {
    const csv = DataService.exportExpensesToCSV(expenses);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <AppLayout
      title="Expenses Ledger"
      onAddExpenseClick={() => setIsAddOpen(true)}
    >
      <div className="space-y-6 select-none">
        {/* Title Header with Lime Underline Accent from Figma image_20261014_111612.jpg */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Expenses Ledger Table
          </h2>
          <div className="h-1 w-14 bg-[#D4F835] rounded-full mt-2" />
        </div>

        {/* Search Bar matching Figma */}
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search transactions..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
          />
        </div>

        {/* Filter Pills Row matching Figma image_20261014_111612.jpg */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Dropdown Pill */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="appearance-none pl-4 pr-8 py-2 rounded-full bg-card border border-border text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
            >
              <option value="all">Category • All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Member Dropdown Pill */}
          <div className="relative">
            <select
              value={selectedMember}
              onChange={(e) => {
                setSelectedMember(e.target.value);
                setPage(1);
              }}
              className="appearance-none pl-4 pr-8 py-2 rounded-full bg-card border border-border text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
            >
              <option value="all">Member • All members</option>
              {members.map((m) => (
                <option key={m.id} value={m.user_id}>
                  {m.display_name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Payment Method Dropdown Pill */}
          <div className="relative">
            <select
              value={selectedMethod}
              onChange={(e) => {
                setSelectedMethod(e.target.value);
                setPage(1);
              }}
              className="appearance-none pl-4 pr-8 py-2 rounded-full bg-card border border-border text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
            >
              <option value="all">Payment • All methods</option>
              <option value="UPI">UPI</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Cash">Cash</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* CSV Export Pill */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0E0E10] text-white hover:bg-zinc-800 text-xs font-bold cursor-pointer transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>CSV</span>
          </button>

          {/* Reset Filters Pill */}
          {(search || selectedCategory !== "all" || selectedMember !== "all" || selectedMethod !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setSelectedMember("all");
                setSelectedMethod("all");
                setPage(1);
              }}
              className="px-3.5 py-2 rounded-full bg-secondary text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Ledger Table Container matching Figma */}
        <div className="rounded-[28px] bg-card border border-border/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/70 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  <th className="py-4 px-6">DATE</th>
                  <th className="py-4 px-6">MERCHANT</th>
                  <th className="py-4 px-6">CATEGORY</th>
                  <th className="py-4 px-6">MEMBER</th>
                  <th className="py-4 px-6">PAYMENT METHOD</th>
                  <th className="py-4 px-6 text-right">AMOUNT</th>
                  <th className="py-4 px-6 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                      Loading ledger entries...
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                      No matching expenses found.
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => {
                    const iconMeta = getCategoryIcon(expense.category?.name);
                    const Icon = iconMeta.icon;

                    return (
                      <tr
                        key={expense.id}
                        className="group hover:bg-secondary/40 transition-colors"
                      >
                        {/* Date */}
                        <td className="py-4 px-6 text-xs font-medium text-muted-foreground whitespace-nowrap">
                          {expense.expense_date}
                        </td>

                        {/* Merchant */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${iconMeta.bg}`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="font-bold text-sm text-foreground truncate max-w-[180px]">
                              {expense.description}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-6">
                          <span className="inline-block px-3 py-1 rounded-full bg-secondary/70 text-foreground text-xs font-semibold">
                            {expense.category?.name || "General"}
                          </span>
                        </td>

                        {/* Member */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-[#D4F835] text-black font-bold text-[10px] flex items-center justify-center shrink-0">
                              {expense.paid_by?.display_name?.slice(0, 1).toUpperCase() || "F"}
                            </div>
                            <span className="text-xs font-medium text-foreground">
                              {expense.paid_by?.display_name || "Family Member"}
                            </span>
                          </div>
                        </td>

                        {/* Payment Method */}
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-xs font-medium text-foreground">
                            <CreditCard className="h-3 w-3 text-muted-foreground" />
                            <span>{expense.payment_method}</span>
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-6 text-right">
                          <span className="font-extrabold text-sm text-foreground whitespace-nowrap">
                            - {formatINR(expense.amount)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedExpense(expense)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpenseToEdit(expense)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                              title="Edit Expense"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpenseToDelete(expense)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
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

          {/* Pagination Footer matching Figma */}
          <div className="py-4 px-6 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-muted-foreground">
            <div>
              Showing {expenses.length > 0 ? (page - 1) * pageSize + 1 : 0}-
              {Math.min(page * pageSize, totalCount)} of {totalCount} transactions
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-full hover:bg-secondary disabled:opacity-30 cursor-pointer"
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
                    className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${isActive
                      ? "bg-[#D4F835] text-black shadow-xs"
                      : "hover:bg-secondary text-foreground"
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
                className="p-1.5 rounded-full hover:bg-secondary disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Expense Modals */}
        {isAddOpen && (
          <ExpenseDialog
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            onSaved={() => {
              setIsAddOpen(false);
              loadData();
            }}
          />
        )}

        {expenseToEdit && (
          <ExpenseDialog
            isOpen={Boolean(expenseToEdit)}
            initialExpense={expenseToEdit}
            onClose={() => setExpenseToEdit(null)}
            onSaved={() => {
              setExpenseToEdit(null);
              loadData();
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
            }}
          />
        )}
      </div>
    </AppLayout>
  );
}

