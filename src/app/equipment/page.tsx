import Link from "next/link";
import { db } from "@/db";
import { equipment } from "@/db/schema";
import { getCurrentProfile } from "@/lib/auth/guard";
import { canWrite, type Role } from "@/lib/auth/roles";
import { warrantyStatus } from "@/lib/intervals";
import { StatusBadge } from "@/components/status-badge";
import { EquipmentForm } from "./equipment-form";
import { DeleteEquipmentButton } from "./delete-equipment-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function EquipmentPage() {
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
  const rows = await db.select().from(equipment);

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="font-mono text-2xl">Equipment</h1>

      {writable && <EquipmentForm />}

      {rows.length === 0 ? (
        <p className="text-muted-foreground">
          Pre-flight: no equipment recorded.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Make / Model</TableHead>
              <TableHead>Serial</TableHead>
              <TableHead>Warranty</TableHead>
              {writable && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((e) => {
              const makeModel = [e.make, e.model].filter(Boolean).join(" ");
              return (
                <TableRow key={e.id}>
                  <TableCell>
                    <Link
                      href={`/equipment/${e.id}`}
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      {e.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">{e.category ?? "—"}</TableCell>
                  <TableCell className="text-sm">{makeModel || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {e.serial ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={warrantyStatus(e.warrantyExpiry, now)} />
                  </TableCell>
                  {writable && (
                    <TableCell className="text-right">
                      <DeleteEquipmentButton id={e.id} />
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
