"use client";

import { useTransition } from "react";
import { deleteInterval } from "@/app/actions/intervals";
import { Button } from "@/components/ui/button";

export function DeleteIntervalButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => deleteInterval(id))}
    >
      {pending ? "…" : "Delete"}
    </Button>
  );
}
