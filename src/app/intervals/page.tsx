import { db } from "@/db";
import { intervals, aircraft } from "@/db/schema";
import { getCurrentProfile } from "@/lib/auth/guard";
import { canWrite, type Role } from "@/lib/auth/roles";
import { computeIntervalStatus, severityRank } from "@/lib/intervals";
import { StatusBadge } from "@/components/status-badge";
import { IntervalForm } from "./interval-form";
import { DeleteIntervalButton } from "./delete-interval-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  const writable = canWrite(profile.role as Role);
  const now = new Date();
  const [plane] = await db.select().from(aircraft).limit(1);
  const currentTach = plane?.currentTach ?? 0;
  const rows = await db.select().from(intervals);

  const computed = rows
    .map((r) => ({ row: r, result: computeIntervalStatus(r, { currentTach, now }) }))
    .sort((a, b) => severityRank(a.result.status) - severityRank(b.result.status));

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <h1 className="font-mono text-2xl">Service Intervals</h1>

      {writable && <IntervalForm />}

      {computed.length === 0 ? (
        <p className="text-muted-foreground">Pre-flight: no intervals defined.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Due</TableHead>
              <TableHead className="text-right font-mono">Remaining</TableHead>
              <TableHead>Status</TableHead>
              {writable && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {computed.map(({ row, result }) => {
              const dueParts: string[] = [];
              if (result.dueDate) dueParts.push(result.dueDate);
              if (result.dueHours != null) dueParts.push(`${result.dueHours} hrs`);

              const remainParts: string[] = [];
              if (result.daysUntilDue != null) remainParts.push(`${result.daysUntilDue}d`);
              if (result.hoursUntilDue != null) remainParts.push(`${result.hoursUntilDue}h`);

              return (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {KIND_LABEL[row.kind] ?? row.kind}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {dueParts.length ? dueParts.join(" · ") : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {remainParts.length ? remainParts.join(" · ") : "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={result.status} />
                  </TableCell>
                  {writable && (
                    <TableCell className="text-right">
                      <DeleteIntervalButton id={row.id} />
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </main>
  );
}
