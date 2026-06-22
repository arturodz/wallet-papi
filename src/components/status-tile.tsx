import { cn } from "@/lib/utils";
import { statusColor, type AnnunciatorStatus } from "@/components/status-badge";

// A glass-cockpit instrument tile: a label, a big mono value, optional sub-line,
// with a status-tinted border + glow. Neutral (slate) when no status given.
export function StatusTile({
  label,
  value,
  sub,
  status = "unknown",
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  status?: AnnunciatorStatus;
}) {
  const c = statusColor(status);
  return (
    <div
      className={cn(
        "rounded-lg border bg-card/60 p-4",
        c.border,
        c.glow,
      )}
    >
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-1 font-mono text-3xl tabular-nums leading-none", c.text)}>
        {value}
      </div>
      {sub != null && (
        <div className="mt-1.5 font-mono text-[11px] text-muted-foreground">
          {sub}
        </div>
      )}
    </div>
  );
}
