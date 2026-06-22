import { db } from "@/db";
import { squawks, equipment, services } from "@/db/schema";
import { getCurrentProfile } from "@/lib/auth/guard";
import { canWrite, type Role } from "@/lib/auth/roles";
import type { SquawkStatus } from "@/lib/squawks";
import { SquawkStatusBadge } from "./squawk-status-badge";
import { SquawkStatusControl } from "./squawk-status-control";
import { SquawkForm, type SquawkFormOption } from "./squawk-form";
import { DeleteSquawkButton } from "./delete-squawk-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  const writable = canWrite(profile.role as Role);
  const [rows, equipmentRows, serviceRows] = await Promise.all([
    db.select().from(squawks),
    db.select().from(equipment),
    db.select().from(services),
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
      <h1 className="font-mono text-2xl">Squawks</h1>

      {writable && (
        <SquawkForm equipment={equipmentOptions} services={serviceOptions} />
      )}

      {sorted.length === 0 ? (
        <p className="text-muted-foreground">
          Pre-flight: no squawks — you&apos;re cleared.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Opened</TableHead>
              <TableHead>Equipment</TableHead>
              <TableHead>Status</TableHead>
              {writable && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div>{s.title}</div>
                  {s.description && (
                    <div className="text-xs text-muted-foreground">
                      {s.description}
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs uppercase">
                  {s.severity ?? "—"}
                </TableCell>
                <TableCell className="font-mono text-xs">{s.openedDate}</TableCell>
                <TableCell className="text-sm">
                  {s.equipmentId ? (equipmentName.get(s.equipmentId) ?? "—") : "—"}
                </TableCell>
                <TableCell>
                  <SquawkStatusBadge status={s.status as SquawkStatus} />
                </TableCell>
                {writable && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <SquawkStatusControl
                        id={s.id}
                        status={s.status as SquawkStatus}
                      />
                      <DeleteSquawkButton id={s.id} />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </main>
  );
}
