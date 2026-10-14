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
  FileSpreadsheet,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import { ExpenseDetailsModal } from "@/components/expenses/expense-details-modal";
import { DeleteExpenseDialog } from "@/components/expenses/delete-dialog";
import { DataService } from "@/lib/data-service";
import { Expense, Category, HouseholdMember, PaymentMethod } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/formatters";

type SortOption = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

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
  const pageSize = 15;

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

  // Total sum of currently loaded expenses
  const currentTotalAmount = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const handleExportCSV = () => {
    const csvContent = DataService.exportExpensesToCSV(expenses);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Our_Home_Expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteConfirm = async () => {
    if (expenseToDelete) {
      await DataService.deleteExpense(expenseToDelete.id);
      loadExpenses();
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedMember("all");
    setSelectedMethod("all");
    setStartDate("");
    setEndDate("");
    setSortBy("date_desc");
    setPage(1);
  };

  return (
    <AppLayout
      title="Household Expenses"
      subtitle="Complete ledger of all family expenses with real-time sync"
    >
      {/* Top Header & Export bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-muted-foreground">Filtered Total:</span>
            <span className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {formatINR(currentTotalAmount)}
            </span>
            <Badge variant="secondary" className="ml-2 font-medium">
              {totalCount} {totalCount === 1 ? "expense" : "expenses"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={expenses.length === 0}
            className="gap-1.5 text-xs font-semibold"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddExpenseOpen(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <Card className="mb-6 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search description, notes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-10 text-xs sm:text-sm"
            />
          </div>

          {/* Category Filter */}
          <div>
            <Select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="h-10 text-xs sm:text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Paid By Filter */}
          <div>
            <Select
              value={selectedMember}
              onChange={(e) => {
                setSelectedMember(e.target.value);
                setPage(1);
              }}
              className="h-10 text-xs sm:text-sm"
            >
              <option value="all">All Family Members</option>
              {members.map((m) => (
                <option key={m.id} value={m.user_id}>
                  Paid by: {m.display_name}
                </option>
              ))}
            </Select>
          </div>

          {/* Sort By */}
          <div>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-10 text-xs sm:text-sm"
            >
              <option value="date_desc">Newest First (Date ↓)</option>
              <option value="date_asc">Oldest First (Date ↑)</option>
              <option value="amount_desc">Highest Amount (₹ ↓)</option>
              <option value="amount_asc">Lowest Amount (₹ ↑)</option>
            </Select>
          </div>
        </div>

        {/* Date Filter Row & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-border/60 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">From:</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="h-8 text-xs w-36"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">To:</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="h-8 text-xs w-36"
              />
            </div>
          </div>

          {(search || selectedCategory !== "all" || selectedMember !== "all" || selectedMethod !== "all" || startDate || endDate) && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-primary font-semibold hover:underline text-xs"
            >
              Reset Filters
            </button>
          )}
        </div>
      </Card>

      {/* Main Expense Table / Card List */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-card border border-border" />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="No expenses found"
          description="Try adjusting your active search or filter criteria, or record a new expense for your home."
          action={
            <Button onClick={() => setIsAddExpenseOpen(true)} className="gap-2 font-semibold">
              <Plus className="h-4 w-4" />
              <span>Record New Expense</span>
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Paid By</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow
                    key={expense.id}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => setExpenseToView(expense)}
                  >
                    <TableCell className="font-medium whitespace-nowrap text-muted-foreground text-xs">
                      {formatDate(expense.expense_date)}
                    </TableCell>

                    <TableCell>
                      <span className="font-semibold text-foreground text-sm block">
                        {expense.description}
                      </span>
                      {expense.notes && (
                        <span className="text-[11px] text-muted-foreground line-clamp-1">
                          {expense.notes}
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/60">
                        <CategoryIcon
                          name={expense.category?.icon || "Receipt"}
                          className="h-3.5 w-3.5"
                          style={{ color: expense.category?.color }}
                        />
                        <span>{expense.category?.name || "General"}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs">
                      {expense.paid_by?.display_name || "Family Member"}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-[11px]">
                        {expense.payment_method}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right font-extrabold text-foreground text-sm whitespace-nowrap">
                      {formatINR(expense.amount)}
                    </TableCell>

                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setExpenseToView(expense)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpenseToEdit(expense)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpenseToDelete(expense)}
                          className="p-1.5 rounded-lg text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View (Adapts table to responsive cards with large touch targets) */}
          <div className="md:hidden space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                onClick={() => setExpenseToView(expense)}
                className="p-4 rounded-xl border border-border bg-card shadow-xs active:scale-[0.99] transition-transform space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0"
                      style={{ backgroundColor: expense.category?.color || "#124334" }}
                    >
                      <CategoryIcon name={expense.category?.icon || "Receipt"} className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-sm text-foreground truncate">
                        {expense.description}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(expense.expense_date)} • {expense.category?.name}
                      </p>
                    </div>
                  </div>
                  <span className="font-extrabold text-base text-foreground shrink-0">
                    {formatINR(expense.amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/60">
                  <span>Paid by {expense.paid_by?.display_name?.split(" ")[0]} ({expense.payment_method})</span>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setExpenseToEdit(expense)}
                      className="p-1 rounded text-primary font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpenseToDelete(expense)}
                      className="p-1 rounded text-destructive font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border text-xs text-muted-foreground">
            <div>
              Showing {expenses.length} of {totalCount} records (Page {page} of {totalPages})
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="gap-1 text-xs h-8"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="gap-1 text-xs h-8"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* View Details Modal */}
      <ExpenseDetailsModal
        isOpen={Boolean(expenseToView)}
        onClose={() => setExpenseToView(null)}
        expense={expenseToView}
        onEdit={(exp) => {
          setExpenseToView(null);
          setExpenseToEdit(exp);
        }}
        onDelete={(exp) => {
          setExpenseToView(null);
          setExpenseToDelete(exp);
        }}
      />

      {/* Add / Edit Dialog */}
      <ExpenseDialog
        isOpen={isAddExpenseOpen || Boolean(expenseToEdit)}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setExpenseToEdit(null);
        }}
        onSaved={() => loadExpenses()}
        expenseToEdit={expenseToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteExpenseDialog
        isOpen={Boolean(expenseToDelete)}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleDeleteConfirm}
        expense={expenseToDelete}
      />
    </AppLayout>
  );
}

