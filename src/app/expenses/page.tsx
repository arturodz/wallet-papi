import { desc } from "drizzle-orm";
import { db } from "@/db";
import { expenses, services } from "@/db/schema";
import { getCurrentProfile } from "@/lib/auth/guard";
import { canWrite, type Role } from "@/lib/auth/roles";
import { toCents, formatUSD } from "@/lib/money";
import { aiEnabled, blobEnabled } from "@/lib/env";
import { ExpenseForm } from "./expense-form";
import { DeleteExpenseButton } from "./delete-expense-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <p className="text-muted-foreground">Please sign in to continue.</p>
      </main>
    );
  }

  const writable = canWrite(profile.role as Role);
  const rows = await db.select().from(expenses).orderBy(desc(expenses.date));
  const serviceRows = await db
    .select({ id: services.id, date: services.date, description: services.description })
    .from(services)
    .orderBy(desc(services.date));
  const serviceLabel = new Map(
    serviceRows.map((s) => [s.id, `${s.date} · ${s.description}`]),
  );

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="font-mono text-2xl">Expense Ledger</h1>

      {writable && (
        <ExpenseForm
          services={serviceRows}
          aiEnabled={aiEnabled()}
          blobEnabled={blobEnabled()}
        />
      )}

      {rows.length === 0 ? (
        <p className="text-muted-foreground">
          Pre-flight: no expenses recorded yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Payee</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Service</TableHead>
              <TableHead className="text-right font-mono">Amount</TableHead>
              {writable && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((x) => (
              <TableRow key={x.id}>
                <TableCell className="font-mono">{x.date}</TableCell>
                <TableCell>{x.payee ?? "—"}</TableCell>
                <TableCell>{x.category ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {x.serviceId ? serviceLabel.get(x.serviceId) ?? "—" : "—"}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatUSD(toCents(x.amount))}
                </TableCell>
                {writable && (
                  <TableCell className="text-right">
                    <DeleteExpenseButton id={x.id} />
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
