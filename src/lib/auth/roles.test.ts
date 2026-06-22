import { describe, it, expect } from "vitest";
import { hasAtLeast, canWrite, canManageUsers } from "./roles";

describe("role ordering", () => {
  it("owner satisfies every requirement", () => {
    expect(hasAtLeast("owner", "viewer")).toBe(true);
    expect(hasAtLeast("owner", "editor")).toBe(true);
    expect(hasAtLeast("owner", "owner")).toBe(true);
  });
  it("editor can write but not manage users", () => {
    expect(hasAtLeast("editor", "editor")).toBe(true);
    expect(hasAtLeast("editor", "owner")).toBe(false);
    expect(canWrite("editor")).toBe(true);
    expect(canManageUsers("editor")).toBe(false);
  });
  it("viewer is read-only", () => {
    expect(canWrite("viewer")).toBe(false);
    expect(hasAtLeast("viewer", "editor")).toBe(false);
    expect(canManageUsers("viewer")).toBe(false);
  });
  it("owner can manage users", () => {
    expect(canManageUsers("owner")).toBe(true);
  });
});
