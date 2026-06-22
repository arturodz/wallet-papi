import { describe, it, expect } from "vitest";
import { resolveTransition } from "./squawks";

const today = "2026-06-22";
describe("resolveTransition", () => {
  it("sets resolvedDate to today when resolving and none set", () => {
    expect(resolveTransition("resolved", null, today)).toBe("2026-06-22");
  });
  it("keeps an existing resolvedDate when already resolved", () => {
    expect(resolveTransition("resolved", "2026-01-10", today)).toBe("2026-01-10");
  });
  it("clears resolvedDate when reopened", () => {
    expect(resolveTransition("open", "2026-01-10", today)).toBeNull();
    expect(resolveTransition("deferred", "2026-01-10", today)).toBeNull();
  });
});
