import { cookies } from "next/headers";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { aircraft } from "@/db/schema";
import {
  ACTIVE_AIRCRAFT_COOKIE,
  resolveActiveAircraftId,
} from "./active-aircraft";

/** All aircraft, ordered by tail number. */
export async function listAircraft() {
  return db.select().from(aircraft).orderBy(asc(aircraft.tailNumber));
}

/**
 * The active aircraft id from the cookie, validated against existing aircraft.
 * Falls back to the first aircraft; null when there are none.
 */
export async function getActiveAircraftId(): Promise<string | null> {
  const cookieValue = (await cookies()).get(ACTIVE_AIRCRAFT_COOKIE)?.value;
  const rows = await db
    .select({ id: aircraft.id })
    .from(aircraft)
    .orderBy(asc(aircraft.tailNumber));
  return resolveActiveAircraftId(cookieValue, rows.map((r) => r.id));
}

/** The active aircraft row, or null when none. */
export async function getActiveAircraft() {
  const id = await getActiveAircraftId();
  if (!id) return null;
  const [row] = await db.select().from(aircraft).where(eq(aircraft.id, id));
  return row ?? null;
}
