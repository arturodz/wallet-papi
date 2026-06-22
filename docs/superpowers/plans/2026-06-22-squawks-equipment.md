# Wallet PAPI — Plan 4: Squawks + Equipment + Warranties

> **For agentic workers:** Execute task-by-task with TDD where logic is non-trivial. Steps use `- [ ]`.

**Goal:** Track squawks (open/deferred/resolved discrepancies) and equipment inventory with warranties, linked to each other and to intervals/services.

**Architecture:** Server actions (editor-gated) over `squawks` and `equipment`. A small tested helper manages the resolve-date transition. Squawks list (filterable by status), equipment list, and an equipment detail page showing that item's intervals (with computed status) + open squawks + warranty. Builds on Plans 1–3 (reuses `computeIntervalStatus`, `warrantyStatus`, `StatusBadge`, `canWrite`).

**Tech Stack:** Next.js 16, Drizzle, Vitest. No new deps.

---

## File Structure
- `src/lib/squawks.ts` — `resolveTransition(newStatus, prevResolvedDate, today)` (pure, tested).
- `src/lib/squawks.test.ts`.
- `src/app/actions/squawks.ts` — `createSquawk`, `updateSquawk`, `setSquawkStatus`, `deleteSquawk`.
- `src/app/actions/equipment.ts` — `createEquipment`, `updateEquipment`, `deleteEquipment`.
- `src/app/squawks/page.tsx` + `squawk-form.tsx` (client) + `squawk-status-control.tsx` (client).
- `src/app/equipment/page.tsx` + `equipment-form.tsx` (client).
- `src/app/equipment/[id]/page.tsx` — detail with linked intervals/squawks/warranty.
- Add `squawkInput`, `equipmentInput` to `src/lib/validation.ts`.
- Add Squawks + Equipment links to `src/components/nav.tsx`.

---

## Task 1: Squawk resolve-date transition (TDD)
**Files:** create `src/lib/squawks.ts`, `src/lib/squawks.test.ts`.

When a squawk becomes `resolved` it should get a `resolvedDate` (today, if not already set); when it moves back to `open`/`deferred` the `resolvedDate` clears.

- [ ] **Step 1: Failing test**
```ts
import { describe, it, expect } from "vitest";
import { resolveTransition } from "./squawks";

const today = "2026-06-22";
describe("resolveTransition", () => {
  it("sets resolvedDate to today when resolving and none set", () => {
    expect(resolveTransition("resolved", null, today)).toBe("2026-06-22");
  });
  it("keeps an existing resolvedDate when already resolved", () => {
    expect(resolveTransition("resolved", "2026-01-10", today)).toBe("2026-01-10");
  });
  it("clears resolvedDate when reopened", () => {
    expect(resolveTransition("open", "2026-01-10", today)).toBeNull();
    expect(resolveTransition("deferred", "2026-01-10", today)).toBeNull();
  });
});
```
- [ ] **Step 2:** `npm test -- squawks` → FAIL.
- [ ] **Step 3: Implement:** `resolved` → `prevResolvedDate ?? today`; else `null`.
- [ ] **Step 4:** → PASS.
- [ ] **Step 5:** Commit `feat: squawk resolve-date transition`.

---

## Task 2: Validation + server actions
**Files:** extend `src/lib/validation.ts`; create `src/app/actions/squawks.ts`, `src/app/actions/equipment.ts`.

Zod (follow existing `emptyToUndefined` / `z.coerce.number()` pattern):
- `squawkInput`: `{ title: string min 1, description?: string, severity?: string, status: enum(open/deferred/resolved) default open, openedDate: string, equipmentId?: uuid, resolvedByServiceId?: uuid }`.
- `equipmentInput`: `{ name: string min 1, category?: string, make?: string, model?: string, serial?: string, installDate?: string, warrantyExpiry?: string, notes?: string }`.

Actions (all `requireRole("editor")`, validate, `revalidatePath` the touched routes + `/`):
- `createSquawk(input)`, `updateSquawk(id, input)`, `deleteSquawk(id)`.
- `setSquawkStatus(id, status)` — loads the row, applies `resolveTransition`, updates `status` + `resolvedDate`.
- `createEquipment(input)`, `updateEquipment(id, input)`, `deleteEquipment(id)`. Guard delete: if intervals/squawks reference the equipment, null those FKs first (or block with a clear error) — pick null-out and document it.

- [ ] Commit `feat: squawk + equipment server actions`.

---

## Task 3: Squawks page
**Files:** `src/app/squawks/page.tsx` + `squawk-form.tsx` + `squawk-status-control.tsx`.

- Server component lists squawks sorted open/deferred first then resolved, each with severity, opened date, linked equipment name (join or lookup), and a `StatusBadge` reusing `statusColor` mapping (map squawk status → annunciator: open→overdue/red is too strong; use: open→amber, deferred→slate, resolved→emerald — define a small local map, do NOT overload interval statuses).
- `squawk-status-control` (client): a control to change status (calls `setSquawkStatus`), editor-only.
- Form (client) supports linking to an equipment item (native `<select>` of equipment) and optionally a resolving service. Add/edit/delete + status control hidden for viewers.
- Empty state: "Pre-flight: no squawks — you're cleared."
- Add `Squawks` to nav.

- [ ] Commit `feat: squawks page`.

---

## Task 4: Equipment list + detail
**Files:** `src/app/equipment/page.tsx` + `equipment-form.tsx`; `src/app/equipment/[id]/page.tsx`.

- List: name, category, make/model, serial (mono), warranty chip via `warrantyStatus` + `StatusBadge`. Editor-gated add/edit/delete. Empty state "Pre-flight: no equipment recorded." Each row links to detail.
- Detail (`/equipment/[id]`): show all fields; **linked intervals** (where `equipmentId = id`) each with `computeIntervalStatus` + `StatusBadge`; **open squawks** against this equipment; warranty status prominently. This realizes the spec's "open the transponder, see its cert due-date and any open squawks."
- Add `Equipment` to nav.

- [ ] **Verify:** `npm run build`, `npm test`, `npx tsc --noEmit` all clean.
- [ ] Commit `feat: equipment list and detail`.

---

## Self-Review
- Covers spec's squawks (open/deferred/resolved, severity, equipment link, resolve-via-service) and equipment inventory + warranties + linkage. The dashboard (Plan 3) already reads squawks + warranties, so it now populates. Viewer read-only enforced.
- Squawk status uses its own color map (not the interval annunciator semantics) to avoid implying "open = overdue."
