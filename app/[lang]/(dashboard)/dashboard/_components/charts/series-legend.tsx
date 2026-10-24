import { cn } from "@/lib/utils"
import type { LegendItem } from "./chart-tokens"
import { HATCH_BACKGROUND } from "./hatch-defs"

/**
 * The legend of a chart with two or more series: a square swatch (hatched where the bar is
 * hatched) and the name in text colour. Identity never rests on colour alone.
 */
export function SeriesLegend({ items, label, className }: { items: readonly LegendItem[]; label?: string; className?: string }) {
  return (
    <div data-slot="series-legend" className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", className)}>
      {label && <span className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">{label}</span>}
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
        {items.map((item) => (
          <li key={item.id} data-series={item.id} className="inline-flex items-center gap-2 text-sm text-text-secondary">
            {item.line ? (
              <span aria-hidden="true" data-shape="line" className="h-3.5 w-0.5 shrink-0" style={{ background: item.color }} />
            ) : (
              <span
                aria-hidden="true"
                className="size-3 shrink-0 border border-foreground/20"
                style={{ background: item.hatched ? HATCH_BACKGROUND : item.color }}
              />
            )}
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
