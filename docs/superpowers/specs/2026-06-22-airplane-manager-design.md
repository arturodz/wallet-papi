# Airplane Manager — Design

**Date:** 2026-06-22
**Status:** Approved, pre-implementation

## Purpose

A personal aircraft maintenance & expense tracker for a single privately-owned
plane. It **complements ForeFlight** (which owns flight planning and the
logbook) by covering what ForeFlight does not: maintenance service history,
recurring service intervals, expenses, squawks, equipment/warranties, and the
documents behind all of it. Phone-first (PWA), used at the hangar.

Out of scope (deliberate): flight planning, pilot logbook, formal Airworthiness
Directive (AD) subscription/tracking engine, life-limited-parts management,
multi-aircraft fleets, equipment removal/replacement history.

## Stack

- **Next.js 15 (App Router) + React 19 + TypeScript** on Vercel. Latest *stable* releases (no canary/RC).
- **Neon Postgres** via **Drizzle ORM**.
- **shadcn/ui + Tailwind**.
- **Neon Auth** for sign-in/sessions; role stored on a `profiles` row.
- **Vercel Blob** for photo/document storage.
- **Gemini** (flash vision model, official Google SDK) for document field extraction.
- All server mutations are **server actions** that check the caller's role. No separate API layer.

## Data model

One aircraft, modeled as a row so other tables FK cleanly.

- **aircraft** — tail_number, make, model, year, serial, `current_tach`, `current_hobbs`, `hours_updated_at`. Hours are updated manually (no ForeFlight API).
- **profiles** — user_id (from Neon Auth), role: `owner | editor | viewer`.
- **equipment** — name, category, make, model, serial, install_date, `warranty_expiry`, notes.
- **intervals** — name, kind (`calendar | hours | both`), interval_months, interval_hours, `last_done_date`, `last_done_hours`, optional `equipment_id`. Next-due is **computed, not stored**.
- **services** — date, tach_at_service, description, vendor, category, optional `equipment_id`, optional `satisfies_interval_id` (logging the service bumps that interval's `last_done_*` anchor).
- **expenses** — date, payee, amount, category, notes, optional `service_id`. **Single source of truth for money** — services have no `cost` column; a service's cost is expense rows linked to it. Standalone costs (hangar, insurance, fuel) link to nothing.
- **squawks** — title, description, severity, status (`open | deferred | resolved`), opened_date, resolved_date, optional `equipment_id`, optional `resolved_by_service_id`.
- **documents** — blob_url, doc_type (`invoice | logbook | warranty | photo`), `extracted_json`, uploaded_at, and **polymorphic** `entity_type` + `entity_id` so one upload+extract pipeline serves services, expenses, squawks, and equipment (warranty cards).

Key decisions:
1. **Money lives only in `expenses`** — avoids double-entry; "total spent" is one query.
2. **`documents` is polymorphic** — one pipeline instead of four near-identical attachment tables.

## Document + AI pipeline

1. User snaps/uploads a photo (native `<input type="file" accept="image/*" capture="environment">`).
2. File uploads to **Vercel Blob**.
3. A **server action** sends the image to **Gemini flash**, which returns `{ date, vendor, amount, hours, description, doc_type }`.
4. Extracted fields **pre-fill the relevant form for the user to review and confirm** — never auto-saved.
5. Raw `extracted_json` is stored on the `documents` row alongside the blob URL.

## Reminders / dashboard

Computed live (not stored). For each interval:
- **Calendar:** days until `last_done_date + interval_months`.
- **Hours:** hours until `last_done_hours + interval_hours − current_tach`.
- `kind = both` → whichever is sooner governs.

Also surfaces equipment `warranty_expiry` and open squawks.

Each item gets an **annunciator status**: `green` (OK), `amber` (due-soon), `red`
(overdue). Due-soon thresholds are constants: **30 days / 10 hours** (tweakable later).

## Auth / roles

Neon Auth for sign-in. Three roles, checked in server actions:
- **owner** — full access + invite/manage users.
- **editor** — full read/write, no user management.
- **viewer** — read-only (for a mechanic or prospective buyer).

No per-field permissions.

## Design system — "glass cockpit"

- **Annunciator status colors** reused as the app's status language: green = airworthy/OK, amber = caution/due-soon, red = warning/overdue. Drives dashboard, interval cards, warranty chips.
- **Palette:** charcoal/slate instrument-panel base, dark "night cockpit" mode as the default, one aviation accent (nav-light green or instrument cyan).
- **Type:** clean technical sans for UI (Geist/Inter) + a **mono readout** for gauge-like numbers (tach/Hobbs hours, serials, tail number).
- **Touches:** dashboard as an instrument-panel of status tiles; empty states phrased "Pre-flight" ("No squawks — you're cleared"); plane/gauge icons from lucide. Restrained modern SaaS that winks at aviation, not skeuomorphic.

## PWA & testing

- **PWA:** web manifest + service worker; installable; offline app-shell with cached read views (writes require connection).
- **Testing:** unit tests cover the **non-trivial logic** — interval/due-date math and role checks. CRUD/forms do not get a dedicated suite.
