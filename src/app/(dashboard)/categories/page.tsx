"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { CategoryIcon } from "@/components/ui/category-icon";
import { DataService } from "@/lib/data-service";
import { Category, Expense } from "@/lib/types";
import { categoryFormSchema } from "@/lib/validations";
import { CATEGORY_ICON_MAP } from "@/lib/constants/categories";
import { formatINR } from "@/lib/formatters";

const COLOR_PRESETS = [
  "#16a34a",
  "#0284c7",
  "#eab308",
  "#06b6d4",
  "#8b5cf6",
  "#f97316",
  "#14b8a6",
  "#6366f1",
  "#3b82f6",
  "#ef4444",
  "#d97706",
  "#ec4899",
  "#a855f7",
  "#64748b",
  "#059669",
  "#84cc16",
  "#94a3b8",
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("HelpCircle");
  const [color, setColor] = useState("#16a34a");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Reassignment Delete State
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [reassignCategoryId, setReassignCategoryId] = useState<string>("");

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [cats, expRes] = await Promise.all([
        DataService.getCategories(),
        DataService.getExpenses({ pageSize: 1000 }),
      ]);
      setCategories(cats);
      setExpenses(expRes.expenses);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddCategory = (existing?: Category) => {
    setFormError(null);
    if (existing) {
      setEditingCategory(existing);
      setName(existing.name);
      setIcon(existing.icon);
      setColor(existing.color);
    } else {
      setEditingCategory(null);
      setName("");
      setIcon("ShoppingCart");
      setColor("#16a34a");
    }
    setIsEditModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validation = categoryFormSchema.safeParse({
      name,
      icon,
      color,
    });

    if (!validation.success) {
      setFormError(validation.error.issues[0]?.message || "Validation failed");
      return;
    }

    try {
      setIsSaving(true);
      if (editingCategory) {
        editingCategory.name = validation.data.name;
        editingCategory.icon = validation.data.icon;
        editingCategory.color = validation.data.color;
      } else {
        const newCat: Category = {
          id: "cat-" + Date.now(),
          household_id: "11111111-1111-1111-1111-111111111111",
          name: validation.data.name,
          icon: validation.data.icon,
          color: validation.data.color,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        categories.push(newCat);
      }
      setIsEditModalOpen(false);
      loadData();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (cat: Category) => {
    setCategoryToDelete(cat);
    const otherCat = categories.find((c) => c.id !== cat.id);
    setReassignCategoryId(otherCat?.id || "");
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    // Reassign any referencing expenses
    expenses.forEach((e) => {
      if (e.category_id === categoryToDelete.id) {
        e.category_id = reassignCategoryId;
      }
    });

    // Remove category
    setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
    setCategoryToDelete(null);
    loadData();
  };

  if (isLoading) {
    return (
      <AppLayout title="Expense Categories" subtitle="Loading categories...">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-card border border-border" />
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Expense Categories"
      subtitle="Organize and classify household spending with icons, colors, and safety guards"
    >
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground">
            {categories.length} Active Categories Configured
          </h3>
        </div>

        <Button
          size="sm"
          onClick={() => openAddCategory()}
          className="gap-1.5 text-xs font-semibold"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const matchingExpenses = expenses.filter((e) => e.category_id === cat.id);
          const totalSpent = matchingExpenses.reduce((sum, e) => sum + e.amount, 0);

          return (
            <Card key={cat.id} className="p-4 hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-xs shrink-0"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{cat.name}</h4>
                    <span className="text-xs text-muted-foreground">
                      {matchingExpenses.length} transactions
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openAddCategory(cat)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(cat)}
                    className="p-1.5 rounded-lg text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total Spend:</span>
                <span className="font-extrabold text-foreground">{formatINR(totalSpent)}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingCategory ? "Edit Category" : "New Expense Category"}
        description="Choose a descriptive name, custom icon, and color code"
        maxWidth="sm"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Category Name
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. Organic Groceries, Pet Care"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Icon
            </label>
            <Select value={icon} onChange={(e) => setIcon(e.target.value)}>
              {Object.keys(CATEGORY_ICON_MAP).map((iconKey) => (
                <option key={iconKey} value={iconKey}>
                  {iconKey}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Theme Color
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {COLOR_PRESETS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setColor(hex)}
                  className={`w-6 h-6 rounded-full transition-transform ${color === hex ? "scale-125 ring-2 ring-primary ring-offset-2" : "hover:scale-110"
                    }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
            <Input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Save Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete and Reassignment Modal Guard */}
      <Modal
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        title="Delete Category with Reassignment Guard"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              To maintain financial audit integrity, all existing expenses in{" "}
              <strong>{categoryToDelete?.name}</strong> must be safely reassigned to another category before deletion.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Reassign existing expenses to:
            </label>
            <Select
              value={reassignCategoryId}
              onChange={(e) => setReassignCategoryId(e.target.value)}
            >
              {categories
                .filter((c) => c.id !== categoryToDelete?.id)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </Select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" onClick={() => setCategoryToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Reassign & Delete
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

