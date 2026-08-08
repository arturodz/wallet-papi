export type NavigationDestination = {
  href: string;
  label: string;
  description?: string;
};

export const desktopDestinations = [
  { href: "/", label: "Dashboard" },
  { href: "/aircraft", label: "Aircraft" },
  { href: "/intervals", label: "Intervals" },
  { href: "/services", label: "Services" },
  { href: "/expenses", label: "Expenses" },
  { href: "/squawks", label: "Squawks" },
  { href: "/equipment", label: "Equipment" },
  { href: "/tco", label: "TCO" },
  { href: "/notes", label: "Notes" },
] as const satisfies readonly NavigationDestination[];

export const primaryMobileDestinations = [
  { href: "/", label: "Dashboard" },
  { href: "/services", label: "Services" },
  { href: "/expenses", label: "Expenses" },
  { href: "/squawks", label: "Squawks" },
  { href: "/more", label: "More" },
] as const satisfies readonly NavigationDestination[];

export const moreDestinations = [
  {
    href: "/aircraft",
    label: "Aircraft",
    description: "Identity, hours, and ownership",
  },
  {
    href: "/intervals",
    label: "Intervals",
    description: "Calendar and engine-hour limits",
  },
  {
    href: "/equipment",
    label: "Equipment",
    description: "Installed gear and warranties",
  },
  {
    href: "/tco",
    label: "Total cost",
    description: "Ownership and operating costs",
  },
  {
    href: "/notes",
    label: "Notes",
    description: "Dated aircraft notes",
  },
] as const satisfies readonly NavigationDestination[];

export function isRouteActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function activeMobileHref(pathname: string): string | null {
  const primary = primaryMobileDestinations.find(
    ({ href }) => href !== "/more" && isRouteActive(pathname, href),
  );
  if (primary) return primary.href;

  if (
    isRouteActive(pathname, "/more") ||
    moreDestinations.some(({ href }) => isRouteActive(pathname, href))
  ) {
    return "/more";
  }

  return null;
}
