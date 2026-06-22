"use client";

import { useTransition } from "react";
import { deleteExpense } from "@/app/actions/expenses";
import { Button } from "@/components/ui/button";

export function DeleteExpenseButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => deleteExpense(id))}
    >
      {pending ? "…" : "Delete"}
    </Button>
  );
}
