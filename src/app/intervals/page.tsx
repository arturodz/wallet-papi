import { eq } from "drizzle-orm";
import { db } from "@/db";
import { intervals } from "@/db/schema";
import { getCurrentProfile } from "@/lib/auth/guard";
import { getActiveAircraft } from "@/lib/aircraft";
import { NoAircraft } from "@/components/no-aircraft";
import { canWrite, type Role } from "@/lib/auth/roles";
import { computeIntervalStatus, severityRank } from "@/lib/intervals";
import { StatusBadge } from "@/components/status-badge";
import { ListHeader, EmptyState } from "@/components/ui/data-list";
import {
  AddIntervalSheet,
  IntervalRow,
  type IntervalRecord,
} from "./interval-form";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = {
  calendar: "Calendar",
  hours: "Hours",
  both: "Both",
};

export default async function IntervalsPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <p className="text-muted-foreground">Please sign in to continue.</p>
      </main>
    );
  }

  const plane = await getActiveAircraft();
  if (!plane) return <NoAircraft />;

  const writable = canWrite(profile.role as Role);
  const now = new Date();
  const currentTach = plane.currentTach ?? 0;
  const rows = await db
    .select()
    .from(intervals)
    .where(eq(intervals.aircraftId, plane.id));

  const computed = rows
    .map((r) => ({ row: r, result: computeIntervalStatus(r, { currentTach, now }) }))
    .sort((a, b) => severityRank(a.result.status) - severityRank(b.result.status));

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <ListHeader title="Service Intervals">
        {writable && <AddIntervalSheet readOnly={false} />}
      </ListHeader>

      {computed.length === 0 ? (
        <EmptyState>
          Pre-flight: no intervals defined
          {writable ? ". Tap + to add one." : "."}
        </EmptyState>
      ) : (
        <ul className="space-y-2">
          {computed.map(({ row, result }) => {
            const record: IntervalRecord = {
              id: row.id,
              name: row.name,
              kind: row.kind,
              intervalMonths: row.intervalMonths,
              intervalHours: row.intervalHours,
              lastDoneDate: row.lastDoneDate,
              lastDoneHours: row.lastDoneHours,
            };

            const dueParts: string[] = [];
            if (result.dueDate) dueParts.push(result.dueDate);
            if (result.dueHours != null) dueParts.push(`${result.dueHours} hrs`);

            const remainParts: string[] = [];
            if (result.daysUntilDue != null) remainParts.push(`${result.daysUntilDue}d`);
            if (result.hoursUntilDue != null) remainParts.push(`${result.hoursUntilDue}h`);

            return (
              <li key={row.id}>
                <IntervalRow
                  record={record}
                  readOnly={!writable}
                  meta={<StatusBadge status={result.status} />}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="truncate text-sm font-medium">
                      {row.name}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                      {KIND_LABEL[row.kind] ?? row.kind}
                    </span>
                  </div>
                  <div className="mt-0.5 flex gap-3 font-mono text-xs text-muted-foreground tabular-nums">
                    {dueParts.length > 0 && (
                      <span>due {dueParts.join(" · ")}</span>
                    )}
                    {remainParts.length > 0 && (
                      <span className="text-muted-foreground/70">
                        {remainParts.join(" · ")} left
                      </span>
                    )}
                  </div>
                </IntervalRow>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
