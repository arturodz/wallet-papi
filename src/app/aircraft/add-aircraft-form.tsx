"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAircraft, setActiveAircraft } from "@/app/actions/aircraft";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** Editor-only: create a new aircraft, then make it the active plane. */
export function AddAircraftForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const input = {
      tailNumber: String(fd.get("tailNumber") ?? ""),
      make: String(fd.get("make") ?? ""),
      model: String(fd.get("model") ?? ""),
      year: String(fd.get("year") ?? ""),
      serial: String(fd.get("serial") ?? ""),
    };
    startTransition(async () => {
      try {
        const row = await createAircraft(input);
        if (row?.id) await setActiveAircraft(row.id);
        form.reset();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add aircraft");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add aircraft</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="add-tail">Tail number</Label>
            <Input
              id="add-tail"
              name="tailNumber"
              required
              placeholder="N12345"
              className="font-mono"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="add-serial">Serial number</Label>
            <Input
              id="add-serial"
              name="serial"
              placeholder="optional"
              className="font-mono"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="add-make">Make</Label>
            <Input id="add-make" name="make" placeholder="e.g. Cirrus" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="add-model">Model</Label>
            <Input id="add-model" name="model" placeholder="e.g. SR22" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="add-year">Year</Label>
            <Input
              id="add-year"
              name="year"
              type="number"
              placeholder="e.g. 2018"
            />
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Adding…" : "Add aircraft"}
            </Button>
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
