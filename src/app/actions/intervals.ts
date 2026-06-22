"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { intervals } from "@/db/schema";
import { requireRole } from "@/lib/auth/guard";
import { intervalInput, type IntervalInput } from "@/lib/validation";

// Map validated input (undefined for empty fields) onto the nullable columns.
function toValues(data: IntervalInput) {
  return {
    name: data.name,
    kind: data.kind,
    intervalMonths: data.intervalMonths ?? null,
    intervalHours: data.intervalHours ?? null,
    lastDoneDate: data.lastDoneDate ?? null,
    lastDoneHours: data.lastDoneHours ?? null,
    equipmentId: data.equipmentId ?? null,
  };
}

export async function createInterval(input: unknown) {
  await requireRole("editor");
  const data = intervalInput.parse(input);
  const [row] = await db.insert(intervals).values(toValues(data)).returning();
  revalidatePath("/intervals");
  revalidatePath("/");
  return row;
}

export async function updateInterval(id: string, input: unknown) {
  await requireRole("editor");
  const data = intervalInput.parse(input);
  const [row] = await db
    .update(intervals)
    .set(toValues(data))
    .where(eq(intervals.id, id))
    .returning();
  revalidatePath("/intervals");
  revalidatePath("/");
  return row;
}

export async function deleteInterval(id: string) {
  await requireRole("editor");
  await db.delete(intervals).where(eq(intervals.id, id));
  revalidatePath("/intervals");
  revalidatePath("/");
}
