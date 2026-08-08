import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { services, intervals } from "@/db/schema";
import { getCurrentProfile } from "@/lib/auth/guard";
import { getActiveAircraftId } from "@/lib/aircraft";
import { NoAircraft } from "@/components/no-aircraft";
import { canWrite, type Role } from "@/lib/auth/roles";
import { getVendorSuggestions } from "@/lib/suggestions";
import { ListHeader, EmptyState } from "@/components/ui/data-list";
import {
  AddServiceSheet,
  ServiceRow,
  type ServiceRecord,
} from "./service-form";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
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
  const rows = await db
    .select()
    .from(services)
    .where(eq(services.aircraftId, activeId))
    .orderBy(desc(services.date));
  const intervalOptions = await db
    .select({ id: intervals.id, name: intervals.name })
    .from(intervals)
    .where(eq(intervals.aircraftId, activeId))
    .orderBy(asc(intervals.name));
  const vendors = await getVendorSuggestions(activeId);

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <ListHeader title="Maintenance Log">
        {writable && (
          <AddServiceSheet
            intervals={intervalOptions}
            vendors={vendors}
            readOnly={false}
          />
        )}
      </ListHeader>

      {rows.length === 0 ? (
        <EmptyState>
          Pre-flight: no services logged yet
          {writable ? ". Tap + to log one." : "."}
        </EmptyState>
      ) : (
        <ul className="space-y-2">
          {rows.map((s) => {
            const record: ServiceRecord = {
              id: s.id,
              date: s.date,
              description: s.description,
              vendor: s.vendor,
              category: s.category,
              tachAtService: s.tachAtService,
            };
            const meta = [s.vendor, s.category].filter(Boolean).join(" · ");
            return (
              <li key={s.id}>
                <ServiceRow
                  record={record}
                  intervals={intervalOptions}
                  vendors={vendors}
                  readOnly={!writable}
                  meta={
                    s.tachAtService != null ? (
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {s.tachAtService} hrs
                      </span>
                    ) : null
                  }
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                      {s.date}
                    </span>
                    <span className="truncate text-sm font-medium">
                      {s.description}
                    </span>
                  </div>
                  {meta && (
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {meta}
                    </div>
                  )}
                </ServiceRow>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
