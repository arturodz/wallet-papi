import Link from "next/link";
import { ne } from "drizzle-orm";
import { db } from "@/db";
import { aircraft, intervals, equipment, squawks } from "@/db/schema";
import { getCurrentProfile } from "@/lib/auth/guard";
import {
  computeIntervalStatus,
  warrantyStatus,
  severityRank,
} from "@/lib/intervals";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";
import { StatusTile } from "@/components/status-tile";
import {
  StatusBadge,
  statusColor,
  type AnnunciatorStatus,
} from "@/components/status-badge";

export const dynamic = "force-dynamic";

type AirworthinessItem = {
  id: string;
  label: string;
  detail: string;
  status: AnnunciatorStatus;
};

export default async function Home() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">Please sign in to continue.</p>
        <Button render={<Link href="/sign-in" />}>Go to sign in</Button>
      </main>
    );
  }

  const now = new Date();
  const [plane] = await db.select().from(aircraft).limit(1);
  const currentTach = plane?.currentTach ?? 0;

  const [intervalRows, equipmentRows, openSquawks] = await Promise.all([
    db.select().from(intervals),
    db.select().from(equipment),
    db.select().from(squawks).where(ne(squawks.status, "resolved")),
  ]);

  // Build the airworthiness list: intervals + non-"none" warranties.
  const items: AirworthinessItem[] = [];

  for (const r of intervalRows) {
    const result = computeIntervalStatus(r, { currentTach, now });
    const detail: string[] = [];
    if (result.dueDate) detail.push(`due ${result.dueDate}`);
    if (result.dueHours != null) detail.push(`due ${result.dueHours} hrs`);
    items.push({
      id: `interval-${r.id}`,
      label: r.name,
      detail: detail.length ? detail.join(" · ") : "no anchor set",
      status: result.status,
    });
  }

  for (const e of equipmentRows) {
    const ws = warrantyStatus(e.warrantyExpiry, now);
    if (ws === "none") continue;
    items.push({
      id: `warranty-${e.id}`,
      label: `${e.name} warranty`,
      detail: `expires ${e.warrantyExpiry}`,
      status: ws,
    });
  }

  items.sort((a, b) => severityRank(a.status) - severityRank(b.status));

  const overdueCount = items.filter((i) => i.status === "overdue").length;
  const dueSoonCount = items.filter((i) => i.status === "due_soon").length;
  const allClear = overdueCount === 0 && dueSoonCount === 0;

  const overdueStatus: AnnunciatorStatus = overdueCount > 0 ? "overdue" : "ok";
  const dueSoonStatus: AnnunciatorStatus = dueSoonCount > 0 ? "due_soon" : "ok";
  const squawkStatus: AnnunciatorStatus = openSquawks.length > 0 ? "due_soon" : "ok";

  const hoursUpdated = plane?.hoursUpdatedAt
    ? new Date(plane.hoursUpdatedAt).toISOString().slice(0, 10)
    : "never";

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-2xl">{plane?.tailNumber ?? "No aircraft"}</h1>
        <div className="flex items-center gap-3">
          <Badge>{profile.role}</Badge>
          <SignOutButton />
        </div>
      </div>

      {/* Instrument panel: top summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatusTile label="Overdue" value={overdueCount} status={overdueStatus} />
        <StatusTile label="Due Soon" value={dueSoonCount} status={dueSoonStatus} />
        <StatusTile label="Open Squawks" value={openSquawks.length} status={squawkStatus} />
        <StatusTile
          label="Tach / Hobbs"
          value={`${currentTach.toFixed(1)}`}
          sub={`HOBBS ${(plane?.currentHobbs ?? 0).toFixed(1)} · upd ${hoursUpdated}`}
        />
      </div>

      {/* Airworthiness list */}
      <section className="space-y-3">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Airworthiness
        </h2>
        {allClear ? (
          <div
            className={`rounded-lg border ${statusColor("ok").border} ${statusColor("ok").bg} ${statusColor("ok").glow} p-6 text-center`}
          >
            <div className={`font-mono text-lg ${statusColor("ok").text}`}>
              All systems go
            </div>
            <div className="mt-1 font-mono text-xs text-muted-foreground">
              Cleared for departure
            </div>
          </div>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">
            Pre-flight: no intervals or warranties tracked yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((i) => {
              const c = statusColor(i.status);
              return (
                <li
                  key={i.id}
                  className={`flex items-center justify-between rounded-md border ${c.border} bg-card/40 px-4 py-2.5`}
                >
                  <div>
                    <div className="text-sm">{i.label}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {i.detail}
                    </div>
                  </div>
                  <StatusBadge status={i.status} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Open squawks preview */}
      {openSquawks.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Open Squawks
            </h2>
            <Link
              href="/squawks"
              className="font-mono text-xs text-primary underline-offset-4 hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="space-y-2">
            {openSquawks.slice(0, 5).map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-md border border-border bg-card/40 px-4 py-2.5"
              >
                <span className="text-sm">{s.title}</span>
                {s.severity && (
                  <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    {s.severity}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
