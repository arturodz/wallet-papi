import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

/**
 * Shared form-layout kit for the entity sheets, so every form reads the same:
 * sans labels + help text, monospace reserved for the inputs that are true
 * instrument readouts (tail#/serial/tach/hours/money), section headers for
 * rhythm, and one inline error slot wired to the server action's message.
 */

/** A small uppercase section header that breaks a form into groups. */
export function FormSection({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

/** Two-column responsive grid used inside a section. */
export function FormGrid({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2", className)}>
      {children}
    </div>
  );
}

/** Label + control + optional help. `span` makes the field full-width. */
export function Field({
  id,
  label,
  required,
  help,
  span,
  className,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  help?: string;
  span?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-1.5", span && "sm:col-span-2", className)}>
      <Label htmlFor={id} className="text-muted-foreground">
        <span>{label}</span>
        {required && (
          <span aria-hidden className="text-amber-400/90">
            *
          </span>
        )}
      </Label>
      {children}
      {help && <p className="text-xs text-muted-foreground/80">{help}</p>}
    </div>
  );
}

/** Native select styled to match the Input (kept native so FormData posts it). */
export const FormSelect = React.forwardRef<
  HTMLSelectElement,
  React.ComponentProps<"select">
>(function FormSelect({ className, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 lg:h-8 lg:px-2.5 lg:text-sm dark:bg-input/30",
        className,
      )}
      {...props}
    />
  );
});

/**
 * A free-text input wired to a native <datalist> of suggestions. The user can
 * always type a brand-new value (datalist only suggests, never constrains), so
 * new titles/payees/vendors flow through untouched — this never traps the user.
 *
 * Pass `options` (the suggestion strings) and an `id`; the matching <datalist>
 * is rendered and linked via the `list` attribute. Everything else (name,
 * value/onChange, defaultValue, disabled, placeholder…) forwards to the Input.
 */
export function DatalistInput({
  id,
  options,
  className,
  ...props
}: { options: readonly string[] } & React.ComponentProps<"input">) {
  const listId = `${id}-list`;
  return (
    <>
      <Input id={id} list={listId} className={className} {...props} />
      <datalist id={listId}>
        {options.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
    </>
  );
}

/** Inline server-error line (annunciator red). */
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="flex items-center gap-1.5 text-sm text-red-400"
    >
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-red-400" />
      {message}
    </p>
  );
}
