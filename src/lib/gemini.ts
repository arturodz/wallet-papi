import { GoogleGenAI } from "@google/genai";
import { parseExtraction, type Extraction } from "./extraction";

/**
 * Gemini vision client for document field extraction.
 *
 * API verified against installed @google/genai@2.9.0 types:
 *  - constructor:   new GoogleGenAI({ apiKey })
 *  - call:          ai.models.generateContent({ model, contents })
 *  - inline image:  contents = [{ inlineData: { mimeType, data: <base64> } }, { text }]
 *  - response text: response.text  (getter -> string | undefined)
 *
 * This module is NOT unit-tested: the Gemini network call is the only untested
 * seam. The parsing it delegates to (`parseExtraction`) is fully tested offline.
 */

// Current Gemini flash model. Confirmed supported by the installed SDK.
const MODEL = "gemini-2.5-flash";

const PROMPT = [
  "You are extracting structured fields from a photo of an aircraft-related",
  "document (an invoice, a logbook entry, a warranty card, or a general photo).",
  "Return ONLY a single JSON object — no prose, no markdown fences — with these keys:",
  '  "date": the document date in strict YYYY-MM-DD format, or omit if none,',
  '  "vendor": the business/shop/payee name, or omit,',
  '  "amount": the total amount as a plain number string like "1234.56" (no $ or commas), or omit,',
  '  "hours": the tach/Hobbs hours as a number if this is a logbook entry, or omit,',
  '  "description": a short summary of the work or item, or omit,',
  '  "doc_type": one of "invoice", "logbook", "warranty", "photo".',
  "Omit any field you cannot read confidently. Do not invent values.",
].join("\n");

function toBase64(bytes: Buffer | Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

/**
 * Sends an image to Gemini and returns normalized, partially-validated fields.
 * Caller is responsible for guarding on `aiEnabled()` before invoking; if the
 * API key is absent or the call fails, the parser returns `{}` (never throws
 * from parsing). A network/auth error here WILL throw and should be handled by
 * the caller's action.
 */
export async function extractDocument(
  bytes: Buffer | Uint8Array,
  mimeType: string,
): Promise<Extraction> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      { inlineData: { mimeType, data: toBase64(bytes) } },
      { text: PROMPT },
    ],
  });

  return parseExtraction(response.text ?? "");
}
