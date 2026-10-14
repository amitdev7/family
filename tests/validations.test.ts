import { describe, it, expect } from "vitest";
import {
  expenseFormSchema,
  budgetFormSchema,
  categoryFormSchema,
  recurringExpenseFormSchema,
} from "@/lib/validations";

describe("Validation Schemas", () => {
  it("validates valid expense inputs", () => {
    const valid = expenseFormSchema.safeParse({
      amount: "1500",
      description: "Groceries",
      category_id: "cat-1",
      expense_date: "2026-10-14",
      paid_by_user_id: "usr-1",
      payment_method: "UPI",
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.amount).toBe(1500);
    }
  });

  it("rejects non-positive expense amounts", () => {
    const invalid = expenseFormSchema.safeParse({
      amount: "-10",
      description: "Test",
      category_id: "cat-1",
      expense_date: "2026-10-14",
      paid_by_user_id: "usr-1",
      payment_method: "UPI",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates budget inputs", () => {
    const valid = budgetFormSchema.safeParse({
      amount: 50000,
      category_id: null,
      period_start: "2026-10-01",
    });
    expect(valid.success).toBe(true);
  });

  it("validates category inputs and hex colors", () => {
    const valid = categoryFormSchema.safeParse({
      name: "Travel",
      icon: "Plane",
      color: "#3b82f6",
    });
    expect(valid.success).toBe(true);

    const invalidColor = categoryFormSchema.safeParse({
      name: "Travel",
      icon: "Plane",
      color: "blue",
    });
    expect(invalidColor.success).toBe(false);
  });

  it("validates recurring expense inputs", () => {
    const valid = recurringExpenseFormSchema.safeParse({
      description: "WiFi Bill",
      amount: 999,
      category_id: "cat-util",
      frequency: "monthly",
      start_date: "2026-10-01",
      paid_by_user_id: "usr-1",
      payment_method: "UPI",
    });
    expect(valid.success).toBe(true);
  });
});
