"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";

/**
 * Slide-over "sheet" built on the base-ui Dialog primitive (focus trap, scroll
 * lock, escape-to-close, ARIA all handled for us). It enters from the RIGHT on
 * md+ and as a BOTTOM SHEET on phones. Used for create + edit across every
 * entity so the whole app feels like one instrument.
 *
 * Animation: the Popup keeps mounting through its exit, exposing
 * data-starting-style / data-ending-style; we drive a single transform+opacity
 * transition off those (no width/height/padding animation, no bounce). Motion
 * is gated behind `motion-safe:` so `prefers-reduced-motion` users get an
 * instant, jump-cut open/close.
 */

const Sheet = Dialog.Root;
const SheetTrigger = Dialog.Trigger;
const SheetClose = Dialog.Close;

function SheetContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Dialog.Popup>) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-[1px]",
          "transition-opacity duration-200 ease-out",
          "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
          "motion-reduce:transition-none",
        )}
      />
      <Dialog.Popup
        data-slot="sheet-content"
        className={cn(
          // shared chrome
          "fixed z-50 flex flex-col overflow-hidden bg-card text-card-foreground shadow-2xl outline-none",
          "border-border",
          // phone: bottom sheet
          "inset-x-0 bottom-0 max-h-[calc(100dvh_-_env(safe-area-inset-top)_-_0.5rem)] rounded-t-2xl border-t",
          // lg+: right side panel
          "lg:inset-y-0 lg:right-0 lg:left-auto lg:bottom-auto lg:h-dvh lg:w-full lg:max-w-md lg:max-h-none lg:rounded-none lg:border-t-0 lg:border-l",
          // entrance: phone slides up, lg+ slides in from the right
          "transition-[transform,opacity] duration-300 ease-out will-change-transform",
          "data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full",
          "lg:data-[starting-style]:translate-y-0 lg:data-[ending-style]:translate-y-0",
          "lg:data-[starting-style]:translate-x-full lg:data-[ending-style]:translate-x-full",
          "data-[starting-style]:opacity-60 data-[ending-style]:opacity-60",
          "motion-reduce:transition-none",
          className,
        )}
        {...props}
      >
        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  );
}

/** Sticky header: kicker (entity), title (mode), and a close affordance. */
function SheetHeader({
  kicker,
  title,
  children,
}: {
  kicker?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pt-5 pb-4 pl-[calc(env(safe-area-inset-left)_+_1.25rem)] pr-[calc(env(safe-area-inset-right)_+_1.25rem)] lg:px-5">
      <div className="min-w-0">
        {kicker && (
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {kicker}
          </div>
        )}
        <Dialog.Title className="mt-1 truncate text-lg font-semibold leading-tight">
          {title}
        </Dialog.Title>
        {children}
      </div>
      <SheetClose
        aria-label="Close"
        className="-mr-1 -mt-1 grid size-11 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:size-8"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          className="size-4"
          aria-hidden
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </SheetClose>
    </div>
  );
}

/** Scrolling body for the form. */
function SheetBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto py-5 pl-[calc(env(safe-area-inset-left)_+_1.25rem)] pr-[calc(env(safe-area-inset-right)_+_1.25rem)] lg:px-5",
        className,
      )}
      {...props}
    />
  );
}

/** Sticky footer for the primary/secondary actions. */
function SheetFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-t border-border bg-card pt-4 pb-[calc(env(safe-area-inset-bottom)_+_1rem)] pl-[calc(env(safe-area-inset-left)_+_1.25rem)] pr-[calc(env(safe-area-inset-right)_+_1.25rem)] lg:px-5 lg:py-4",
        className,
      )}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
};
