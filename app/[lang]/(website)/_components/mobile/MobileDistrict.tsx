/**
 * The mobile hero's visual (D-LM-3): a static isometric district drawn as inline SVG instead of
 * the desktop's 3D scene. Buildings on a ground plate, the cyan and the orange loop of the
 * bidirectional low-temperature network with a crossing in the middle, the local source at the
 * orange corner. The flow dashes move along the loops only without reduced motion (`mobile.css`).
 */

/** Isometric projection: district units to viewBox pixels (400 × 300, centre 200 × 150). */
const A = 24
const B = 14
const project = (x: number, z: number): [number, number] => [200 + (x - z) * A, 150 + (x + z) * B]

/** Buildings as [x, z, height]; drawn back to front. */
const BUILDINGS: readonly [number, number, number][] = [
  [-2.3, -2.3, 54],
  [-1.1, -2.5, 40],
  [1.4, -2.4, 72],
  [2.4, -1.2, 48],
  [-2.4, 1.2, 34],
  [-1.2, 2.3, 56],
  [1.2, 1.3, 66],
  [2.3, 2.4, 42],
]

const HALF = 0.55
const W = 2 * A * HALF
const D = 2 * B * HALF

function diamond(size: number): string {
  const [tx, ty] = project(-size, -size)
  const [rx, ry] = project(size, -size)
  const [bx, by] = project(size, size)
  const [lx, ly] = project(-size, size)
  return `M${tx} ${ty}L${rx} ${ry}L${bx} ${by}L${lx} ${ly}Z`
}

function Building({ x, z, height }: { x: number; z: number; height: number }) {
  const [cx, cy] = project(x, z)
  const top = cy - height
  return (
    <g>
      <path className="m-district__left" d={`M${cx - W} ${top}L${cx} ${top + D}L${cx} ${cy + D}L${cx - W} ${cy}Z`} />
      <path className="m-district__right" d={`M${cx} ${top + D}L${cx + W} ${top}L${cx + W} ${cy}L${cx} ${cy + D}Z`} />
      <path className="m-district__roof" d={`M${cx} ${top - D}L${cx + W} ${top}L${cx} ${top + D}L${cx - W} ${top}Z`} />
    </g>
  )
}

export function MobileDistrict({ label }: { label: string }) {
  const cool = diamond(3)
  const hot = diamond(2.5)
  const [crossLeftX, crossLeftY] = project(-3, 0)
  const [crossRightX, crossRightY] = project(3, 0)
  const [crossTopX, crossTopY] = project(0, -3)
  const [crossBottomX, crossBottomY] = project(0, 3)
  const [sourceX, sourceY] = project(2.5, -2.5)
  const sorted = [...BUILDINGS].sort((first, second) => first[0] + first[1] - (second[0] + second[1]))

  return (
    <svg className="m-district" viewBox="0 0 400 300" role="img" aria-label={label}>
      <path className="m-district__ground" d={diamond(3.75)} />
      <g className="m-district__grid">
        {[-2.5, -1.25, 0, 1.25, 2.5].map((offset) => {
          const [ax, ay] = project(offset, -3.75)
          const [bx, by] = project(offset, 3.75)
          const [cx, cy] = project(-3.75, offset)
          const [dx, dy] = project(3.75, offset)
          return <path key={offset} d={`M${ax} ${ay}L${bx} ${by}M${cx} ${cy}L${dx} ${dy}`} />
        })}
      </g>

      <path className="m-district__pipe m-district__pipe--cool" d={`${cool}M${crossLeftX} ${crossLeftY}L${crossRightX} ${crossRightY}`} />
      <path className="m-district__pipe m-district__pipe--hot" d={`${hot}M${crossTopX} ${crossTopY}L${crossBottomX} ${crossBottomY}`} />
      <path className="m-district__flow m-district__flow--cool" d={cool} />
      <path className="m-district__flow m-district__flow--hot" d={hot} />

      {sorted.map(([x, z, height]) => <Building key={`${x}:${z}`} x={x} z={z} height={height} />)}

      <rect className="m-district__node m-district__node--cool" x={196} y={146} width={8} height={8} />
      <rect className="m-district__glow" x={sourceX - 10} y={sourceY - 10} width={20} height={20} />
      <rect className="m-district__node m-district__node--hot" x={sourceX - 4} y={sourceY - 4} width={8} height={8} />
    </svg>
  )
}
