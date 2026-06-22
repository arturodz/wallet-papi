import { PlaneTakeoff } from "lucide-react";

export const metadata = {
  title: "Offline",
};

// Served by the service worker when a navigation fails offline and no cached
// copy of the requested page exists. Read-only by design: mutations need a link.
export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center gap-4 p-8 text-center">
      <PlaneTakeoff className="size-10 text-muted-foreground" aria-hidden />
      <h1 className="font-mono text-2xl">No signal</h1>
      <p className="text-muted-foreground">
        You&apos;re offline and this page isn&apos;t cached yet. Reconnect to
        log services, expenses, or squawks — Wallet PAPI needs a link to write.
      </p>
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Awaiting clearance
      </p>
    </main>
  );
}
