"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteEquipment } from "@/app/actions/equipment";
import { Button } from "@/components/ui/button";

export function DeleteEquipmentButton({
  id,
  redirectTo,
}: {
  id: string;
  // When set, navigate here after a successful delete (used on the detail page).
  redirectTo?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await deleteEquipment(id);
          if (redirectTo) router.push(redirectTo);
        })
      }
    >
      {pending ? "…" : "Delete"}
    </Button>
  );
}
