import { eq } from "drizzle-orm";
import { db } from "@/db";
import { equipment } from "@/db/schema";
import { getCurrentProfile } from "@/lib/auth/guard";
import { getActiveAircraftId } from "@/lib/aircraft";
import { NoAircraft } from "@/components/no-aircraft";
import { canWrite, type Role } from "@/lib/auth/roles";
import { warrantyStatus } from "@/lib/intervals";
import { StatusBadge } from "@/components/status-badge";
import { ListHeader, EmptyState } from "@/components/ui/data-list";
import {
  AddEquipmentSheet,
  EquipmentRow,
  type EquipmentRecord,
} from "./equipment-form";

export const dynamic = "force-dynamic";

export default async function EquipmentPage() {
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
  const now = new Date();
  const rows = await db
    .select()
    .from(equipment)
    .where(eq(equipment.aircraftId, activeId));

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <ListHeader title="Equipment">
        {writable && <AddEquipmentSheet readOnly={false} />}
      </ListHeader>

      {rows.length === 0 ? (
        <EmptyState>
          Pre-flight: no equipment recorded
          {writable ? " — tap + to add an item." : "."}
        </EmptyState>
      ) : (
        <ul className="space-y-2">
          {rows.map((e) => {
            const record: EquipmentRecord = {
              id: e.id,
              name: e.name,
              category: e.category,
              make: e.make,
              model: e.model,
              serial: e.serial,
              installDate: e.installDate,
              warrantyExpiry: e.warrantyExpiry,
              notes: e.notes,
            };
            const makeModel = [e.make, e.model].filter(Boolean).join(" ");
            const sub = [e.category, makeModel].filter(Boolean).join(" · ");
            return (
              <li key={e.id}>
                <EquipmentRow
                  record={record}
                  readOnly={!writable}
                  meta={<StatusBadge status={warrantyStatus(e.warrantyExpiry, now)} />}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="truncate text-sm font-medium">{e.name}</span>
                    {e.serial && (
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {e.serial}
                      </span>
                    )}
                  </div>
                  {sub && (
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {sub}
                    </div>
                  )}
                </EquipmentRow>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
