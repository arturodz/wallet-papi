import "server-only";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { expenses, services } from "@/db/schema";
import {
  resolveDistinct,
  resolveExpenseTitleTemplates,
  type ExpenseSuggestions,
} from "./suggestions-core";

export {
  matchExpenseTitle,
  resolveDistinct,
  resolveExpenseTitleTemplates,
} from "./suggestions-core";
export type {
  ExpenseSuggestions,
  ExpenseTitleSuggestion,
} from "./suggestions-core";

/** Expense title/payee suggestions for the active aircraft. */
export async function getExpenseSuggestions(
  aircraftId: string,
): Promise<ExpenseSuggestions> {
  const rows = await db
    .select({
      title: expenses.title,
      payee: expenses.payee,
      category: expenses.category,
      amount: expenses.amount,
    })
    .from(expenses)
    .where(eq(expenses.aircraftId, aircraftId))
    .orderBy(desc(expenses.date), desc(expenses.id));

  return {
    expenseTitles: resolveExpenseTitleTemplates(rows),
    payees: resolveDistinct(rows.map((r) => r.payee)),
  };
}

/** Distinct non-null service vendors for the active aircraft (most-recent first). */
export async function getVendorSuggestions(
  aircraftId: string,
): Promise<string[]> {
  const rows = await db
    .select({ vendor: services.vendor })
    .from(services)
    .where(and(eq(services.aircraftId, aircraftId), isNotNull(services.vendor)))
    .orderBy(desc(services.date), desc(services.id));
  return resolveDistinct(rows.map((r) => r.vendor));
}