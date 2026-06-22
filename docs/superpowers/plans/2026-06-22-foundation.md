# Airplane Manager — Plan 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the app skeleton — a deployable Next.js app where you sign in via Neon Auth, your aircraft record exists in Neon, and role-based access (owner/editor/viewer) is enforced.

**Architecture:** Next.js 15 App Router on Vercel. Neon Postgres accessed through Drizzle ORM (neon-http driver). Neon Auth handles sessions; a `profiles` row maps each Neon Auth user to a role. A pure role-ordering helper backs all access checks; server actions wrap it against the live session.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, shadcn/ui, Drizzle ORM, `@neondatabase/serverless`, `@neondatabase/auth`, Vitest.

This is Plan 1 of 6. Later plans (logbook, intervals+dashboard, squawks+equipment, documents+Gemini, PWA+iPad) build on this schema and the `requireRole` helper defined here.

---

## File Structure

- `src/db/schema.ts` — full Drizzle schema for all tables (defined now so later plans only query, never re-migrate the core).
- `src/db/index.ts` — Drizzle client bound to Neon.
- `drizzle.config.ts` — drizzle-kit config.
- `src/lib/auth/server.ts` — Neon Auth server client.
- `src/lib/auth/client.ts` — Neon Auth client-component client.
- `src/lib/auth/roles.ts` — pure role-ordering logic (unit-tested).
- `src/lib/auth/guard.ts` — `requireRole` server guard that reads the session + profile and applies `roles.ts`.
- `src/lib/auth/roles.test.ts` — unit tests for role ordering.
- `src/app/page.tsx` — aircraft dashboard stub (shows the plane + current user role).
- `src/app/layout.tsx` — root layout (generated; tweaked for fonts/theme).

---

## Task 1: Scaffold the Next.js app

**Files:**
- Create: project root files via generator.

- [ ] **Step 1: Scaffold**

The repo already exists with `docs/` committed. Scaffold into the current directory:

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --app --eslint --src-dir --import-alias "@/*" --use-npm --no-turbopack
```
Expected: prompts answered by flags; `src/app/`, `package.json`, `tsconfig.json`, `tailwind.config.ts` created. If it warns the directory is non-empty, accept (it preserves `docs/` and `.git`).

- [ ] **Step 2: Verify it runs**

Run: `npm run dev` then open http://localhost:3000 — expect the Next.js starter page. Stop the server (Ctrl-C).

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "chore: scaffold Next.js app"
```

---

## Task 2: Initialize shadcn/ui

**Files:**
- Create: `components.json`, `src/components/ui/*`, `src/lib/utils.ts` (generated).

- [ ] **Step 1: Init shadcn**

Run:
```bash
npx shadcn@latest init -d
```
Expected: `components.json` created, Tailwind + CSS variables wired, base theme installed.

- [ ] **Step 2: Add the components Plan 1 needs**

Run:
```bash
npx shadcn@latest add button card badge
```
Expected: files appear under `src/components/ui/`.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "chore: init shadcn/ui with button, card, badge"
```

---

## Task 3: Install data + auth + test dependencies

**Files:**
- Modify: `package.json`.

- [ ] **Step 1: Install**

Run:
```bash
npm install drizzle-orm @neondatabase/serverless @neondatabase/auth
npm install -D drizzle-kit vitest
```
Expected: dependencies added, no peer-dep errors that block install.

- [ ] **Step 2: Add scripts**

In `package.json`, add to `"scripts"`:
```json
"db:generate": "drizzle-kit generate",
"db:push": "drizzle-kit push",
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "chore: add drizzle, neon, neon-auth, vitest deps"
```

---

## Task 4: Environment + Drizzle config

**Files:**
- Create: `.env.local` (gitignored), `.env.example`, `drizzle.config.ts`, `src/db/index.ts`.

- [ ] **Step 1: Env template**

Create `.env.example`:
```
DATABASE_URL=postgres://...neon...
NEON_AUTH_BASE_URL=https://...neon-auth...
NEON_AUTH_COOKIE_SECRET=replace-with-32+char-random-string
BLOB_READ_WRITE_TOKEN=
GEMINI_API_KEY=
```
Then copy to `.env.local` and fill `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET` from the Neon console (Entropy org). Leave Blob/Gemini blank — later plans use them.

- [ ] **Step 2: drizzle.config.ts**

Create `drizzle.config.ts`:
```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

- [ ] **Step 3: Drizzle client**

Create `src/db/index.ts`:
```ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: drizzle config and neon db client"
```

---

## Task 5: Define the full database schema

**Files:**
- Create: `src/db/schema.ts`.

- [ ] **Step 1: Write the schema**

Create `src/db/schema.ts` (all tables for the whole app — later plans only query these):
```ts
import {
  pgTable, pgEnum, uuid, text, integer, numeric, timestamp, date, real,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["owner", "editor", "viewer"]);
export const intervalKindEnum = pgEnum("interval_kind", ["calendar", "hours", "both"]);
export const squawkStatusEnum = pgEnum("squawk_status", ["open", "deferred", "resolved"]);
export const docTypeEnum = pgEnum("doc_type", ["invoice", "logbook", "warranty", "photo"]);
export const entityTypeEnum = pgEnum("entity_type", ["service", "expense", "squawk", "equipment"]);

export const aircraft = pgTable("aircraft", {
  id: uuid("id").primaryKey().defaultRandom(),
  tailNumber: text("tail_number").notNull(),
  make: text("make"),
  model: text("model"),
  year: integer("year"),
  serial: text("serial"),
  currentTach: real("current_tach").notNull().default(0),
  currentHobbs: real("current_hobbs").notNull().default(0),
  hoursUpdatedAt: timestamp("hours_updated_at", { withTimezone: true }),
  acquiredDate: date("acquired_date"),
  acquisitionTach: real("acquisition_tach"), // tach at purchase; anchors cost-per-hour in TCO
});

export const profiles = pgTable("profiles", {
  // userId is the Neon Auth user id (subject), not generated here.
  userId: text("user_id").primaryKey(),
  email: text("email"),
  role: roleEnum("role").notNull().default("viewer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const equipment = pgTable("equipment", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: text("category"),
  make: text("make"),
  model: text("model"),
  serial: text("serial"),
  installDate: date("install_date"),
  warrantyExpiry: date("warranty_expiry"),
  notes: text("notes"),
});

export const intervals = pgTable("intervals", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  kind: intervalKindEnum("kind").notNull(),
  intervalMonths: integer("interval_months"),
  intervalHours: real("interval_hours"),
  lastDoneDate: date("last_done_date"),
  lastDoneHours: real("last_done_hours"),
  equipmentId: uuid("equipment_id").references(() => equipment.id),
});

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date").notNull(),
  tachAtService: real("tach_at_service"),
  description: text("description").notNull(),
  vendor: text("vendor"),
  category: text("category"),
  equipmentId: uuid("equipment_id").references(() => equipment.id),
  satisfiesIntervalId: uuid("satisfies_interval_id").references(() => intervals.id),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date").notNull(),
  payee: text("payee"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category"),
  notes: text("notes"),
  serviceId: uuid("service_id").references(() => services.id),
});

export const squawks = pgTable("squawks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  severity: text("severity"),
  status: squawkStatusEnum("status").notNull().default("open"),
  openedDate: date("opened_date").notNull(),
  resolvedDate: date("resolved_date"),
  equipmentId: uuid("equipment_id").references(() => equipment.id),
  resolvedByServiceId: uuid("resolved_by_service_id").references(() => services.id),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  blobUrl: text("blob_url").notNull(),
  docType: docTypeEnum("doc_type"),
  extractedJson: text("extracted_json"), // raw Gemini JSON, parsed on read
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
  entityType: entityTypeEnum("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
});
```

- [ ] **Step 2: Push schema to Neon**

Run: `npm run db:push`
Expected: drizzle-kit reports the enums + 8 tables created on the Neon branch pointed to by `DATABASE_URL`. No errors.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: full database schema and initial push"
```

---

## Task 6: Role-ordering logic (TDD)

This is the only non-trivial logic in the foundation, so it gets tests. `roles.ts` is pure (no I/O) and orders `viewer < editor < owner`.

**Files:**
- Create: `src/lib/auth/roles.ts`
- Test: `src/lib/auth/roles.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/auth/roles.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { hasAtLeast, canWrite, canManageUsers } from "./roles";

describe("role ordering", () => {
  it("owner satisfies every requirement", () => {
    expect(hasAtLeast("owner", "viewer")).toBe(true);
    expect(hasAtLeast("owner", "editor")).toBe(true);
    expect(hasAtLeast("owner", "owner")).toBe(true);
  });
  it("editor can write but not manage users", () => {
    expect(hasAtLeast("editor", "editor")).toBe(true);
    expect(hasAtLeast("editor", "owner")).toBe(false);
    expect(canWrite("editor")).toBe(true);
    expect(canManageUsers("editor")).toBe(false);
  });
  it("viewer is read-only", () => {
    expect(canWrite("viewer")).toBe(false);
    expect(hasAtLeast("viewer", "editor")).toBe(false);
    expect(canManageUsers("viewer")).toBe(false);
  });
  it("owner can manage users", () => {
    expect(canManageUsers("owner")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- roles`
Expected: FAIL — cannot resolve `./roles` / functions undefined.

- [ ] **Step 3: Write the implementation**

Create `src/lib/auth/roles.ts`:
```ts
export type Role = "owner" | "editor" | "viewer";

const RANK: Record<Role, number> = { viewer: 0, editor: 1, owner: 2 };

export function hasAtLeast(role: Role, required: Role): boolean {
  return RANK[role] >= RANK[required];
}

export const canWrite = (role: Role) => hasAtLeast(role, "editor");
export const canManageUsers = (role: Role) => hasAtLeast(role, "owner");
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- roles`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: role-ordering logic with tests"
```

---

## Task 7: Neon Auth clients + session→profile guard

**Files:**
- Create: `src/lib/auth/server.ts`, `src/lib/auth/client.ts`, `src/lib/auth/guard.ts`.

- [ ] **Step 1: Auth clients**

Create `src/lib/auth/server.ts`:
```ts
import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
});
```

Create `src/lib/auth/client.ts`:
```ts
"use client";
import { createAuthClient } from "@neondatabase/auth/next";

export const authClient = createAuthClient();
```

- [ ] **Step 2: The guard**

Create `src/lib/auth/guard.ts`. It reads the Neon Auth session, looks up (or lazily creates) the user's `profiles` row, and enforces a minimum role using `hasAtLeast`:
```ts
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { auth } from "./server";
import { hasAtLeast, type Role } from "./roles";

export async function getCurrentProfile() {
  // Neon Auth (Better Auth compatible) returns a `{ data, error }` envelope;
  // the session lives under `data`, with the user under `data.user`.
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;

  const userId = session.user.id;
  const found = await db.select().from(profiles).where(eq(profiles.userId, userId));
  if (found.length > 0) return found[0];

  // First sign-in: create a viewer profile by default. Owner is granted manually in DB.
  const inserted = await db
    .insert(profiles)
    .values({ userId, email: session.user.email ?? null, role: "viewer" })
    .returning();
  return inserted[0];
}

export async function requireRole(min: Role) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("UNAUTHENTICATED");
  if (!hasAtLeast(profile.role as Role, min)) throw new Error("FORBIDDEN");
  return profile;
}
```

- [ ] **Step 3: Manually grant yourself owner**

After your first sign-in (next task) creates a `viewer` profile, promote it once:
Run (psql or Neon SQL editor): `UPDATE profiles SET role = 'owner' WHERE email = '<your-email>';`
(Documented here; execute after Task 8 sign-in.)

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: neon auth clients and requireRole guard"
```

---

## Task 8: Aircraft dashboard stub

**Files:**
- Modify: `src/app/page.tsx`
- Create: aircraft seed via SQL (one row).

- [ ] **Step 1: Seed the aircraft row**

Run (Neon SQL editor), substituting your tail number:
```sql
INSERT INTO aircraft (tail_number, make, model) VALUES ('N12345', 'Cirrus', 'SR22');
```

- [ ] **Step 2: Render plane + role**

Replace `src/app/page.tsx`:
```tsx
import { db } from "@/db";
import { aircraft } from "@/db/schema";
import { getCurrentProfile } from "@/lib/auth/guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function Home() {
  const profile = await getCurrentProfile();
  const [plane] = await db.select().from(aircraft).limit(1);

  if (!profile) {
    return <main className="p-8">Please sign in.</main>;
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-2xl">{plane?.tailNumber ?? "No aircraft"}</h1>
        <Badge>{profile.role}</Badge>
      </div>
      <Card>
        <CardHeader><CardTitle>Aircraft</CardTitle></CardHeader>
        <CardContent className="font-mono text-sm space-y-1">
          <div>{plane?.make} {plane?.model}</div>
          <div>Tach: {plane?.currentTach}</div>
          <div>Hobbs: {plane?.currentHobbs}</div>
        </CardContent>
      </Card>
    </main>
  );
}
```

- [ ] **Step 3: Verify end-to-end**

Run: `npm run dev`, sign in via Neon Auth, run the Task 7 Step 3 promotion SQL, refresh.
Expected: page shows your tail number, make/model, tach/Hobbs, and an "owner" badge.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: aircraft dashboard stub with role badge"
```

---

## Task 9: Auth routing + sign-in UI

**Context:** Tasks 7–8 created the Neon Auth server/client instances and the `requireRole` guard, but never mounted the auth HTTP endpoints or shipped any sign-in surface — so `getSession()` always returned an empty session and the app was unusable. This task wires the real handler/middleware and adds a minimal sign-in/sign-out UI.

**Real API used (verified against `@neondatabase/auth@0.4.2-beta` installed types, `dist/next/server/index.d.mts` + `dist/next/index.d.mts`):**
- `createNeonAuth(config)` returns a `NeonAuth` instance exposing all Better Auth server methods **plus** `handler()` and `middleware(config?)`.
- `auth.handler()` → `{ GET, POST, PUT, DELETE, PATCH }` route handlers. Each takes `(request: Request, { params }: { params: Promise<{ path: string[] }> })`. Because the param is named `path`, the catch-all route folder **must** be `[...path]`.
- `auth.middleware({ loginUrl })` → `(request: NextRequest) => Promise<NextResponse>`; refreshes the session cookie and redirects unauthenticated requests to `loginUrl` (default `/auth/sign-in`).
- Client (`createAuthClient()` from `@neondatabase/auth/next`): `authClient.signIn.email({ email, password, callbackURL? })`, `authClient.signUp.email({ name, email, password, callbackURL? })`, `authClient.signIn.social({ provider: "google", callbackURL? })`, `authClient.signOut()`. All return a `{ data, error }` better-fetch envelope (no throw by default).

**Files:**
- Create: `src/app/api/auth/[...path]/route.ts` — `export const { GET, POST } = auth.handler();`
- Create: `src/proxy.ts` — `export default auth.middleware({ loginUrl: "/sign-in" });` with a `matcher` excluding `api/auth`, `sign-in`, Next internals, and static assets. (Next.js 16 deprecated the `middleware` filename in favor of `proxy`; the helper's signature is identical, so it slots straight into the proxy default export and the build emits no deprecation warning.)
- Create: `src/app/sign-in/page.tsx` — client component; email+password sign-in/sign-up toggle plus a "Continue with Google" social button; shadcn `Card`/`Input`/`Label`/`Button`.
- Create: `src/components/sign-out-button.tsx` — client `signOut()` button.
- Add: shadcn `input` + `label` components.
- Modify: `src/app/page.tsx` — the no-profile branch now links to `/sign-in`; the signed-in header shows the role badge + a sign-out button.

**Manual step remaining (human):** Google OAuth must be enabled for this Neon Auth project and the redirect/callback URL (the deployed origin + `/api/auth/...`) registered in the Neon Auth console / Google OAuth client. Email+password works without extra config.

**Verification:** `npm run build` ✓ (routes `/`, `/sign-in`, `/api/auth/[...path]`, Proxy middleware all registered), `tsc --noEmit` ✓.

---

## Self-Review

- **Spec coverage (foundation slice):** stack ✓ (Tasks 1–4), full data model ✓ (Task 5 — defines every table the later plans need), Neon Auth + owner/editor/viewer roles ✓ (Tasks 6–7), aircraft record + manual hours fields ✓ (Tasks 5, 8). Document/Gemini, interval math, dashboard statuses, PWA, iPad layouts are deliberately deferred to Plans 2–6.
- **Placeholders:** none — every code step has complete code; the one manual SQL grant is intentional and documented.
- **Type consistency:** `Role` type and `hasAtLeast`/`canWrite`/`canManageUsers` names match between `roles.ts`, its test, and `guard.ts`; schema table/column names match the queries in `guard.ts` and `page.tsx`.
- **Note:** Neon Auth's session shape was confirmed against `@neondatabase/auth@0.4.2-beta`: `auth.getSession()` returns `{ data, error }`, so `guard.ts` destructures `const { data: session } = await auth.getSession()` and reads `session.user.id` / `session.user.email`. Auth routing + sign-in UI added in Task 9.
