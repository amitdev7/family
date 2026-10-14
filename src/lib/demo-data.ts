import {
  Household,
  HouseholdMember,
  Category,
  Expense,
  Budget,
  RecurringExpense,
  ActivityLog,
  ReceivedMoney,
} from "./types";

export const DEMO_HOUSEHOLD: Household = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Family Home",
  currency: "INR",
  created_at: "2026-01-01T00:00:00Z",
};

export const DEMO_MEMBERS: HouseholdMember[] = [
  {
    id: "mem-1",
    household_id: "11111111-1111-1111-1111-111111111111",
    user_id: "usr-amit",
    display_name: "Amit",
    relationship: "Member",
    email: "amit@family.local",
    role: "admin",
    color: "#2563eb",
    joined_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "mem-2",
    household_id: "11111111-1111-1111-1111-111111111111",
    user_id: "usr-ajay",
    display_name: "Ajay",
    relationship: "Member",
    email: "ajay@family.local",
    role: "member",
    color: "#ec4899",
    joined_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "mem-3",
    household_id: "11111111-1111-1111-1111-111111111111",
    user_id: "usr-chhotu",
    display_name: "Chhotu",
    relationship: "Member",
    email: "chhotu@family.local",
    role: "member",
    color: "#10b981",
    joined_at: "2026-01-05T00:00:00Z",
  },
];


export const DEMO_CATEGORIES: Category[] = [
  {
    id: "cat-groceries",
    household_id: "11111111-1111-1111-1111-111111111111",
    name: "Groceries & Supermarket",
    icon: "ShoppingCart",
    color: "#16a34a",
    is_active: true,
    is_system: true,
  },
  {
    id: "cat-rent",
    household_id: "11111111-1111-1111-1111-111111111111",
    name: "Housing & Society",
    icon: "Home",
    color: "#0284c7",
    is_active: true,
    is_system: true,
  },
  {
    id: "cat-utilities",
    household_id: "11111111-1111-1111-1111-111111111111",
    name: "Electricity & Utilities",
    icon: "Zap",
    color: "#eab308",
    is_active: true,
    is_system: true,
  },
  {
    id: "cat-dining",
    household_id: "11111111-1111-1111-1111-111111111111",
    name: "Dining & Food Delivery",
    icon: "Utensils",
    color: "#f97316",
    is_active: true,
    is_system: true,
  },
  {
    id: "cat-transport",
    household_id: "11111111-1111-1111-1111-111111111111",
    name: "Transport & Fuel",
    icon: "Car",
    color: "#8b5cf6",
    is_active: true,
    is_system: true,
  },
  {
    id: "cat-entertainment",
    household_id: "11111111-1111-1111-1111-111111111111",
    name: "Subscriptions & OTT",
    icon: "Tv",
    color: "#06b6d4",
    is_active: true,
    is_system: true,
  },
  {
    id: "cat-health",
    household_id: "11111111-1111-1111-1111-111111111111",
    name: "Healthcare & Medicines",
    icon: "HeartPulse",
    color: "#ef4444",
    is_active: true,
    is_system: true,
  },
  {
    id: "cat-education",
    household_id: "11111111-1111-1111-1111-111111111111",
    name: "Education & Tuition",
    icon: "GraduationCap",
    color: "#3b82f6",
    is_active: true,
    is_system: true,
  },
];

export const DEMO_BUDGETS: Budget[] = [];

// Clean slate: Zero fake transactions or dummy logs
export const DEMO_RECURRING: RecurringExpense[] = [];
export const DEMO_EXPENSES: Expense[] = [];
export const DEMO_RECEIVED_MONEY: ReceivedMoney[] = [];
export const DEMO_ACTIVITY_LOGS: ActivityLog[] = [];
