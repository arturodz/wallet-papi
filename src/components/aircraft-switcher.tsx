"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setActiveAircraft } from "@/app/actions/aircraft";

export type AircraftOption = { id: string; tailNumber: string };

/**
 * Compact plane picker shown in the nav. Switching writes the activeAircraftId
 * cookie via setActiveAircraft, then refreshes so every scoped page re-reads.
 */
export function AircraftSwitcher({
  aircraft,
  activeId,
  className,
}: {
  aircraft: AircraftOption[];
  activeId: string | null;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (aircraft.length === 0) return null;

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    if (!id || id === activeId) return;
    startTransition(async () => {
      await setActiveAircraft(id);
      router.refresh();
    });
  }

  return (
    <select
      aria-label="Active aircraft"
      value={activeId ?? ""}
      onChange={onChange}
      disabled={pending}
      className={
        "h-9 w-full rounded-md border border-border bg-card/60 px-2 font-mono text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 " +
        (className ?? "")
      }
    >
      {aircraft.map((a) => (
        <option key={a.id} value={a.id}>
          {a.tailNumber}
        </option>
      ))}
    </select>
  );
}
