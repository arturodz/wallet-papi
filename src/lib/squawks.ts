export type SquawkStatus = "open" | "deferred" | "resolved";

// Manages the resolvedDate column as squawk status changes:
//  - resolving keeps an existing resolvedDate, else stamps today.
//  - reopening (open/deferred) clears the resolvedDate.
export function resolveTransition(
  newStatus: SquawkStatus,
  prevResolvedDate: string | null,
  today: string,
): string | null {
  if (newStatus === "resolved") return prevResolvedDate ?? today;
  return null;
}
