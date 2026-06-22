"use client";

import { useState, useTransition } from "react";
import { setSquawkStatus } from "@/app/actions/squawks";
import type { SquawkStatus } from "@/lib/squawks";

const selectClass =
  "h-8 rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

export function SquawkStatusControl({
  id,
  status,
}: {
  id: string;
  status: SquawkStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as SquawkStatus;
    setError(null);
    startTransition(async () => {
      try {
        await setSquawkStatus(id, next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  return (
    <span className="inline-flex items-center gap-2">
      <select
        className={selectClass}
        value={status}
        onChange={onChange}
        disabled={pending}
        aria-label="Change squawk status"
      >
        <option value="open">Open</option>
        <option value="deferred">Deferred</option>
        <option value="resolved">Resolved</option>
      </select>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </span>
  );
}
