# Wallet PAPI iPhone PWA Polish

## Goal

Make Wallet PAPI feel native, focused, and dependable as an installed iPhone PWA while preserving its Calm Instrument Panel identity. Remove the most generic dashboard patterns without changing the product's data model or task flows.

## Usage context

The primary user stands beside an aircraft in a dim hangar, often holding the phone in one hand. Sessions are short and operational: check readiness, log service, record an expense, or capture a squawk. The interface must work at 320, 375, 390, and 430 CSS pixels, in portrait and landscape, with iOS safe areas and the software keyboard active.

## Navigation

Desktop keeps the complete left rail. Phone navigation becomes a standard five-tab structure:

1. Dashboard
2. Services
3. Expenses
4. Squawks
5. More

More is a normal route, not a modal. It exposes Aircraft, Intervals, Equipment, TCO, and Notes as full-width rows with clear descriptions. Any overflow destination marks More as the active mobile tab. No capability disappears on mobile.

The top identity bar respects the top safe area. The bottom tabs and page content respect the Home Indicator. Mobile tab targets are at least 44 pixels high and never depend on hover.

## Touch and forms

Interactive controls use a 44-pixel minimum target on phone while retaining the existing compact dimensions at the medium breakpoint and above. This applies to buttons, add actions, inputs, native and custom selects, aircraft switching, sheet close controls, and select options.

Form text remains at least 16 pixels on phone to prevent Safari input zoom. Bottom-sheet footers include the bottom safe area. Sheets fit inside the visual viewport, keep actions reachable above the Home Indicator, and continue to become right-side panels on larger screens.

## Information design

Replace the dashboard's four identical metric cards with one connected instrument strip. The strip uses a two-by-two mobile layout and a four-column desktop layout, with internal dividers rather than four floating cards. Readiness color stays functional. Values may use semantic color, but ambient glows remain reserved for exceptional live status confirmation.

Keep list rows because they are a familiar task affordance, not decorative cards. Reduce blur and translucent card styling where it does not preserve navigation context. Geist Mono remains limited to aircraft identifiers, measured values, money, and true status readouts.

## PWA behavior

Keep the existing standalone manifest and Apple web app metadata. Add an explicit dark color scheme and visual-widget resize behavior through the supported Next.js viewport export. Preserve user scaling rather than disabling zoom.

Use `viewport-fit=cover` with CSS safe-area insets. The app shell must not place controls beneath the status area or Home Indicator. Motion remains short, state-driven, and disabled under reduced-motion preferences.

## Accessibility

Every route has a descriptive `h1` for Next.js route announcements. Current navigation uses `aria-current="page"`. Status is communicated with text and shape as well as color. Focus rings remain visible. Mobile controls meet 44-pixel target guidance, and body or field text never falls below 16 pixels where reading or editing is required.

## Verification

- Unit-test mobile navigation mapping, including overflow routes activating More.
- Run the existing Vitest suite in the isolated worktree without production database credentials.
- Run ESLint and the production build.
- Exercise public PWA surfaces in Chromium at 320, 375, 390, and 430 pixel widths plus landscape.
- Inspect safe-area CSS, tab counts, focus behavior, and reduced-motion handling.
- Review the final diff for DESIGN.md compliance and generic AI patterns.

Database reminder: any future E2E run must use a fresh database. This pass does not run E2E against an existing database.
