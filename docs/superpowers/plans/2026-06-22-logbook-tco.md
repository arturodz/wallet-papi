# Wallet PAPI — Plan 2: Logbook + Total Cost of Ownership

> **For agentic workers:** Execute task-by-task with TDD. Steps use `- [ ]`.

**Goal:** Log maintenance services and all expenses, link costs to services, edit aircraft hours/acquisition details, and view a total-cost-of-ownership report.

**Architecture:** Server actions (role-gated via `requireRole`) mutate `services`, `expenses`, and `aircraft`. Pure functions compute TCO over the expense ledger (single source of truth). shadcn forms + lists; a TCO report page. Builds on Plan 1 schema + `requireRole`.

**Tech Stack:** Next.js 16 App Router, Drizzle, Neon Auth guard, shadcn/ui, Vitest, Zod (add for input validation).

Money note: `expenses.amount` is `numeric(12,2)` → Drizzle returns a **string**; parse with care. We compute in JS floats rounded to cents — fine for a single-aircraft personal ledger (ponytail: float money, single currency; revisit only if multi-currency ever appears).

---

## File Structure
- `src/lib/money.ts` — `toCents`, `formatUSD` helpers (tested).
- `src/lib/tco.ts` — pure TCO computation (tested).
- `src/lib/tco.test.ts`, `src/lib/money.test.ts`.
- `src/lib/validation.ts` — Zod schemas for service/expense/aircraft inputs.
- `src/app/actions/services.ts` — `createService`, `updateService`, `deleteService` server actions.
- `src/app/actions/expenses.ts` — `createExpense`, `updateExpense`, `deleteExpense`.
- `src/app/actions/aircraft.ts` — `updateAircraft` (hours + acquisition fields).
- `src/app/services/page.tsx` + `src/app/services/service-form.tsx` (client) — list + add/edit.
- `src/app/expenses/page.tsx` + `src/app/expenses/expense-form.tsx` (client).
- `src/app/tco/page.tsx` — TCO report.
- `src/components/nav.tsx` — simple nav (Dashboard / Services / Expenses / TCO).

---

## Task 1: Money helpers (TDD)
**Files:** create `src/lib/money.ts`, `src/lib/money.test.ts`.

- [ ] **Step 1: Failing test**
```ts
import { describe, it, expect } from "vitest";
import { toCents, formatUSD } from "./money";

describe("money", () => {
  it("parses dollar strings to integer cents", () => {
    expect(toCents("1234.56")).toBe(123456);
    expect(toCents("0")).toBe(0);
    expect(toCents("99.9")).toBe(9990);
  });
  it("formats cents as USD", () => {
    expect(formatUSD(123456)).toBe("$1,234.56");
    expect(formatUSD(0)).toBe("$0.00");
  });
});
```
- [ ] **Step 2:** Run `npm test -- money` → FAIL.
- [ ] **Step 3: Implement**
```ts
export function toCents(amount: string | number): number {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) throw new Error(`invalid amount: ${amount}`);
  return Math.round(n * 100);
}
export function formatUSD(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
    .format(cents / 100);
}
```
- [ ] **Step 4:** `npm test -- money` → PASS.
- [ ] **Step 5:** Commit `feat: money helpers`.

---

## Task 2: TCO computation (TDD)
**Files:** create `src/lib/tco.ts`, `src/lib/tco.test.ts`.

Input is the raw expense rows (amount as string, category nullable, date string) plus aircraft hours. Output is in cents.

- [ ] **Step 1: Failing test**
```ts
import { describe, it, expect } from "vitest";
import { computeTco } from "./tco";

const expenses = [
  { amount: "50000.00", category: "acquisition", date: "2025-01-01" },
  { amount: "300.00", category: "maintenance", date: "2025-02-01" },
  { amount: "150.50", category: "fuel", date: "2025-02-15" },
  { amount: "300.00", category: null, date: "2025-03-01" },
];

describe("computeTco", () => {
  it("sums lifetime total in cents", () => {
    const r = computeTco(expenses, { currentTach: 120, acquisitionTach: 100 });
    expect(r.totalCents).toBe(5075050);
  });
  it("breaks down by category, nulls grouped as 'uncategorized'", () => {
    const r = computeTco(expenses, { currentTach: 120, acquisitionTach: 100 });
    expect(r.byCategory.acquisition).toBe(5000000);
    expect(r.byCategory.uncategorized).toBe(30000);
  });
  it("cost per hour uses hours flown under ownership", () => {
    const r = computeTco(expenses, { currentTach: 120, acquisitionTach: 100 });
    // 5,075,050 cents / 20 hours = 253,752.5 -> round to 253753
    expect(r.costPerHourCents).toBe(253753);
  });
  it("cost per hour is null when no hours flown (avoid divide by zero)", () => {
    const r = computeTco(expenses, { currentTach: 100, acquisitionTach: 100 });
    expect(r.costPerHourCents).toBeNull();
  });
  it("cost per hour is null when acquisitionTach unknown", () => {
    const r = computeTco(expenses, { currentTach: 120, acquisitionTach: null });
    expect(r.costPerHourCents).toBeNull();
  });
});
```
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: Implement** (`src/lib/tco.ts`) using `toCents` from `./money`. Group by `category ?? "uncategorized"`. `hoursFlown = currentTach - acquisitionTach` when `acquisitionTach != null && hoursFlown > 0`, else cost/hour null. Return `{ totalCents, byCategory: Record<string, number>, costPerHourCents: number | null }`. Round cost/hour with `Math.round`.
- [ ] **Step 4:** Run → PASS (5 tests).
- [ ] **Step 5:** Commit `feat: TCO computation with tests`.

---

## Task 3: Validation schemas
**Files:** create `src/lib/validation.ts`. Add Zod: `npm install zod`.

Define and export Zod schemas (infer types):
- `serviceInput`: `{ date: string (YYYY-MM-DD), description: string min 1, vendor?: string, category?: string, tachAtService?: number, equipmentId?: uuid, satisfiesIntervalId?: uuid }`.
- `expenseInput`: `{ date: string, payee?: string, amount: string (regex /^\d+(\.\d{1,2})?$/), category?: string, notes?: string, serviceId?: uuid }`.
- `aircraftInput`: `{ tailNumber, make?, model?, year?, serial?, currentTach?: number, currentHobbs?: number, acquiredDate?: string, acquisitionTach?: number }`.

- [ ] Commit `feat: zod validation schemas`.

---

## Task 4: Server actions (services, expenses, aircraft)
**Files:** create the three files under `src/app/actions/`. Each begins with `"use server"`.

Pattern for every mutation:
```ts
"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guard";
import { db } from "@/db";
// ...schema imports, zod schema, eq

export async function createService(input: unknown) {
  await requireRole("editor");           // throws FORBIDDEN/UNAUTHENTICATED
  const data = serviceInput.parse(input);
  const [row] = await db.insert(services).values(data).returning();
  // If satisfiesIntervalId set, bump that interval's anchors:
  if (data.satisfiesIntervalId) {
    await db.update(intervals)
      .set({ lastDoneDate: data.date, lastDoneHours: data.tachAtService ?? null })
      .where(eq(intervals.id, data.satisfiesIntervalId));
  }
  revalidatePath("/services");
  revalidatePath("/");
  return row;
}
```
Implement: `createService/updateService/deleteService`, `createExpense/updateExpense/deleteExpense`, `updateAircraft`. All gated `requireRole("editor")`. `updateAircraft` also sets `hoursUpdatedAt: new Date()` when tach/hobbs change. `revalidatePath` the affected routes (`/services`, `/expenses`, `/tco`, `/`).

- [ ] **Test:** add `src/app/actions/services.test.ts` that mocks `requireRole` to throw and asserts the action rejects for viewers (one focused test — proves role gating is wired). Mock `db` minimally. Commit `feat: services/expenses/aircraft server actions`.

---

## Task 5: Services & Expenses UI
**Files:** `src/app/services/page.tsx` (+ `service-form.tsx`), `src/app/expenses/page.tsx` (+ `expense-form.tsx`), `src/components/nav.tsx`.

- Server components fetch rows (`db.select().from(...).orderBy(desc(date))`) and read `getCurrentProfile()` to know if the user `canWrite`.
- Forms are client components calling the server actions; hide add/edit/delete controls when `!canWrite(role)` (viewer = read-only). Use shadcn `Input`, `Label`, `Button`, `Card`, and `Select` for category/status (run `npx shadcn@latest add select table` as needed).
- Expense form supports optionally linking to a service (`serviceId` select). Show amounts via `formatUSD(toCents(row.amount))`.
- Lists rendered in a `Table`. Empty states phrased "Pre-flight" (e.g. "No services logged yet").
- Add `nav.tsx` linking Dashboard / Services / Expenses / TCO; include it in `layout.tsx`.

- [ ] Commit `feat: services and expenses UI`.

---

## Task 6: TCO report page
**Files:** `src/app/tco/page.tsx`.

Server component: load all expenses + the aircraft row, call `computeTco`. Render with glass-cockpit styling:
- Big **lifetime total** (mono) and **$/hour** (or "—" if null, with hint "set acquisition tach to enable").
- **By-category** breakdown (Table or simple bars) using `formatUSD`.
- **Monthly burn**: group expenses by `YYYY-MM`, show last 12 months as a simple list/bar (compute inline or extend `computeTco` — if extended, add a test).
- Link to edit aircraft acquisition fields (reuse an aircraft form, or a small inline form posting `updateAircraft`).

- [ ] **Verify:** `npm run build` passes, `npm test` green, `tsc --noEmit` clean.
- [ ] Commit `feat: TCO report page`.

---

## Self-Review
- Covers spec's logbook (services), money model (expenses single-source), and full TCO (total, by-category, monthly, $/hour). Interval-anchor bump on service is implemented here (used by Plan 3). Viewer read-only enforced in actions + UI.
- Deferred to later plans: interval due math + dashboard statuses (Plan 3), squawks/equipment (Plan 4), document attachments (Plan 5).
