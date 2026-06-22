import { describe, it, expect } from "vitest";
import { toCents, formatUSD } from "./money";

describe("money", () => {
  it("parses dollar strings to integer cents", () => {
    expect(toCents("1234.56")).toBe(123456);
    expect(toCents("0")).toBe(0);
    expect(toCents("99.9")).toBe(9990);
  });
  it("formats cents as USD", () => {
    expect(formatUSD(123456)).toBe("$1,234.56");
    expect(formatUSD(0)).toBe("$0.00");
  });
});
