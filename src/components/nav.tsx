"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DollarSign,
  Gauge,
  MoreHorizontal,
  Plane,
  Radio,
  Receipt,
  StickyNote,
  Timer,
  TriangleAlert,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  activeMobileHref,
  desktopDestinations,
  isRouteActive,
  primaryMobileDestinations,
} from "@/lib/navigation";
import {
  AircraftSwitcher,
  type AircraftOption,
} from "@/components/aircraft-switcher";

type NavLink = { href: string; label: string; icon: LucideIcon };

const iconByHref: Record<string, LucideIcon> = {
  "/": Gauge,
  "/aircraft": Plane,
  "/intervals": Timer,
  "/services": Wrench,
  "/expenses": Receipt,
  "/squawks": TriangleAlert,
  "/equipment": Radio,
  "/tco": DollarSign,
  "/notes": StickyNote,
  "/more": MoreHorizontal,
};

const desktopLinks: NavLink[] = desktopDestinations.map((destination) => ({
  ...destination,
  icon: iconByHref[destination.href],
}));

const mobileLinks: NavLink[] = primaryMobileDestinations.map((destination) => ({
  ...destination,
  icon: iconByHref[destination.href],
}));

export function Nav({
  aircraft = [],
  activeId = null,
}: {
  aircraft?: AircraftOption[];
  activeId?: string | null;
}) {
  const pathname = usePathname() ?? "/";
  const activeMobileTab = activeMobileHref(pathname);

  return (
    <>
      {/* iPad landscape / desktop: fixed left sidebar (lg+) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-border bg-card/80 backdrop-blur lg:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <span className="flex items-center gap-1" aria-hidden>
            <span className="size-2 rounded-full bg-slate-100" />
            <span className="size-2 rounded-full bg-slate-100" />
            <span className="size-2 rounded-full bg-red-500" />
            <span className="size-2 rounded-full bg-red-500" />
          </span>
          <span className="font-mono text-sm font-semibold tracking-tight">
            WALLET&nbsp;PAPI
          </span>
        </div>
        <div className="px-3 pb-2">
          <AircraftSwitcher aircraft={aircraft} activeId={activeId} />
        </div>
        <nav aria-label="Primary navigation" className="flex flex-1 flex-col gap-1 px-3 py-2">
          {desktopLinks.map((l) => {
            const active = isRouteActive(pathname, l.href);
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Phone and iPad portrait: safe-area-aware top bar */}
      <header
        className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-card/95 px-4 pb-3 lg:hidden"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)",
          paddingLeft: "calc(env(safe-area-inset-left) + 1rem)",
          paddingRight: "calc(env(safe-area-inset-right) + 1rem)",
        }}
      >
        <span className="flex items-center gap-1" aria-hidden>
          <span className="size-2 rounded-full bg-slate-100" />
          <span className="size-2 rounded-full bg-slate-100" />
          <span className="size-2 rounded-full bg-red-500" />
          <span className="size-2 rounded-full bg-red-500" />
        </span>
        <span className="font-mono text-sm font-semibold tracking-tight">
          WALLET&nbsp;PAPI
        </span>
        <div className="ml-auto w-32">
          <AircraftSwitcher aircraft={aircraft} activeId={activeId} />
        </div>
      </header>

      {/* Phone and iPad portrait: safe-area-aware fixed bottom tabs */}
      <nav
        aria-label="Primary navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 lg:hidden"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        <ul className="grid grid-cols-5">
          {mobileLinks.map((l) => {
            const active = activeMobileTab === l.href;
            const Icon = l.icon;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-1.5 text-[11px] transition-colors active:bg-muted/60",
                    active
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn("size-5 shrink-0", active && "text-primary")}
                    aria-hidden
                  />
                  <span className="leading-none">{l.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
