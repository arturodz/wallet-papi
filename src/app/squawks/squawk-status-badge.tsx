import { cn } from "@/lib/utils";
import type { SquawkStatus } from "@/lib/squawks";

// Squawk status has its OWN color semantics — deliberately NOT the interval
// annunciator map. An open squawk is not "overdue"; it is simply outstanding.
//   open → amber, deferred → slate, resolved → emerald.
const SQUAWK_COLOR: Record<SquawkStatus, { bg: string; border: string; text: string; dot: string }> = {
  open: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/40",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  deferred: {
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    text: "text-slate-400",
    dot: "bg-slate-400",
  },
  resolved: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/40",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
};

const LABELS: Record<SquawkStatus, string> = {
  open: "OPEN",
  deferred: "DEFERRED",
  resolved: "RESOLVED",
};

export function SquawkStatusBadge({
  status,
  className,
}: {
  status: SquawkStatus;
  className?: string;
}) {
  const c = SQUAWK_COLOR[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider",
        c.bg,
        c.border,
        c.text,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", c.dot)} />
      {LABELS[status]}
    </span>
  );
}
