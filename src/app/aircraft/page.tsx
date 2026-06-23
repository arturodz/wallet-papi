import { db } from "@/db";
import { aircraft } from "@/db/schema";
import { getCurrentProfile } from "@/lib/auth/guard";
import { canWrite, type Role } from "@/lib/auth/roles";
import { AircraftDetailsForm } from "./aircraft-details-form";

export const dynamic = "force-dynamic";

export default async function AircraftPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <p className="text-muted-foreground">Please sign in to continue.</p>
      </main>
    );
  }

  const [plane] = await db.select().from(aircraft).limit(1);
  const writable = canWrite(profile.role as Role);

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <h1 className="font-mono text-2xl">Aircraft</h1>
      {plane ? (
        <AircraftDetailsForm aircraft={plane} readOnly={!writable} />
      ) : (
        <p className="text-muted-foreground">
          Pre-flight: no aircraft record found.
        </p>
      )}
    </main>
  );
}
