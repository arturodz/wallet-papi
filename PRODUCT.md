# Design Context — Wallet PAPI

## Target audience
A single private aircraft owner (primary), plus occasional **read-only viewers** (an A&P mechanic, a prospective buyer). Used mostly on a **phone at the hangar**, also iPad and desktop. The owner is an aviation person, comfortable with tach/Hobbs, squawks, ADs, tail numbers.

## Use cases
Log maintenance services; track expenses and **total cost of ownership**; manage recurring service **intervals** (calendar + engine-hours); record **squawks**; inventory **equipment** + warranties; manage **multiple aircraft**. The core jobs: *fast data entry on a phone* and *at-a-glance "what's due / what's it costing me."*

## Brand personality — "glass cockpit"
Dark instrument-panel aesthetic: precise, calm, utilitarian but refined. Aviation references that **wink, not shout** — never skeuomorphic 747 panels.

- **Annunciator color language** is the status system: green = airworthy/OK, amber = caution/due-soon, red = warning/overdue. These are functional, not decorative — they carry meaning.
- **Dark is intentional** (hangar use, glare), not a default-for-cool.
- **Monospace is reserved for true instrument readouts** — tach/Hobbs hours, serials, tail numbers, money. NOT used as generic "technical" decoration; body/labels use the sans (Geist).
- Restrained, fast, confident. Data first; chrome second. Tail number reads as the call-sign.

## Notes for design work
- shadcn is the **base-ui** flavor (not Radix): Button-as-link uses `render={<Link/>}`.
- Forms should feel like quick cockpit data entry, not a DB admin panel: create/edit via a slide-over **sheet** (bottom sheet on phone, side panel on larger screens) opened by "+ Add" or tapping a row — list pages show data first.
