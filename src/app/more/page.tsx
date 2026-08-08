import Link from "next/link";
import {
  ChevronRight,
  DollarSign,
  Plane,
  Radio,
  StickyNote,
  Timer,
  type LucideIcon,
} from "lucide-react";

import { moreDestinations } from "@/lib/navigation";

const iconByHref: Record<string, LucideIcon> = {
  "/aircraft": Plane,
  "/intervals": Timer,
  "/equipment": Radio,
  "/tco": DollarSign,
  "/notes": StickyNote,
};

export default function MorePage() {
  return (
    <main className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
      <h1 className="font-mono text-2xl tracking-tight">More</h1>

      <nav aria-label="More destinations" className="border-y border-border">
        <ul className="divide-y divide-border">
          {moreDestinations.map((destination) => {
            const Icon = iconByHref[destination.href];
            return (
              <li key={destination.href}>
                <Link
                  href={destination.href}
                  className="group flex min-h-16 items-center gap-3 py-3 transition-colors active:bg-muted/60 sm:px-2"
                >
                  <Icon
                    className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-medium">
                      {destination.label}
                    </span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {destination.description}
                    </span>
                  </span>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground/60"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </main>
  );
}
