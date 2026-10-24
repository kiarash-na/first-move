import { cn } from "@/lib/utils"

/**
 * A quiet line drawing of a low-temperature network (buildings linked to a shared loop), used as
 * decoration on the start screen. Cyan and orange only, 1px lines (DESIGN-TOKENS §1, §6).
 */
export function NetworkMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 160" aria-hidden="true" className={cn("pointer-events-none fill-none", className)}>
      <g className="stroke-border" strokeWidth="1">
        {[20, 60, 100, 140].map((y) => (
          <line key={`h${y}`} x1="0" x2="240" y1={y} y2={y} />
        ))}
        {[40, 80, 120, 160, 200].map((x) => (
          <line key={`v${x}`} x1={x} x2={x} y1="0" y2="160" />
        ))}
      </g>
      <path d="M40 100 H200 M80 60 V100 M160 60 V100 M120 100 V140" className="stroke-primary" strokeWidth="1.5" />
      <path d="M40 60 H120 M200 100 V140" className="stroke-hot" strokeWidth="1.5" />
      {[
        [40, 60],
        [80, 60],
        [160, 60],
        [40, 100],
        [200, 100],
        [120, 140],
        [200, 140],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 5} y={y - 5} width="10" height="10" className="fill-background stroke-foreground/70" strokeWidth="1" />
      ))}
      <rect x="114" y="54" width="12" height="12" className="fill-hot" />
    </svg>
  )
}
