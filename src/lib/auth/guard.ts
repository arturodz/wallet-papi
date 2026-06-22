import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { auth } from "./server";
import { hasAtLeast, type Role } from "./roles";

export async function getCurrentProfile() {
  // Neon Auth (Better Auth compatible) returns { data, error }; the session
  // lives under `data`, with the authenticated user under `data.user`.
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;

  const userId = session.user.id;
  const found = await db.select().from(profiles).where(eq(profiles.userId, userId));
  if (found.length > 0) return found[0];

  // First sign-in: create a viewer profile by default. Owner is granted manually in DB.
  const inserted = await db
    .insert(profiles)
    .values({ userId, email: session.user.email ?? null, role: "viewer" })
    .returning();
  return inserted[0];
}

export async function requireRole(min: Role) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("UNAUTHENTICATED");
  if (!hasAtLeast(profile.role as Role, min)) throw new Error("FORBIDDEN");
  return profile;
}
