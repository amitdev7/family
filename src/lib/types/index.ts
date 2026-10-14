export type HouseholdRole = "admin" | "member";

export interface Household {
  id: string;
  name: string;
  currency: string;
  created_at: string;
  updated_at?: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  display_name: string;
  relationship?: string;
  email: string;
  role: HouseholdRole;
  color?: string;
  avatar_url?: string | null;
  joined_at?: string;
}

export interface Category {
  id: string;
  household_id: string;
  name: string;
  icon: string;
  color: string;
  is_active?: boolean;
  is_system?: boolean;
  created_at?: string;
}

export const PAYMENT_METHODS = [
  "UPI",
  "Credit Card",
  "Debit Card",
  "Net Banking",
  "Cash",
  "Other",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number] | string;

export interface Expense {
  id: string;
  household_id: string;
  category_id: string;
  amount: number;
  description: string;
  expense_date: string;
  paid_by_user_id: string;
  created_by_user_id: string;
  payment_method: PaymentMethod;
  notes?: string | null;
  receipt_path?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;

  // Joined metadata
  category?: Category;
  paid_by?: HouseholdMember;
  created_by?: HouseholdMember;
}

export interface Budget {
  id: string;
  household_id: string;
  category_id: string | null; // null represents overall monthly household budget
  amount: number;
  period: "monthly" | "yearly";
  period_start: string;
  created_by_user_id?: string;
  created_at?: string;
  updated_at?: string;

  category?: Category;
}

export type RecurringFrequency = "weekly" | "monthly" | "quarterly" | "yearly";

export interface RecurringExpense {
  id: string;
  household_id: string;
  category_id: string;
  amount: number;
  description: string;
  frequency: RecurringFrequency;
  start_date: string;
  next_occurrence: string;
  paid_by_user_id: string;
  created_by_user_id: string;
  payment_method: PaymentMethod;
  is_active: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;

  category?: Category;
  paid_by?: HouseholdMember;
}

export interface ActivityLog {
  id: string;
  household_id: string;
  actor_user_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  change_summary: Record<string, any>;
  created_at: string;

  actor?: HouseholdMember;
}

export interface ExpenseFilters {
  categoryId?: string;
  paidByUserId?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: "date_desc" | "date_asc" | "amount_desc" | "amount_asc";
  page?: number;
  pageSize?: number;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  totalAmount: number;
  percentage: number;
  budget?: number;
}

export interface MemberSpending {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  totalAmount: number;
  percentage: number;
  count: number;
  memberId?: string;
  memberName?: string;
}

export interface MonthlyTrendItem {
  label: string;
  totalAmount: number;
  month?: string;
  amount?: number;
}

export interface DashboardMetrics {
  totalSpentThisMonth: number;
  totalSpentThisYear: number;
  monthlyBudget: number;
  budgetRemaining: number;
  budgetUtilizationPercent: number;
  transactionCountThisMonth: number;
  recentExpenses: Expense[];
  categorySpending: CategorySpending[];
  memberSpending: MemberSpending[];
  monthlyTrend: MonthlyTrendItem[];
  upcomingRecurring: RecurringExpense[];
}
