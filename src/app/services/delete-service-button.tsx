"use client";

import { useTransition } from "react";
import { deleteService } from "@/app/actions/services";
import { Button } from "@/components/ui/button";

export function DeleteServiceButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => deleteService(id))}
    >
      {pending ? "…" : "Delete"}
    </Button>
  );
}
