import { eq } from "drizzle-orm";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { getCurrentProfile } from "@/lib/auth/guard";
import { getActiveAircraftId } from "@/lib/aircraft";
import { NoAircraft } from "@/components/no-aircraft";
import { canWrite, type Role } from "@/lib/auth/roles";
import { ListHeader, EmptyState } from "@/components/ui/data-list";
import { AddNoteSheet, NoteRow, type NoteRecord } from "./note-form";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
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
  const rows = await db.select().from(notes).where(eq(notes.aircraftId, activeId));

  // Newest first.
  const sorted = [...rows].sort((a, b) => b.date.localeCompare(a.date));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <ListHeader title="Notes">
        {writable && <AddNoteSheet readOnly={false} today={today} />}
      </ListHeader>

      {sorted.length === 0 ? (
        <EmptyState>No notes yet — jot down anything worth remembering.</EmptyState>
      ) : (
        <ul className="space-y-2">
          {sorted.map((n) => {
            const record: NoteRecord = { id: n.id, date: n.date, text: n.text };
            return (
              <li key={n.id}>
                <NoteRow record={record} readOnly={!writable}>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                      {n.date}
                    </span>
                  </div>
                  <div className="mt-0.5 text-sm whitespace-pre-wrap">
                    {n.text}
                  </div>
                </NoteRow>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
