"use client";

import { useState, useTransition } from "react";
import { createService } from "@/app/actions/services";
import { CATEGORIES } from "@/lib/categories";
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

export function ServiceForm({
  intervals,
}: {
  intervals: { id: string; name: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    const input = {
      date: String(fd.get("date") ?? ""),
      description: String(fd.get("description") ?? ""),
      vendor: String(fd.get("vendor") ?? ""),
      category: String(fd.get("category") ?? ""),
      tachAtService: String(fd.get("tachAtService") ?? ""),
      satisfiesIntervalId: String(fd.get("satisfiesIntervalId") ?? ""),
    };
    startTransition(async () => {
      try {
        await createService(input);
        form.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to log service");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log a service</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="svc-date">Date</Label>
            <Input id="svc-date" name="date" type="date" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="svc-tach">Tach at service</Label>
            <Input
              id="svc-tach"
              name="tachAtService"
              type="number"
              step="0.1"
              placeholder="optional"
            />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="svc-desc">Description</Label>
            <Input
              id="svc-desc"
              name="description"
              required
              placeholder="e.g. oil change, annual inspection"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="svc-vendor">Vendor</Label>
            <Input id="svc-vendor" name="vendor" placeholder="optional" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="svc-cat">Category</Label>
            <select id="svc-cat" name="category" className={selectClass} defaultValue="">
              <option value="">—</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          {intervals.length > 0 && (
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="svc-interval">Marks interval complete</Label>
              <select
                id="svc-interval"
                name="satisfiesIntervalId"
                className={selectClass}
                defaultValue=""
              >
                <option value="">— none —</option>
                {intervals.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center gap-3 sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Logging…" : "Log service"}
            </Button>
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
