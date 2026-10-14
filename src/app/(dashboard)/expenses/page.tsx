"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Download,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  ShoppingCart,
  Utensils,
  Fuel,
  HeartPulse,
  Home,
  Receipt,
  Zap,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import { ExpenseDetailsModal } from "@/components/expenses/expense-details-modal";
import { DeleteExpenseDialog } from "@/components/expenses/delete-dialog";
import { DataService } from "@/lib/data-service";
import { Expense, Category, HouseholdMember, PaymentMethod } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/formatters";

type SortOption = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

function getMerchantIcon(description: string) {
  const d = description.toLowerCase();
  if (d.includes("grocery") || d.includes("dmart") || d.includes("zepto") || d.includes("supermarket")) return ShoppingCart;
  if (d.includes("swiggy") || d.includes("food") || d.includes("dinner") || d.includes("lunch")) return Utensils;
  if (d.includes("petrol") || d.includes("fuel") || d.includes("transport") || d.includes("uber")) return Fuel;
  if (d.includes("pharmacy") || d.includes("doctor") || d.includes("medical")) return HeartPulse;
  if (d.includes("rent") || d.includes("home") || d.includes("apartment")) return Home;
  return Receipt;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMember, setSelectedMember] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date_desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Dialogs state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseToView, setExpenseToView] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const loadExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await DataService.getExpenses({
        search: search.trim() || undefined,
        categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
        paidByUserId: selectedMember !== "all" ? selectedMember : undefined,
        paymentMethod: selectedMethod !== "all" ? (selectedMethod as PaymentMethod) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        page,
        pageSize,
      });
      setExpenses(res.expenses);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory, selectedMember, selectedMethod, startDate, endDate, sortBy, page, pageSize]);

  useEffect(() => {
    DataService.getCategories().then(setCategories);
    DataService.getMembers().then(setMembers);
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleExportCSV = async () => {
    const csvContent = await DataService.exportExpensesCSV();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `expenses_ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmDelete = async () => {
    if (expenseToDelete) {
      await DataService.deleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
      loadExpenses();
    }
  };

  return (
    <AppLayout
      title="Expenses Ledger"
      subtitle="Complete ledger of all family expenses with real-time sync"
      onAddExpenseClick={() => setIsAddExpenseOpen(true)}
    >
      <div className="space-y-6">
        {/* Header Title with Lime Bar */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Expenses Ledger Table
          </h2>
          <div className="h-1.5 w-16 bg-[#D4F835] rounded-full mt-2" />
        </div>

        {/* Search Bar matching Figma */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full h-12 pl-11 pr-4 rounded-full bg-card border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835] shadow-2xs"
          />
        </div>

        {/* Filter Pills Row matching Figma */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="h-10 px-4 rounded-full bg-card border border-border text-xs font-bold text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4F835] shadow-2xs appearance-none pr-8"
            >
              <option value="all">Category • All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  Category • {c.name}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-[10px]">
              ▼
            </span>
          </div>

          {/* Member Filter */}
          <div className="relative">
            <select
              value={selectedMember}
              onChange={(e) => {
                setSelectedMember(e.target.value);
                setPage(1);
              }}
              className="h-10 px-4 rounded-full bg-card border border-border text-xs font-bold text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4F835] shadow-2xs appearance-none pr-8"
            >
              <option value="all">Member • All members</option>
              {members.map((m) => (
                <option key={m.id} value={m.user_id}>
                  Member • {m.display_name} ({m.relationship || m.role})
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-[10px]">
              ▼
            </span>
          </div>

          {/* Payment Method Filter */}
          <div className="relative">
            <select
              value={selectedMethod}
              onChange={(e) => {
                setSelectedMethod(e.target.value);
                setPage(1);
              }}
              className="h-10 px-4 rounded-full bg-card border border-border text-xs font-bold text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4F835] shadow-2xs appearance-none pr-8"
            >
              <option value="all">Payment • All methods</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Net Banking">Net Banking</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-[10px]">
              ▼
            </span>
          </div>

          {/* CSV Export Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="h-10 px-4 rounded-full bg-[#0E0E10] hover:bg-black/85 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ml-auto cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>CSV</span>
          </button>

          {/* Add Expense Button */}
          <button
            type="button"
            onClick={() => setIsAddExpenseOpen(true)}
            className="h-10 px-4 rounded-full bg-[#D4F835] hover:bg-[#c5ea28] active:scale-95 text-black text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Ledger Table Container */}
        <div className="rounded-[28px] bg-card border border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider bg-muted/30">
                  <th className="py-4 px-5">DATE</th>
                  <th className="py-4 px-5">MERCHANT</th>
                  <th className="py-4 px-5">CATEGORY</th>
                  <th className="py-4 px-5">MEMBER</th>
                  <th className="py-4 px-5">PAYMENT METHOD</th>
                  <th className="py-4 px-5 text-right">AMOUNT</th>
                  <th className="py-4 px-4 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      Loading transactions...
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      No expenses match your filters.
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => {
                    const MerchantIcon = getMerchantIcon(expense.description);

                    return (
                      <tr
                        key={expense.id}
                        className="hover:bg-muted/40 transition-colors group cursor-pointer"
                        onClick={() => setExpenseToView(expense)}
                      >
                        {/* Date */}
                        <td className="py-4 px-5 text-muted-foreground font-semibold whitespace-nowrap">
                          {formatDate(expense.expense_date)}
                        </td>

                        {/* Merchant / Description */}
                        <td className="py-4 px-5 font-extrabold text-foreground whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-foreground shrink-0 shadow-2xs">
                              <MerchantIcon className="h-4 w-4" />
                            </div>
                            <span className="truncate max-w-[200px]">{expense.description}</span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-5 text-foreground font-semibold whitespace-nowrap">
                          {expense.category?.name || "General"}
                        </td>

                        {/* Member */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-6 w-6 rounded-full text-black font-extrabold text-[10px] flex items-center justify-center shadow-2xs shrink-0"
                              style={{ backgroundColor: expense.paid_by?.color || "#D4F835" }}
                            >
                              {expense.paid_by?.display_name ? expense.paid_by.display_name.charAt(0) : "A"}
                            </div>
                            <span className="font-semibold text-foreground">
                              {expense.paid_by?.display_name || "Member"}
                            </span>
                          </div>
                        </td>

                        {/* Payment Method */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted font-bold text-[11px] text-foreground">
                            <Zap className="h-3 w-3 text-[#B8DC14]" />
                            <span>{expense.payment_method}</span>
                          </span>
                        </td>

                        {/* Amount in Bold */}
                        <td className="py-4 px-5 text-right font-black text-sm text-foreground whitespace-nowrap">
                          - {formatINR(expense.amount)}
                        </td>

                        {/* Actions */}
                        <td
                          className="py-4 px-4 text-center whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => setExpenseToView(expense)}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              title="View details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpenseToEdit(expense)}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              title="Edit expense"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpenseToDelete(expense)}
                              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                              title="Delete expense"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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
          <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              Showing {expenses.length > 0 ? (page - 1) * pageSize + 1 : 0}-
              {Math.min(page * pageSize, totalCount)} of {totalCount} transactions
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isCurrent = pageNum === page;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={`h-8 w-8 rounded-full font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-[#D4F835] text-black shadow-xs font-black"
                        : "hover:bg-muted text-foreground"
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
                className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isAddExpenseOpen && (
        <ExpenseDialog
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
          onSaved={() => {
            loadExpenses();
            setIsAddExpenseOpen(false);
          }}
        />
      )}

      {expenseToEdit && (
        <ExpenseDialog
          isOpen={!!expenseToEdit}
          expenseToEdit={expenseToEdit}
          onClose={() => setExpenseToEdit(null)}
          onSaved={() => {
            loadExpenses();
            setExpenseToEdit(null);
          }}
        />
      )}

      {expenseToView && (
        <ExpenseDetailsModal
          isOpen={!!expenseToView}
          expense={expenseToView}
          onClose={() => setExpenseToView(null)}
          onEdit={(exp) => {
            setExpenseToView(null);
            setExpenseToEdit(exp);
          }}
          onDelete={(exp) => {
            setExpenseToView(null);
            setExpenseToDelete(exp);
          }}
        />
      )}

      {expenseToDelete && (
        <DeleteExpenseDialog
          isOpen={!!expenseToDelete}
          expense={expenseToDelete}
          onClose={() => setExpenseToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </AppLayout>
  );
}
