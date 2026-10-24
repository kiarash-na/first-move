import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

/**
 * A secondary number: icon and label, the value, one line of context. Smaller than a KPI card and
 * without a heavy frame; `info` is the "How we calculate" popover (D-33).
 */
export function MetricTile({
  id,
  icon: Icon,
  label,
  value,
  unit,
  detail,
  info,
}: {
  id: string
  icon: LucideIcon
  label: string
  value: string
  unit?: string
  detail?: ReactNode
  info: ReactNode
}) {
  return (
    <article data-slot="metric-tile" data-tile={id} aria-labelledby={`tile-${id}`} className="relative flex min-w-0 flex-col gap-2 border bg-card p-4">
      <header className="pr-5">
        <h3 id={`tile-${id}`} className="inline-flex min-w-0 items-start gap-2 pt-0.5 font-mono text-xs leading-snug tracking-[0.06em] text-muted-foreground uppercase [overflow-wrap:anywhere]">
          <Icon className="mt-px size-4 shrink-0 text-primary" strokeWidth={1.6} aria-hidden="true" />
          {label}
        </h3>
        {/* In the corner, out of the label's flow: the 44px target never widens a narrow tile (320px reflow). */}
        <span className="absolute top-0 right-0">{info}</span>
      </header>
      <p className="flex flex-wrap items-baseline gap-x-1.5">
        <span className="text-[26px] leading-none font-[540] tracking-[-0.04em] [font-stretch:86%]">{value}</span>
        {unit && <span className="font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase">{unit}</span>}
      </p>
      {detail && <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-snug text-text-secondary">{detail}</div>}
    </article>
  )
}
