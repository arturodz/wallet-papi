"use client";

import { usePathname } from "next/navigation";
import { Nav } from "@/components/nav";
import type { AircraftOption } from "@/components/aircraft-switcher";

// Routes that render bare, without the app sidebar/tab-bar chrome.
const BARE_ROUTES = ["/sign-in", "/offline"];

export function AppChrome({
  children,
  aircraft = [],
  activeId = null,
}: {
  children: React.ReactNode;
  aircraft?: AircraftOption[];
  activeId?: string | null;
}) {
  const pathname = usePathname();
  if (BARE_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }
  return (
    <>
      <Nav aircraft={aircraft} activeId={activeId} />
      {/* Content offset: bottom tab bar on phone (pb-24), sidebar on md+ (pl-56). */}
      <div className="min-h-svh pb-24 md:pb-0 md:pl-56">{children}</div>
    </>
  );
}
