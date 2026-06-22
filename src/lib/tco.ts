import { toCents } from "./money";

export interface TcoExpense {
  amount: string | number;
  category: string | null;
  date: string;
}

export interface TcoResult {
  totalCents: number;
  byCategory: Record<string, number>;
  costPerHourCents: number | null;
}

export interface MonthlyBurn {
  month: string; // YYYY-MM
  totalCents: number;
}

export function computeTco(
  expenses: TcoExpense[],
  hours: { currentTach: number; acquisitionTach: number | null },
): TcoResult {
  let totalCents = 0;
  const byCategory: Record<string, number> = {};

  for (const e of expenses) {
    const cents = toCents(e.amount);
    totalCents += cents;
    const key = e.category ?? "uncategorized";
    byCategory[key] = (byCategory[key] ?? 0) + cents;
  }

  let costPerHourCents: number | null = null;
  if (hours.acquisitionTach != null) {
    const hoursFlown = hours.currentTach - hours.acquisitionTach;
    if (hoursFlown > 0) {
      costPerHourCents = Math.round(totalCents / hoursFlown);
    }
  }

  return { totalCents, byCategory, costPerHourCents };
}

export function computeMonthlyBurn(expenses: TcoExpense[]): MonthlyBurn[] {
  const byMonth: Record<string, number> = {};
  for (const e of expenses) {
    const month = e.date.slice(0, 7); // YYYY-MM
    byMonth[month] = (byMonth[month] ?? 0) + toCents(e.amount);
  }
  return Object.entries(byMonth)
    .map(([month, totalCents]) => ({ month, totalCents }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
