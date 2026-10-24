import { cn } from "@/lib/utils"

export interface BulletTick {
  /** Position on the scale, same unit as `value`. */
  at: number
  /** Already formatted (numbers go through `lib/i18n/format`); empty = a band edge without a label (no room). */
  label: string
}

const WIDTH = 300
const HEIGHT = 24

/**
 * A bullet bar in plain SVG (D-18): grey qualitative bands between the ticks, the measure as a
 * thin bar in the signal colour, and a heavier mark at the target. Decorative: the value is
 * always given as text next to it, so the SVG is hidden from assistive technology.
 */
export function BulletBar({
  value,
  max,
  ticks,
  target,
  tone,
  className,
}: {
  value: number
  max: number
  ticks: readonly BulletTick[]
  target: number
  tone: "cool" | "hot"
  className?: string
}) {
  const x = (at: number) => (Math.min(Math.max(at, 0), max) / max) * WIDTH
  const edges = [0, ...ticks.map((tick) => tick.at), max]
  // Bands get darker the closer they are to meeting the target (graduated greys, one hue).
  const shades = [0.05, 0.09, 0.14, 0.2]

  return (
    <div data-slot="bullet-bar" className={cn("flex flex-col gap-1", className)}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" aria-hidden="true" className="h-6 w-full overflow-visible">
        {edges.slice(0, -1).map((from, index) => (
          <rect
            key={from}
            data-band={index}
            x={x(from)}
            y={0}
            width={Math.max(x(edges[index + 1]) - x(from) - 2, 0)}
            height={HEIGHT}
            fill="var(--foreground)"
            fillOpacity={shades[Math.min(index, shades.length - 1)]}
          />
        ))}
        <rect
          data-measure
          x={0}
          y={HEIGHT / 2 - 4}
          width={x(value)}
          height={8}
          fill={tone === "cool" ? "var(--chart-1)" : "var(--chart-2)"}
          className="transition-[width] duration-[240ms] ease-signature"
        />
        <line data-target x1={x(target)} x2={x(target)} y1={3} y2={HEIGHT - 3} stroke="var(--foreground)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="relative h-4 font-mono text-xs text-muted-foreground tabular-nums" aria-hidden="true">
        {ticks
          .filter((tick) => tick.label)
          .map((tick) => (
            <span key={tick.at} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${(x(tick.at) / WIDTH) * 100}%` }}>
              {tick.label}
            </span>
          ))}
      </div>
    </div>
  )
}
