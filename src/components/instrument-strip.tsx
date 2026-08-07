import { statusColor, type AnnunciatorStatus } from "@/components/status-badge";
import { cn } from "@/lib/utils";

type InstrumentReading = {
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
  status?: AnnunciatorStatus;
};

export function InstrumentStrip({
  items,
  label = "Instrument summary",
}: {
  items: InstrumentReading[];
  label?: string;
}) {
  return (
    <section
      aria-label={label}
      className={cn(
        "grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-card/60",
        items.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-4",
      )}
    >
      {items.map((item) => {
        const color = statusColor(item.status ?? "unknown");
        return (
          <div
            key={item.label}
            className={cn(
              "min-w-0 border-border p-4 odd:border-r sm:border-r sm:border-b-0 sm:last:border-r-0",
              items.length > 2 && "[&:nth-child(-n+2)]:border-b",
            )}
          >
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {item.status && (
                <span
                  className={cn("size-1.5 shrink-0 rounded-full", color.dot)}
                  aria-hidden
                />
              )}
              {item.label}
            </div>
            <div
              className={cn(
                "mt-1 font-mono text-2xl leading-none tabular-nums sm:text-3xl",
                item.status ? color.text : "text-foreground",
              )}
            >
              {item.value}
            </div>
            {item.detail != null && (
              <div className="mt-1.5 truncate font-mono text-[11px] text-muted-foreground">
                {item.detail}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
