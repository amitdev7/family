"use client";

import React, { useState, useEffect } from "react";
import {
  Tags,
  Search,
  ShoppingCart,
  Utensils,
  Car,
  Heart,
  Home,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { DataService } from "@/lib/data-service";
import { Category, Expense } from "@/lib/types";
import { formatINR } from "@/lib/formatters";
import Image from "next/image";
import { CATEGORY_IMAGES, NAV_3D_ICONS } from "@/lib/assets";

const COLOR_SWATCHES = [
  { name: "Lime", hex: "#E2F937", bg: "bg-[#E2F937]" },
  { name: "Black", hex: "#0E0E10", bg: "bg-[#0E0E10]" },
  { name: "Grey", hex: "#9CA3AF", bg: "bg-zinc-400" },
  { name: "Blue", hex: "#3B82F6", bg: "bg-blue-500" },
  { name: "Pink", hex: "#EC4899", bg: "bg-pink-500" },
  { name: "Purple", hex: "#A855F7", bg: "bg-purple-500" },
];

const ICON_CHOICES = [
  { name: "cart", icon: ShoppingCart },
  { name: "dining", icon: Utensils },
  { name: "transport", icon: Car },
  { name: "health", icon: Heart },
  { name: "housing", icon: Home },
  { name: "shopping", icon: ShoppingBag },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_SWATCHES[0].hex);
  const [selectedIcon, setSelectedIcon] = useState("cart");
  const [newCatName, setNewCatName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = async () => {
    const [cats, expsRes] = await Promise.all([
      DataService.getCategories(),
      DataService.getExpenses({ pageSize: 1000 }),
    ]);
    setCategories(cats);
    setExpenses(expsRes.expenses);
  };

  useEffect(() => {
    loadData();
  }, []);

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
      setToastMsg("Category saved successfully!");
      setTimeout(() => setToastMsg(null), 3000);
      loadData();
    } finally {
      setIsSaving(false);
    }
  };

  const categoryCards = categories.map((cat, idx) => {
    const catExpenses = expenses.filter((e) => e.category_id === cat.id);
    const totalAmount = catExpenses.reduce((sum, e) => sum + e.amount, 0);
    const count = catExpenses.length;
    const icons = [ShoppingCart, ShoppingBag, Car, Heart, Home, Utensils];
    const IconComponent = icons[idx % icons.length];
    return {
      id: cat.id,
      name: cat.name,
      count,
      amount: formatINR(totalAmount),
      trend: count > 0 ? `${count} transaction${count === 1 ? "" : "s"}` : "No transactions yet",
      trendType: count > 0 ? "up" : "neutral",
      icon: IconComponent,
      bg: idx % 2 === 0 ? "bg-[#E2F937] text-black" : "bg-secondary text-foreground",
    };
  });

  const filteredCards = categoryCards.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Category Center">
      <div className="max-w-xl mx-auto space-y-6 select-none">
        {/* Top Header Bar matching Figma image_20261014_111556.jpg */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 relative flex items-center justify-center shrink-0">
              <Image
                src={NAV_3D_ICONS.categories}
                alt="Category Center"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Category Center
            </h2>
          </div>

          <button
            type="button"
            onClick={() => document.getElementById("new-cat-input")?.focus()}
            className="px-3.5 py-1.5 rounded-full border border-border text-xs font-bold text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            + New Category
          </button>
        </div>

        {/* Search Input matching Figma */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#E2F937]"
          />
        </div>

        {/* 2x2 Category Cards Grid matching Figma */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredCards.map((card, i) => {
            const Icon = card.icon;

            return (
              <div
                key={i}
                className="rounded-[28px] bg-card border border-border/80 p-5 shadow-xs flex flex-col items-center text-center space-y-3"
              >
                {/* 3D Category Badge */}
                <div
                  className="h-16 w-16 rounded-2xl flex items-center justify-center p-1 relative"
                >
                  {CATEGORY_IMAGES[card.id] ? (
                    <Image
                      src={CATEGORY_IMAGES[card.id]}
                      alt={card.name}
                      width={60}
                      height={60}
                      className="object-contain drop-shadow-md hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center shadow-xs ${card.bg}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-foreground">
                    {card.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {card.count} transactions • {card.amount}
                  </p>
                </div>

                {/* Trend Badge */}
                <div>
                  {card.trendType === "up" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="h-3 w-3" />
                      <span>{card.trend}</span>
                    </span>
                  )}
                  {card.trendType === "down" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500">
                      <TrendingDown className="h-3 w-3" />
                      <span>{card.trend}</span>
                    </span>
                  )}
                  {card.trendType === "neutral" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                      <Minus className="h-3 w-3" />
                      <span>{card.trend}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Color & Icon Picker Card matching Figma */}
        <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs space-y-5">
          <h3 className="font-extrabold text-base text-foreground">
            Color &amp; Icon Picker
          </h3>

          <form onSubmit={handleSaveCategory} className="space-y-4">
            {/* Category Name Input */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Category Name
              </label>
              <input
                id="new-cat-input"
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Pet Care, Education, Fitness"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#E2F937]"
              />
            </div>

            {/* Choose Color */}
            <div>
              <span className="block text-xs font-semibold text-muted-foreground mb-2">
                Choose Color:
              </span>
              <div className="flex items-center gap-3">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.hex}
                    type="button"
                    onClick={() => setSelectedColor(swatch.hex)}
                    className={`h-7 w-7 rounded-full transition-transform cursor-pointer ${swatch.bg} ${selectedColor === swatch.hex
                      ? "ring-2 ring-black dark:ring-white scale-110 shadow-xs"
                      : "hover:scale-105 opacity-80"
                      }`}
                    title={swatch.name}
                  />
                ))}
              </div>
            </div>

            {/* Choose Icon */}
            <div>
              <span className="block text-xs font-semibold text-muted-foreground mb-2">
                Choose Icon:
              </span>
              <div className="flex items-center gap-3">
                {ICON_CHOICES.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedIcon === item.name;

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setSelectedIcon(item.name)}
                      className={`h-9 w-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${isSelected
                        ? "bg-[#E2F937] text-black shadow-xs"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {toastMsg && (
              <p className="text-xs font-bold text-emerald-600 text-center animate-in fade-in">
                {toastMsg}
              </p>
            )}

            {/* + Save Category Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 rounded-full bg-[#0E0E10] text-white hover:bg-zinc-800 font-bold text-sm transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "+ Save Category"}
              </button>
            </div>

            {categories.length > 0 && (
              <div className="pt-3 border-t border-border/50">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Saved Categories ({categories.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/80 text-foreground border border-border/60"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: c.color || "#E2F937" }}
                      />
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

