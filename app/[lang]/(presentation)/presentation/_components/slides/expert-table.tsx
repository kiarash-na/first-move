import type { CSSProperties, ReactNode } from "react"

export interface Seat {
  id: string
  name: string
  /** 0..1 after caps. */
  score: number
  capped: boolean
}

const CENTRE = 120
const SEAT_RADIUS = 96
const SEAT = 16

/** Seat `index` of `count` around the table, starting at the top, clockwise. */
function seatPosition(index: number, count: number) {
  const angle = (-90 + (index * 360) / count) * (Math.PI / 180)
  return { x: CENTRE + SEAT_RADIUS * Math.cos(angle), y: CENTRE + SEAT_RADIUS * Math.sin(angle) }
}

/**
 * Slide 5's table: one seat per dimension of the AI Plan Score, the score in the middle. Seats
 * light up as the run reaches them; a capped dimension lights orange (risk), the others cyan.
 */
export function ExpertTable({ seats, lit, centre, label }: { seats: readonly Seat[]; lit: number; centre: ReactNode; label: string }) {
  return (
    <figure className="expert-table" aria-label={label}>
      <svg viewBox="0 0 240 240" aria-hidden="true">
        <circle className="expert-table__rim" cx={CENTRE} cy={CENTRE} r={74} />
        <circle className="expert-table__orbit" cx={CENTRE} cy={CENTRE} r={SEAT_RADIUS} />
        <line className="expert-table__sweep" x1={CENTRE} y1={CENTRE} x2={CENTRE} y2={CENTRE - SEAT_RADIUS} />
        {seats.map((seat, index) => {
          const { x, y } = seatPosition(index, seats.length)
          return (
            <g key={seat.id} className="expert-table__seat" data-lit={index < lit || undefined} data-capped={seat.capped || undefined} style={{ "--i": index } as CSSProperties}>
              <line x1={CENTRE} y1={CENTRE} x2={x} y2={y} className="expert-table__spoke" />
              <rect x={x - SEAT / 2} y={y - SEAT / 2} width={SEAT} height={SEAT} />
            </g>
          )
        })}
      </svg>
      <div className="expert-table__centre">{centre}</div>
    </figure>
  )
}
