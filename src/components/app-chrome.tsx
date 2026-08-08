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
      {/* Keep phone content above the five-tab bar and iPhone Home Indicator. */}
      <div className="min-h-svh pb-[calc(5rem+env(safe-area-inset-bottom))] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] lg:p-0 lg:pl-56">
        {children}
      </div>
    </>
  );
}
