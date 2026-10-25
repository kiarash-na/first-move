"use client"

import { Play, RotateCcw } from "lucide-react"
import { useState, type CSSProperties } from "react"

export interface FirstMoveCopy {
  line: string
  after: string
  play: string
  replay: string
  boardLabel: string
}

/** Plots of the 3 × 3 board (centres, in a 300-unit square) that hold buildings: the free points of the mark. */
const BUILDINGS = [
  { x: 250, y: 50, tone: "cool", delay: 1350 },
  { x: 250, y: 150, tone: "hot", delay: 1600 },
  { x: 250, y: 250, tone: "cool", delay: 1850 },
  { x: 150, y: 250, tone: "hot", delay: 2100 },
  { x: 150, y: 150, tone: "cool", delay: 2400 },
] as const

/** The knight's first move (D-68): up two squares from the start node, then one across. */
const MOVE = "M50 250V50H150"
/** The network the move opens: around the board, and a stub to the centre plot. */
const RING = "M150 50H250V250H50"
const STUB = "M150 250V150"
/** The whole loop, for the two flows that run in it both ways (heating and cooling share one network). */
const LOOP = "M50 250V50H250V250Z"

type Phase = "idle" | "played"

/**
 * Slide 1's interaction: "Make the first move" draws the knight's move of the First Move mark,
 * then the network it opens lights the buildings one by one. CSS transitions with delays run the
 * sequence (`presentation.css`); with reduced motion it jumps to the end.
 */
export function FirstMove({ copy }: { copy: FirstMoveCopy }) {
  const [phase, setPhase] = useState<Phase>("idle")

  const play = () => {
    if (phase === "idle") {
      setPhase("played")
      return
    }
    setPhase("idle")
    requestAnimationFrame(() => requestAnimationFrame(() => setPhase("played")))
  }

  return (
    <>
      <div className="slide__body first-move__text">
        <p className="slide-line" data-reveal style={{ "--i": 3 } as CSSProperties}>
          {copy.line}
        </p>
        <p className="first-move__after" data-phase={phase} aria-hidden={phase === "idle"}>
          {copy.after}
        </p>
        <div data-reveal style={{ "--i": 4 } as CSSProperties}>
          <button type="button" className="deck-cta" onClick={play}>
            {phase === "idle" ? copy.play : copy.replay}
            {phase === "idle" ? <Play size={18} strokeWidth={1.6} aria-hidden="true" /> : <RotateCcw size={18} strokeWidth={1.6} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <figure className="slide__visual first-move__visual" data-reveal style={{ "--i": 2 } as CSSProperties}>
        <svg className="first-move" data-phase={phase} viewBox="-24 -24 348 348" role="img" aria-label={copy.boardLabel}>
          <defs>
            <filter id="first-move-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="9" />
            </filter>
          </defs>
          <g className="first-move__grid">
            {[0, 100, 200, 300].map((at) => (
              <g key={at}>
                <line x1={at} y1={0} x2={at} y2={300} />
                <line x1={0} y1={at} x2={300} y2={at} />
              </g>
            ))}
          </g>
          <path className="first-move__pipe first-move__pipe--ring" d={RING} pathLength={100} />
          <path className="first-move__pipe first-move__pipe--stub" d={STUB} pathLength={100} />
          <path className="first-move__pipe first-move__pipe--move" d={MOVE} pathLength={100} />
          <path className="first-move__flow first-move__flow--cool" d={LOOP} />
          <path className="first-move__flow first-move__flow--hot" d={LOOP} />
          {BUILDINGS.map(({ x, y, tone, delay }) => (
            <g key={`${x}-${y}`} className="first-move__plot" data-tone={tone} style={{ "--delay": `${delay}ms` } as CSSProperties}>
              <rect className="first-move__dot" x={x - 4} y={y - 4} width={8} height={8} />
              <rect className="first-move__building" x={x - 26} y={y - 26} width={52} height={52} />
              <rect className="first-move__roof" x={x - 10} y={y - 10} width={20} height={20} />
            </g>
          ))}
          <rect className="first-move__start" x={28} y={228} width={44} height={44} />
          <rect className="first-move__glow" x={124} y={24} width={52} height={52} filter="url(#first-move-glow)" />
          <rect className="first-move__end" x={128} y={28} width={44} height={44} />
        </svg>
      </figure>
    </>
  )
}
