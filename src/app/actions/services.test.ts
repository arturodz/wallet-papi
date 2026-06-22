import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the auth guard so requireRole behaves like a viewer hitting a write.
vi.mock("@/lib/auth/guard", () => ({
  requireRole: vi.fn(async () => {
    throw new Error("FORBIDDEN");
  }),
}));

// Minimal db mock: if gating works, these must never be reached.
const insertSpy = vi.fn();
vi.mock("@/db", () => ({
  db: {
    insert: () => {
      insertSpy();
      return { values: () => ({ returning: async () => [{}] }) };
    },
  },
}));

// next/cache is server-only; stub it so the module imports under vitest.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { createService } from "./services";
import { requireRole } from "@/lib/auth/guard";

describe("createService role gating", () => {
  beforeEach(() => {
    insertSpy.mockClear();
  });

  it("rejects when requireRole denies (viewer cannot create)", async () => {
    await expect(
      createService({ date: "2025-01-01", description: "oil change" }),
    ).rejects.toThrow("FORBIDDEN");
    // Guard runs before any DB write.
    expect(requireRole).toHaveBeenCalledWith("editor");
    expect(insertSpy).not.toHaveBeenCalled();
  });
});
