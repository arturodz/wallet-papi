import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { expenses, services } from "@/db/schema";
import { getCurrentProfile } from "@/lib/auth/guard";
import { getActiveAircraftId } from "@/lib/aircraft";
import { NoAircraft } from "@/components/no-aircraft";
import { canWrite, type Role } from "@/lib/auth/roles";
import { toCents, formatUSD } from "@/lib/money";
import { aiEnabled, blobEnabled } from "@/lib/env";
import { getExpenseSuggestions } from "@/lib/suggestions";
import { ListHeader, EmptyState } from "@/components/ui/data-list";
import {
  AddExpenseSheet,
  ExpenseRow,
  type ExpenseRecord,
} from "./expense-form";

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

  const activeId = await getActiveAircraftId();
  if (!activeId) return <NoAircraft />;

  const writable = canWrite(profile.role as Role);
  const rows = await db
    .select()
    .from(expenses)
    .where(eq(expenses.aircraftId, activeId))
    .orderBy(desc(expenses.date));
  const serviceRows = await db
    .select({ id: services.id, date: services.date, description: services.description })
    .from(services)
    .where(eq(services.aircraftId, activeId))
    .orderBy(desc(services.date));
  const serviceLabel = new Map(
    serviceRows.map((s) => [s.id, `${s.date} · ${s.description}`]),
  );
  const suggestions = await getExpenseSuggestions(activeId);

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <ListHeader title="Expense Ledger">
        {writable && (
          <AddExpenseSheet
            services={serviceRows}
            suggestions={suggestions}
            aiEnabled={aiEnabled()}
            blobEnabled={blobEnabled()}
            readOnly={false}
          />
        )}
      </ListHeader>

      {rows.length === 0 ? (
        <EmptyState>
          Pre-flight: no expenses recorded yet
          {writable ? " — tap + to log one." : "."}
        </EmptyState>
      ) : (
        <ul className="space-y-2">
          {rows.map((x) => {
            const record: ExpenseRecord = {
              id: x.id,
              date: x.date,
              title: x.title,
              payee: x.payee,
              amount: x.amount,
              category: x.category,
              notes: x.notes,
              serviceId: x.serviceId,
            };
            // Primary label: Title, falling back to payee then notes.
            const primary = x.title ?? x.payee ?? x.notes ?? "—";
            // When Title is the headline, surface the payee in the sub-line too.
            const sub = [
              x.title ? x.payee : null,
              x.category,
              x.serviceId ? serviceLabel.get(x.serviceId) : null,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={x.id}>
                <ExpenseRow
                  record={record}
                  services={serviceRows}
                  suggestions={suggestions}
                  readOnly={!writable}
                  meta={
                    <span className="font-mono text-sm tabular-nums">
                      {formatUSD(toCents(x.amount))}
                    </span>
                  }
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                      {x.date}
                    </span>
                    <span className="truncate text-sm font-medium">
                      {primary}
                    </span>
                  </div>
                  {sub && (
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {sub}
                    </div>
                  )}
                </ExpenseRow>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
