import { cn } from "@/lib/utils";
import type { IntervalStatus, WarrantyStatus } from "@/lib/intervals";

export type AnnunciatorStatus = IntervalStatus | WarrantyStatus;

// Single source of truth for annunciator colors. Dashboard, lists, and badges
// all read from here. ok→emerald, due_soon→amber, overdue→red, unknown→slate.
export function statusColor(status: AnnunciatorStatus): {
  text: string;
  bg: string;
  border: string;
  glow: string;
  dot: string;
} {
  switch (status) {
    case "ok":
      return {
        text: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/40",
        glow: "shadow-[0_0_18px_-6px_rgba(16,185,129,0.7)]",
        dot: "bg-emerald-400",
      };
    case "due_soon":
      return {
        text: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/40",
        glow: "shadow-[0_0_18px_-6px_rgba(245,158,11,0.7)]",
        dot: "bg-amber-400",
      };
    case "overdue":
      return {
        text: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/50",
        glow: "shadow-[0_0_18px_-6px_rgba(239,68,68,0.8)]",
        dot: "bg-red-400",
      };
    default: // unknown | none
      return {
        text: "text-slate-400",
        bg: "bg-slate-500/10",
        border: "border-slate-500/30",
        glow: "",
        dot: "bg-slate-400",
      };
  }
}

const LABELS: Record<AnnunciatorStatus, string> = {
  ok: "OK",
  due_soon: "DUE SOON",
  overdue: "OVERDUE",
  unknown: "UNKNOWN",
  none: "NONE",
};

export function StatusBadge({
  status,
  className,
}: {
  status: AnnunciatorStatus;
  className?: string;
}) {
  const c = statusColor(status);
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
