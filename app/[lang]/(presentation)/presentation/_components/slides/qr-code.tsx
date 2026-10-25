import { finderAt, finderOrigins, FINDER_SIZE, modulesPath, qrMatrix, QUIET_ZONE, type FinderCorner } from "@/lib/presentation/qr"

/** Finder colours: the mark's knight's move, from the cyan start node to the orange end node. */
const FINDER_TONE: Record<FinderCorner, "ink" | "cool" | "hot"> = { topLeft: "ink", topRight: "hot", bottomLeft: "cool" }

/**
 * A QR code drawn on the server: square modules on a light panel (`data-theme="light"`, so the
 * tokens give Ink, the light cyan and the light orange, all 4.5:1 or more on Paper), the four-module
 * quiet zone included. `qr.test.ts` decodes these exact colours.
 */
export function QrCode({ value, label }: { value: string; label: string }) {
  const matrix = qrMatrix(value)
  const side = matrix.size + 2 * QUIET_ZONE
  const origins = finderOrigins(matrix.size)

  return (
    <svg className="qr" data-theme="light" viewBox={`${-QUIET_ZONE} ${-QUIET_ZONE} ${side} ${side}`} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect className="qr__paper" x={-QUIET_ZONE} y={-QUIET_ZONE} width={side} height={side} />
      <path className="qr__modules" d={modulesPath(matrix, (row, col) => finderAt(matrix.size, row, col) === null)} />
      {(Object.keys(origins) as FinderCorner[]).map((corner) => {
        const [top, left] = origins[corner]
        return (
          <path
            key={corner}
            className={`qr__finder qr__finder--${FINDER_TONE[corner]}`}
            d={modulesPath(matrix, (row, col) => row >= top && row < top + FINDER_SIZE && col >= left && col < left + FINDER_SIZE)}
          />
        )
      })}
    </svg>
  )
}
