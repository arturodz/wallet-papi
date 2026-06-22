# Wallet PAPI — Plan 5: Documents + Gemini Extraction

> **For agentic workers:** Execute task-by-task with TDD where logic is non-trivial. Steps use `- [ ]`.

**Goal:** Snap/upload a photo of an invoice, logbook entry, or warranty card; store it in Vercel Blob; have Gemini extract fields; pre-fill the relevant form for the user to confirm; and attach the document (polymorphically) to a service / expense / squawk / equipment.

**Architecture:** A server action uploads the image to Vercel Blob and sends it to Gemini (flash vision); a **pure, tested** parser normalizes Gemini's JSON into known fields; extracted values pre-fill a form (never auto-saved); on confirm, a `documents` row is inserted with `entity_type` + `entity_id`. Degrades gracefully when `GEMINI_API_KEY` / `BLOB_READ_WRITE_TOKEN` are unset. Builds on Plans 1–4.

**Tech Stack:** Next.js 16, Drizzle, `@vercel/blob`, `@google/genai`, Vitest.

---

## File Structure
- `src/lib/extraction.ts` — `parseExtraction(rawText)` pure normalizer (tested).
- `src/lib/extraction.test.ts`.
- `src/lib/gemini.ts` — `extractDocument(bytes, mimeType)` (calls Gemini; not unit-tested).
- `src/lib/env.ts` — `aiEnabled()` / `blobEnabled()` boolean helpers.
- `src/app/actions/documents.ts` — `uploadAndExtract(formData)`, `attachDocument(input)`, `listDocuments(entityType, entityId)`, `deleteDocument(id)`.
- `src/components/document-scan.tsx` (client) — camera/upload + extracted-field display.
- `src/components/document-list.tsx` (client/server) — thumbnails + delete for an entity.
- Add `documentInput` to `src/lib/validation.ts`.

---

## Task 1: Extraction parser (TDD)
**Files:** create `src/lib/extraction.ts`, `src/lib/extraction.test.ts`.

Gemini returns text that may be wrapped in ```json fences, may have missing/extra fields, and amounts as "$1,234.56". Normalize to `{ date?, vendor?, amount?, hours?, description?, docType? }` (all optional; `amount` as a plain numeric string like "1234.56"; `date` as YYYY-MM-DD if parseable; `docType` only if one of invoice/logbook/warranty/photo).

- [ ] **Step 1: Failing test**
```ts
import { describe, it, expect } from "vitest";
import { parseExtraction } from "./extraction";

describe("parseExtraction", () => {
  it("parses fenced json and normalizes amount + date", () => {
    const raw = '```json\n{"date":"2026-03-04","vendor":"Aero Shop","amount":"$1,234.56","hours":120.4,"description":"Oil change","doc_type":"invoice"}\n```';
    const r = parseExtraction(raw);
    expect(r.date).toBe("2026-03-04");
    expect(r.vendor).toBe("Aero Shop");
    expect(r.amount).toBe("1234.56");
    expect(r.hours).toBe(120.4);
    expect(r.docType).toBe("invoice");
  });
  it("tolerates plain json and missing fields", () => {
    const r = parseExtraction('{"vendor":"X"}');
    expect(r.vendor).toBe("X");
    expect(r.amount).toBeUndefined();
    expect(r.docType).toBeUndefined();
  });
  it("drops invalid docType and unparseable amount", () => {
    const r = parseExtraction('{"amount":"n/a","doc_type":"receipt"}');
    expect(r.amount).toBeUndefined();
    expect(r.docType).toBeUndefined();
  });
  it("returns empty object on non-json garbage (never throws)", () => {
    expect(parseExtraction("sorry, I cannot read this")).toEqual({});
  });
});
```
- [ ] **Step 2:** `npm test -- extraction` → FAIL.
- [ ] **Step 3: Implement.** Strip ```/```json fences, `JSON.parse` inside try/catch (return `{}` on failure). Accept both `doc_type` and `docType`. Amount: strip `$`/`,`/whitespace, keep only if it matches `/^\d+(\.\d{1,2})?$/`. Date: keep if matches `/^\d{4}-\d{2}-\d{2}$/`. Hours: keep if finite number. docType: keep only if ∈ {invoice,logbook,warranty,photo}.
- [ ] **Step 4:** → PASS.
- [ ] **Step 5:** Commit `feat: document extraction parser`.

---

## Task 2: Gemini client + env helpers
**Files:** create `src/lib/gemini.ts`, `src/lib/env.ts`. Add dep: `npm install @google/genai @vercel/blob`.

- **VERIFY the real `@google/genai` API** by reading the installed package types before writing (constructor, how to pass inline image data + a text prompt, how to read the text out of the response). Use a **flash** model (e.g. `gemini-2.0-flash` or `gemini-2.5-flash` — pick one that the SDK/docs confirm current). Don't guess the API.
- `extractDocument(bytes: Buffer | Uint8Array, mimeType: string): Promise<Extraction>`: builds a prompt instructing Gemini to return ONLY JSON with keys `date (YYYY-MM-DD), vendor, amount, hours, description, doc_type (invoice|logbook|warranty|photo)`; sends the image inline (base64) + prompt; passes the response text through `parseExtraction`.
- `src/lib/env.ts`: `aiEnabled = () => !!process.env.GEMINI_API_KEY`, `blobEnabled = () => !!process.env.BLOB_READ_WRITE_TOKEN`.

- [ ] Commit `feat: gemini extraction client and env helpers`.

---

## Task 3: Document server actions
**Files:** create `src/app/actions/documents.ts` (`"use server"`); add `documentInput` Zod (`{ blobUrl: url, docType?: enum, extractedJson?: string, entityType: enum(service/expense/squawk/equipment), entityId: uuid }`).

- `uploadAndExtract(formData)`: `requireRole("editor")`. Read `file` from formData. If `!blobEnabled()` → throw `Error("BLOB_NOT_CONFIGURED")`. `put(\`docs/${crypto.randomUUID()}-${file.name}\`, file, { access: "public" })` from `@vercel/blob`. If `aiEnabled()`, read bytes and call `extractDocument`; else return `{ fields: {} }`. Return `{ blobUrl, fields }`. Never auto-insert.
- `attachDocument(input)`: `requireRole("editor")`, validate, insert into `documents`, `revalidatePath` the entity's route. Returns the row.
- `listDocuments(entityType, entityId)`: select rows for an entity (read; any signed-in user).
- `deleteDocument(id)`: `requireRole("editor")`; `del(blobUrl)` from `@vercel/blob` (best-effort, ignore errors) then delete the row.

- [ ] Commit `feat: document server actions (blob upload + extract + attach)`.

---

## Task 4: Scan + attachments UI, integrated
**Files:** create `src/components/document-scan.tsx`, `src/components/document-list.tsx`; integrate into the **expense create form** and the **equipment detail** page.

- `document-scan.tsx` (client): native `<input type="file" accept="image/*" capture="environment">`. On select → calls `uploadAndExtract`. While running, show a spinner. On result, display extracted fields and call an `onExtracted(fields, blobUrl)` callback so the parent form can pre-fill its inputs. If `aiEnabled()` is false (pass as prop from a server component), render the upload but label it "AI extraction off — set GEMINI_API_KEY"; if `blobEnabled()` is false, disable with "set BLOB_READ_WRITE_TOKEN". Graceful, never crashes.
- Wire into the expense form: a "Scan invoice" affordance that pre-fills date/payee(vendor)/amount/description, and on submit also attaches the document to the created expense (call `attachDocument` with the new expense id + blobUrl).
- `document-list.tsx`: shows attached docs (image thumbnail linking to blobUrl, docType badge) for an entity; editor-only delete. Add to equipment detail (warranty cards) and the expense list rows or detail.
- Pass `aiEnabled()`/`blobEnabled()` from server components into the client components as props (don't read process.env client-side).

- [ ] **Verify:** `npm run build` passes, `npm test` green, `npx tsc --noEmit` clean. Confirm the app builds and the scan UI renders its disabled/“off” state cleanly when env is unset (the AFK default).
- [ ] Commit `feat: document scan + attachments UI`.

---

## Self-Review
- Covers spec's document pipeline: capture → Vercel Blob → Gemini flash → parse → pre-fill (review, never auto-save) → polymorphic attach; raw `extracted_json` stored on the row. Graceful when keys absent.
- Live extraction requires `GEMINI_API_KEY` + `BLOB_READ_WRITE_TOKEN` (set at deploy). Parser is fully tested offline; the Gemini call itself is the only untested seam (external).
