# Wallet PAPI — Plan 6: PWA + iPad + Glass-Cockpit Polish

> **For agentic workers:** Execute task-by-task. Steps use `- [ ]`. Mostly config + UI; little unit-testable logic.

**Goal:** Make Wallet PAPI an installable, offline-capable PWA that looks and works great on phone AND iPad, with a cohesive glass-cockpit visual pass.

**Architecture:** Next.js App Router `manifest.ts` + a Serwist (or minimal hand-rolled) service worker for the offline app-shell. Responsive layouts (bottom tab bar on phone, sidebar/multi-column on iPad). A shared visual system: dark instrument theme, mono numerics, annunciator accents. Builds on Plans 1–5; changes are presentational + config, no schema or logic changes.

**Tech Stack:** Next.js 16, Tailwind, Serwist (`@serwist/next`) or a minimal custom SW, `sharp` (dev, icon rasterization).

---

## File Structure
- `src/app/manifest.ts` — web app manifest (Next metadata route).
- `public/icons/*` — generated PNG icons (192, 512, maskable, apple-touch).
- `public/icon.svg` + `scripts/gen-icons.mjs` — source icon (PAPI 4-light motif) + rasterizer.
- `src/app/sw.ts` (Serwist) or `public/sw.js` (hand-rolled) + registration.
- `next.config.ts` — wrap with Serwist if used.
- `src/app/layout.tsx` — viewport, theme-color, apple-mobile-web-app meta, responsive shell.
- `src/components/nav.tsx` — responsive nav (bottom tabs ≤ phone, sidebar ≥ md).
- `src/app/globals.css` — glass-cockpit theme tokens.

---

## Task 1: App icon (PAPI motif)
**Files:** `public/icon.svg`, `scripts/gen-icons.mjs`, generated `public/icons/*.png`. Add `sharp` dev dep.

- Create `public/icon.svg`: dark rounded-square background; a row of **4 PAPI lights** (the precision approach path indicator — render as two white + two red circles, or all-white, on a subtle runway centerline) and a small "PAPI" / aircraft glyph. Keep it clean and recognizable at small sizes.
- `scripts/gen-icons.mjs`: use `sharp` to render `icon.svg` → `public/icons/icon-192.png`, `icon-512.png`, `maskable-512.png` (with padding/safe-zone), `apple-touch-icon.png` (180, opaque background). Run it (`node scripts/gen-icons.mjs`) and commit the PNGs.

- [ ] Commit `feat: PAPI app icon and rasterizer`.

---

## Task 2: Web manifest + meta
**Files:** create `src/app/manifest.ts`; update `src/app/layout.tsx`.

- `manifest.ts` (default export `MetadataRoute.Manifest`): `name: "Wallet PAPI"`, `short_name: "PAPI"`, `description`, `start_url: "/"`, `display: "standalone"`, `background_color`/`theme_color` (dark instrument tones, e.g. `#0b0f14`), `orientation: "portrait"` (allow `any` if iPad landscape desired), icons referencing the generated PNGs incl. the maskable one.
- `layout.tsx`: export `viewport` (`themeColor`, `width=device-width, initialScale=1, viewportFit=cover`) and `metadata` (`appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "PAPI" }`, `applicationName`, icons incl. `apple` = apple-touch-icon). Add `manifest` link (Next auto-links the manifest route).

- [ ] Commit `feat: web manifest and PWA meta`.

---

## Task 3: Service worker (offline app-shell)
**Files:** Serwist route + `next.config.ts`, OR `public/sw.js` + a registration client component.

- **Preferred: Serwist.** `npm install @serwist/next` (+ `serwist`). Create `src/app/sw.ts` with `defaultCache` + `installSerwist`/`Serwist` precaching the app shell; wrap `next.config.ts` with `withSerwist({ swSrc: "src/app/sw.ts", swDest: "public/sw.js" })`. Strategy: network-first for navigations (so data stays fresh online), cache fallback offline; cache static assets. **If Serwist fights Next 16 + Turbopack**, fall back to a minimal hand-rolled `public/sw.js` (precache `/`, offline fallback page, stale-while-revalidate for static) registered via a small `"use client"` `ServiceWorkerRegister` component in `layout.tsx`. Document which path you took.
- Ensure writes (server actions) are NOT cached/intercepted — only GET navigations + assets. Offline = read cached shell; mutations require connection (acceptable per spec).

- [ ] **Verify:** `npm run build` produces `sw.js`; app still builds. Commit `feat: offline service worker`.

---

## Task 4: Responsive shell + nav (phone + iPad)
**Files:** `src/components/nav.tsx`, `src/app/layout.tsx`, page grids.

- Nav: **bottom tab bar** (fixed, icon+label, safe-area inset padding) on small screens; **left sidebar** on `md+` (iPad/desktop). Use lucide icons (Dashboard=gauge, Services=wrench, Expenses=receipt, Intervals=timer, Squawks=triangle-alert, Equipment=cpu/radio, TCO=dollar). Active-route highlight.
- Layout: content max-width + centered on large screens; padding accounts for the bottom bar on phone (`pb-20`) and the sidebar on iPad (`md:pl-56`).
- Dashboard + list pages: responsive grids — single column on phone, 2–3 columns of StatusTiles and side-by-side detail on `md/lg`. Tables scroll horizontally on phone (`overflow-x-auto`) and lay out fully on iPad.
- Verify touch targets are ≥ 44px and the camera/scan input is easy to tap.

- [ ] Commit `feat: responsive phone + iPad shell and nav`.

---

## Task 5: Glass-cockpit visual pass
**Files:** `src/app/globals.css`, shared components.

- Theme tokens: dark instrument background, panel surfaces with subtle borders, the green/amber/red annunciator accents already centralized in `statusColor`. Ensure dark is the default (PWA at the hangar).
- Numerics (tach/Hobbs/hours/serials/tail#/money) in mono with tabular-nums.
- Polish: consistent card styling, status glow on overdue tiles, "Pre-flight" empty states, a tasteful header with tail number as the call-sign. Keep it restrained — modern SaaS that winks at aviation, not skeuomorphic.
- Quick accessibility check: color is never the ONLY status signal (badges have text labels too); inputs have labels; focus states visible.

- [ ] **Verify:** `npm run build` passes, `npm test` green (no regressions), `npx tsc --noEmit` clean. Sanity-check the manifest JSON (`/manifest.webmanifest`) and that `sw.js` exists post-build.
- [ ] Commit `feat: glass-cockpit visual pass`.

---

## Self-Review
- Covers spec's PWA (installable, offline app-shell, manifest, SW), iPad as first-class (responsive sidebar/grids, not stretched phone), and the glass-cockpit design system. No schema/logic changes — purely presentational + PWA config, so all prior tests remain green.
- Offline is read-only by design (mutations need connection) — matches the spec.
