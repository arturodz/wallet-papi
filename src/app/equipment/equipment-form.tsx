"use client";

import { useState, useTransition } from "react";
import { createEquipment } from "@/app/actions/equipment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function EquipmentForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    const input = {
      name: String(fd.get("name") ?? ""),
      category: String(fd.get("category") ?? ""),
      make: String(fd.get("make") ?? ""),
      model: String(fd.get("model") ?? ""),
      serial: String(fd.get("serial") ?? ""),
      installDate: String(fd.get("installDate") ?? ""),
      warrantyExpiry: String(fd.get("warrantyExpiry") ?? ""),
      notes: String(fd.get("notes") ?? ""),
    };
    startTransition(async () => {
      try {
        await createEquipment(input);
        form.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add equipment");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add equipment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="eq-name">Name</Label>
            <Input
              id="eq-name"
              name="name"
              required
              placeholder="e.g. Transponder, Garmin GTX 345"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="eq-category">Category</Label>
            <Input id="eq-category" name="category" placeholder="e.g. avionics" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="eq-make">Make</Label>
            <Input id="eq-make" name="make" placeholder="optional" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="eq-model">Model</Label>
            <Input id="eq-model" name="model" placeholder="optional" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="eq-serial">Serial</Label>
            <Input id="eq-serial" name="serial" placeholder="optional" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="eq-install">Install date</Label>
            <Input id="eq-install" name="installDate" type="date" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="eq-warranty">Warranty expiry</Label>
            <Input id="eq-warranty" name="warrantyExpiry" type="date" />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="eq-notes">Notes</Label>
            <Input id="eq-notes" name="notes" placeholder="optional" />
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Add equipment"}
            </Button>
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
