import { describe, it, expect } from "vitest";
import { resolveActiveAircraftId } from "./active-aircraft";

describe("resolveActiveAircraftId", () => {
  const ids = ["a", "b", "c"];

  it("returns null when there are no aircraft", () => {
    expect(resolveActiveAircraftId("a", [])).toBeNull();
    expect(resolveActiveAircraftId(null, [])).toBeNull();
  });

  it("honors the cookie when it points at an existing aircraft", () => {
    expect(resolveActiveAircraftId("b", ids)).toBe("b");
  });

  it("falls back to the first aircraft when cookie is missing", () => {
    expect(resolveActiveAircraftId(null, ids)).toBe("a");
    expect(resolveActiveAircraftId(undefined, ids)).toBe("a");
    expect(resolveActiveAircraftId("", ids)).toBe("a");
  });

  it("falls back to the first aircraft when cookie points at a gone aircraft", () => {
    expect(resolveActiveAircraftId("zzz", ids)).toBe("a");
  });
});
