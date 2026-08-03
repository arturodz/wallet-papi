"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gauge,
  Plane,
  Timer,
  Wrench,
  Receipt,
  TriangleAlert,
  Radio,
  DollarSign,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AircraftSwitcher,
  type AircraftOption,
} from "@/components/aircraft-switcher";

type NavLink = { href: string; label: string; icon: LucideIcon };

const links: NavLink[] = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/aircraft", label: "Aircraft", icon: Plane },
  { href: "/intervals", label: "Intervals", icon: Timer },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/squawks", label: "Squawks", icon: TriangleAlert },
  { href: "/equipment", label: "Equipment", icon: Radio },
  { href: "/tco", label: "TCO", icon: DollarSign },
  { href: "/notes", label: "Notes", icon: StickyNote },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav({
  aircraft = [],
  activeId = null,
}: {
  aircraft?: AircraftOption[];
  activeId?: string | null;
}) {
  const pathname = usePathname() ?? "/";

  return (
    <>
      {/* iPad / desktop: fixed left sidebar (md+) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-border bg-card/80 backdrop-blur md:flex">
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
        <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
          {links.map((l) => {
            const active = isActive(pathname, l.href);
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

      {/* Phone: top brand bar + plane switcher (md hidden) */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur md:hidden">
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

      {/* Phone: fixed bottom tab bar (md hidden), safe-area inset */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="grid grid-cols-8">
          {links.map((l) => {
            const active = isActive(pathname, l.href);
            const Icon = l.icon;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-1.5 text-[10px] transition-colors",
                    active
                      ? "text-foreground"
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
