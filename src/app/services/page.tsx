import { desc } from "drizzle-orm";
import { db } from "@/db";
import { services } from "@/db/schema";
import { getCurrentProfile } from "@/lib/auth/guard";
import { canWrite, type Role } from "@/lib/auth/roles";
import { ServiceForm } from "./service-form";
import { DeleteServiceButton } from "./delete-service-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  const writable = canWrite(profile.role as Role);
  const rows = await db.select().from(services).orderBy(desc(services.date));

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="font-mono text-2xl">Maintenance Log</h1>

      {writable && <ServiceForm />}

      {rows.length === 0 ? (
        <p className="text-muted-foreground">
          Pre-flight: no services logged yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right font-mono">Tach</TableHead>
              {writable && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono">{s.date}</TableCell>
                <TableCell>{s.description}</TableCell>
                <TableCell>{s.vendor ?? "—"}</TableCell>
                <TableCell>{s.category ?? "—"}</TableCell>
                <TableCell className="text-right font-mono">
                  {s.tachAtService ?? "—"}
                </TableCell>
                {writable && (
                  <TableCell className="text-right">
                    <DeleteServiceButton id={s.id} />
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
