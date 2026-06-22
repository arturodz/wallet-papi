"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { equipment, intervals, squawks, services } from "@/db/schema";
import { requireRole } from "@/lib/auth/guard";
import { equipmentInput, type EquipmentInput } from "@/lib/validation";

// Map validated input (undefined for empty fields) onto the nullable columns.
function toValues(data: EquipmentInput) {
  return {
    name: data.name,
    category: data.category ?? null,
    make: data.make ?? null,
    model: data.model ?? null,
    serial: data.serial ?? null,
    installDate: data.installDate ?? null,
    warrantyExpiry: data.warrantyExpiry ?? null,
    notes: data.notes ?? null,
  };
}

export async function createEquipment(input: unknown) {
  await requireRole("editor");
  const data = equipmentInput.parse(input);
  const [row] = await db.insert(equipment).values(toValues(data)).returning();
  revalidatePath("/equipment");
  revalidatePath("/");
  return row;
}

export async function updateEquipment(id: string, input: unknown) {
  await requireRole("editor");
  const data = equipmentInput.parse(input);
  const [row] = await db
    .update(equipment)
    .set(toValues(data))
    .where(eq(equipment.id, id))
    .returning();
  revalidatePath("/equipment");
  revalidatePath(`/equipment/${id}`);
  revalidatePath("/");
  return row;
}

export async function deleteEquipment(id: string) {
  await requireRole("editor");
  // Intervals, squawks, and services reference equipment via nullable FKs.
  // Rather than blocking the delete (or cascading and destroying maintenance
  // history), we null out those references so the linked records survive
  // un-attributed. (Services would otherwise raise an FK violation on delete.)
  await db
    .update(intervals)
    .set({ equipmentId: null })
    .where(eq(intervals.equipmentId, id));
  await db
    .update(squawks)
    .set({ equipmentId: null })
    .where(eq(squawks.equipmentId, id));
  await db
    .update(services)
    .set({ equipmentId: null })
    .where(eq(services.equipmentId, id));
  await db.delete(equipment).where(eq(equipment.id, id));
  revalidatePath("/equipment");
  revalidatePath("/");
}
