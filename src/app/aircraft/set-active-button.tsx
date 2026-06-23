"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setActiveAircraft } from "@/app/actions/aircraft";
import { Button } from "@/components/ui/button";

/** Switch the active plane (allowed for any signed-in user). */
export function SetActiveButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await setActiveAircraft(id);
          router.refresh();
        })
      }
    >
      {pending ? "Switching…" : "Set active"}
    </Button>
  );
}
