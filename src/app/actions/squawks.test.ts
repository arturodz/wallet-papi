import { describe, it, expect, vi, beforeEach } from "vitest";

// Auth guard: allow the write (editor) so we can reach the validation branch.
vi.mock("@/lib/auth/guard", () => ({
  requireRole: vi.fn(async () => ({ role: "editor" })),
  getCurrentProfile: vi.fn(async () => ({ role: "editor" })),
}));

// Minimal db mock. setSquawkStatus first selects the existing row, then updates.
const updateSpy = vi.fn();
const existingRow = { resolvedDate: null as string | null };
vi.mock("@/db", () => ({
  db: {
    select: () => ({
      from: () => ({ where: async () => [existingRow] }),
    }),
    update: () => {
      updateSpy();
      return {
        set: () => ({ where: () => ({ returning: async () => [{}] }) }),
      };
    },
  },
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { setSquawkStatus } from "./squawks";
import { requireRole } from "@/lib/auth/guard";

describe("setSquawkStatus", () => {
  beforeEach(() => {
    updateSpy.mockClear();
  });

  it("rejects an invalid status before writing", async () => {
    await expect(
      // Force a bad value past the compile-time type.
      setSquawkStatus("id", "bogus" as never),
    ).rejects.toThrow("INVALID_STATUS");
    expect(requireRole).toHaveBeenCalledWith("editor");
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("accepts a valid status", async () => {
    await expect(setSquawkStatus("id", "resolved")).resolves.toBeDefined();
    expect(updateSpy).toHaveBeenCalledTimes(1);
  });
});
