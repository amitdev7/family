import { describe, it, expect } from "vitest";
import {
  calculateTotalSpending,
  calculateBudgetMetrics,
  calculateNextOccurrence,
  comparePeriodsSpending,
} from "@/lib/calculations/financials";
import { Expense } from "@/lib/types";

describe("Financial Calculations", () => {
  it("calculates total spending correctly excluding deleted expenses", () => {
    const expenses: Expense[] = [
      {
        id: "1",
        household_id: "h1",
        category_id: "c1",
        amount: 1500,
        description: "Test 1",
        expense_date: "2026-10-10",
        paid_by_user_id: "u1",
        created_by_user_id: "u1",
        payment_method: "UPI",
        created_at: "",
        updated_at: "",
      },
      {
        id: "2",
        household_id: "h1",
        category_id: "c1",
        amount: 2500,
        description: "Test 2",
        expense_date: "2026-10-11",
        paid_by_user_id: "u1",
        created_by_user_id: "u1",
        payment_method: "UPI",
        deleted_at: "2026-10-12T00:00:00Z",
        created_at: "",
        updated_at: "",
      },
    ];

    expect(calculateTotalSpending(expenses)).toBe(1500);
  });

  it("calculates budget metrics properly", () => {
    const { remaining, utilizationPercent } = calculateBudgetMetrics(40000, 100000);
    expect(remaining).toBe(60000);
    expect(utilizationPercent).toBe(40);
  });

  it("calculates next occurrence accurately", () => {
    expect(calculateNextOccurrence("2026-10-15", "monthly")).toBe("2026-11-15");
    expect(calculateNextOccurrence("2026-10-01", "weekly")).toBe("2026-10-08");
    expect(calculateNextOccurrence("2026-10-01", "yearly")).toBe("2027-10-01");
  });

  it("compares periods spending", () => {
    const comp1 = comparePeriodsSpending(12000, 10000);
    expect(comp1.isIncrease).toBe(true);
    expect(comp1.percentChange).toBe(20);

    const comp2 = comparePeriodsSpending(8000, 10000);
    expect(comp2.isIncrease).toBe(false);
    expect(comp2.percentChange).toBe(20);
  });
});
