# Wallet PAPI — Plan 3: Service Intervals + Glass-Cockpit Dashboard

> **For agentic workers:** Execute task-by-task with TDD. Steps use `- [ ]`.

**Goal:** Define recurring service intervals (calendar / engine-hours / both), compute what's due, and surface it on a glass-cockpit dashboard with annunciator (green/amber/red) status — alongside warranty expiries and open squawks.

**Architecture:** A pure, fully-tested function computes each interval's status from its anchors + the aircraft's current tach + today. Server actions (editor-gated) manage intervals. The dashboard is a server component that runs the computation over all intervals, plus warranty/squawk queries, and renders status tiles. Builds on Plans 1–2.

**Tech Stack:** Next.js 16, Drizzle, Vitest. No new deps.

Thresholds (constants in `src/lib/intervals.ts`): **due-soon = 30 days OR 10 hours**.

---

## File Structure
- `src/lib/intervals.ts` — `computeIntervalStatus`, `warrantyStatus`, threshold constants (pure, tested).
- `src/lib/intervals.test.ts`.
- `src/app/actions/intervals.ts` — `createInterval`, `updateInterval`, `deleteInterval`.
- `src/app/intervals/page.tsx` + `intervals/interval-form.tsx` (client).
- `src/app/page.tsx` — rebuilt dashboard (instrument panel).
- `src/components/status-tile.tsx`, `src/components/status-badge.tsx` — annunciator UI.

---

## Task 1: Interval + warranty status logic (TDD)
**Files:** create `src/lib/intervals.ts`, `src/lib/intervals.test.ts`.

Types:
```ts
export type IntervalStatus = "ok" | "due_soon" | "overdue" | "unknown";
export interface IntervalRow {
  kind: "calendar" | "hours" | "both";
  intervalMonths: number | null;
  intervalHours: number | null;
  lastDoneDate: string | null;   // YYYY-MM-DD
  lastDoneHours: number | null;
}
export interface IntervalResult {
  status: IntervalStatus;
  dueDate: string | null;        // YYYY-MM-DD
  daysUntilDue: number | null;
  dueHours: number | null;
  hoursUntilDue: number | null;
}
```

- [ ] **Step 1: Failing test** (`now` and `currentTach` injected for determinism)
```ts
import { describe, it, expect } from "vitest";
import { computeIntervalStatus, warrantyStatus } from "./intervals";

const now = new Date("2026-06-22T00:00:00Z");

describe("computeIntervalStatus", () => {
  it("calendar: far out is ok (green)", () => {
    const r = computeIntervalStatus(
      { kind: "calendar", intervalMonths: 12, intervalHours: null, lastDoneDate: "2026-03-01", lastDoneHours: null },
      { currentTach: 100, now });
    expect(r.status).toBe("ok");
    expect(r.dueDate).toBe("2027-03-01");
    expect(r.daysUntilDue).toBeGreaterThan(30);
  });
  it("calendar: within 30 days is due_soon (amber)", () => {
    const r = computeIntervalStatus(
      { kind: "calendar", intervalMonths: 12, intervalHours: null, lastDoneDate: "2025-07-01", lastDoneHours: null },
      { currentTach: 100, now });
    expect(r.status).toBe("due_soon"); // due 2026-07-01, ~9 days out
  });
  it("calendar: past due is overdue (red)", () => {
    const r = computeIntervalStatus(
      { kind: "calendar", intervalMonths: 12, intervalHours: null, lastDoneDate: "2025-01-01", lastDoneHours: null },
      { currentTach: 100, now });
    expect(r.status).toBe("overdue");
    expect(r.daysUntilDue).toBeLessThan(0);
  });
  it("hours: within 10 hours is due_soon", () => {
    const r = computeIntervalStatus(
      { kind: "hours", intervalMonths: null, intervalHours: 50, lastDoneDate: null, lastDoneHours: 95 },
      { currentTach: 140, now }); // due at 145, 5 hrs out
    expect(r.status).toBe("due_soon");
    expect(r.hoursUntilDue).toBe(5);
  });
  it("hours: past due is overdue", () => {
    const r = computeIntervalStatus(
      { kind: "hours", intervalMonths: null, intervalHours: 50, lastDoneDate: null, lastDoneHours: 95 },
      { currentTach: 150, now }); // due 145, -5
    expect(r.status).toBe("overdue");
  });
  it("both: takes the worse of calendar/hours", () => {
    const r = computeIntervalStatus(
      { kind: "both", intervalMonths: 12, intervalHours: 50, lastDoneDate: "2026-03-01", lastDoneHours: 95 },
      { currentTach: 150, now }); // calendar ok, hours overdue -> overdue
    expect(r.status).toBe("overdue");
  });
  it("unknown when required anchor missing", () => {
    const r = computeIntervalStatus(
      { kind: "calendar", intervalMonths: 12, intervalHours: null, lastDoneDate: null, lastDoneHours: null },
      { currentTach: 100, now });
    expect(r.status).toBe("unknown");
  });
});

describe("warrantyStatus", () => {
  it("none when no expiry", () => { expect(warrantyStatus(null, now)).toBe("none"); });
  it("ok when far out", () => { expect(warrantyStatus("2027-01-01", now)).toBe("ok"); });
  it("due_soon within 30 days", () => { expect(warrantyStatus("2026-07-10", now)).toBe("due_soon"); });
  it("overdue when expired", () => { expect(warrantyStatus("2026-01-01", now)).toBe("overdue"); });
});
```
- [ ] **Step 2:** Run `npm test -- intervals` → FAIL.
- [ ] **Step 3: Implement.** Constants `DUE_SOON_DAYS = 30`, `DUE_SOON_HOURS = 10`. Calendar: `dueDate = addMonths(lastDoneDate, intervalMonths)`; `daysUntilDue = floor((dueDate - now)/86400000)`. Hours: `dueHours = lastDoneHours + intervalHours`; `hoursUntilDue = dueHours - currentTach`. Per-axis status: `< 0` → overdue; `<= threshold` → due_soon; else ok. Missing required anchor for an active axis → that axis "unknown". For `both`, combine by severity order `overdue > due_soon > ok > unknown` (worst wins; but if one axis unknown and other computable, use the computable one). `addMonths` via `new Date(Date.UTC(y, m + months, d))` (note ceiling: naive month add; fine for maintenance). Return ISO `YYYY-MM-DD` for dueDate.
- [ ] **Step 4:** Run → PASS (all cases).
- [ ] **Step 5:** Commit `feat: interval + warranty status logic with tests`.

---

## Task 2: Interval server actions
**Files:** create `src/app/actions/intervals.ts` (`"use server"`).

`createInterval/updateInterval/deleteInterval`, all `requireRole("editor")`, validated with a new `intervalInput` Zod schema (add to `src/lib/validation.ts`): `{ name: string min 1, kind: enum, intervalMonths?: number, intervalHours?: number, lastDoneDate?: string, lastDoneHours?: number, equipmentId?: uuid }`. Refine: require `intervalMonths` when kind is calendar/both; require `intervalHours` when kind is hours/both. `revalidatePath("/intervals")` and `revalidatePath("/")`.

- [ ] Commit `feat: interval server actions`.

---

## Task 3: Annunciator UI components
**Files:** create `src/components/status-badge.tsx`, `src/components/status-tile.tsx`.

- `statusColor(status)` map → Tailwind classes: ok→emerald, due_soon→amber, overdue→red, unknown→slate. Centralize so dashboard + lists share it.
- `StatusBadge`: small pill showing the status word with the color.
- `StatusTile`: a card for the dashboard with a label, a big number/value (mono), and a status accent border/glow.

- [ ] Commit `feat: annunciator status components`.

---

## Task 4: Intervals page
**Files:** `src/app/intervals/page.tsx` (+ `interval-form.tsx`).

Server component lists intervals, computes each one's status via `computeIntervalStatus` (pass aircraft.currentTach + `new Date()`), shows name, kind, due date / due hours, days/hours remaining, and a `StatusBadge`. Add/edit/delete hidden for viewers. Sort by severity (overdue → due_soon → ok → unknown). Add `Intervals` to `nav.tsx`. Empty state "Pre-flight: no intervals defined."

- [ ] Commit `feat: intervals page`.

---

## Task 5: Glass-cockpit dashboard (rebuild `/`)
**Files:** rewrite `src/app/page.tsx`.

Server component. If no profile → keep the "Please sign in" branch (link to `/sign-in`). Otherwise build the instrument panel:
- **Top summary row** of `StatusTile`s: counts of `overdue` and `due_soon` items (across intervals + warranties), open squawks count, and current tach/Hobbs (mono readout) with "updated <hoursUpdatedAt>".
- **Airworthiness list**: every interval with its status, sorted worst-first; every equipment item with a non-`none` `warrantyStatus`; shown with `StatusBadge`. Green when all clear ("All systems go / Cleared for departure").
- **Open squawks** preview (title + severity), linking to `/squawks` (page arrives in Plan 4 — link is fine).
- Header keeps tail number (mono) + role badge + sign-out button.
- Queries: `db.select` intervals, equipment (for warranties), squawks where status != resolved, aircraft row. Compute statuses in the component.

- [ ] **Verify:** `npm run build` passes, `npm test` green, `npx tsc --noEmit` clean.
- [ ] Commit `feat: glass-cockpit dashboard`.

---

## Self-Review
- Covers spec's interval kinds (calendar/hours/both), computed-not-stored due dates, annunciator statuses, and the instrument-panel dashboard incl. warranties + open squawks. Equipment/squawks data entry arrives in Plan 4; the dashboard already reads those tables so it lights up automatically.
- Threshold constants centralized and tweakable. Month-add is a documented naive approximation.
