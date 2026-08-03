"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { requireRole } from "@/lib/auth/guard";
import { getActiveAircraftId } from "@/lib/aircraft";
import { noteInput } from "@/lib/validation";

export async function createNote(input: unknown) {
  await requireRole("editor");
  const aircraftId = await getActiveAircraftId();
  if (!aircraftId) throw new Error("NO_ACTIVE_AIRCRAFT");
  const data = noteInput.parse(input);
  const [row] = await db
    .insert(notes)
    .values({ ...data, aircraftId })
    .returning();
  revalidatePath("/notes");
  return row;
}

export async function updateNote(id: string, input: unknown) {
  await requireRole("editor");
  const data = noteInput.parse(input);
  const [row] = await db
    .update(notes)
    .set(data)
    .where(eq(notes.id, id))
    .returning();
  revalidatePath("/notes");
  return row;
}

export async function deleteNote(id: string) {
  await requireRole("editor");
  await db.delete(notes).where(eq(notes.id, id));
  revalidatePath("/notes");
}
