"use client";

import { useState, useTransition } from "react";
import { createExpense } from "@/app/actions/expenses";
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

export interface ServiceOption {
  id: string;
  date: string;
  description: string;
}

export function ExpenseForm({ services }: { services: ServiceOption[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    const input = {
      date: String(fd.get("date") ?? ""),
      payee: String(fd.get("payee") ?? ""),
      amount: String(fd.get("amount") ?? ""),
      category: String(fd.get("category") ?? ""),
      notes: String(fd.get("notes") ?? ""),
      serviceId: String(fd.get("serviceId") ?? ""),
    };
    startTransition(async () => {
      try {
        await createExpense(input);
        form.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add expense");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add an expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="exp-date">Date</Label>
            <Input id="exp-date" name="date" type="date" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="exp-amount">Amount (USD)</Label>
            <Input
              id="exp-amount"
              name="amount"
              inputMode="decimal"
              pattern="\d+(\.\d{1,2})?"
              placeholder="1234.56"
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="exp-payee">Payee</Label>
            <Input id="exp-payee" name="payee" placeholder="optional" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="exp-cat">Category</Label>
            <select id="exp-cat" name="category" className={selectClass} defaultValue="">
              <option value="">—</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="exp-notes">Notes</Label>
            <Input id="exp-notes" name="notes" placeholder="optional" />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="exp-svc">Link to service</Label>
            <select id="exp-svc" name="serviceId" className={selectClass} defaultValue="">
              <option value="">— none —</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.date} · {s.description}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Adding…" : "Add expense"}
            </Button>
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
