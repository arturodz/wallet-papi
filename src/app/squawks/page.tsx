import { eq } from "drizzle-orm";
import { db } from "@/db";
import { squawks, equipment, services } from "@/db/schema";
import { getCurrentProfile } from "@/lib/auth/guard";
import { getActiveAircraftId } from "@/lib/aircraft";
import { NoAircraft } from "@/components/no-aircraft";
import { canWrite, type Role } from "@/lib/auth/roles";
import type { SquawkStatus } from "@/lib/squawks";
import { ListHeader, EmptyState } from "@/components/ui/data-list";
import { SquawkStatusBadge } from "./squawk-status-badge";
import {
  AddSquawkSheet,
  SquawkRow,
  type SquawkFormOption,
  type SquawkRecord,
} from "./squawk-form";

export const dynamic = "force-dynamic";

// Open/deferred (live) before resolved (closed out).
const STATUS_RANK: Record<SquawkStatus, number> = {
  open: 0,
  deferred: 1,
  resolved: 2,
};

export default async function SquawksPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <p className="text-muted-foreground">Please sign in to continue.</p>
      </main>
    );
  }

  const activeId = await getActiveAircraftId();
  if (!activeId) return <NoAircraft />;

  const writable = canWrite(profile.role as Role);
  const [rows, equipmentRows, serviceRows] = await Promise.all([
    db.select().from(squawks).where(eq(squawks.aircraftId, activeId)),
    db.select().from(equipment).where(eq(equipment.aircraftId, activeId)),
    db.select().from(services).where(eq(services.aircraftId, activeId)),
  ]);

  const equipmentName = new Map(equipmentRows.map((e) => [e.id, e.name]));

  const sorted = [...rows].sort((a, b) => {
    const r = STATUS_RANK[a.status as SquawkStatus] - STATUS_RANK[b.status as SquawkStatus];
    if (r !== 0) return r;
    // Newest opened first within a status group.
    return b.openedDate.localeCompare(a.openedDate);
  });

  const equipmentOptions: SquawkFormOption[] = equipmentRows.map((e) => ({
    id: e.id,
    label: e.name,
  }));
  const serviceOptions: SquawkFormOption[] = serviceRows.map((s) => ({
    id: s.id,
    label: `${s.date} — ${s.description}`,
  }));

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <ListHeader title="Squawks">
        {writable && (
          <AddSquawkSheet
            equipment={equipmentOptions}
            services={serviceOptions}
            readOnly={false}
          />
        )}
      </ListHeader>

      {sorted.length === 0 ? (
        <EmptyState>
          Pre-flight: no squawks — you&apos;re cleared.
        </EmptyState>
      ) : (
        <ul className="space-y-2">
          {sorted.map((s) => {
            const record: SquawkRecord = {
              id: s.id,
              title: s.title,
              description: s.description,
              severity: s.severity,
              status: s.status,
              openedDate: s.openedDate,
              equipmentId: s.equipmentId,
              resolvedByServiceId: s.resolvedByServiceId,
            };
            const sub = [
              s.severity ? s.severity.toUpperCase() : null,
              s.equipmentId ? equipmentName.get(s.equipmentId) : null,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={s.id}>
                <SquawkRow
                  record={record}
                  equipment={equipmentOptions}
                  services={serviceOptions}
                  readOnly={!writable}
                  meta={<SquawkStatusBadge status={s.status as SquawkStatus} />}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="truncate text-sm font-medium">
                      {s.title}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                      {s.openedDate}
                    </span>
                  </div>
                  {(sub || s.description) && (
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {sub}
                      {sub && s.description ? " — " : ""}
                      {s.description}
                    </div>
                  )}
                </SquawkRow>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
