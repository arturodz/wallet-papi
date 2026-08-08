# Wallet PAPI iPhone PWA Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Wallet PAPI native-feeling and reliable as an installed iPhone PWA while removing generic dashboard styling.

**Architecture:** Keep the existing App Router and responsive shell. Move route grouping into a pure navigation module, render five primary phone tabs plus a normal More route, make touch dimensions responsive at the shared primitive layer, and replace repeated dashboard tiles with one connected instrument strip.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Base UI, Vitest

---

### Task 1: Mobile navigation contract

**Files:**
- Create: `src/lib/navigation.ts`
- Create: `src/lib/navigation.test.ts`

- [ ] **Step 1: Write navigation behavior tests**

Cover exact and nested route matching, primary tab selection, overflow routes mapping to More, and unknown paths returning no active tab.

```ts
import { describe, expect, it } from "vitest";
import { activeMobileHref, isRouteActive } from "./navigation";

describe("mobile navigation", () => {
  it("matches exact and nested routes", () => {
    expect(isRouteActive("/services", "/services")).toBe(true);
    expect(isRouteActive("/services/annual", "/services")).toBe(true);
    expect(isRouteActive("/expenses", "/")).toBe(false);
  });

  it("keeps primary destinations on their own tab", () => {
    expect(activeMobileHref("/expenses")).toBe("/expenses");
  });

  it("maps overflow destinations to More", () => {
    expect(activeMobileHref("/equipment/elt")).toBe("/more");
    expect(activeMobileHref("/intervals")).toBe("/more");
  });

  it("returns null for an unknown route", () => {
    expect(activeMobileHref("/unknown")).toBeNull();
  });
});
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `npx vitest run src/lib/navigation.test.ts`

Expected: failure because `src/lib/navigation.ts` does not exist.

- [ ] **Step 3: Implement the pure route model**

Create exported desktop, primary mobile, and More destination arrays. Implement `isRouteActive(pathname, href)` with a root-route special case. Implement `activeMobileHref(pathname)` so primary routes win and any More destination returns `/more`.

```ts
export const primaryMobileDestinations = [
  { href: "/", label: "Dashboard" },
  { href: "/services", label: "Services" },
  { href: "/expenses", label: "Expenses" },
  { href: "/squawks", label: "Squawks" },
  { href: "/more", label: "More" },
] as const;

export const moreDestinations = [
  { href: "/aircraft", label: "Aircraft", description: "Identity, hours, and ownership" },
  { href: "/intervals", label: "Intervals", description: "Calendar and engine-hour limits" },
  { href: "/equipment", label: "Equipment", description: "Installed gear and warranties" },
  { href: "/tco", label: "Total cost", description: "Ownership and operating costs" },
  { href: "/notes", label: "Notes", description: "Dated aircraft notes" },
] as const;
```

- [ ] **Step 4: Run the focused test and confirm it passes**

Run: `npx vitest run src/lib/navigation.test.ts`

Expected: 4 tests pass.

### Task 2: Five-tab iPhone navigation

**Files:**
- Modify: `src/components/nav.tsx`
- Modify: `src/components/app-chrome.tsx`
- Create: `src/app/more/page.tsx`

- [ ] **Step 1: Consume the shared route model in Nav**

Keep all destinations in the desktop rail. Render exactly five phone tabs from `primaryMobileDestinations`. Add a More icon and use `activeMobileHref(pathname)` to set `aria-current`. Give the top bar top safe-area padding and the bottom bar bottom safe-area padding.

- [ ] **Step 2: Add the normal More route**

Render a descriptive `h1` and a single divided list from `moreDestinations`. Each row is a full-width `Link` with a 44-pixel minimum target, icon, label, description, and trailing chevron. Do not use cards or a modal.

- [ ] **Step 3: Fix application content insets**

Replace fixed `pb-24` with `pb-[calc(5rem+env(safe-area-inset-bottom))]` on phone. Preserve the desktop left-rail offset.

### Task 3: Phone touch and keyboard ergonomics

**Files:**
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/select.tsx`
- Modify: `src/components/ui/form-field.tsx`
- Modify: `src/components/ui/data-list.tsx`
- Modify: `src/components/ui/sheet.tsx`
- Modify: `src/components/aircraft-switcher.tsx`

- [ ] **Step 1: Make shared controls 44 pixels on phone**

Use mobile-first `h-11` or `size-11` dimensions and restore compact dimensions with `md:` classes. Keep phone text at `text-base`; restore `text-sm` at `md:`. Apply the rule to default buttons, inputs, select triggers and options, native form selects, the add trigger, aircraft switcher, and sheet close.

- [ ] **Step 2: Protect sheet actions from iPhone safe areas**

Constrain the phone sheet against the visual viewport and top safe area. Add bottom safe-area padding to the sticky footer. Keep the existing right-side desktop panel and reduced-motion behavior.

- [ ] **Step 3: Preserve visible interaction feedback**

Retain focus rings, active one-pixel button translation, disabled states, and semantic error states. Do not replace touch feedback with hover-only behavior.

### Task 4: Distill the dashboard

**Files:**
- Create: `src/components/instrument-strip.tsx`
- Modify: `src/app/page.tsx`
- Delete: `src/components/status-tile.tsx`
- Modify: `src/app/sign-in/page.tsx`

- [ ] **Step 1: Replace four metric cards with one instrument strip**

Create `InstrumentStrip` with a two-column phone layout and four-column desktop layout inside one bordered panel. Use internal dividers, semantic value colors, text labels, and tabular figures. Do not apply per-cell shadows or glows.

- [ ] **Step 2: Migrate the dashboard caller**

Replace four `StatusTile` calls with one `InstrumentStrip` item array. Preserve overdue, due-soon, open-squawk, tach, Hobbs, and update-date information. Remove the obsolete component.

- [ ] **Step 3: Remove decorative sign-in glass**

Remove the translucent blurred card treatment. Keep the quiet tonal card, make its phone placement reachable above the bottom safe area, and retain centered desktop placement.

### Task 5: PWA viewport and touch defaults

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Extend the supported viewport export**

Add `colorScheme: "dark"` and `interactiveWidget: "resizes-visual"`. Keep `width`, `initialScale`, `viewportFit`, and theme color. Do not disable user scaling.

- [ ] **Step 2: Add restrained touch defaults**

Set interactive elements to `touch-action: manipulation`. Keep visible focus treatment and reduced-motion behavior. Ensure the document canvas remains Ramp Black through the full safe area.

### Task 6: Verification and delivery

**Files:**
- Verify all modified files

- [ ] **Step 1: Run unit tests**

Run: `npm test`

Expected: all existing tests and navigation tests pass. This suite runs without production database credentials. Use a fresh database for any future E2E run.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: no errors.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: successful Next.js production build.

- [ ] **Step 4: Smoke-test responsive PWA surfaces**

Launch the app and inspect the sign-in, offline, manifest, and shell CSS at 320, 375, 390, and 430 pixel portrait widths plus 844 by 390 landscape. Confirm safe areas, five tabs, 44-pixel controls, no horizontal overflow, and reduced-motion styles.

- [ ] **Step 5: Run Impeccable audit and final review**

Check accessibility, responsive behavior, PWA metadata, visual consistency, and AI-pattern bans against `PRODUCT.md` and `DESIGN.md`. Fix every high or medium issue introduced or exposed by the changed surfaces.

- [ ] **Step 6: Commit, review, open, and merge the production PR**

Commit focused changes, push `feat/iphone-pwa-polish`, open a PR against `main`, run automated review, wait for CI, fix failures, and merge only when all checks are green.
