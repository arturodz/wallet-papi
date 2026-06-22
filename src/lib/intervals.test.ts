import { describe, it, expect } from "vitest";
import { computeIntervalStatus, warrantyStatus } from "./intervals";

const now = new Date("2026-06-22T00:00:00Z");

describe("computeIntervalStatus", () => {
  it("calendar: far out is ok (green)", () => {
    const r = computeIntervalStatus(
      { kind: "calendar", intervalMonths: 12, intervalHours: null, lastDoneDate: "2026-03-01", lastDoneHours: null },
      { currentTach: 100, now });
    expect(r.status).toBe("ok");
    expect(r.dueDate).toBe("2027-03-01");
    expect(r.daysUntilDue).toBeGreaterThan(30);
  });
  it("calendar: within 30 days is due_soon (amber)", () => {
    const r = computeIntervalStatus(
      { kind: "calendar", intervalMonths: 12, intervalHours: null, lastDoneDate: "2025-07-01", lastDoneHours: null },
      { currentTach: 100, now });
    expect(r.status).toBe("due_soon"); // due 2026-07-01, ~9 days out
  });
  it("calendar: past due is overdue (red)", () => {
    const r = computeIntervalStatus(
      { kind: "calendar", intervalMonths: 12, intervalHours: null, lastDoneDate: "2025-01-01", lastDoneHours: null },
      { currentTach: 100, now });
    expect(r.status).toBe("overdue");
    expect(r.daysUntilDue).toBeLessThan(0);
  });
  it("hours: within 10 hours is due_soon", () => {
    const r = computeIntervalStatus(
      { kind: "hours", intervalMonths: null, intervalHours: 50, lastDoneDate: null, lastDoneHours: 95 },
      { currentTach: 140, now }); // due at 145, 5 hrs out
    expect(r.status).toBe("due_soon");
    expect(r.hoursUntilDue).toBe(5);
  });
  it("hours: past due is overdue", () => {
    const r = computeIntervalStatus(
      { kind: "hours", intervalMonths: null, intervalHours: 50, lastDoneDate: null, lastDoneHours: 95 },
      { currentTach: 150, now }); // due 145, -5
    expect(r.status).toBe("overdue");
  });
  it("both: takes the worse of calendar/hours", () => {
    const r = computeIntervalStatus(
      { kind: "both", intervalMonths: 12, intervalHours: 50, lastDoneDate: "2026-03-01", lastDoneHours: 95 },
      { currentTach: 150, now }); // calendar ok, hours overdue -> overdue
    expect(r.status).toBe("overdue");
  });
  it("unknown when required anchor missing", () => {
    const r = computeIntervalStatus(
      { kind: "calendar", intervalMonths: 12, intervalHours: null, lastDoneDate: null, lastDoneHours: null },
      { currentTach: 100, now });
    expect(r.status).toBe("unknown");
  });
});

describe("warrantyStatus", () => {
  it("none when no expiry", () => { expect(warrantyStatus(null, now)).toBe("none"); });
  it("ok when far out", () => { expect(warrantyStatus("2027-01-01", now)).toBe("ok"); });
  it("due_soon within 30 days", () => { expect(warrantyStatus("2026-07-10", now)).toBe("due_soon"); });
  it("overdue when expired", () => { expect(warrantyStatus("2026-01-01", now)).toBe("overdue"); });
});
