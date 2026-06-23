# Wallet PAPI ✈️

A personal aircraft maintenance, expense, and **total-cost-of-ownership** tracker — built to *complement* ForeFlight (which owns flight planning and the logbook) by covering what it doesn't: service history, recurring intervals, money, squawks, equipment, and the documents behind all of it.

Phone-first installable **PWA**, iPad-friendly, with a dark "glass cockpit" aesthetic. Multi-aircraft. Roles for sharing read-only access with a mechanic or prospective buyer.

> PAPI = Precision Approach Path Indicator — the row of red/white lights by the runway. Here it keeps your *wallet* on the glideslope.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Farturodz%2Fwallet-papi&env=DATABASE_URL,NEON_AUTH_BASE_URL,NEON_AUTH_COOKIE_SECRET&envDescription=Neon%20Postgres%20%2B%20Neon%20Auth%20credentials%20(see%20setup)&envLink=https%3A%2F%2Fgithub.com%2Farturodz%2Fwallet-papi%23setup&project-name=wallet-papi&repository-name=wallet-papi)

---

## Features

- **Aircraft & fleet** — manage one plane or several; switch the active aircraft from the nav. Everything scopes to it.
- **Service log** — log maintenance with date, tach, vendor, category; link costs.
- **Expenses & TCO** — a single money ledger (acquisition → fuel → hangar → insurance → parts). The TCO report shows lifetime total, breakdown by category, monthly burn, and **cost per flight hour**.
- **Service intervals** — calendar, engine-hours, or both. Computes what's due and how soon.
- **Glass-cockpit dashboard** — annunciator status tiles (🟢 OK / 🟡 due-soon / 🔴 overdue) across intervals, warranties, and open squawks.
- **Squawks** — open / deferred / resolved discrepancies, optionally tied to equipment and the service that fixed them.
- **Equipment & warranties** — installed components with serials, install dates, and warranty expiry; a per-item detail view of its intervals and open squawks.
- **Documents + AI** *(optional)* — snap a photo of an invoice/logbook/warranty; Gemini extracts the fields to pre-fill the form (you confirm — never auto-saved).
- **Roles** — `owner` (full + manage), `editor` (write), `viewer` (read-only, for a mechanic or buyer).
- **PWA** — installable, offline app-shell; slide-over sheets for fast one-handed data entry at the hangar.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · [Drizzle ORM](https://orm.drizzle.team) · [Neon](https://neon.tech) Postgres · [Neon Auth](https://neon.tech/docs/auth) · Tailwind + shadcn/ui · [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) + [Gemini](https://ai.google.dev) (optional) · deployed on Vercel.

## Setup

The one-click button deploys the app, but you provision the database yourself (it's free on Neon). Full flow:

### 1. Create a Neon project
[neon.tech](https://neon.tech) → new project. Copy the **pooled** connection string → that's `DATABASE_URL`.

### 2. Provision Neon Auth
In the project, open **Auth** and enable Neon Auth. Copy the **base URL** → `NEON_AUTH_BASE_URL`. Email/password sign-in works out of the box.

### 3. Generate a cookie secret
```bash
openssl rand -hex 32   # → NEON_AUTH_COOKIE_SECRET
```

### 4. Set env vars & deploy
Use the **Deploy with Vercel** button above (it prompts for the three required vars), or set them in your Vercel project settings. See [`.env.example`](.env.example) for the full list.

### 5. Create the schema
After the DB exists, push the Drizzle schema:
```bash
npm install
npm run db:push          # creates all tables on Neon
```
Then sign up in the app, open **Aircraft → Add aircraft**, and you're flying. First sign-up defaults to `viewer`; grant yourself `owner`:
```sql
UPDATE profiles SET role = 'owner' WHERE email = 'you@example.com';
```

### 6. (Optional) Document AI
Add a Vercel Blob store (`BLOB_READ_WRITE_TOKEN`) and a Google AI Studio key (`GEMINI_API_KEY`). Without them the app works fully — the scan button just shows a disabled state.

## Local development

```bash
cp .env.example .env.local   # fill in the three required vars
npm install
npm run db:push
npm run dev                  # http://localhost:3000
```

Scripts: `dev` · `build` · `start` · `lint` · `test` (Vitest) · `db:push` · `db:generate`.

## Notes & limitations

- **Google sign-in** is intentionally disabled. Neon's shared Google OAuth client sets the session cookie on Neon's domain, so it can't be read first-party on a `*.vercel.app` host. Email/password works reliably; Google would need a custom auth domain.
- **Active aircraft** is stored in a per-browser cookie — designed for a single owner.
- Money is tracked in a single currency (USD), rounded to cents.

## License

[MIT](LICENSE) © Arturo Diaz. Personal project — issues and PRs welcome, no support guarantees.
