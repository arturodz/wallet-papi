import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { equipment, intervals, squawks } from "@/db/schema";
import { getCurrentProfile } from "@/lib/auth/guard";
import { getActiveAircraft } from "@/lib/aircraft";
import { NoAircraft } from "@/components/no-aircraft";
import { canWrite, type Role } from "@/lib/auth/roles";
import { computeIntervalStatus, warrantyStatus } from "@/lib/intervals";
import type { SquawkStatus } from "@/lib/squawks";
import { StatusBadge } from "@/components/status-badge";
import { SquawkStatusBadge } from "@/app/squawks/squawk-status-badge";
import { DocumentList } from "@/components/document-list";
import { listDocuments } from "@/app/actions/documents";
import { DeleteEquipmentButton } from "../delete-equipment-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = {
  calendar: "Calendar",
  hours: "Hours",
  both: "Both",
};

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="font-mono text-sm">{value && value.length ? value : "Not recorded"}</dd>
    </div>
  );
}

// Next 15+/16: dynamic route params arrive as a Promise and must be awaited.
export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

  // Scope to the active plane: an item belonging to another aircraft is a 404.
  const [item] = await db
    .select()
    .from(equipment)
    .where(and(eq(equipment.id, id), eq(equipment.aircraftId, plane.id)));
  if (!item) notFound();

  const writable = canWrite(profile.role as Role);
  const now = new Date();

  const currentTach = plane.currentTach ?? 0;

  const [linkedIntervals, openSquawks, docs] = await Promise.all([
    db.select().from(intervals).where(eq(intervals.equipmentId, id)),
    db
      .select()
      .from(squawks)
      .where(and(eq(squawks.equipmentId, id), eq(squawks.status, "open"))),
    listDocuments("equipment", id),
  ]);

  const computedIntervals = linkedIntervals.map((r) => ({
    row: r,
    result: computeIntervalStatus(r, { currentTach, now }),
  }));

  const makeModel = [item.make, item.model].filter(Boolean).join(" ");

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link
            href="/equipment"
            className="inline-flex min-h-11 items-center font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            ← Equipment
          </Link>
          <h1 className="font-mono text-2xl">{item.name}</h1>
        </div>
        {writable && <DeleteEquipmentButton id={item.id} redirectTo="/equipment" />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <span>Details</span>
            <StatusBadge status={warrantyStatus(item.warrantyExpiry, now)} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-3">
            <Field label="Category" value={item.category} />
            <Field label="Make / Model" value={makeModel || null} />
            <Field label="Serial" value={item.serial} />
            <Field label="Installed" value={item.installDate} />
            <Field label="Warranty expiry" value={item.warrantyExpiry} />
            <Field label="Notes" value={item.notes} />
          </dl>
        </CardContent>
      </Card>

      <section className="space-y-2">
        <h2 className="font-mono text-lg">Linked intervals</h2>
        {computedIntervals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No intervals linked to this equipment.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {computedIntervals.map(({ row, result }) => {
              const dueParts: string[] = [];
              if (result.dueDate) dueParts.push(result.dueDate);
              if (result.dueHours != null) dueParts.push(`${result.dueHours} hrs`);
              return (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-3 px-3 py-2"
                >
                  <div>
                    <div className="text-sm">{row.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {KIND_LABEL[row.kind] ?? row.kind}
                      {dueParts.length ? ` · due ${dueParts.join(" · ")}` : ""}
                    </div>
                  </div>
                  <StatusBadge status={result.status} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-mono text-lg">Open squawks</h2>
        {openSquawks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No open squawks against this equipment.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {openSquawks.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 px-3 py-2"
              >
                <div>
                  <div className="text-sm">{s.title}</div>
                  <div className="font-mono text-xs text-muted-foreground">
                    opened {s.openedDate}
                    {s.severity ? ` · ${s.severity}` : ""}
                  </div>
                </div>
                <SquawkStatusBadge status={s.status as SquawkStatus} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-mono text-lg">Documents</h2>
        <DocumentList documents={docs} writable={writable} />
      </section>
    </main>
  );
}
