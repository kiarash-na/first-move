import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * A primary key number (D-06): large icon, label, the value in display size with a small unit,
 * and a status or note line. `info` is the "How we calculate" popover of the number (D-33).
 * Icons follow the brand roles: orange = heating, cyan = cooling and money.
 */
export function KpiCard({
  id,
  icon: Icon,
  tone,
  label,
  value,
  unit,
  status,
  note,
  info,
}: {
  id: string
  icon: LucideIcon
  tone: "cool" | "hot"
  label: string
  /** The formatted number, shown in display size. */
  value: string
  /** Its unit (`GWh/a`, `/a`), shown smaller after the value. */
  unit?: string
  status?: ReactNode
  note?: ReactNode
  info: ReactNode
}) {
  return (
    <article data-slot="kpi-card" data-kpi={id} aria-labelledby={`kpi-${id}`} className="flex flex-col gap-4 border bg-card p-5 sm:p-6">
      <header className="flex items-start justify-between gap-3">
        <span className={cn("inline-flex size-12 shrink-0 items-center justify-center border", tone === "hot" ? "border-hot/50 text-hot" : "border-primary/50 text-primary")}>
          <Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <span className="-m-2.5 shrink-0">{info}</span>
      </header>
      <div className="flex flex-col gap-1.5">
        <h3 id={`kpi-${id}`} className="font-mono text-xs tracking-[0.075em] text-muted-foreground uppercase">
          {label}
        </h3>
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[clamp(32px,3vw,44px)] leading-none font-[560] tracking-[-0.045em] [font-stretch:84%]">{value}</span>
          {unit && <span className="font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase">{unit}</span>}
        </p>
      </div>
      {status && <div className="inline-flex items-center gap-2 text-[15px] leading-tight font-[480]">{status}</div>}
      {note && <p className="mt-auto text-sm leading-relaxed text-text-secondary">{note}</p>}
    </article>
  )
}
