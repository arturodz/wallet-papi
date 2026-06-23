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

export interface AircraftDetails {
  id: string;
  tailNumber: string;
  make: string | null;
  model: string | null;
  year: number | null;
  serial: string | null;
  currentTach: number;
  currentHobbs: number;
  acquiredDate: string | null;
  acquisitionTach: number | null;
}

export function AircraftDetailsForm({
  aircraft,
  readOnly,
}: {
  aircraft: AircraftDetails;
  readOnly: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const input = {
      tailNumber: String(fd.get("tailNumber") ?? ""),
      make: String(fd.get("make") ?? ""),
      model: String(fd.get("model") ?? ""),
      year: String(fd.get("year") ?? ""),
      serial: String(fd.get("serial") ?? ""),
      currentTach: String(fd.get("currentTach") ?? ""),
      currentHobbs: String(fd.get("currentHobbs") ?? ""),
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
        <CardTitle>Aircraft details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="ac-tail">Tail number</Label>
            <Input
              id="ac-tail"
              name="tailNumber"
              required
              disabled={readOnly}
              defaultValue={aircraft.tailNumber}
              placeholder="N12345"
              className="font-mono"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ac-serial">Serial number</Label>
            <Input
              id="ac-serial"
              name="serial"
              disabled={readOnly}
              defaultValue={aircraft.serial ?? ""}
              placeholder="optional"
              className="font-mono"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ac-make">Make</Label>
            <Input
              id="ac-make"
              name="make"
              disabled={readOnly}
              defaultValue={aircraft.make ?? ""}
              placeholder="e.g. Cirrus"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ac-model">Model</Label>
            <Input
              id="ac-model"
              name="model"
              disabled={readOnly}
              defaultValue={aircraft.model ?? ""}
              placeholder="e.g. SR22"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ac-year">Year</Label>
            <Input
              id="ac-year"
              name="year"
              type="number"
              disabled={readOnly}
              defaultValue={aircraft.year ?? ""}
              placeholder="e.g. 2018"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ac-curtach">Current tach</Label>
            <Input
              id="ac-curtach"
              name="currentTach"
              type="number"
              step="0.1"
              disabled={readOnly}
              defaultValue={aircraft.currentTach}
              className="font-mono"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ac-curhobbs">Current Hobbs</Label>
            <Input
              id="ac-curhobbs"
              name="currentHobbs"
              type="number"
              step="0.1"
              disabled={readOnly}
              defaultValue={aircraft.currentHobbs}
              className="font-mono"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ac-acqtach">Acquisition tach</Label>
            <Input
              id="ac-acqtach"
              name="acquisitionTach"
              type="number"
              step="0.1"
              disabled={readOnly}
              defaultValue={aircraft.acquisitionTach ?? ""}
              placeholder="tach at purchase"
              className="font-mono"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ac-acqdate">Acquired date</Label>
            <Input
              id="ac-acqdate"
              name="acquiredDate"
              type="date"
              disabled={readOnly}
              defaultValue={aircraft.acquiredDate ?? ""}
            />
          </div>
          {!readOnly && (
            <div className="flex items-center gap-3 sm:col-span-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save aircraft"}
              </Button>
              {msg && (
                <span className="text-sm text-muted-foreground">{msg}</span>
              )}
              {error && <span className="text-sm text-destructive">{error}</span>}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
