/** A node's box relative to the graph, in CSS pixels. */
export interface Box {
  left: number
  top: number
  width: number
  height: number
}

/** How far left of the nodes the edge runs when the columns are stacked. */
export const RAIL_OFFSET = 10

/**
 * The SVG path of an edge from a branch to the follow-up check it opened. Side by side (the
 * check's column is to the right): a soft curve from the branch's right edge to the check's left
 * edge. Stacked (narrow screens): a rail just left of the nodes, so it never crosses one.
 */
export function edgePath(from: Box, to: Box): string {
  const fy = from.top + from.height / 2
  const ty = to.top + to.height / 2
  const fx = from.left + from.width
  if (to.left >= fx) {
    const bend = Math.max(16, (to.left - fx) / 2)
    return `M ${fx} ${fy} C ${fx + bend} ${fy}, ${to.left - bend} ${ty}, ${to.left} ${ty}`
  }
  const rail = Math.min(from.left, to.left) - RAIL_OFFSET
  return `M ${from.left} ${fy} C ${rail} ${fy}, ${rail} ${ty}, ${to.left} ${ty}`
}

/** A box relative to a container's box. */
export function relativeBox(element: DOMRect, container: DOMRect): Box {
  return { left: element.left - container.left, top: element.top - container.top, width: element.width, height: element.height }
}
