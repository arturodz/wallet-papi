"use client";

import { useTransition } from "react";
import { deleteSquawk } from "@/app/actions/squawks";
import { Button } from "@/components/ui/button";

export function DeleteSquawkButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => deleteSquawk(id))}
    >
      {pending ? "…" : "Delete"}
    </Button>
  );
}
