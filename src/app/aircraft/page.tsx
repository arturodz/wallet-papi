import { getCurrentProfile } from "@/lib/auth/guard";
import { canWrite, type Role } from "@/lib/auth/roles";
import { getActiveAircraftId, listAircraft } from "@/lib/aircraft";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AircraftDetailsForm } from "./aircraft-details-form";
import { AddAircraftForm } from "./add-aircraft-form";
import { SetActiveButton } from "./set-active-button";

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

  const writable = canWrite(profile.role as Role);
  const fleet = await listAircraft();
  const activeId = await getActiveAircraftId();
  const active = fleet.find((p) => p.id === activeId) ?? null;

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <h1 className="font-mono text-2xl">Aircraft</h1>

      {/* Fleet list */}
      <Card>
        <CardHeader>
          <CardTitle>Fleet</CardTitle>
        </CardHeader>
        <CardContent>
          {fleet.length === 0 ? (
            <p className="text-muted-foreground">
              No aircraft yet. Add your first below.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {fleet.map((p) => {
                const isActive = p.id === activeId;
                const makeModel = [p.make, p.model].filter(Boolean).join(" ");
                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{p.tailNumber}</span>
                        {isActive && <Badge>Active</Badge>}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {makeModel || "—"}
                      </div>
                    </div>
                    {!isActive && <SetActiveButton id={p.id} />}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Add aircraft (editor only) */}
      {writable && <AddAircraftForm />}

      {/* Full edit of the active plane */}
      {active && (
        <AircraftDetailsForm aircraft={active} readOnly={!writable} />
      )}
    </main>
  );
}
