import {
  Expense,
  Category,
  HouseholdMember,
  CategorySpending,
  MemberSpending,
  MonthlyTrendItem,
} from "../types";

export function calculateMonthSpending(
  expenses: Expense[],
  targetDate: Date = new Date()
): number {
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const prefix = `${year}-${month}`;

  return expenses
    .filter((e) => !e.deleted_at && e.expense_date.startsWith(prefix))
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
}

export function calculateYearSpending(
  expenses: Expense[],
  targetDate: Date = new Date()
): number {
  const prefix = `${targetDate.getFullYear()}`;
  return expenses
    .filter((e) => !e.deleted_at && e.expense_date.startsWith(prefix))
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
}

export function calculateTotalSpending(expenses: Expense[]): number {
  return expenses
    .filter((e) => !e.deleted_at)
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
}

export function calculateBudgetMetrics(
  spent: number,
  budget: number
): { remaining: number; utilizationPercent: number } {
  const remaining = Math.max(0, budget - spent);
  const utilizationPercent = budget > 0 ? (spent / budget) * 100 : 0;
  return { remaining, utilizationPercent };
}

export function calculateCategorySpending(
  expenses: Expense[],
  categories: Category[],
  categoryBudgetsMap: Record<string, number> = {}
): CategorySpending[] {
  const activeExpenses = expenses.filter((e) => !e.deleted_at);
  const totalSpend = activeExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const spendingByCat: Record<string, number> = {};
  for (const exp of activeExpenses) {
    spendingByCat[exp.category_id] = (spendingByCat[exp.category_id] || 0) + (Number(exp.amount) || 0);
  }

  const results: CategorySpending[] = categories.map((cat) => {
    const amount = spendingByCat[cat.id] || 0;
    const percentage = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;
    return {
      categoryId: cat.id,
      categoryName: cat.name,
      color: cat.color,
      icon: cat.icon,
      totalAmount: amount,
      percentage,
      budget: categoryBudgetsMap[cat.id],
    };
  });

  return results.sort((a, b) => b.totalAmount - a.totalAmount);
}

export function calculateMemberSpending(
  expenses: Expense[],
  members: HouseholdMember[]
): MemberSpending[] {
  const activeExpenses = expenses.filter((e) => !e.deleted_at);
  const totalSpend = activeExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const spendingByMember: Record<string, number> = {};
  const countByMember: Record<string, number> = {};

  for (const exp of activeExpenses) {
    spendingByMember[exp.paid_by_user_id] =
      (spendingByMember[exp.paid_by_user_id] || 0) + (Number(exp.amount) || 0);
    countByMember[exp.paid_by_user_id] =
      (countByMember[exp.paid_by_user_id] || 0) + 1;
  }

  const results: MemberSpending[] = members.map((member) => {
    const amount = spendingByMember[member.user_id] || 0;
    const count = countByMember[member.user_id] || 0;
    const percentage = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;
    return {
      userId: member.user_id,
      displayName: member.display_name,
      avatarUrl: member.avatar_url,
      totalAmount: amount,
      percentage,
      count,
      memberId: member.user_id,
      memberName: member.display_name,
    };
  });

  return results.sort((a, b) => b.totalAmount - a.totalAmount);
}

export function calculateMonthlyTrend(
  expenses: Expense[],
  monthsCount: number = 6,
  targetDate: Date = new Date()
): MonthlyTrendItem[] {
  const activeExpenses = expenses.filter((e) => !e.deleted_at);
  const items: MonthlyTrendItem[] = [];

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(targetDate.getFullYear(), targetDate.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const prefix = `${year}-${month}`;
    const label = `${monthNames[d.getMonth()]} '${String(year).slice(-2)}`;

    const total = activeExpenses
      .filter((e) => e.expense_date.startsWith(prefix))
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    items.push({
      label,
      totalAmount: total,
      month: label,
      amount: total,
    });
  }

  return items;
}

export function calculateNextOccurrence(currentDate: string, frequency: string): string {
  const [y, m, d] = currentDate.split("-").map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);

  switch (frequency) {
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "quarterly":
      date.setMonth(date.getMonth() + 3);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }

  const resYear = date.getFullYear();
  const resMonth = String(date.getMonth() + 1).padStart(2, "0");
  const resDay = String(date.getDate()).padStart(2, "0");
  return `${resYear}-${resMonth}-${resDay}`;
}

export function comparePeriodsSpending(current: number, previous: number) {
  if (previous === 0) {
    return {
      isIncrease: current > 0,
      percentChange: current > 0 ? 100 : 0,
      diffAmount: current,
    };
  }
  const diff = current - previous;
  const percentChange = Math.abs((diff / previous) * 100);
  return {
    isIncrease: diff > 0,
    percentChange,
    diffAmount: Math.abs(diff),
  };
}
