import { getCurrentProfile } from "@/lib/auth/guard";
import { canWrite, type Role } from "@/lib/auth/roles";
import { getActiveAircraftId, listAircraft } from "@/lib/aircraft";
import { Badge } from "@/components/ui/badge";
import { ListHeader, EmptyState } from "@/components/ui/data-list";
import { SetActiveButton } from "./set-active-button";
import {
  AddAircraftSheet,
  AircraftRow,
  type AircraftRecord,
} from "./aircraft-form";

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

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <ListHeader title="Fleet">
        {writable && <AddAircraftSheet readOnly={false} />}
      </ListHeader>

      {fleet.length === 0 ? (
        <EmptyState>
          Pre-flight: no aircraft yet
          {writable ? " — tap + to add your first." : "."}
        </EmptyState>
      ) : (
        <ul className="space-y-2">
          {fleet.map((p) => {
            const isActive = p.id === activeId;
            const makeModel = [p.make, p.model].filter(Boolean).join(" ");
            const record: AircraftRecord = {
              id: p.id,
              tailNumber: p.tailNumber,
              make: p.make,
              model: p.model,
              year: p.year,
              serial: p.serial,
              currentTach: p.currentTach,
              currentHobbs: p.currentHobbs,
              acquiredDate: p.acquiredDate,
              acquisitionTach: p.acquisitionTach,
            };
            return (
              <li key={p.id} className="flex items-stretch gap-2">
                <div className="min-w-0 flex-1">
                  <AircraftRow
                    record={record}
                    readOnly={!writable}
                    meta={isActive ? <Badge>Active</Badge> : undefined}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-sm font-medium tabular-nums">
                        {p.tailNumber}
                      </span>
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {makeModel || "—"}
                      <span className="ml-2 font-mono tabular-nums">
                        {p.currentTach} hrs
                      </span>
                    </div>
                  </AircraftRow>
                </div>
                {!isActive && (
                  <div className="flex shrink-0 items-center">
                    <SetActiveButton id={p.id} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
