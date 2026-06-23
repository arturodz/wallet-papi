/**
 * Pure (DB-free) helpers behind the "fast re-entry" suggestions. Kept separate
 * from suggestions.ts so they can be unit-tested without importing the db
 * client (which needs DATABASE_URL at module load).
 */

/**
 * A title the user has used before, paired with the payee/category/amount from
 * the MOST RECENT expense carrying that title. Powers the datalist + prefill.
 */
export interface ExpenseTitleSuggestion {
  title: string;
  payee: string | null;
  category: string | null;
  amount: string;
}

export interface ExpenseSuggestions {
  /** Distinct non-null titles, each with its most-recent template values. */
  expenseTitles: ExpenseTitleSuggestion[];
  /** Distinct non-null payees the user has logged before. */
  payees: string[];
}

/**
 * Resolve the per-title "template" from a list of expenses ordered most-recent
 * first. For each distinct title we keep the FIRST occurrence seen (i.e. the
 * most recent given the input order).
 *
 * Title matching is case-insensitive and trim-insensitive for dedup purposes,
 * but the suggestion preserves the original (most recent) casing for display.
 */
export function resolveExpenseTitleTemplates(
  rows: {
    title: string | null;
    payee: string | null;
    category: string | null;
    amount: string;
  }[],
): ExpenseTitleSuggestion[] {
  const seen = new Map<string, ExpenseTitleSuggestion>();
  for (const r of rows) {
    if (r.title == null) continue;
    const trimmed = r.title.trim();
    if (trimmed === "") continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.set(key, {
      title: trimmed,
      payee: r.payee,
      category: r.category,
      amount: r.amount,
    });
  }
  return [...seen.values()];
}

/**
 * Find the template for a typed title: trimmed, case-insensitive exact match
 * against the known suggestions. Returns null for an unknown (brand-new) title,
 * so new values flow through untouched — never trapping the user.
 */
export function matchExpenseTitle(
  input: string,
  suggestions: ExpenseTitleSuggestion[],
): ExpenseTitleSuggestion | null {
  const key = input.trim().toLowerCase();
  if (key === "") return null;
  return suggestions.find((s) => s.title.trim().toLowerCase() === key) ?? null;
}

/** Distinct non-null values, preserving first-seen (most-recent) order/casing. */
export function resolveDistinct(values: (string | null)[]): string[] {
  const seen = new Map<string, string>();
  for (const v of values) {
    if (v == null) continue;
    const trimmed = v.trim();
    if (trimmed === "") continue;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) seen.set(key, trimmed);
  }
  return [...seen.values()];
}
