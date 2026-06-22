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
