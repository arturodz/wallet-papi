import Link from "next/link";
import { Plane } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Shown on every scoped page when the fleet is empty. */
export function NoAircraft() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center gap-4 p-8 text-center">
      <Plane className="size-10 text-muted-foreground" aria-hidden />
      <div className="space-y-1">
        <h1 className="font-mono text-xl">No aircraft yet</h1>
        <p className="text-sm text-muted-foreground">
          Add your first aircraft to start tracking intervals, services,
          expenses, and squawks.
        </p>
      </div>
      <Button render={<Link href="/aircraft" />}>Add your first aircraft</Button>
    </main>
  );
}
