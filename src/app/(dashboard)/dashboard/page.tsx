"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DataService } from "@/lib/data-service";
import { HouseholdMember } from "@/lib/types";

type IconName =
  | "home"
  | "wallet"
  | "chart"
  | "repeat"
  | "users"
  | "settings"
  | "search"
  | "bell"
  | "plus"
  | "arrowUp"
  | "arrowDown"
  | "chevron"
  | "dots"
  | "cart"
  | "utensils"
  | "bolt"
  | "car"
  | "bag"
  | "close"
  | "calendar"
  | "card"
  | "sparkles";

const paths: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v11h14V9M9 20v-6h6v6" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 6h14a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h13v3" />
      <path d="M16 12h4" />
    </>
  ),
  chart: (
    <>
      <path d="M4 19V9m6 10V5m6 14v-7m5 7H2" />
    </>
  ),
  repeat: (
    <>
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4" />
      <path d="M21 13v2a3 3 0 0 1-3 3H3" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <path d="M20 8v6m3-3h-6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V21h-4v-.08A1.7 1.7 0 0 0 8.94 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.57 15 1.7 1.7 0 0 0 3 14H3v-4h.08A1.7 1.7 0 0 0 4.6 8.94a1.7 1.7 0 0 0-.34-1.88L4.2 7l2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.57 1.7 1.7 0 0 0 10 3h4a1.7 1.7 0 0 0 1 1.57 1.7 1.7 0 0 0 1.88-.34l.06-.06L19.77 7l-.06.06A1.7 1.7 0 0 0 19.4 9c.12.43.6 1 1.52 1H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  arrowUp: (
    <>
      <path d="m18 15-6-6-6 6" />
    </>
  ),
  arrowDown: (
    <>
      <path d="m6 9 6 6 6-6" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  dots: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1" />
      <circle cx="19" cy="20" r="1" />
      <path d="M3 4h2l2.5 11h11l2-7H7" />
    </>
  ),
  utensils: (
    <>
      <path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3v18M14 3c0 5 3 6 3 6" />
    </>
  ),
  bolt: <path d="m13 2-9 12h8l-1 8 9-12h-8l1-8Z" />,
  car: (
    <>
      <path d="m5 17-2-1v-5l2-1 2-4h10l2 4 2 1v5l-2 1" />
      <path d="M5 17v2h3v-2h8v2h3v-2M6 11h12" />
    </>
  ),
  bag: (
    <>
      <path d="M5 8h14l1 13H4L5 8Z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M6 15h4" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14ZM19 13l.7 1.8 1.8.7-1.8.7L19 18l-.7-1.8-1.8-.7 1.8-.7L19 13Z" />
    </>
  ),
};

function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const categories = [
  {
    label: "Groceries",
    value: 12450,
    percent: 34,
    color: "#6E4CA8",
    icon: "cart" as IconName,
    bg: "#EEE5FF",
  },
  {
    label: "Dining out",
    value: 8220,
    percent: 23,
    color: "#8B62C7",
    icon: "utensils" as IconName,
    bg: "#F2EBFF",
  },
  {
    label: "Utilities",
    value: 6760,
    percent: 19,
    color: "#2D2D2D",
    icon: "bolt" as IconName,
    bg: "#E7E7E7",
  },
  {
    label: "Transport",
    value: 4970,
    percent: 14,
    color: "#7656A8",
    icon: "car" as IconName,
    bg: "#E8DDF8",
  },
  {
    label: "Shopping",
    value: 3480,
    percent: 10,
    color: "#A47BDD",
    icon: "bag" as IconName,
    bg: "#F3ECFF",
  },
];

interface TransactionItem {
  id: number | string;
  name: string;
  meta: string;
  amount: number;
  member: string;
  icon: IconName;
  bg: string;
  color: string;
}

const initialTransactions: TransactionItem[] = [
  {
    id: 1,
    name: "DMart Groceries",
    meta: "Groceries • Today, 10:32 AM",
    amount: 2840,
    member: "Amit",
    icon: "cart" as IconName,
    bg: "#EEE5FF",
    color: "#6E4CA8",
  },
  {
    id: 2,
    name: "Swiggy",
    meta: "Dining out • Yesterday",
    amount: 786,
    member: "Priya",
    icon: "utensils" as IconName,
    bg: "#F2EBFF",
    color: "#8B62C7",
  },
  {
    id: 3,
    name: "Tata Power",
    meta: "Utilities • 14 Oct",
    amount: 3640,
    member: "Amit",
    icon: "bolt" as IconName,
    bg: "#E7E7E7",
    color: "#2D2D2D",
  },
  {
    id: 4,
    name: "Uber",
    meta: "Transport • 13 Oct",
    amount: 428,
    member: "Rohan",
    icon: "car" as IconName,
    bg: "#E8DDF8",
    color: "#7656A8",
  },
];

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function useCountUp(target: number, duration = 1100) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, target]);
  return value;
}

function Button({
  children,
  className = "",
  type = "button",
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`cursor-pointer transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2D2D2D] ${className}`}
    >
      {children}
    </button>
  );
}

function Avatar({
  name,
  color = "bg-[#EEE5FF]",
  text = "text-[#2D2D2D]",
  small = false,
}: {
  name: string;
  color?: string;
  text?: string;
  small?: boolean;
}) {
  return (
    <span
      className={`${small ? "size-7 text-[10px]" : "size-10 text-xs"
        } ${color} ${text} inline-flex shrink-0 items-center justify-center rounded-full font-bold ring-2 ring-white`}
    >
      {name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}

function QuickAddModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (name: string, amount: number, category: string) => void;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Groceries");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name || !amount) return;
    onAdd(name, Number(amount), category);
  }

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-[#111B18]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="expense-title"
      onMouseDown={(event) => event.currentTarget === event.target && onClose()}
    >
      <div className="modal-panel w-full max-w-md rounded-t-[28px] bg-white p-6 shadow-2xl sm:rounded-[28px]">
        <div className="flex items-start justify-between">
          <div>
            <div
              id="expense-title"
              className="text-xl font-extrabold tracking-tight text-[#17201D]"
            >
              Add an expense
            </div>
            <div className="mt-1 text-sm text-[#7A807D]">
              Record a new family purchase.
            </div>
          </div>
          <Button
            ariaLabel="Close modal"
            onClick={onClose}
            className="rounded-full bg-[#F3F2EE] p-2 text-[#59605D] hover:bg-[#E7E5DF]"
          >
            <Icon name="close" size={18} />
          </Button>
        </div>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-[#3A413E]">
              Description
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="e.g. Weekly groceries"
              className="h-12 w-full rounded-xl border border-[#DEDDD7] bg-[#FAF9F6] px-4 text-sm outline-none transition focus:border-[#2D2D2D] focus:ring-2 focus:ring-[#2D2D2D]/10"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-[#3A413E]">
              Amount
            </span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#59605D]">
                ₹
              </span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min="1"
                placeholder="0"
                className="h-12 w-full rounded-xl border border-[#DEDDD7] bg-[#FAF9F6] pl-9 pr-4 text-sm outline-none transition focus:border-[#2D2D2D] focus:ring-2 focus:ring-[#2D2D2D]/10"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-[#3A413E]">
              Category
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-12 w-full rounded-xl border border-[#DEDDD7] bg-[#FAF9F6] px-4 text-sm outline-none transition focus:border-[#2D2D2D]"
            >
              {categories.map((item) => (
                <option key={item.label} value={item.label}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              onClick={onClose}
              className="h-12 rounded-xl border border-[#DEDDD7] text-sm font-bold text-[#59605D] hover:bg-[#F7F6F2]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-12 rounded-xl bg-[#2D2D2D] text-sm font-bold text-white shadow-[0_8px_20px_rgba(22,93,74,.2)] hover:bg-[#1F1F1F]"
            >
              Add expense
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [active, setActive] = useState("Overview");
  const [showModal, setShowModal] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [transactions, setTransactions] = useState<TransactionItem[]>(initialTransactions);
  const [currency, setCurrency] = useState("INR");
  const [currentUser, setCurrentUser] = useState<HouseholdMember | null>(null);
  const [showTransferToast, setShowTransferToast] = useState(false);

  const total = useMemo(
    () => transactions.reduce((sum, item) => sum + item.amount, 0),
    [transactions]
  );
  const animatedBalance = useCountUp(44160);
  const animatedSavings = useCountUp(122172, 1350);

  // Sync real currentUser and expenses if available
  useEffect(() => {
    const user = DataService.getCurrentUser();
    if (user) setCurrentUser(user);

    DataService.getExpenses().then((res) => {
      if (res && res.expenses && res.expenses.length > 0) {
        const liveItems: TransactionItem[] = res.expenses.slice(0, 4).map((e) => {
          const cat = categories.find((c) =>
            e.category_id?.toLowerCase().includes(c.label.toLowerCase()) ||
            e.description?.toLowerCase().includes(c.label.toLowerCase())
          ) || categories[0];
          return {
            id: e.id,
            name: e.description || "Household Expense",
            meta: `${cat.label} • ${new Date(e.expense_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`,
            amount: e.amount,
            member: currentUser?.display_name || "Amit",
            icon: cat.icon,
            bg: cat.bg,
            color: cat.color,
          };
        });
        setTransactions(() => {
          const merged = [...liveItems];
          for (const item of initialTransactions) {
            if (!merged.some((m) => m.name === item.name)) merged.push(item);
          }
          return merged;
        });
      }
    });

    const handleDataChange = () => {
      const u = DataService.getCurrentUser();
      if (u) setCurrentUser(u);
    };

    window.addEventListener("household-user-changed", handleDataChange);
    window.addEventListener("expense-saved", handleDataChange);
    return () => {
      window.removeEventListener("household-user-changed", handleDataChange);
      window.removeEventListener("expense-saved", handleDataChange);
    };
  }, [currentUser?.display_name]);

  function handleNavClick(item: string) {
    setActive(item);
    if (item === "Expenses" || item === "Wealth") {
      router.push("/expenses");
    } else if (item === "Budgets") {
      router.push("/budgets");
    } else if (item === "Recurring") {
      router.push("/recurring");
    } else if (item === "Family") {
      router.push("/categories");
    } else if (item === "Overview") {
      router.push("/dashboard");
    }
  }

  function addExpense(name: string, amount: number, category: string) {
    const match =
      categories.find((item) => item.label === category) ?? categories[0];

    // Optimistically update list
    setTransactions((items) => [
      {
        id: Date.now(),
        name,
        meta: `${category} • Just now`,
        amount,
        member: currentUser?.display_name || "Amit",
        icon: match.icon,
        bg: match.bg,
        color: match.color,
      },
      ...items,
    ]);

    // Persist to DataService
    DataService.addExpense({
      amount,
      description: name,
      category_id: `cat-${category.toLowerCase().replace(/\s+/g, "-")}`,
      paid_by_user_id: currentUser?.user_id || "usr-amit",
      payment_method: "Cash",
      expense_date: new Date().toISOString().slice(0, 10),
    })
      .then(() => {
        window.dispatchEvent(new Event("expense-saved"));
      })
      .catch((err) => console.error("Error saving expense:", err));

    setShowModal(false);
  }

  function handleTransferClick() {
    setShowTransferToast(true);
    setTimeout(() => setShowTransferToast(false), 3000);
  }

  return (
    <div className="min-h-screen bg-[#E7DDF5] p-0 font-['Plus_Jakarta_Sans',sans-serif] text-[#0B0C0B] sm:p-6 lg:flex lg:items-center lg:justify-center lg:p-12">
      <main className="app-shell min-h-screen w-full overflow-hidden bg-[#F5F5F4] sm:min-h-0 sm:max-w-[1240px] sm:rounded-[32px] sm:border sm:border-white sm:shadow-[0_22px_70px_rgba(0,0,0,.08)]">
        {/* App Header */}
        <header className="app-header flex h-[84px] items-center px-5 sm:px-8">
          <Button
            className="flex items-center gap-3"
            onClick={() => handleNavClick("Overview")}
          >
            <Avatar
              name={currentUser?.display_name || "Amit Sharma"}
              color="bg-[#E2C7AD]"
              text="text-[#5E4633]"
            />
            <span className="hidden text-lg font-semibold tracking-[-.03em] sm:block">
              Hello, {currentUser?.display_name?.split(" ")[0] || "Amit"}
            </span>
          </Button>

          {/* Center Navigation Capsule */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
            {["Overview", "Wealth", "Budgets", "Family"].map((item) => (
              <Button
                key={item}
                onClick={() => handleNavClick(item)}
                className={`rounded-full px-5 py-2.5 text-[11px] font-semibold ${active === item
                  ? "bg-[#C5A3FF] text-[#2D2D2D]"
                  : "text-[#959592] hover:text-black"
                  }`}
              >
                {item}
              </Button>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="relative ml-auto flex items-center gap-2">
            <Button
              ariaLabel="Search"
              onClick={() => router.push("/expenses")}
              className="flex size-11 items-center justify-center rounded-full bg-white text-[#222] hover:scale-105"
            >
              <Icon name="search" size={18} />
            </Button>
            <Button
              ariaLabel="Notifications"
              onClick={() => setShowAlerts(!showAlerts)}
              className="flex h-11 items-center gap-2 rounded-full bg-white px-4 text-xs font-bold"
            >
              <Icon name="bell" size={17} />
              <span className="size-1.5 rounded-full bg-[#E74E48]" />
              4
            </Button>
            {showAlerts && (
              <div className="popover-in absolute right-0 top-14 z-40 w-72 rounded-2xl bg-white p-4 shadow-xl">
                <div className="text-xs font-bold">Family reminders</div>
                <div className="mt-3 rounded-xl bg-[#F4F4F2] p-3 text-[11px] leading-relaxed text-[#6D6E69]">
                  Electricity bill of ₹3,640 is due in 2 days.
                </div>
              </div>
            )}
          </div>
        </header>

        {/* 12-Column Dashboard Bento Grid */}
        <div className="dashboard-grid grid gap-4 px-4 pb-4 sm:px-6 sm:pb-6 lg:grid-cols-12">
          {/* Card 1: Monthly Budget Remaining (7 Cols) */}
          <section className="relative min-h-[310px] overflow-hidden rounded-[26px] bg-white p-6 sm:p-8 lg:col-span-7">
            <div className="flex items-start justify-between">
              <div className="flex rounded-full bg-[#F1F1F1] p-1">
                {["INR", "USD", "EUR"].map((item) => (
                  <Button
                    key={item}
                    onClick={() => setCurrency(item)}
                    className={`rounded-full px-4 py-2 text-[11px] font-bold ${currency === item ? "bg-white shadow-sm" : "text-[#777873]"
                      }`}
                  >
                    {item === "INR" ? "🇮🇳 INR" : item}
                  </Button>
                ))}
              </div>
              <div className="hidden text-right sm:block">
                <div className="text-[9px] text-[#777873]">Household ID</div>
                <div className="mt-1 flex items-center gap-1 text-sm font-semibold">
                  SHARMA-2026 <Icon name="card" size={13} />
                </div>
              </div>
            </div>
            <div className="mt-10 text-[11px] text-[#777873]">
              Monthly budget remaining
            </div>
            <div className="balance-number mt-1 flex items-center gap-3 text-[42px] font-medium tracking-[-.06em] sm:text-[54px]">
              {formatINR(animatedBalance)}
              <Button
                ariaLabel="Toggle visibility"
                onClick={() => router.push("/expenses")}
                className="flex size-9 items-center justify-center rounded-full bg-[#F5F5F3] text-[#535650]"
              >
                <Icon name="search" size={15} />
              </Button>
            </div>
            <div className="absolute bottom-7 left-6 flex flex-wrap gap-2 sm:left-8">
              <Button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 rounded-full bg-[#2D2D2D] px-5 py-3 text-[11px] font-semibold text-white"
              >
                <Icon name="plus" size={15} />
                Add expense
              </Button>
              <Button
                onClick={handleTransferClick}
                className="flex items-center gap-2 rounded-full border border-[#1D271E] px-5 py-3 text-[11px] font-semibold"
              >
                <Icon name="repeat" size={14} />
                Transfer
              </Button>
            </div>
            <Button
              ariaLabel="Open budget"
              onClick={() => router.push("/budgets")}
              className="pulse-action absolute bottom-7 right-7 flex size-14 items-center justify-center rounded-full bg-[#C5A3FF] text-[#2D2D2D] hover:rotate-12 sm:size-16"
            >
              <Icon name="arrowUp" size={26} />
            </Button>
          </section>

          {/* Card 2: Family Goal Card (5 Cols, Lavender Mist #C5A3FF) */}
          <section className="goal-card relative min-h-[310px] overflow-hidden rounded-[26px] bg-[#C5A3FF] p-6 sm:p-8 lg:col-span-5">
            <div className="goal-star absolute -right-8 -top-12 text-[180px] font-black leading-none text-white/10">
              ★
            </div>
            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-2 rounded-full bg-[#2D2D2D] px-4 py-2 text-[10px] font-bold tracking-wider text-white">
                FAMILY GOAL{" "}
                <span className="flex size-5 items-center justify-center rounded-full bg-[#C5A3FF] text-[#2D2D2D]">
                  <Icon name="plus" size={12} />
                </span>
              </div>
              <Button
                ariaLabel="Goal menu"
                onClick={() => router.push("/budgets")}
                className="flex size-9 items-center justify-center rounded-full border border-black/10"
              >
                <Icon name="dots" size={18} />
              </Button>
            </div>
            <div className="relative mt-11 text-[11px] text-[#665477]">
              Emergency fund saved
            </div>
            <div className="balance-number relative mt-1 text-[36px] font-medium tracking-[-.05em] sm:text-[42px]">
              {formatINR(animatedSavings)}{" "}
              <span className="rounded-full bg-white/75 px-3 py-1 align-middle text-[9px] font-bold tracking-normal text-[#6E4CA8]">
                +40% this month
              </span>
            </div>
            <div className="absolute bottom-7 left-6 right-6 grid grid-cols-2 gap-3 sm:left-8 sm:right-8">
              <div className="rounded-2xl bg-white/35 p-4">
                <div className="text-[9px] text-[#665477]">Goal progress</div>
                <div className="mt-1 text-sm font-semibold">☆ 61%</div>
              </div>
              <div className="rounded-2xl bg-white/35 p-4">
                <div className="text-[9px] text-[#665477]">Target</div>
                <div className="mt-1 text-sm font-semibold">₹2,00,000</div>
              </div>
            </div>
          </section>

          {/* Card 3: Spending Donut (4 Cols) */}
          <section className="rounded-[26px] bg-white p-6 lg:col-span-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm font-semibold">
                <span className="flex size-9 items-center justify-center rounded-full border border-[#ECECE8]">
                  <Icon name="bag" size={16} />
                </span>
                Spending
              </div>
              <Button
                onClick={() => router.push("/expenses")}
                className="rounded-xl border border-[#ECECE8] px-4 py-2.5 text-[11px] font-semibold"
              >
                October
              </Button>
            </div>
            <div className="relative mx-auto mt-5 size-40">
              <svg className="size-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#E8E8E8"
                  strokeWidth="8"
                  strokeDasharray="48 10"
                />
                <circle
                  className="spend-ring"
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#C5A3FF"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="170 283"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-medium tracking-tight">
                  ₹{(total / 1000).toFixed(1)}K
                </div>
                <div className="mt-1 text-[10px] font-bold text-[#E55A52]">
                  +12%
                </div>
              </div>
            </div>
            <div className="mx-auto mt-2 w-fit rounded-full border border-[#ECECE8] px-4 py-2 text-[10px]">
              ✧ Dining is up <b className="text-[#E55A52]">8.4%</b>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-y-2 text-[10px]">
              {categories.slice(0, 4).map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 text-[#8C8D88]"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.label}</span>
                  <b className="text-[#444640]">
                    ₹{(item.value / 1000).toFixed(1)}K
                  </b>
                </div>
              ))}
            </div>
          </section>

          {/* Card 4: Budget Breakdown (4 Cols) */}
          <section className="rounded-[26px] bg-white p-6 lg:col-span-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm font-semibold">
                <span className="flex size-9 items-center justify-center rounded-full border border-[#ECECE8]">
                  <Icon name="wallet" size={16} />
                </span>
                Budget
              </div>
              <div className="text-sm font-semibold">
                ₹80,000
                <div className="mt-1 h-1 rounded-full bg-[#ED6A36]" />
              </div>
            </div>
            <div className="mt-6 text-[38px] font-medium tracking-[-.05em]">
              ₹44,160
            </div>
            <div className="mt-1 text-[10px]">
              <span className="font-bold text-[#6E4CA8]">+18%</span>{" "}
              <span className="text-[#A1A19D]">remaining vs last month</span>
            </div>
            <div className="mt-6 space-y-5">
              {[
                ["Groceries", "₹25,000", "65%", "w-[65%]"],
                ["Dining", "₹15,000", "48%", "w-[48%]"],
                ["Utilities", "₹12,000", "56%", "w-[56%]"],
                ["Others", "₹28,000", "31%", "w-[31%]"],
              ].map((row) => (
                <div key={row[0]}>
                  <div className="mb-2 flex justify-between text-[10px]">
                    <span className="text-[#969792]">{row[0]}</span>
                    <span>{row[1]}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#F0F0EE]">
                    <div
                      className={`progress-fill h-full rounded-full ${row[0] === "Groceries" ? "bg-[#C5A3FF]" : "bg-[#D7D8D4]"
                        } ${row[3]}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Card 5: Recent Transactions (4 Cols) */}
          <section className="rounded-[26px] bg-white p-6 lg:col-span-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm font-semibold">
                <span className="flex size-9 items-center justify-center rounded-full border border-[#ECECE8]">
                  <Icon name="wallet" size={16} />
                </span>
                Transactions
              </div>
              <Button
                ariaLabel="Transaction menu"
                onClick={() => router.push("/expenses")}
                className="flex size-9 items-center justify-center rounded-full border border-[#ECECE8]"
              >
                <Icon name="dots" size={17} />
              </Button>
            </div>
            <div className="mt-5 space-y-1">
              {transactions.slice(0, 4).map((item, index) => (
                <div
                  key={item.id}
                  className={`transaction-row flex items-center gap-3 rounded-2xl px-2 py-3 ${index === 0
                    ? "border border-[#EEE9DD]"
                    : "border-b border-[#F0F0ED]"
                    }`}
                  style={{ animationDelay: `${700 + index * 90}ms` }}
                >
                  <div
                    className="transaction-icon flex size-9 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: item.bg, color: item.color }}
                  >
                    <Icon name={item.icon} size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[10px] font-semibold">
                      {item.name}
                    </div>
                    <div className="mt-1 text-[9px] text-[#A4A49F]">
                      {item.member} · {item.meta.includes("•") ? item.meta.split("•")[1] : item.meta}
                    </div>
                  </div>
                  <div className="text-[10px] font-semibold text-[#E0504A]">
                    −{formatINR(item.amount)}
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setShowModal(true)}
              className="mt-3 w-full rounded-full bg-[#F3F3F0] py-3 text-[10px] font-bold hover:bg-[#C5A3FF]"
            >
              Add transaction
            </Button>
          </section>
        </div>

        {/* Mobile Sticky Bottom Navigation Dock */}
        <nav className="sticky bottom-0 z-30 flex items-center justify-around border-t border-[#E5E5E2] bg-white/95 p-3 backdrop-blur md:hidden">
          {["Overview", "Wealth", "Budgets", "Family"].map((item, index) => (
            <Button
              key={item}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center gap-1 px-2 text-[9px] font-bold ${active === item ? "text-[#6E4CA8]" : "text-[#92938E]"
                }`}
            >
              <Icon
                name={
                  ["home", "chart", "wallet", "users"][index] as IconName
                }
                size={18}
              />
              {item}
            </Button>
          ))}
        </nav>
      </main>

      {/* Quick Add Expense Modal */}
      {showModal && (
        <QuickAddModal
          onClose={() => setShowModal(false)}
          onAdd={addExpense}
        />
      )}

      {/* Transfer Notification Toast */}
      {showTransferToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-[#2D2D2D] p-4 text-xs font-bold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-center gap-2.5">
          <Icon name="repeat" size={16} className="text-[#C5A3FF]" />
          <span>Internal family transfer initiated successfully!</span>
        </div>
      )}
    </div>
  );
}
