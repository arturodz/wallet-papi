---
name: Wallet PAPI
description: Low-glare aircraft ownership records and readiness at a glance.
colors:
  ramp-black: "oklch(0.16 0.012 250)"
  backlit-slate: "oklch(0.205 0.013 250)"
  elevated-slate: "oklch(0.269 0.012 250)"
  instrument-white: "oklch(0.97 0.005 250)"
  primary-control: "oklch(0.922 0 0)"
  muted-readout: "oklch(0.7 0.012 250)"
  focus-blue: "oklch(0.62 0.05 250)"
  clear-green: "oklch(76.5% 0.177 163.223)"
  caution-amber: "oklch(82.8% 0.189 84.429)"
  warning-red: "oklch(70.4% 0.191 22.216)"
  quiet-slate: "oklch(70.4% 0.04 256.788)"
typography:
  display:
    fontFamily: '"Geist Mono", ui-monospace, monospace'
    fontSize: "1.875rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
  headline:
    fontFamily: '"Geist Mono", ui-monospace, monospace'
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.333
    letterSpacing: "-0.025em"
  title:
    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "normal"
  body:
    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  compact-body:
    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4286
    letterSpacing: "normal"
  label:
    fontFamily: '"Geist Mono", ui-monospace, monospace'
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.18em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  2xl: "18px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary-control}"
    textColor: "{colors.ramp-black}"
    typography: "{typography.compact-body}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "oklch(0.922 0 0 / 80%)"
    textColor: "{colors.ramp-black}"
  button-outline:
    backgroundColor: "oklch(1 0 0 / 4.5%)"
    textColor: "{colors.instrument-white}"
    typography: "{typography.compact-body}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "oklch(1 0 0 / 7.5%)"
    textColor: "{colors.instrument-white}"
  button-secondary:
    backgroundColor: "{colors.elevated-slate}"
    textColor: "{colors.instrument-white}"
    typography: "{typography.compact-body}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
    height: "44px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.instrument-white}"
    typography: "{typography.compact-body}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
    height: "44px"
  button-destructive:
    backgroundColor: "oklch(70.4% 0.191 22.216 / 20%)"
    textColor: "{colors.warning-red}"
    typography: "{typography.compact-body}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
    height: "44px"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.instrument-white}"
    typography: "{typography.compact-body}"
    padding: "0"
    height: "44px"
  input:
    backgroundColor: "oklch(1 0 0 / 4.5%)"
    textColor: "{colors.instrument-white}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
    height: "44px"
  card:
    backgroundColor: "{colors.backlit-slate}"
    textColor: "{colors.instrument-white}"
    typography: "{typography.compact-body}"
    rounded: "{rounded.xl}"
    padding: "16px"
  nav-item-active:
    backgroundColor: "{colors.elevated-slate}"
    textColor: "{colors.instrument-white}"
    typography: "{typography.compact-body}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "44px"
  status-badge-clear:
    backgroundColor: "oklch(69.6% 0.17 162.48 / 10%)"
    textColor: "{colors.clear-green}"
    typography: "{typography.label}"
    rounded: "999px"
    padding: "2px 8px"
---

# Design System: Wallet PAPI

## Overview

**Creative North Star: "Calm Instrument Panel"**

Wallet PAPI is a precise, calm, low-glare tool for an aircraft owner standing beside a plane in a dim hangar, phone in one hand and maintenance work in progress. The dark, cool surface reduces glare. Information arrives in familiar controls, compact lists, and fixed-width readouts instead of decorative aviation theater.

The system is restrained by default. Neutral tonal layers organize the interface; emerald, amber, and red appear only when readiness status requires them. Aviation references wink through annunciator dots, call-sign treatment, and pre-flight language. They never imitate a skeuomorphic 747 panel.

**Key Characteristics:**
- Low-glare cool neutrals with fine borders and backlit tonal separation.
- Geist for ordinary interface work; Geist Mono only for real instrument data.
- Compact, phone-friendly controls with crisp focus and active states.
- Status colors that carry one stable operational meaning everywhere.
- Data first, chrome second, with sheets reserved for focused create and edit tasks.

## Colors

The Ramp Black palette behaves like a dim instrument panel: quiet until a functional status needs attention. Canonical values live in the frontmatter tokens.

### Primary
- **Instrument White** (`{colors.instrument-white}`): Primary text, active navigation, and high-confidence controls.
- **Primary Control** (`{colors.primary-control}`): Filled primary actions. Its near-neutral character keeps actions visible without becoming decorative.
- **Focus Bearing Blue** (`{colors.focus-blue}`): Keyboard focus rings only. It marks interaction, not brand decoration.

### Secondary
- **Clear Green** (`{colors.clear-green}`): Airworthy, current, complete, and OK.
- **Caution Amber** (`{colors.caution-amber}`): Due soon, open attention, and caution.
- **Warning Red** (`{colors.warning-red}`): Overdue, destructive, and unsafe states.

### Neutral
- **Ramp Black** (`{colors.ramp-black}`): The application canvas and PWA shell.
- **Backlit Slate** (`{colors.backlit-slate}`): Cards, sheets, popovers, and fixed navigation surfaces.
- **Elevated Slate** (`{colors.elevated-slate}`): Muted controls, active navigation, and secondary surfaces.
- **Muted Readout** (`{colors.muted-readout}`): Supporting labels and secondary data.
- **Quiet Slate** (`{colors.quiet-slate}`): Unknown or intentionally neutral status.

### Named Rules

**The Annunciator Rule.** Emerald means OK, amber means caution, and red means warning. Never reuse these hues as decoration.

**The Low-Glare Rule.** Ramp Black owns the canvas. Backlit Slate and Elevated Slate create depth through lightness, not saturation.

**The Ten Percent Rule.** Functional chroma occupies no more than ten percent of a normal screen. Its rarity preserves signal strength.

## Typography

**Display Font:** Geist Mono with a system monospace fallback  
**Body Font:** Geist with a system sans-serif fallback  
**Label/Mono Font:** Geist Mono with a system monospace fallback

**Character:** The pairing is quiet and exact. Geist disappears into task work; Geist Mono turns measured values into stable instrument readouts.

### Hierarchy
- **Display** (`{typography.display}`): Tach, Hobbs, totals, and dashboard status values only.
- **Headline** (`{typography.headline}`): Page titles and aircraft call-signs.
- **Title** (`{typography.title}`): Sheet titles and focused section names.
- **Body** (`{typography.body}`): Forms and prose. Cap explanatory copy at 70 characters per line.
- **Compact Body** (`{typography.compact-body}`): Rows, buttons, cards, and dense operational UI.
- **Label** (`{typography.label}`): Uppercase instrument labels and status microcopy.

### Named Rules

**The Readout Rule.** Use Geist Mono only for tach and Hobbs hours, serials, tail numbers, money, status labels, and measured values. Generic technical decoration is forbidden.

**The Tabular Rule.** Every numeric readout uses tabular figures so columns and changing values remain stable.

## Elevation

The system uses tonal layering first, fine one-pixel rings second, and shadows only when state or physical overlay requires them. Cards remain flat at rest. Sheets receive structural lift because they sit above the task. Annunciator glows are status signals, not ambient decoration.

### Shadow Vocabulary
- **Clear Glow** (`0 0 18px -6px rgba(16, 185, 129, 0.7)`): Exceptional all-clear confirmation only.
- **Caution Glow** (`0 0 18px -6px rgba(245, 158, 11, 0.7)`): Exceptional due-soon callout only.
- **Warning Glow** (`0 0 18px -6px rgba(239, 68, 68, 0.8)`): Exceptional overdue callout only.
- **Sheet Lift** (`0 25px 50px -12px rgb(0 0 0 / 0.25)`): Bottom sheets and right-side panels only.

### Named Rules

**The Tonal-First Rule.** If Ramp Black, Backlit Slate, and a fine ring can express hierarchy, a shadow is forbidden.

**The Signal-Only Glow Rule.** Green, amber, and red glows belong only to live readiness states. No decorative bloom.

## Components

Components are compact and confident. Their shapes are familiar, their targets remain phone-friendly, and every state reads without decorative chrome.

### Buttons
- **Shape:** Gently curved controls use `{rounded.lg}` and the frontmatter height tokens.
- **Primary:** Instrument White fill with Ramp Black text. Reserve it for the next decisive action.
- **Hover / Focus:** Hover changes opacity or tonal level. Focus uses a three-pixel Focus Bearing Blue ring with a two-pixel Ramp Black offset.
- **Secondary / Ghost / Destructive / Link:** Secondary uses Elevated Slate; ghost stays transparent until hover; destructive uses a translucent Warning Red field; links underline only on hover.

### Chips
- **Style:** Status badges use a full pill, a one-pixel semantic border, a six-pixel leading dot, and the Label typography role.
- **State:** Color and text travel together. Never communicate status through hue alone.

### Cards / Containers
- **Corner Style:** Cards use `{rounded.xl}`; operational rows use the same radius when the whole row is tappable.
- **Background:** Backlit Slate over Ramp Black.
- **Shadow Strategy:** Flat by default; use the Elevation vocabulary only for overlays or annunciator state.
- **Border:** A one-pixel low-contrast ring separates adjacent tonal surfaces.
- **Internal Padding:** Compact cards use `{spacing.md}`; standard cards use `{spacing.lg}`.

### Inputs / Fields
- **Style:** Controls are forty-four pixels tall through iPhone landscape and iPad portrait, then compact to thirty-two pixels at the large breakpoint. Fields use `{rounded.lg}`, a quiet translucent fill, and a one-pixel input border. Editing text remains at Body size on touch layouts to prevent browser zoom.
- **Focus:** Shift the border to Focus Bearing Blue and add the shared three-pixel focus ring.
- **Error / Disabled:** Error combines Warning Red border and ring. Disabled fields reduce opacity and block interaction without hiding their value.

### Navigation
- **Style:** Desktop and iPad landscape use a fixed 224-pixel left rail from the large breakpoint. Phone and iPad portrait use a safe-area-aware identity bar and exactly five bottom tabs: Dashboard, Services, Expenses, Squawks, and More. More is a normal route that exposes every secondary destination. Active items use Elevated Slate or Instrument White; inactive items stay Muted Readout.

### Instrument Strip
- **Style:** Related measurements share one bordered strip with internal dividers. Use two columns on phone and four on larger layouts. Never split summary measurements into identical floating cards.
- **Behavior:** Values use tabular figures and semantic text color. Status dots pair color with labels. Individual cells never glow.

### Sheets
- **Style:** Create and edit work opens as a safe-area-aware bottom sheet through iPhone landscape and iPad portrait, then becomes a right-side panel at the large breakpoint. Headers and footers remain fixed while the form body scrolls.
- **Motion:** Backdrops fade in 200ms; panels transform in 300ms with ease-out timing. Reduced-motion users receive no transition.

## Do's and Don'ts

### Do:
- **Do** use Ramp Black, Backlit Slate, and Elevated Slate as the default hierarchy.
- **Do** keep exactly five primary tabs on touch layouts and place secondary destinations on the More route.
- **Do** reserve green for OK, amber for due soon, and red for overdue or destructive states.
- **Do** keep list data visible first; open create and edit forms in a responsive sheet.
- **Do** keep phone controls easy to tap even when their visual height is compact.
- **Do** use aircraft language sparingly where it clarifies the task, such as call-sign, pre-flight, and squawk.
- **Do** use Backlit Slate navigation blur only where a fixed surface must retain context over scrolling content.

### Don't:
- **Don't** imitate a skeuomorphic 747 panel. Aviation references must wink, not shout.
- **Don't** use Geist Mono as generic technical decoration. It is reserved for true instrument readouts.
- **Don't** decorate with annunciator colors. They carry functional meaning.
- **Don't** place thick colored side stripes on cards, rows, callouts, or alerts.
- **Don't** use gradient text, decorative glass cards, nested cards, or identical card grids.
- **Don't** turn the dashboard into a generic hero-metric template. Readiness and maintenance context come first.
- **Don't** reach for a modal first. Use inline disclosure or the established responsive sheet.
- **Don't** animate layout properties or choreograph page-load entrances.
