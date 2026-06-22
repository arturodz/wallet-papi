/**
 * Pure, offline-testable normalizer for Gemini's document-extraction output.
 *
 * Gemini returns free-form text that MAY be wrapped in ```json fences, MAY omit
 * fields, and MAY format amounts like "$1,234.56". This module turns that into a
 * predictable, partially-validated shape. It NEVER throws — on any parse failure
 * it returns `{}` so the upload pipeline degrades gracefully.
 */

export interface Extraction {
  date?: string;
  vendor?: string;
  amount?: string;
  hours?: number;
  description?: string;
  docType?: "invoice" | "logbook" | "warranty" | "photo";
}

const DOC_TYPES = ["invoice", "logbook", "warranty", "photo"] as const;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const AMOUNT_RE = /^\d+(\.\d{1,2})?$/;

/** Strip a leading/trailing ```json (or plain ```) code fence, if present. */
function stripFences(raw: string): string {
  let s = raw.trim();
  // Opening fence: ``` optionally followed by a language tag (e.g. json).
  s = s.replace(/^```[a-zA-Z]*\s*\n?/, "");
  // Closing fence.
  s = s.replace(/\n?```\s*$/, "");
  return s.trim();
}

function asString(v: unknown): string | undefined {
  if (typeof v === "string") {
    const t = v.trim();
    return t.length ? t : undefined;
  }
  return undefined;
}

function normalizeAmount(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v).replace(/[$,\s]/g, "");
  return AMOUNT_RE.test(s) ? s : undefined;
}

function normalizeDate(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return DATE_RE.test(s) ? s : undefined;
}

function normalizeHours(v: unknown): number | undefined {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : undefined;
}

function normalizeDocType(v: unknown): Extraction["docType"] {
  return DOC_TYPES.includes(v as (typeof DOC_TYPES)[number])
    ? (v as Extraction["docType"])
    : undefined;
}

export function parseExtraction(rawText: string): Extraction {
  let obj: Record<string, unknown>;
  try {
    const parsed = JSON.parse(stripFences(rawText));
    if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    obj = parsed as Record<string, unknown>;
  } catch {
    return {};
  }

  const out: Extraction = {};

  const date = normalizeDate(obj.date);
  if (date) out.date = date;

  const vendor = asString(obj.vendor);
  if (vendor) out.vendor = vendor;

  const amount = normalizeAmount(obj.amount);
  if (amount) out.amount = amount;

  const hours = normalizeHours(obj.hours);
  if (hours !== undefined) out.hours = hours;

  const description = asString(obj.description);
  if (description) out.description = description;

  // Accept both snake_case (Gemini default per our prompt) and camelCase.
  const docType = normalizeDocType(obj.doc_type ?? obj.docType);
  if (docType) out.docType = docType;

  return out;
}
