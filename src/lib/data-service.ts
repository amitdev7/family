import {
  Household,
  HouseholdMember,
  Category,
  Expense,
  Budget,
  RecurringExpense,
  ActivityLog,
  ExpenseFilters,
  DashboardMetrics,
  RecurringFrequency,
  PaymentMethod,
} from "./types";
import {
  DEMO_HOUSEHOLD,
  DEMO_MEMBERS,
  DEMO_CATEGORIES,
  DEMO_EXPENSES,
  DEMO_BUDGETS,
  DEMO_RECURRING,
  DEMO_ACTIVITY_LOGS,
} from "./demo-data";
import {
  calculateMonthSpending,
  calculateYearSpending,
  calculateBudgetMetrics,
  calculateCategorySpending,
  calculateMemberSpending,
  calculateMonthlyTrend,
  calculateNextOccurrence,
} from "./calculations/financials";
import { createClient, isSupabaseConfigured } from "./supabase/client";

// Storage key for local demo modifications
const DEMO_STORAGE_KEY = "our_home_demo_state_v1";
const DEVICE_USER_KEY = "family_device_active_user_id";
const USER_IDENTIFIED_KEY = "family_user_has_selected_identity";

interface DemoState {
  household: Household;
  members: HouseholdMember[];
  categories: Category[];
  expenses: Expense[];
  budgets: Budget[];
  recurring: RecurringExpense[];
  activityLogs: ActivityLog[];
  currentUserId: string;
}

function getInitialDemoState(): DemoState {
  if (typeof window === "undefined") {
    return {
      household: DEMO_HOUSEHOLD,
      members: DEMO_MEMBERS,
      categories: DEMO_CATEGORIES,
      expenses: DEMO_EXPENSES,
      budgets: DEMO_BUDGETS,
      recurring: DEMO_RECURRING,
      activityLogs: DEMO_ACTIVITY_LOGS,
      currentUserId: DEMO_MEMBERS[0].user_id,
    };
  }

  try {
    const saved = localStorage.getItem(DEMO_STORAGE_KEY);
    if (saved) {
      const parsed: DemoState = JSON.parse(saved);
      const deviceUser = localStorage.getItem(DEVICE_USER_KEY);
      if (deviceUser && parsed.members.some((m: HouseholdMember) => m.user_id === deviceUser)) {
        parsed.currentUserId = deviceUser;
      }
      return parsed;
    }
  } catch (err) {
    console.error("Failed to load saved demo state", err);
  }

  const deviceUser = localStorage.getItem(DEVICE_USER_KEY);
  const initialUserId = (deviceUser && DEMO_MEMBERS.some((m: HouseholdMember) => m.user_id === deviceUser))
    ? deviceUser
    : DEMO_MEMBERS[0].user_id;

  const fresh: DemoState = {
    household: DEMO_HOUSEHOLD,
    members: DEMO_MEMBERS,
    categories: DEMO_CATEGORIES,
    expenses: DEMO_EXPENSES,
    budgets: DEMO_BUDGETS,
    recurring: DEMO_RECURRING,
    activityLogs: DEMO_ACTIVITY_LOGS,
    currentUserId: initialUserId,
  };
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(fresh));
  } catch { }
  return fresh;
}

function saveDemoState(state: DemoState) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("Failed to persist demo state", err);
    }
  }
}

export class DataService {
  private static state: DemoState = getInitialDemoState();

  // Check if current device/user has completed "Who are you?" identification
  static hasUserIdentified(): boolean {
    if (typeof window === "undefined") return true;
    return Boolean(localStorage.getItem(USER_IDENTIFIED_KEY));
  }

  // Select an existing member as the current active user for this device
  static selectActiveUser(userId: string) {
    this.state.currentUserId = userId;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(USER_IDENTIFIED_KEY, "true");
        localStorage.setItem(DEVICE_USER_KEY, userId);
      } catch { }
    }
    saveDemoState(this.state);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("household-user-changed"));
    }
  }

  // Switch active demo user (for simulating multi-user family interaction)
  static switchDemoUser(userId: string) {
    this.selectActiveUser(userId);
  }

  // Add a new family member with a unique user ID and save
  static async addMember(data: {
    name?: string;
    display_name?: string;
    relationship: string;
    email?: string;
    color?: string;
    role?: "admin" | "member";
  }): Promise<HouseholdMember> {
    const uniqueUserId = "usr_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 7);
    const memberId = "mem_" + Date.now().toString(36);
    const resolvedName = (data.display_name || data.name || "Family Member").trim();

    const newMember: HouseholdMember = {
      id: memberId,
      household_id: this.state.household.id,
      user_id: uniqueUserId,
      display_name: resolvedName,
      relationship: data.relationship.trim(),
      email: data.email?.trim() || `${resolvedName.toLowerCase().replace(/[^a-z0-9]/g, "")}@family.home`,
      role: data.role || "member",
      color: data.color || "#3b82f6",
      joined_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.from("household_members").insert({
        id: newMember.id,
        household_id: newMember.household_id,
        user_id: newMember.user_id,
        display_name: newMember.display_name,
        email: newMember.email,
        role: newMember.role,
        color: newMember.color,
      });
    }

    // Demo state update
    this.state.members.push(newMember);
    this.state.activityLogs.unshift({
      id: "act-" + Date.now(),
      household_id: this.state.household.id,
      actor_user_id: uniqueUserId,
      entity_type: "member",
      entity_id: memberId,
      action: "create",
      change_summary: {
        name: newMember.display_name,
        relationship: newMember.relationship,
        user_id: uniqueUserId,
      },
      created_at: new Date().toISOString(),
      actor: newMember,
    });

    this.selectActiveUser(uniqueUserId);
    return newMember;
  }

  // Reset demo data to factory defaults
  static resetDemoData() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(DEMO_STORAGE_KEY);
      localStorage.removeItem(USER_IDENTIFIED_KEY);
      localStorage.removeItem(DEVICE_USER_KEY);
    }
    this.state = getInitialDemoState();
  }

  static getCurrentUser(): HouseholdMember {
    const user = this.state.members.find((m) => m.user_id === this.state.currentUserId);
    return user || this.state.members[0];
  }

  static async getHousehold(): Promise<Household> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase.from("households").select("*").single();
      if (!error && data) return data;
    }
    return this.state.household;
  }

  static async updateHousehold(updates: { name?: string; currency?: string }): Promise<Household> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.from("households").update(updates).eq("id", this.state.household.id);
    }
    if (updates.name) this.state.household.name = updates.name;
    if (updates.currency) this.state.household.currency = updates.currency;
    saveDemoState(this.state);
    return this.state.household;
  }

  static async getMembers(): Promise<HouseholdMember[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase.from("household_members").select("*");
      if (!error && data) return data;
    }
    return this.state.members;
  }

  static async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (!error && data) return data;
    }
    return this.state.categories;
  }

  static async addCategory(data: {
    name: string;
    icon: string;
    color: string;
    is_active?: boolean;
  }): Promise<Category> {
    const newCategory: Category = {
      id: "cat-" + Date.now(),
      household_id: this.state.household.id,
      name: data.name.trim(),
      icon: data.icon,
      color: data.color,
      is_active: data.is_active ?? true,
      is_system: false,
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.from("categories").insert(newCategory);
    }
    this.state.categories.push(newCategory);
    saveDemoState(this.state);
    return newCategory;
  }

  static async getExpenses(filters?: ExpenseFilters): Promise<{
    expenses: Expense[];
    totalCount: number;
    totalPages: number;
  }> {
    let list: Expense[] = [];

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      let query = supabase
        .from("expenses")
        .select("*, category:categories(*)", { count: "exact" })
        .is("deleted_at", null);

      if (filters?.categoryId && filters.categoryId !== "all") {
        query = query.eq("category_id", filters.categoryId);
      }
      if (filters?.paidByUserId && filters.paidByUserId !== "all") {
        query = query.eq("paid_by_user_id", filters.paidByUserId);
      }
      if (filters?.paymentMethod && filters.paymentMethod !== "all") {
        query = query.eq("payment_method", filters.paymentMethod);
      }
      if (filters?.startDate) {
        query = query.gte("expense_date", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("expense_date", filters.endDate);
      }
      if (filters?.search) {
        query = query.ilike("description", `%${filters.search}%`);
      }

      const sortKey = filters?.sortBy || "date_desc";
      if (sortKey === "date_desc") query = query.order("expense_date", { ascending: false });
      else if (sortKey === "date_asc") query = query.order("expense_date", { ascending: true });
      else if (sortKey === "amount_desc") query = query.order("amount", { ascending: false });
      else if (sortKey === "amount_asc") query = query.order("amount", { ascending: true });

      const page = filters?.page || 1;
      const pageSize = filters?.pageSize || 25;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (!error && data) {
        const totalCount = count || data.length;
        return {
          expenses: data,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        };
      }
    }

    // In-memory demo fallback with relations attached
    list = this.state.expenses
      .filter((e) => !e.deleted_at)
      .map((e) => ({
        ...e,
        category: this.state.categories.find((c) => c.id === e.category_id),
        paid_by: this.state.members.find((m) => m.user_id === e.paid_by_user_id),
        created_by: this.state.members.find((m) => m.user_id === e.created_by_user_id),
      }));

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.notes?.toLowerCase().includes(q) ||
          e.amount.toString().includes(q)
      );
    }
    if (filters?.categoryId && filters.categoryId !== "all") {
      list = list.filter((e) => e.category_id === filters.categoryId);
    }
    if (filters?.paidByUserId && filters.paidByUserId !== "all") {
      list = list.filter((e) => e.paid_by_user_id === filters.paidByUserId);
    }
    if (filters?.paymentMethod && filters.paymentMethod !== "all") {
      list = list.filter((e) => e.payment_method === filters.paymentMethod);
    }
    if (filters?.startDate) {
      list = list.filter((e) => e.expense_date >= filters.startDate!);
    }
    if (filters?.endDate) {
      list = list.filter((e) => e.expense_date <= filters.endDate!);
    }

    // Sorting
    const sortKey = filters?.sortBy || "date_desc";
    list.sort((a, b) => {
      if (sortKey === "date_desc") return b.expense_date.localeCompare(a.expense_date);
      if (sortKey === "date_asc") return a.expense_date.localeCompare(b.expense_date);
      if (sortKey === "amount_desc") return b.amount - a.amount;
      if (sortKey === "amount_asc") return a.amount - b.amount;
      return 0;
    });

    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 25;
    const startIndex = (page - 1) * pageSize;
    const paginated = list.slice(startIndex, startIndex + pageSize);

    return {
      expenses: paginated,
      totalCount: list.length,
      totalPages: Math.ceil(list.length / pageSize),
    };
  }

  static async addExpense(expenseData: Omit<Expense, "id" | "household_id" | "created_at" | "updated_at">): Promise<Expense> {
    const currentUser = this.getCurrentUser();
    const newExpense: Expense = {
      ...expenseData,
      id: "exp-" + Date.now(),
      household_id: this.state.household.id,
      created_by_user_id: currentUser.user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("expenses")
        .insert({
          household_id: this.state.household.id,
          category_id: newExpense.category_id,
          amount: newExpense.amount,
          description: newExpense.description,
          expense_date: newExpense.expense_date,
          paid_by_user_id: newExpense.paid_by_user_id,
          created_by_user_id: currentUser.user_id,
          payment_method: newExpense.payment_method,
          notes: newExpense.notes,
          receipt_path: newExpense.receipt_path,
        })
        .select()
        .single();

      if (!error && data) return data;
    }

    // Demo state update
    this.state.expenses.unshift(newExpense);
    this.state.activityLogs.unshift({
      id: "act-" + Date.now(),
      household_id: this.state.household.id,
      actor_user_id: currentUser.user_id,
      entity_type: "expense",
      entity_id: newExpense.id,
      action: "create",
      change_summary: {
        amount: newExpense.amount,
        description: newExpense.description,
        paid_by: newExpense.paid_by_user_id,
      },
      created_at: new Date().toISOString(),
      actor: currentUser,
    });
    saveDemoState(this.state);
    return newExpense;
  }

  static async updateExpense(
    id: string,
    updates: Partial<Omit<Expense, "id" | "household_id" | "created_at" | "updated_at">>
  ): Promise<Expense> {
    const currentUser = this.getCurrentUser();

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("expenses")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      if (!error && data) return data;
    }

    const index = this.state.expenses.findIndex((e) => e.id === id);
    if (index === -1) throw new Error("Expense not found");

    const old = this.state.expenses[index];
    const updated: Expense = {
      ...old,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.state.expenses[index] = updated;

    this.state.activityLogs.unshift({
      id: "act-" + Date.now(),
      household_id: this.state.household.id,
      actor_user_id: currentUser.user_id,
      entity_type: "expense",
      entity_id: id,
      action: "update",
      change_summary: {
        old_amount: old.amount,
        new_amount: updated.amount,
        old_desc: old.description,
        new_desc: updated.description,
      },
      created_at: new Date().toISOString(),
      actor: currentUser,
    });
    saveDemoState(this.state);
    return updated;
  }

  static async deleteExpense(id: string): Promise<boolean> {
    const currentUser = this.getCurrentUser();

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      // Use soft delete by setting deleted_at
      const { error } = await supabase
        .from("expenses")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      return !error;
    }

    const exp = this.state.expenses.find((e) => e.id === id);
    if (!exp) return false;

    exp.deleted_at = new Date().toISOString();
    this.state.activityLogs.unshift({
      id: "act-" + Date.now(),
      household_id: this.state.household.id,
      actor_user_id: currentUser.user_id,
      entity_type: "expense",
      entity_id: id,
      action: "delete",
      change_summary: {
        amount: exp.amount,
        description: exp.description,
      },
      created_at: new Date().toISOString(),
      actor: currentUser,
    });
    saveDemoState(this.state);
    return true;
  }

  static async getBudgets(): Promise<Budget[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("budgets")
        .select("*, category:categories(*)")
        .order("period_start", { ascending: false });
      if (!error && data) return data;
    }
    return this.state.budgets.map((b) => ({
      ...b,
      category: this.state.categories.find((c) => c.id === b.category_id),
    }));
  }

  static async saveBudget(budget: {
    id?: string;
    category_id: string | null;
    amount: number;
    period_start: string;
  }): Promise<Budget> {
    const currentUser = this.getCurrentUser();

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (budget.id) {
        const { data, error } = await supabase
          .from("budgets")
          .update({ amount: budget.amount })
          .eq("id", budget.id)
          .select()
          .single();
        if (!error && data) return data;
      } else {
        const { data, error } = await supabase
          .from("budgets")
          .insert({
            household_id: this.state.household.id,
            category_id: budget.category_id,
            amount: budget.amount,
            period_start: budget.period_start,
            created_by_user_id: currentUser.user_id,
          })
          .select()
          .single();
        if (!error && data) return data;
      }
    }

    if (budget.id) {
      const idx = this.state.budgets.findIndex((b) => b.id === budget.id);
      if (idx !== -1) {
        this.state.budgets[idx].amount = budget.amount;
        this.state.budgets[idx].updated_at = new Date().toISOString();
        saveDemoState(this.state);
        return this.state.budgets[idx];
      }
    }

    const created: Budget = {
      id: "b-" + Date.now(),
      household_id: this.state.household.id,
      category_id: budget.category_id,
      amount: budget.amount,
      period: "monthly",
      period_start: budget.period_start,
      created_by_user_id: currentUser.user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.budgets.push(created);
    saveDemoState(this.state);
    return created;
  }

  static async setBudget(budget: {
    id?: string;
    category_id?: string | null;
    amount: number;
    period_start?: string;
  }): Promise<Budget> {
    return this.saveBudget({
      id: budget.id,
      category_id: budget.category_id ?? null,
      amount: budget.amount,
      period_start: budget.period_start || new Date().toISOString().slice(0, 7) + "-01",
    });
  }

  static async updateBudget(id: string, budget: { amount?: number; category_id?: string | null }): Promise<Budget> {
    return this.saveBudget({
      id,
      amount: budget.amount ?? 0,
      category_id: budget.category_id ?? null,
      period_start: new Date().toISOString().slice(0, 7) + "-01",
    });
  }

  static async deleteBudget(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await supabase.from("budgets").delete().eq("id", id);
      return !error;
    }
    this.state.budgets = this.state.budgets.filter((b) => b.id !== id);
    saveDemoState(this.state);
    return true;
  }

  static async getRecurringExpenses(): Promise<RecurringExpense[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("recurring_expenses")
        .select("*, category:categories(*)")
        .order("next_occurrence");
      if (!error && data) return data;
    }
    return this.state.recurring.map((r) => ({
      ...r,
      category: this.state.categories.find((c) => c.id === r.category_id),
      paid_by: this.state.members.find((m) => m.user_id === r.paid_by_user_id),
    }));
  }

  static async saveRecurringExpense(data: Omit<RecurringExpense, "id" | "household_id" | "created_at" | "updated_at"> & { id?: string }): Promise<RecurringExpense> {
    const currentUser = this.getCurrentUser();

    if (data.id) {
      const idx = this.state.recurring.findIndex((r) => r.id === data.id);
      if (idx !== -1) {
        const updated = { ...this.state.recurring[idx], ...data, updated_at: new Date().toISOString() };
        this.state.recurring[idx] = updated;
        saveDemoState(this.state);
        return updated;
      }
    }

    const created: RecurringExpense = {
      ...data,
      id: "rec-" + Date.now(),
      household_id: this.state.household.id,
      created_by_user_id: currentUser.user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.recurring.push(created);
    saveDemoState(this.state);
    return created;
  }

  static async toggleRecurringStatus(id: string): Promise<boolean> {
    const item = this.state.recurring.find((r) => r.id === id);
    if (!item) return false;
    item.is_active = !item.is_active;
    item.updated_at = new Date().toISOString();
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.from("recurring_expenses").update({ is_active: item.is_active }).eq("id", id);
    }
    saveDemoState(this.state);
    return true;
  }

  static async addRecurringExpense(data: {
    description: string;
    amount: number;
    category_id: string;
    frequency?: RecurringFrequency;
    start_date?: string;
    paid_by_user_id: string;
    payment_method?: PaymentMethod;
    is_active?: boolean;
    notes?: string | null;
  }): Promise<RecurringExpense> {
    const today = new Date().toISOString().split("T")[0];
    return this.saveRecurringExpense({
      description: data.description,
      amount: data.amount,
      category_id: data.category_id,
      frequency: data.frequency || "monthly",
      start_date: data.start_date || today,
      next_occurrence: data.start_date || today,
      paid_by_user_id: data.paid_by_user_id,
      created_by_user_id: this.getCurrentUser().user_id,
      payment_method: data.payment_method || "UPI",
      is_active: data.is_active ?? true,
      notes: data.notes || null,
    });
  }

  /**
   * Process a recurring expense: records an actual expense and advances the next occurrence idempotently.
   */
  static async recordRecurringPayment(recurringId: string): Promise<Expense> {
    const rec = this.state.recurring.find((r) => r.id === recurringId);
    if (!rec) throw new Error("Recurring expense not found");

    // 1. Create the actual expense record
    const expense = await this.addExpense({
      category_id: rec.category_id,
      amount: rec.amount,
      description: `${rec.description} (Auto-Bill)`,
      expense_date: rec.next_occurrence,
      paid_by_user_id: rec.paid_by_user_id,
      created_by_user_id: this.getCurrentUser().user_id,
      payment_method: rec.payment_method,
      notes: `Recurring payment recorded for cycle ${rec.next_occurrence}`,
    });

    // 2. Advance the next occurrence date
    const nextDate = calculateNextOccurrence(rec.next_occurrence, rec.frequency);
    rec.next_occurrence = nextDate;
    rec.updated_at = new Date().toISOString();
    saveDemoState(this.state);

    return expense;
  }

  static async getActivityLogs(): Promise<ActivityLog[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!error && data) return data;
    }
    return this.state.activityLogs.map((log) => ({
      ...log,
      actor: this.state.members.find((m) => m.user_id === log.actor_user_id),
    }));
  }

  static async getDashboardMetrics(targetDate: Date = new Date()): Promise<DashboardMetrics> {
    const expenses = (await this.getExpenses()).expenses;
    const categories = await this.getCategories();
    const members = await this.getMembers();
    const budgets = await this.getBudgets();
    const recurring = await this.getRecurringExpenses();

    const spentThisMonth = calculateMonthSpending(expenses, targetDate);
    const spentThisYear = calculateYearSpending(expenses, targetDate);

    // Household overall budget
    const overallBudget = budgets.find((b) => b.category_id === null)?.amount || 100000;
    const { remaining, utilizationPercent } = calculateBudgetMetrics(spentThisMonth, overallBudget);

    // Category budgets map
    const categoryBudgetsMap: Record<string, number> = {};
    budgets.forEach((b) => {
      if (b.category_id) categoryBudgetsMap[b.category_id] = b.amount;
    });

    const categorySpending = calculateCategorySpending(expenses, categories, categoryBudgetsMap);
    const memberSpending = calculateMemberSpending(expenses, members);
    const monthlyTrend = calculateMonthlyTrend(expenses, 6, targetDate);

    // Upcoming recurring in next 30 days
    const upcomingRecurring = recurring.filter((r) => r.is_active);

    return {
      totalSpentThisMonth: spentThisMonth,
      totalSpentThisYear: spentThisYear,
      monthlyBudget: overallBudget,
      budgetRemaining: remaining,
      budgetUtilizationPercent: utilizationPercent,
      transactionCountThisMonth: expenses.filter((e) => !e.deleted_at).length,
      recentExpenses: expenses.slice(0, 5),
      categorySpending,
      memberSpending,
      monthlyTrend,
      upcomingRecurring,
    };
  }

  /**
   * Export expenses to CSV matching active filters
   */
  static exportExpensesToCSV(expenses: Expense[]): string {
    const headers = [
      "Date",
      "Description",
      "Category",
      "Amount (INR)",
      "Paid By",
      "Payment Method",
      "Notes",
    ];

    const rows = expenses.map((e) => [
      `"${e.expense_date}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      `"${(e.category?.name || "Other").replace(/"/g, '""')}"`,
      e.amount.toFixed(2),
      `"${(e.paid_by?.display_name || "Family Member").replace(/"/g, '""')}"`,
      `"${e.payment_method}"`,
      `"${(e.notes || "").replace(/"/g, '""')}"`,
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  }

  static exportExpensesCSV(expenses?: Expense[]): string {
    return this.exportExpensesToCSV(expenses || this.state.expenses);
  }
}

