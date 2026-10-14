import { z } from "zod";

export const expenseFormSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  category_id: z.string().min(1, "Please select a category"),
  expense_date: z.string().min(1, "Please select an expense date"),
  paid_by_user_id: z.string().min(1, "Please select who paid"),
  payment_method: z.string().min(1, "Please select payment method"),
  notes: z.string().optional().nullable(),
  receipt_path: z.string().optional().nullable(),
});

export const budgetFormSchema = z.object({
  amount: z.coerce.number().positive("Budget amount must be greater than 0"),
  category_id: z.string().nullable().optional(),
  period_start: z.string().min(1, "Period start is required"),
});

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Name is too long"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, "Invalid hex color format"),
});

export const recurringExpenseFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  category_id: z.string().min(1, "Category is required"),
  frequency: z.enum(["weekly", "monthly", "quarterly", "yearly"]),
  start_date: z.string().min(1, "Start date is required"),
  paid_by_user_id: z.string().min(1, "Please select payer"),
  payment_method: z.string().min(1, "Payment method is required"),
});
