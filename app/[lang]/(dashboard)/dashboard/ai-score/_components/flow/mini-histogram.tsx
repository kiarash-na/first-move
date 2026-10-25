import { levelFill } from "./level-ramp"

/**
 * Jev's five level probabilities as a tiny column chart inside a node (decoration for sighted
 * readers; the node's text and its detail carry the same numbers). One column per level, filled
 * on the level ramp, grown from a shared baseline; a 1px floor keeps empty levels visible.
 */
export function MiniHistogram({ probabilities }: { probabilities: readonly number[] }) {
  const height = 18
  return (
    <svg data-slot="mini-histogram" width={24} height={height} viewBox={`0 0 24 ${height}`} aria-hidden="true" className="shrink-0">
      {probabilities.map((p, level) => {
        const h = Math.max(1, Math.round(p * height))
        return <rect key={level} data-level={level} x={level * 5} y={height - h} width={4} height={h} fill={levelFill(level)} />
      })}
    </svg>
  )
}
