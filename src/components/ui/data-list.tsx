"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { SheetTrigger } from "@/components/ui/sheet";

/**
 * List-page primitives shared by every entity so the surfaces feel identical:
 * a header with title + "+ Add" trigger, tappable rows that open the edit
 * sheet, and a teaching empty state.
 */

/** Page header: mono title on the left, "+ Add" trigger on the right. */
export function ListHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h1 className="font-mono text-2xl tracking-tight">{title}</h1>
      {children}
    </div>
  );
}

/**
 * The "+ Add <thing>" button. It IS the sheet trigger, so it lives inside a
 * <Sheet> (rendered by the entity's create EntitySheet). base-ui's Trigger
 * renders our styled button via `render`.
 */
export function AddTrigger({ label }: { label: string }) {
  return (
    <SheetTrigger
      render={
        <button
          type="button"
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      }
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="size-4"
        aria-hidden
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
      {label}
    </SheetTrigger>
  );
}

/**
 * A tappable list row that opens its edit sheet. Whole row is the trigger so
 * it's a big phone-friendly target. `meta` (right side) is for a badge/status.
 */
export function Row({
  children,
  meta,
  readOnly,
}: {
  children: React.ReactNode;
  meta?: React.ReactNode;
  /** Viewers still open the sheet (read-only); affordance copy differs. */
  readOnly?: boolean;
}) {
  return (
    <SheetTrigger
      render={
        <button
          type="button"
          aria-label={readOnly ? "View details" : "Edit"}
          className={cn(
            "group flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors",
            "hover:border-ring/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          )}
        />
      }
    >
      <div className="min-w-0 flex-1">{children}</div>
      {meta && <div className="flex shrink-0 items-center gap-2">{meta}</div>}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-muted-foreground"
        aria-hidden
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </SheetTrigger>
  );
}

/** Teaching empty state: "Pre-flight: no … yet — tap + to log one." */
export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
