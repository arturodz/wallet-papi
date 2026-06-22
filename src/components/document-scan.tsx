"use client";

import { useRef, useState, useTransition } from "react";
import { uploadAndExtract } from "@/app/actions/documents";
import type { Extraction } from "@/lib/extraction";
import { Button } from "@/components/ui/button";

export interface DocumentScanProps {
  /** From server: blob storage available? When false, upload is disabled. */
  blobEnabled: boolean;
  /** From server: Gemini extraction available? When false, upload still works. */
  aiEnabled: boolean;
  /** Called after a successful upload with extracted fields + the blob URL. */
  onExtracted?: (fields: Extraction, blobUrl: string) => void;
}

/**
 * Camera/file capture + extracted-field preview. Renders cleanly in its disabled
 * ("blob off") and "AI off" states — the default when neither key is set. Reads
 * NO process.env: availability is passed in as props from a server component.
 */
export function DocumentScan({
  blobEnabled,
  aiEnabled,
  onExtracted,
}: DocumentScanProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Extraction | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setFields(null);

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      try {
        const { blobUrl, fields } = await uploadAndExtract(formData);
        setFields(fields);
        onExtracted?.(fields, blobUrl);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setError(
          msg === "BLOB_NOT_CONFIGURED"
            ? "Document storage is not configured."
            : msg,
        );
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  const extractedRows = fields
    ? (
        [
          ["Date", fields.date],
          ["Vendor", fields.vendor],
          ["Amount", fields.amount ? `$${fields.amount}` : undefined],
          ["Hours", fields.hours != null ? String(fields.hours) : undefined],
          ["Description", fields.description],
          ["Type", fields.docType],
        ] as const
      ).filter(([, v]) => v != null && v !== "")
    : [];

  return (
    <div className="space-y-2 rounded-md border border-border p-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFileChange}
        disabled={!blobEnabled || pending}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!blobEnabled || pending}
          onClick={() => inputRef.current?.click()}
        >
          {pending ? "Scanning…" : "Scan document"}
        </Button>

        {!blobEnabled && (
          <span className="text-xs text-muted-foreground">
            Upload disabled — set BLOB_READ_WRITE_TOKEN
          </span>
        )}
        {blobEnabled && !aiEnabled && (
          <span className="text-xs text-muted-foreground">
            AI extraction off — set GEMINI_API_KEY
          </span>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {fields && extractedRows.length === 0 && (
        <p className="text-xs text-muted-foreground">
          {aiEnabled
            ? "No fields could be extracted. Uploaded anyway."
            : "Uploaded. AI extraction is off."}
        </p>
      )}

      {extractedRows.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {extractedRows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {label}
              </dt>
              <dd className="font-mono">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
