"use client";

import { useState, useTransition } from "react";
import { createExpense } from "@/app/actions/expenses";
import { attachDocument } from "@/app/actions/documents";
import { CATEGORIES } from "@/lib/categories";
import type { Extraction } from "@/lib/extraction";
import { DocumentScan } from "@/components/document-scan";
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

export interface ExpenseFormProps {
  services: ServiceOption[];
  aiEnabled: boolean;
  blobEnabled: boolean;
}

export function ExpenseForm({
  services,
  aiEnabled,
  blobEnabled,
}: ExpenseFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Controlled so the scan-to-prefill can populate these fields.
  const [date, setDate] = useState("");
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  // Blob URL of a scanned doc to attach to the expense once it is created.
  const [scannedBlobUrl, setScannedBlobUrl] = useState<string | null>(null);
  const [scannedDocType, setScannedDocType] =
    useState<Extraction["docType"]>(undefined);
  const [scannedJson, setScannedJson] = useState<string | null>(null);

  function onExtracted(fields: Extraction, blobUrl: string) {
    if (fields.date) setDate(fields.date);
    if (fields.vendor) setPayee(fields.vendor);
    if (fields.amount) setAmount(fields.amount);
    if (fields.description) setNotes(fields.description);
    setScannedBlobUrl(blobUrl);
    setScannedDocType(fields.docType ?? "invoice");
    setScannedJson(JSON.stringify(fields));
  }

  function resetForm() {
    setDate("");
    setPayee("");
    setAmount("");
    setNotes("");
    setScannedBlobUrl(null);
    setScannedDocType(undefined);
    setScannedJson(null);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const input = {
      date,
      payee,
      amount,
      category: String(fd.get("category") ?? ""),
      notes,
      serviceId: String(fd.get("serviceId") ?? ""),
    };
    startTransition(async () => {
      try {
        const row = await createExpense(input);
        if (scannedBlobUrl && row?.id) {
          await attachDocument({
            blobUrl: scannedBlobUrl,
            docType: scannedDocType,
            extractedJson: scannedJson ?? undefined,
            entityType: "expense",
            entityId: row.id,
          });
        }
        resetForm();
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
      <CardContent className="space-y-4">
        <DocumentScan
          aiEnabled={aiEnabled}
          blobEnabled={blobEnabled}
          onExtracted={onExtracted}
        />
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="exp-date">Date</Label>
            <Input
              id="exp-date"
              name="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
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
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="exp-payee">Payee</Label>
            <Input
              id="exp-payee"
              name="payee"
              placeholder="optional"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
            />
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
            <Input
              id="exp-notes"
              name="notes"
              placeholder="optional"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
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
            {scannedBlobUrl && (
              <span className="text-xs text-muted-foreground">
                Scanned document will be attached.
              </span>
            )}
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
