"use client";

import { useTransition } from "react";
import { deleteDocument } from "@/app/actions/documents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface DocumentRow {
  id: string;
  blobUrl: string;
  docType: "invoice" | "logbook" | "warranty" | "photo" | null;
  uploadedAt: Date | string;
}

export interface DocumentListProps {
  documents: DocumentRow[];
  /** Editor-only: show delete controls. Viewers see a read-only list. */
  writable?: boolean;
}

function DeleteDocButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      disabled={pending}
      onClick={() => startTransition(() => deleteDocument(id))}
    >
      {pending ? "…" : "Delete"}
    </Button>
  );
}

/**
 * Thumbnails + docType badges for documents attached to an entity. Delete is
 * editor-only; pass writable={false} (or omit) for the read-only viewer.
 */
export function DocumentList({ documents, writable = false }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No documents attached.</p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="space-y-1 rounded-md border border-border p-2"
        >
          <a
            href={doc.blobUrl}
            target="_blank"
            rel="noreferrer"
            className="block overflow-hidden rounded"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={doc.blobUrl}
              alt={doc.docType ?? "document"}
              className="aspect-square w-full object-cover"
            />
          </a>
          <div className="flex items-center justify-between gap-2">
            {doc.docType ? (
              <Badge variant="outline">{doc.docType}</Badge>
            ) : (
              <span className="text-xs text-muted-foreground">document</span>
            )}
            {writable && <DeleteDocButton id={doc.id} />}
          </div>
        </li>
      ))}
    </ul>
  );
}
