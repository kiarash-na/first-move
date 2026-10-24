import { useId } from "react"

import { cn } from "@/lib/utils"
import "./brand-mark.css"

/** Board points of the 3 × 3 grid (viewBox units) that the move leaves free. */
const DOTS = [
  [26, 6],
  [16, 16],
  [26, 16],
  [16, 26],
  [26, 26],
] as const

/** The move: up two squares from the start node, then one to the right (D-68). */
const MOVE = "M6 21.5V6h6.5"

/**
 * The First Move mark, "Knight's move" (D-68): on a 3 × 3 board, a pipe runs from a cyan node up
 * two squares and one across to an orange node, the knight's first move and a network link in
 * one. A pulse runs along the pipe once on load and again when the surrounding link is hovered or
 * focused, and the orange node glows, flaring as the pulse arrives. Every animation ends, and with
 * reduced motion nothing moves (`brand-mark.css`).
 * Decorative: the link around it carries the name.
 */
export function BrandMark({ className }: { className?: string }) {
  const glow = `brand-mark-glow-${useId().replace(/[^\w-]/g, "")}`

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={cn("brand-mark", className)}>
      <defs>
        <filter id={glow} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>
      {DOTS.map(([x, y]) => (
        <rect key={`${x}-${y}`} className="brand-mark__dot" x={x - 1} y={y - 1} width="2" height="2" />
      ))}
      <path className="brand-mark__pipe" d={MOVE} />
      <path className="brand-mark__pulse brand-mark__pulse--load" d={MOVE} pathLength={100} />
      <path className="brand-mark__pulse brand-mark__pulse--hover" d={MOVE} pathLength={100} />
      <rect className="brand-mark__start" x="2.5" y="22.5" width="7" height="7" />
      <rect className="brand-mark__glow" x="12" y="2" width="8" height="8" filter={`url(#${glow})`} />
      <rect className="brand-mark__end" x="12.5" y="2.5" width="7" height="7" />
    </svg>
  )
}
