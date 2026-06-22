export type IntervalStatus = "ok" | "due_soon" | "overdue" | "unknown";
export type WarrantyStatus = "none" | "ok" | "due_soon" | "overdue";

export interface IntervalRow {
  kind: "calendar" | "hours" | "both";
  intervalMonths: number | null;
  intervalHours: number | null;
  lastDoneDate: string | null; // YYYY-MM-DD
  lastDoneHours: number | null;
}

export interface IntervalResult {
  status: IntervalStatus;
  dueDate: string | null; // YYYY-MM-DD
  daysUntilDue: number | null;
  dueHours: number | null;
  hoursUntilDue: number | null;
}

export interface ComputeContext {
  currentTach: number;
  now: Date;
}

export const DUE_SOON_DAYS = 30;
export const DUE_SOON_HOURS = 10;

const MS_PER_DAY = 86_400_000;

// Naive month add: rolls into the next month if the day-of-month overflows
// (e.g. Jan 31 + 1mo -> Mar 3). Acceptable ceiling for maintenance intervals.
function addMonths(dateStr: string, months: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + months, d));
  return dt.toISOString().slice(0, 10);
}

function parseUTCDate(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

// Status from a "units until due" value (days or hours), against its threshold.
function axisStatus(untilDue: number, threshold: number): IntervalStatus {
  if (untilDue < 0) return "overdue";
  if (untilDue <= threshold) return "due_soon";
  return "ok";
}

const SEVERITY: Record<IntervalStatus, number> = {
  ok: 0,
  due_soon: 1,
  overdue: 2,
  unknown: -1,
};

// Worst of two axes. If one axis is unknown but the other is computable,
// use the computable one; only unknown if both are unknown.
function combine(a: IntervalStatus, b: IntervalStatus): IntervalStatus {
  if (a === "unknown") return b;
  if (b === "unknown") return a;
  return SEVERITY[a] >= SEVERITY[b] ? a : b;
}

export function computeIntervalStatus(
  row: IntervalRow,
  ctx: ComputeContext,
): IntervalResult {
  const result: IntervalResult = {
    status: "unknown",
    dueDate: null,
    daysUntilDue: null,
    dueHours: null,
    hoursUntilDue: null,
  };

  const useCalendar = row.kind === "calendar" || row.kind === "both";
  const useHours = row.kind === "hours" || row.kind === "both";

  let calStatus: IntervalStatus = "unknown";
  let hrsStatus: IntervalStatus = "unknown";

  if (useCalendar) {
    if (row.lastDoneDate != null && row.intervalMonths != null) {
      const dueDate = addMonths(row.lastDoneDate, row.intervalMonths);
      const days = Math.floor((parseUTCDate(dueDate) - ctx.now.getTime()) / MS_PER_DAY);
      result.dueDate = dueDate;
      result.daysUntilDue = days;
      calStatus = axisStatus(days, DUE_SOON_DAYS);
    }
  }

  if (useHours) {
    if (row.lastDoneHours != null && row.intervalHours != null) {
      const dueHours = row.lastDoneHours + row.intervalHours;
      const hoursUntil = dueHours - ctx.currentTach;
      result.dueHours = dueHours;
      result.hoursUntilDue = hoursUntil;
      hrsStatus = axisStatus(hoursUntil, DUE_SOON_HOURS);
    }
  }

  if (row.kind === "calendar") result.status = calStatus;
  else if (row.kind === "hours") result.status = hrsStatus;
  else result.status = combine(calStatus, hrsStatus);

  return result;
}

export function warrantyStatus(
  warrantyExpiry: string | null,
  now: Date,
): WarrantyStatus {
  if (warrantyExpiry == null) return "none";
  const days = Math.floor((parseUTCDate(warrantyExpiry) - now.getTime()) / MS_PER_DAY);
  if (days < 0) return "overdue";
  if (days <= DUE_SOON_DAYS) return "due_soon";
  return "ok";
}
