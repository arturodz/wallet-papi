# Wallet PAPI — Plan 7: Multi-Aircraft Support

> Execute task-by-task. Builds on the live app (Plans 1–6 + aircraft page).

**Goal:** Manage more than one aircraft. Add/edit planes, pick an **active plane** via a header switcher (cookie-backed), and scope every page + create action to the active plane.

**Architecture:** Each domain table (intervals, services, expenses, squawks, equipment) now has a required `aircraft_id` FK (migration already applied to the live DB). A server helper resolves the active aircraft from an `activeAircraftId` cookie (falling back to the first plane). All reads filter by it; all creates stamp it. A client switcher in the nav sets the cookie via a server action.

**DB migration: ALREADY DONE on live Neon** — `aircraft_id uuid NOT NULL REFERENCES aircraft(id)` added to intervals/services/expenses/squawks/equipment (tables were empty). The code must catch up to this.

---

## Task 1: Schema catch-up
`src/db/schema.ts`: add to **intervals, services, expenses, squawks, equipment**:
```ts
aircraftId: uuid("aircraft_id").notNull().references(() => aircraft.id),
```
Run `npm run db:push` — expect NO diff (DB already migrated). If drizzle reports a diff, reconcile so schema matches the live DB (do not drop/recreate columns). Commit.

---

## Task 2: Active-aircraft helper + actions
`src/lib/aircraft.ts` (server-only):
- `listAircraft()` → all aircraft ordered by tail number.
- `getActiveAircraftId()` → read `activeAircraftId` cookie (`await cookies()`); if missing/not found in the list, return the first aircraft's id (or null if none).
- `getActiveAircraft()` → the active aircraft row (or null).

`src/app/actions/aircraft.ts` (extend):
- `createAircraft(input)` — `requireRole("editor")`, parse with `aircraftInput`, insert, return row.
- `setActiveAircraft(id: string)` — `requireRole("viewer")` (any signed-in user can switch their view), validate id exists, set the `activeAircraftId` cookie (`await cookies()).set(...)` httpOnly, path "/"), `revalidatePath` the app routes (`/`, `/intervals`, `/services`, `/expenses`, `/squawks`, `/equipment`, `/tco`, `/aircraft`).

Commit.

---

## Task 3: Stamp aircraftId on creates
In each create action, set `aircraftId` to the active aircraft id (resolve via `getActiveAircraftId()` inside the action; throw a clear error if null):
- `createInterval`, `createService`, `createExpense`, `createSquawk`, `createEquipment`.
Existing role checks/validation stay. Commit.

---

## Task 4: Scope every read by active aircraft
Add `where(eq(table.aircraftId, activeId))` (and keep existing ordering) in:
- `/` dashboard (intervals, equipment, squawks queries), `/intervals`, `/services`, `/expenses`, `/squawks`, `/equipment`, `/equipment/[id]` (also verify the item belongs to the active plane), `/tco` (expenses + the active aircraft for cost/hour).
Each page resolves `getActiveAircraftId()` once. If there are zero aircraft, render a "Add your first aircraft" prompt linking to `/aircraft`. Commit.

---

## Task 5: Aircraft page = list + add + switch + edit
Rebuild `src/app/aircraft/page.tsx`:
- List all aircraft (tail # mono, make/model, a "Active" badge on the current one, a "Set active" button per non-active plane calling `setActiveAircraft`).
- **Add aircraft** form (client) — tail number required + make/model/year/serial, calls `createAircraft`, then `setActiveAircraft(newId)` so you land on the new plane. Editor-gated.
- Per-plane **edit** via the existing `AircraftDetailsForm` (keep it; reuse for the active plane's full details incl. hours/acquisition). Viewers see read-only.
Commit.

---

## Task 6: Header plane switcher
`src/components/aircraft-switcher.tsx` (client): a compact `<select>` of all aircraft (tail #), value = active id, `onChange` → `setActiveAircraft` then `router.refresh()`. Render it in the nav (top of sidebar on md+, and in a sensible spot on the phone layout — e.g. a slim bar under the header). Pass the aircraft list + active id from a server component (the nav is client — fetch in `layout.tsx` or a small server wrapper and pass as props). Hide the switcher on bare routes (sign-in/offline). When only one plane exists, still show it (read-only-ish) so the model is obvious.

Verify: `npm run build` passes, `npm test` green (34), `npx tsc --noEmit` clean. Commit.

---

## Self-Review
- Every read scoped to the active plane; every create stamps it; switching is a cookie + revalidate. Adding a plane auto-activates it. Zero-aircraft and single-aircraft states both handled.
- Out of scope (note for later): deleting an aircraft (has cascade implications), per-plane combined/fleet TCO view, per-user active-plane (cookie is per-browser, fine for one owner).
