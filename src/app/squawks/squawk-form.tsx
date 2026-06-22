"use client";

import { useState, useTransition } from "react";
import { createSquawk } from "@/app/actions/squawks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export interface SquawkFormOption {
  id: string;
  label: string;
}

export function SquawkForm({
  equipment,
  services,
}: {
  equipment: SquawkFormOption[];
  services: SquawkFormOption[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    const input = {
      title: String(fd.get("title") ?? ""),
      description: String(fd.get("description") ?? ""),
      severity: String(fd.get("severity") ?? ""),
      status: String(fd.get("status") ?? "open"),
      openedDate: String(fd.get("openedDate") ?? ""),
      equipmentId: String(fd.get("equipmentId") ?? ""),
      resolvedByServiceId: String(fd.get("resolvedByServiceId") ?? ""),
    };
    startTransition(async () => {
      try {
        await createSquawk(input);
        form.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add squawk");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record a squawk</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="sq-title">Title</Label>
            <Input
              id="sq-title"
              name="title"
              required
              placeholder="e.g. Comm 1 intermittent, oil door latch loose"
            />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="sq-desc">Description</Label>
            <Input id="sq-desc" name="description" placeholder="optional" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sq-opened">Opened date</Label>
            <Input id="sq-opened" name="openedDate" type="date" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sq-severity">Severity</Label>
            <select
              id="sq-severity"
              name="severity"
              className={selectClass}
              defaultValue=""
            >
              <option value="">—</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="grounding">Grounding</option>
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sq-status">Status</Label>
            <select
              id="sq-status"
              name="status"
              className={selectClass}
              defaultValue="open"
            >
              <option value="open">Open</option>
              <option value="deferred">Deferred</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sq-equipment">Equipment</Label>
            <select
              id="sq-equipment"
              name="equipmentId"
              className={selectClass}
              defaultValue=""
            >
              <option value="">— none —</option>
              {equipment.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="sq-service">Resolved by service</Label>
            <select
              id="sq-service"
              name="resolvedByServiceId"
              className={selectClass}
              defaultValue=""
            >
              <option value="">— none —</option>
              {services.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Add squawk"}
            </Button>
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
