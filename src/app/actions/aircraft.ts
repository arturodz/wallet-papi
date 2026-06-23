"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { aircraft } from "@/db/schema";
import { requireRole } from "@/lib/auth/guard";
import { aircraftInput } from "@/lib/validation";
import { ACTIVE_AIRCRAFT_COOKIE } from "@/lib/active-aircraft";

// App routes whose data is scoped to the active aircraft; revalidated when the
// active plane changes so cached pages re-render against the new plane.
const APP_ROUTES = [
  "/",
  "/intervals",
  "/services",
  "/expenses",
  "/squawks",
  "/equipment",
  "/tco",
  "/aircraft",
];

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

export async function createAircraft(input: unknown) {
  await requireRole("editor");
  const data = aircraftInput.parse(input);
  const [row] = await db.insert(aircraft).values(data).returning();
  revalidatePath("/aircraft");
  revalidatePath("/");
  return row;
}

// Switching the active plane is a per-browser view preference, allowed for any
// signed-in user (including viewers); it mutates no aircraft data.
export async function setActiveAircraft(id: string) {
  await requireRole("viewer");
  const [exists] = await db
    .select({ id: aircraft.id })
    .from(aircraft)
    .where(eq(aircraft.id, id));
  if (!exists) throw new Error("AIRCRAFT_NOT_FOUND");

  (await cookies()).set(ACTIVE_AIRCRAFT_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  for (const route of APP_ROUTES) revalidatePath(route);
}
