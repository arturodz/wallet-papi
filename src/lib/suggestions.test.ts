import { describe, it, expect } from "vitest";
import {
  resolveExpenseTitleTemplates,
  matchExpenseTitle,
  resolveDistinct,
} from "./suggestions-core";

describe("resolveExpenseTitleTemplates", () => {
  it("keeps the most-recent template per title (rows passed most-recent first)", () => {
    const out = resolveExpenseTitleTemplates([
      { title: "Hangar rent", payee: "KFAT FBO", category: "Hangar", amount: "550.00" },
      { title: "Insurance premium", payee: "Avemco", category: "Insurance", amount: "1200.00" },
      { title: "Hangar rent", payee: "Old FBO", category: "Hangar", amount: "500.00" },
    ]);
    expect(out).toHaveLength(2);
    const rent = out.find((t) => t.title === "Hangar rent")!;
    expect(rent.payee).toBe("KFAT FBO");
    expect(rent.amount).toBe("550.00");
  });

  it("dedups case- and trim-insensitively but preserves the recent casing", () => {
    const out = resolveExpenseTitleTemplates([
      { title: "  Hangar Rent ", payee: "A", category: null, amount: "1.00" },
      { title: "hangar rent", payee: "B", category: null, amount: "2.00" },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe("Hangar Rent");
    expect(out[0].payee).toBe("A");
  });

  it("skips null and blank titles", () => {
    const out = resolveExpenseTitleTemplates([
      { title: null, payee: "X", category: null, amount: "1.00" },
      { title: "   ", payee: "Y", category: null, amount: "2.00" },
      { title: "Real", payee: "Z", category: null, amount: "3.00" },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe("Real");
  });
});

describe("matchExpenseTitle", () => {
  const suggestions = resolveExpenseTitleTemplates([
    { title: "Hangar rent", payee: "KFAT FBO", category: "Hangar", amount: "550.00" },
  ]);

  it("matches case- and trim-insensitively", () => {
    expect(matchExpenseTitle("  hangar RENT ", suggestions)?.payee).toBe("KFAT FBO");
  });

  it("returns null for a brand-new title (never traps the user)", () => {
    expect(matchExpenseTitle("Brand new charge", suggestions)).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(matchExpenseTitle("   ", suggestions)).toBeNull();
  });
});

describe("resolveDistinct", () => {
  it("dedups case-insensitively, drops null/blank, keeps first (recent) casing", () => {
    expect(
      resolveDistinct(["Avemco", null, "  avemco ", "", "Shell"]),
    ).toEqual(["Avemco", "Shell"]);
  });
});
