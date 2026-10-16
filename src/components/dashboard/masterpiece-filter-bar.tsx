"use client";

import React from "react";
import { Search, ChevronDown, Filter, X } from "lucide-react";
import { HouseholdMember } from "@/lib/types";

interface MasterpieceFilterBarProps {
  members: HouseholdMember[];
  selectedMemberId: string | null;
  onSelectMember: (id: string | null) => void;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: string[];
}

export function MasterpieceFilterBar({
  members,
  selectedMemberId,
  onSelectMember,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  categories,
}: MasterpieceFilterBarProps) {
  const activeFilterCount =
    (selectedMemberId ? 1 : 0) +
    (selectedCategory ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 py-1 select-none">
      {/* Left Pill Group */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Active Filters Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16171B] text-white text-xs font-black shadow-xs">
          <Filter className="w-3.5 h-3.5 text-[#E2F937]" />
          <span>Active filters</span>
          <span className="w-4 h-4 rounded-full bg-[#E2F937] text-black font-extrabold text-[10px] flex items-center justify-center ml-0.5">
            {activeFilterCount > 0 ? activeFilterCount : 2}
          </span>
        </div>

        {/* Member Filter Select Pill */}
        <div className="relative">
          <select
            value={selectedMemberId || ""}
            onChange={(e) => onSelectMember(e.target.value ? e.target.value : null)}
            className="appearance-none bg-white dark:bg-[#16171B] border border-slate-200/90 dark:border-white/10 rounded-full py-1.5 pl-3.5 pr-8 text-xs font-bold text-slate-800 dark:text-zinc-200 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 cursor-pointer outline-hidden focus:ring-2 focus:ring-[#E2F937]"
          >
            <option value="">All Members</option>
            {members.map((m) => (
              <option key={m.id || m.user_id} value={m.id || m.user_id}>
                {m.display_name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Category Filter Select Pill */}
        <div className="relative">
          <select
            value={selectedCategory || ""}
            onChange={(e) => onSelectCategory(e.target.value ? e.target.value : null)}
            className="appearance-none bg-white dark:bg-[#16171B] border border-slate-200/90 dark:border-white/10 rounded-full py-1.5 pl-3.5 pr-8 text-xs font-bold text-slate-800 dark:text-zinc-200 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 cursor-pointer outline-hidden focus:ring-2 focus:ring-[#E2F937]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Date Period Pill */}
        <div className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white dark:bg-[#16171B] border border-slate-200/90 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-zinc-300 shadow-2xs">
          <span>October 2026</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Clear Filters (if active) */}
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => {
              onSelectMember(null);
              onSelectCategory(null);
              onSearchChange("");
            }}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white px-2 py-1 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Right Search Input Pill */}
      <div className="relative w-full md:w-64">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search expenses, tags..."
          className="w-full bg-white dark:bg-[#16171B] border border-slate-200/90 dark:border-white/10 rounded-full py-1.5 pl-9 pr-3.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 shadow-2xs outline-hidden focus:ring-2 focus:ring-[#E2F937] transition-all"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="w-4 h-4 rounded-full bg-slate-200 dark:bg-white/20 text-slate-700 dark:text-white flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
    </div>
  );
}

