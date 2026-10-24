import { cn } from "@/lib/utils"

/** The scale ends at 150 %; the TBL-7 thresholds are marked at 70, 90 and 100 %. */
const SCALE_MAX = 1.5
const TICKS = [0.7, 0.9, 1] as const

/**
 * A bullet bar for one coverage value (fraction): 2px track, filled up to the value, ticks at
 * the TBL-7 boundaries. Decorative: the value and class are given as text next to it.
 */
export function CoverageScale({ value, supporting, className }: { value: number; supporting: boolean; className?: string }) {
  const width = Math.min(Math.max(value, 0) / SCALE_MAX, 1) * 100
  return (
    <div aria-hidden="true" data-slot="coverage-scale" className={cn("relative h-4", className)}>
      <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-input" />
      <div
        data-fill
        className={cn("absolute top-1/2 left-0 h-[3px] -translate-y-1/2 transition-[width] duration-[240ms] ease-signature", supporting ? "bg-primary" : "bg-hot")}
        style={{ width: `${width}%` }}
      />
      {TICKS.map((tick) => (
        <span key={tick} className="absolute inset-y-0 w-px bg-foreground/45" style={{ left: `${(tick / SCALE_MAX) * 100}%` }} />
      ))}
    </div>
  )
}
