"use client";

import { usePathname } from "next/navigation";
import { Nav } from "@/components/nav";

// Routes that render bare, without the app sidebar/tab-bar chrome.
const BARE_ROUTES = ["/sign-in", "/offline"];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (BARE_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }
  return (
    <>
      <Nav />
      {/* Content offset: bottom tab bar on phone (pb-24), sidebar on md+ (pl-56). */}
      <div className="min-h-svh pb-24 md:pb-0 md:pl-56">{children}</div>
    </>
  );
}
