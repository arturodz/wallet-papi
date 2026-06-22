"use client";

import { useState, useTransition } from "react";
import { updateAircraft } from "@/app/actions/aircraft";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface AircraftDefaults {
  id: string;
  tailNumber: string;
  currentTach: number;
  acquiredDate: string | null;
  acquisitionTach: number | null;
}

export function AircraftForm({ aircraft }: { aircraft: AircraftDefaults }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const input = {
      tailNumber: String(fd.get("tailNumber") ?? aircraft.tailNumber),
      currentTach: String(fd.get("currentTach") ?? ""),
      acquiredDate: String(fd.get("acquiredDate") ?? ""),
      acquisitionTach: String(fd.get("acquisitionTach") ?? ""),
    };
    startTransition(async () => {
      try {
        await updateAircraft(aircraft.id, input);
        setMsg("Saved.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ownership &amp; hours</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="tailNumber" value={aircraft.tailNumber} />
          <div className="grid gap-1.5">
            <Label htmlFor="ac-acqtach">Acquisition tach</Label>
            <Input
              id="ac-acqtach"
              name="acquisitionTach"
              type="number"
              step="0.1"
              defaultValue={aircraft.acquisitionTach ?? ""}
              placeholder="tach at purchase"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ac-acqdate">Acquired date</Label>
            <Input
              id="ac-acqdate"
              name="acquiredDate"
              type="date"
              defaultValue={aircraft.acquiredDate ?? ""}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ac-curtach">Current tach</Label>
            <Input
              id="ac-curtach"
              name="currentTach"
              type="number"
              step="0.1"
              defaultValue={aircraft.currentTach}
            />
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
            {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
