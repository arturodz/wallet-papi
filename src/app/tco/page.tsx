import { eq } from "drizzle-orm";
import { db } from "@/db";
import { expenses } from "@/db/schema";
import { getCurrentProfile } from "@/lib/auth/guard";
import { getActiveAircraft } from "@/lib/aircraft";
import { NoAircraft } from "@/components/no-aircraft";
import { canWrite, type Role } from "@/lib/auth/roles";
import { formatUSD } from "@/lib/money";
import { computeTco, computeMonthlyBurn } from "@/lib/tco";
import { InstrumentStrip } from "@/components/instrument-strip";
import { AircraftForm } from "./aircraft-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function TcoPage() {
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
  const rows = await db
    .select()
    .from(expenses)
    .where(eq(expenses.aircraftId, plane.id));

  const tco = computeTco(rows, {
    currentTach: plane.currentTach ?? 0,
    acquisitionTach: plane.acquisitionTach ?? null,
  });

  const monthly = computeMonthlyBurn(rows).slice(-12);
  const maxMonth = Math.max(1, ...monthly.map((m) => m.totalCents));

  const categories = Object.entries(tco.byCategory).sort(
    (a, b) => b[1] - a[1],
  );
  const maxCat = Math.max(1, ...categories.map(([, c]) => c));

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <h1 className="font-mono text-2xl">Total Cost of Ownership</h1>

      <InstrumentStrip
        label="Ownership cost summary"
        items={[
          {
            label: "Lifetime total",
            value: formatUSD(tco.totalCents),
          },
          {
            label: "Cost per hour",
            value:
              tco.costPerHourCents == null ? (
                "N/A"
              ) : (
                <>
                  {formatUSD(tco.costPerHourCents)}
                  <span className="text-sm text-muted-foreground"> / hr</span>
                </>
              ),
            detail:
              tco.costPerHourCents == null
                ? "SET ACQUISITION TACH"
                : "OPERATING COSTS, EXCLUDES ACQUISITION",
          },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>By category</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-muted-foreground">
              Pre-flight: no expenses to break down yet.
            </p>
          ) : (
            <div className="space-y-2">
              {categories.map(([cat, cents]) => (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{cat}</span>
                    <span className="font-mono tabular-nums">
                      {formatUSD(cents)}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${(cents / maxCat) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly burn (last 12 months)</CardTitle>
        </CardHeader>
        <CardContent>
          {monthly.length === 0 ? (
            <p className="text-muted-foreground">
              Pre-flight: no monthly spend recorded yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="w-1/2">Burn</TableHead>
                  <TableHead className="text-right font-mono">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthly.map((m) => (
                  <TableRow key={m.month}>
                    <TableCell className="font-mono">{m.month}</TableCell>
                    <TableCell>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{
                            width: `${(m.totalCents / maxMonth) * 100}%`,
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatUSD(m.totalCents)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {writable && plane && (
        <AircraftForm
          aircraft={{
            id: plane.id,
            tailNumber: plane.tailNumber,
            currentTach: plane.currentTach,
            acquiredDate: plane.acquiredDate,
            acquisitionTach: plane.acquisitionTach,
          }}
        />
      )}
    </main>
  );
}
