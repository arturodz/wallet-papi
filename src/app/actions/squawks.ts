"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { squawks } from "@/db/schema";
import { requireRole } from "@/lib/auth/guard";
import { squawkInput, type SquawkInput } from "@/lib/validation";
import { resolveTransition, type SquawkStatus } from "@/lib/squawks";

// Map validated input (undefined for empty fields) onto the nullable columns.
// resolvedDate is derived from the status transition, not posted by the form.
function toValues(data: SquawkInput) {
  return {
    title: data.title,
    description: data.description ?? null,
    severity: data.severity ?? null,
    status: data.status,
    openedDate: data.openedDate,
    resolvedDate: resolveTransition(data.status, null, today()),
    equipmentId: data.equipmentId ?? null,
    resolvedByServiceId: data.resolvedByServiceId ?? null,
  };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function createSquawk(input: unknown) {
  await requireRole("editor");
  const data = squawkInput.parse(input);
  const [row] = await db.insert(squawks).values(toValues(data)).returning();
  revalidatePath("/squawks");
  revalidatePath("/");
  return row;
}

export async function updateSquawk(id: string, input: unknown) {
  await requireRole("editor");
  const data = squawkInput.parse(input);
  // Preserve an already-set resolvedDate across edits that keep status resolved.
  const [existing] = await db
    .select({ resolvedDate: squawks.resolvedDate })
    .from(squawks)
    .where(eq(squawks.id, id));
  const [row] = await db
    .update(squawks)
    .set({
      ...toValues(data),
      resolvedDate: resolveTransition(
        data.status,
        existing?.resolvedDate ?? null,
        today(),
      ),
    })
    .where(eq(squawks.id, id))
    .returning();
  revalidatePath("/squawks");
  revalidatePath("/");
  return row;
}

export async function setSquawkStatus(id: string, status: SquawkStatus) {
  await requireRole("editor");
  const [existing] = await db
    .select({ resolvedDate: squawks.resolvedDate })
    .from(squawks)
    .where(eq(squawks.id, id));
  if (!existing) throw new Error("NOT_FOUND");
  const resolvedDate = resolveTransition(
    status,
    existing.resolvedDate ?? null,
    today(),
  );
  const [row] = await db
    .update(squawks)
    .set({ status, resolvedDate })
    .where(eq(squawks.id, id))
    .returning();
  revalidatePath("/squawks");
  revalidatePath("/");
  return row;
}

export async function deleteSquawk(id: string) {
  await requireRole("editor");
  await db.delete(squawks).where(eq(squawks.id, id));
  revalidatePath("/squawks");
  revalidatePath("/");
}
