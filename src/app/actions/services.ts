"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { services, intervals } from "@/db/schema";
import { requireRole } from "@/lib/auth/guard";
import { getActiveAircraftId } from "@/lib/aircraft";
import { serviceInput } from "@/lib/validation";

function bumpInterval(intervalId: string, date: string, tach: number | undefined) {
  return db
    .update(intervals)
    .set({ lastDoneDate: date, lastDoneHours: tach ?? null })
    .where(eq(intervals.id, intervalId));
}

export async function createService(input: unknown) {
  await requireRole("editor");
  const aircraftId = await getActiveAircraftId();
  if (!aircraftId) throw new Error("NO_ACTIVE_AIRCRAFT");
  const data = serviceInput.parse(input);
  const [row] = await db
    .insert(services)
    .values({ ...data, aircraftId })
    .returning();
  if (data.satisfiesIntervalId) {
    await bumpInterval(data.satisfiesIntervalId, data.date, data.tachAtService);
  }
  revalidatePath("/services");
  revalidatePath("/tco");
  revalidatePath("/");
  return row;
}

export async function updateService(id: string, input: unknown) {
  await requireRole("editor");
  const data = serviceInput.parse(input);
  const [row] = await db
    .update(services)
    .set(data)
    .where(eq(services.id, id))
    .returning();
  if (data.satisfiesIntervalId) {
    await bumpInterval(data.satisfiesIntervalId, data.date, data.tachAtService);
  }
  revalidatePath("/services");
  revalidatePath("/tco");
  revalidatePath("/");
  return row;
}

export async function deleteService(id: string) {
  await requireRole("editor");
  await db.delete(services).where(eq(services.id, id));
  revalidatePath("/services");
  revalidatePath("/tco");
  revalidatePath("/");
}
