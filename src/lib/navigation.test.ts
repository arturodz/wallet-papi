import { describe, expect, it } from "vitest";

import { activeMobileHref, isRouteActive } from "./navigation";

describe("mobile navigation", () => {
  it("matches exact and nested routes", () => {
    expect(isRouteActive("/services", "/services")).toBe(true);
    expect(isRouteActive("/services/annual", "/services")).toBe(true);
    expect(isRouteActive("/expenses", "/")).toBe(false);
  });

  it("keeps primary destinations on their own tab", () => {
    expect(activeMobileHref("/expenses")).toBe("/expenses");
  });

  it("maps overflow destinations to More", () => {
    expect(activeMobileHref("/equipment/elt")).toBe("/more");
    expect(activeMobileHref("/intervals")).toBe("/more");
  });

  it("returns null for an unknown route", () => {
    expect(activeMobileHref("/unknown")).toBeNull();
  });
});
