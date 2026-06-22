"use client";

import { useState, useTransition } from "react";
import { createInterval } from "@/app/actions/intervals";
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

export function IntervalForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState("calendar");

  const needsMonths = kind === "calendar" || kind === "both";
  const needsHours = kind === "hours" || kind === "both";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    const input = {
      name: String(fd.get("name") ?? ""),
      kind: String(fd.get("kind") ?? "calendar"),
      intervalMonths: String(fd.get("intervalMonths") ?? ""),
      intervalHours: String(fd.get("intervalHours") ?? ""),
      lastDoneDate: String(fd.get("lastDoneDate") ?? ""),
      lastDoneHours: String(fd.get("lastDoneHours") ?? ""),
    };
    startTransition(async () => {
      try {
        await createInterval(input);
        form.reset();
        setKind("calendar");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add interval");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Define an interval</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="iv-name">Name</Label>
            <Input
              id="iv-name"
              name="name"
              required
              placeholder="e.g. Annual inspection, Oil change"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="iv-kind">Kind</Label>
            <select
              id="iv-kind"
              name="kind"
              className={selectClass}
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              <option value="calendar">Calendar (months)</option>
              <option value="hours">Engine hours</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div className="hidden sm:block" aria-hidden />
          {needsMonths && (
            <div className="grid gap-1.5">
              <Label htmlFor="iv-months">Interval (months)</Label>
              <Input
                id="iv-months"
                name="intervalMonths"
                type="number"
                step="1"
                min="1"
                placeholder="e.g. 12"
              />
            </div>
          )}
          {needsHours && (
            <div className="grid gap-1.5">
              <Label htmlFor="iv-hours">Interval (hours)</Label>
              <Input
                id="iv-hours"
                name="intervalHours"
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g. 50"
              />
            </div>
          )}
          {needsMonths && (
            <div className="grid gap-1.5">
              <Label htmlFor="iv-lastdate">Last done (date)</Label>
              <Input id="iv-lastdate" name="lastDoneDate" type="date" />
            </div>
          )}
          {needsHours && (
            <div className="grid gap-1.5">
              <Label htmlFor="iv-lasthours">Last done (tach hours)</Label>
              <Input
                id="iv-lasthours"
                name="lastDoneHours"
                type="number"
                step="0.1"
                placeholder="optional"
              />
            </div>
          )}
          <div className="flex items-center gap-3 sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Add interval"}
            </Button>
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
