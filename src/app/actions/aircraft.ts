"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { aircraft } from "@/db/schema";
import { requireRole } from "@/lib/auth/guard";
import { aircraftInput } from "@/lib/validation";

export async function updateAircraft(id: string, input: unknown) {
  await requireRole("editor");
  const data = aircraftInput.parse(input);

  const [existing] = await db.select().from(aircraft).where(eq(aircraft.id, id));

  const hoursChanged =
    (data.currentTach != null && data.currentTach !== existing?.currentTach) ||
    (data.currentHobbs != null && data.currentHobbs !== existing?.currentHobbs);

  const [row] = await db
    .update(aircraft)
    .set({ ...data, ...(hoursChanged ? { hoursUpdatedAt: new Date() } : {}) })
    .where(eq(aircraft.id, id))
    .returning();

  revalidatePath("/");
  revalidatePath("/tco");
  return row;
}
