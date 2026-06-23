"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet";
import { FormError } from "@/components/ui/form-field";

/**
 * EntitySheet is the single create/edit surface reused by every entity page.
 *
 *  - `trigger` opens the sheet (a "+ Add" button in a list header, or a row).
 *  - One render-prop body handles BOTH modes: no record = create, record = edit.
 *  - `readOnly` (viewers) disables fields and hides Save/Delete — tapping a row
 *    just inspects it.
 *  - The submit/delete plumbing (pending state, inline error, refresh, close) is
 *    centralised here so all entities behave identically.
 */

export interface EntityFormRenderProps {
  /** Disable every field; hide actions. */
  readOnly: boolean;
  /** Stable id-prefix so field ids don't collide between open sheets. */
  idPrefix: string;
}

export interface EntitySheetProps {
  /** Entity name shown as the header kicker, e.g. "Service". */
  kicker: string;
  /** Element that opens the sheet. */
  trigger: React.ReactNode;
  /** True when this sheet edits an existing record (changes title + verbs). */
  isEdit: boolean;
  readOnly: boolean;
  /** Collect FormData -> plain input object for the server action. */
  onSubmit: (form: HTMLFormElement) => Promise<void>;
  /** Optional delete handler (edit mode, editors only). */
  onDelete?: () => Promise<void>;
  /** Render the fields. */
  children: (props: EntityFormRenderProps) => React.ReactNode;
  /** Verb for the primary button, e.g. "Log service" / "Add expense". */
  saveLabel?: string;
  /** Override the header title; defaults to `${isEdit ? "Edit" : "New"} kicker`. */
  title?: string;
}

export function EntitySheet({
  kicker,
  trigger,
  isEdit,
  readOnly,
  onSubmit,
  onDelete,
  children,
  saveLabel,
  title,
}: EntitySheetProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [deleting, startDelete] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  // Stable id prefix per sheet instance so labels point at the right inputs.
  const idPrefix = React.useId();

  function reset() {
    setError(null);
    setConfirmingDelete(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    startTransition(async () => {
      try {
        await onSubmit(form);
        if (!isEdit) form.reset();
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function handleDelete() {
    if (!onDelete) return;
    setError(null);
    startDelete(async () => {
      try {
        await onDelete();
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete");
      }
    });
  }

  const resolvedTitle =
    title ?? `${isEdit ? "Edit" : "New"} ${kicker.toLowerCase()}`;
  const busy = pending || deleting;

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      {trigger}
      <SheetContent>
        <SheetHeader kicker={kicker} title={readOnly ? `${kicker} details` : resolvedTitle} />
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <SheetBody className="space-y-6">
            {children({ readOnly, idPrefix })}
          </SheetBody>

          {!readOnly && (
            <SheetFooter className="flex-col items-stretch gap-3">
              <FormError message={error} />
              <div className="flex items-center gap-2">
                <Button type="submit" size="lg" disabled={busy} className="flex-1">
                  {pending ? "Saving…" : (saveLabel ?? (isEdit ? "Save changes" : "Save"))}
                </Button>
                {isEdit && onDelete && (
                  <DeleteAction
                    confirming={confirmingDelete}
                    deleting={deleting}
                    disabled={busy}
                    onArm={() => setConfirmingDelete(true)}
                    onCancel={() => setConfirmingDelete(false)}
                    onConfirm={handleDelete}
                  />
                )}
              </div>
            </SheetFooter>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
}

/** Two-step destructive action: tap once to arm, again to confirm. */
function DeleteAction({
  confirming,
  deleting,
  disabled,
  onArm,
  onCancel,
  onConfirm,
}: {
  confirming: boolean;
  deleting: boolean;
  disabled: boolean;
  onArm: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!confirming) {
    return (
      <Button
        type="button"
        variant="destructive"
        size="lg"
        disabled={disabled}
        onClick={onArm}
      >
        Delete
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <Button
        type="button"
        variant="destructive"
        size="lg"
        disabled={deleting}
        onClick={onConfirm}
        className={cn("font-medium")}
      >
        {deleting ? "Deleting…" : "Confirm"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="lg"
        disabled={deleting}
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>
  );
}
