import { describe, it, expect } from "vitest";
import { computeTco } from "./tco";

const expenses = [
  { amount: "50000.00", category: "acquisition", date: "2025-01-01" },
  { amount: "300.00", category: "maintenance", date: "2025-02-01" },
  { amount: "150.50", category: "fuel", date: "2025-02-15" },
  { amount: "300.00", category: null, date: "2025-03-01" },
];

describe("computeTco", () => {
  it("sums lifetime total in cents", () => {
    const r = computeTco(expenses, { currentTach: 120, acquisitionTach: 100 });
    expect(r.totalCents).toBe(5075050);
  });
  it("breaks down by category, nulls grouped as 'uncategorized'", () => {
    const r = computeTco(expenses, { currentTach: 120, acquisitionTach: 100 });
    expect(r.byCategory.acquisition).toBe(5000000);
    expect(r.byCategory.uncategorized).toBe(30000);
  });
  it("cost per hour uses hours flown under ownership", () => {
    const r = computeTco(expenses, { currentTach: 120, acquisitionTach: 100 });
    // 5,075,050 cents / 20 hours = 253,752.5 -> round to 253753
    expect(r.costPerHourCents).toBe(253753);
  });
  it("cost per hour is null when no hours flown (avoid divide by zero)", () => {
    const r = computeTco(expenses, { currentTach: 100, acquisitionTach: 100 });
    expect(r.costPerHourCents).toBeNull();
  });
  it("cost per hour is null when acquisitionTach unknown", () => {
    const r = computeTco(expenses, { currentTach: 120, acquisitionTach: null });
    expect(r.costPerHourCents).toBeNull();
  });
});

describe("computeMonthlyBurn", () => {
  it("groups expenses by YYYY-MM with cents totals", async () => {
    const { computeMonthlyBurn } = await import("./tco");
    const months = computeMonthlyBurn(expenses);
    const feb = months.find((m) => m.month === "2025-02");
    expect(feb?.totalCents).toBe(45050); // 300.00 + 150.50
    const jan = months.find((m) => m.month === "2025-01");
    expect(jan?.totalCents).toBe(5000000);
  });
  it("returns months sorted ascending", async () => {
    const { computeMonthlyBurn } = await import("./tco");
    const months = computeMonthlyBurn(expenses);
    expect(months.map((m) => m.month)).toEqual(["2025-01", "2025-02", "2025-03"]);
  });
});
