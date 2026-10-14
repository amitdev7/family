"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { DataService } from "@/lib/data-service";
import { Category } from "@/lib/types";
import { formatINR } from "@/lib/formatters";
import {
  ListFilter,
  Search,
  Plus,
  ShoppingCart,
  ShoppingBag,
  Fuel,
  HeartPulse,
  Utensils,
  Car,
  Heart,
  Home,
  Check,
} from "lucide-react";

const ICON_OPTIONS = [
  { id: "ShoppingCart", icon: ShoppingCart },
  { id: "Utensils", icon: Utensils },
  { id: "Car", icon: Car },
  { id: "Heart", icon: Heart },
  { id: "Home", icon: Home },
  { id: "ShoppingBag", icon: ShoppingBag },
];

const COLOR_OPTIONS = [
  "#D4F835", // Lime
  "#0E0E10", // Black
  "#9CA3AF", // Gray
  "#3B82F6", // Blue
  "#EC4899", // Pink
  "#8B5CF6", // Purple
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // New Category State
  const [newCatName, setNewCatName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0].id);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await DataService.getCategories();
      setCategories(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      setIsSaving(true);
      await DataService.addCategory({
        name: newCatName.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });
      setNewCatName("");
      setToast("New category created successfully!");
      setTimeout(() => setToast(null), 3000);
      loadData();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout title="Category Center" subtitle="Organize and monitor spending groups">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header Bar matching Figma */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-[#D4F835] text-black flex items-center justify-center font-bold shadow-xs">
              <ListFilter className="h-5 w-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
              Category Center
            </h2>
          </div>

          <a
            href="#create-category"
            className="px-3.5 py-1.5 rounded-full bg-[#D4F835] hover:bg-[#c5ea28] text-black text-xs font-extrabold shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>New Category</span>
          </a>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-full bg-card border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835] shadow-2xs"
          />
        </div>

        {/* Categories Grid matching Figma */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredCategories.slice(0, 4).map((cat, idx) => {
            const mockTrans = [32, 18, 14, 6][idx % 4] || 12;
            const mockAmount = [24500, 10200, 16800, 5400][idx % 4] || 8500;
            const mockTrend = [
              { label: "+12% vs last month", type: "up" },
              { label: "-5% vs last month", type: "down" },
              { label: "No change", type: "neutral" },
              { label: "+8% vs last month", type: "up" },
            ][idx % 4];

            // Resolve icon component
            const iconMatch = ICON_OPTIONS.find((i) => i.id === cat.icon);
            const Icon = iconMatch ? iconMatch.icon : ShoppingCart;

            return (
              <div
                key={cat.id}
                className="rounded-[28px] bg-card border border-border p-6 shadow-xs flex flex-col items-center text-center justify-between min-h-[220px] transition-transform hover:-translate-y-1"
              >
                {/* Large Circle Icon with vibrant color */}
                <div
                  className="h-16 w-16 rounded-full flex items-center justify-center font-bold shadow-xs text-black"
                  style={{ backgroundColor: cat.color || COLOR_OPTIONS[idx % COLOR_OPTIONS.length] }}
                >
                  <Icon className="h-8 w-8 stroke-[2.2]" />
                </div>

                <div className="mt-3">
                  <h4 className="font-extrabold text-base text-foreground">
                    {cat.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {mockTrans} transactions • {formatINR(mockAmount)}
                  </p>
                </div>

                {/* Trend Badge */}
                <div className="mt-3">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold ${
                      mockTrend.type === "up"
                        ? "text-emerald-500"
                        : mockTrend.type === "down"
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span>{mockTrend.type === "up" ? "↗" : mockTrend.type === "down" ? "↘" : "→"}</span>
                    <span>{mockTrend.label}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Color & Icon Picker Form matching Figma */}
        <form
          id="create-category"
          onSubmit={handleSaveCategory}
          className="rounded-[28px] bg-card border border-border p-6 shadow-xs space-y-5"
        >
          <h3 className="text-base font-extrabold text-foreground">
            Color & Icon Picker
          </h3>

          {toast && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 p-2.5 rounded-xl">
              {toast}
            </p>
          )}

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5">
              Category Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Travel & Vacations"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-muted/60 border border-border text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
            />
          </div>

          {/* Choose Color */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-2">
              Choose Color:
            </label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((c) => {
                const isPicked = selectedColor === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    style={{ backgroundColor: c }}
                    className={`h-8 w-8 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                      isPicked ? "ring-2 ring-offset-2 ring-black dark:ring-white scale-110" : "hover:scale-105"
                    }`}
                  >
                    {isPicked && (
                      <Check className={`h-4 w-4 stroke-[3] ${c === "#D4F835" ? "text-black" : "text-white"}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Choose Icon */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-2">
              Choose Icon:
            </label>
            <div className="flex items-center gap-3">
              {ICON_OPTIONS.map((item) => {
                const isPicked = selectedIcon === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedIcon(item.id)}
                    className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                      isPicked
                        ? "bg-[#D4F835] text-black shadow-xs ring-1 ring-[#c2e424]"
                        : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Button matching Figma */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full h-12 rounded-full bg-[#0E0E10] hover:bg-black/90 active:scale-98 text-white font-extrabold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "+ Save Category"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
