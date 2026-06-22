import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/intervals", label: "Intervals" },
  { href: "/services", label: "Services" },
  { href: "/expenses", label: "Expenses" },
  { href: "/tco", label: "TCO" },
];

export function Nav() {
  return (
    <nav className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-4xl items-center gap-1 px-4 py-2">
        <span className="mr-3 font-mono text-sm font-semibold tracking-tight">
          WALLET&nbsp;PAPI
        </span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
