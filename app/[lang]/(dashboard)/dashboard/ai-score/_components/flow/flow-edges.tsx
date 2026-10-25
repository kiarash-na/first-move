"use client"

import { useId, useLayoutEffect, useRef, useState } from "react"

import { edgePath, relativeBox } from "./edge-path"
import { nodeKey, type FlowEdge } from "./flow-model"

interface DrawnEdge {
  key: string
  d: string
}

const same = (a: readonly DrawnEdge[], b: readonly DrawnEdge[]) => a.length === b.length && a.every((edge, index) => edge.key === b[index].key && edge.d === b[index].d)

/**
 * The edges from each branch to the follow-up check it opened, drawn in SVG over the graph and
 * measured from the nodes' boxes inside the SVG's parent (again on every resize, so they follow
 * the stacked layout on narrow screens). Put it last inside the positioned element that holds the
 * nodes. Decoration for sighted readers: the relation is also in each node's detail
 * and in the table view.
 */
export function FlowEdges({ edges, layoutKey }: { edges: readonly FlowEdge[]; layoutKey: string }) {
  const svg = useRef<SVGSVGElement>(null)
  const [drawn, setDrawn] = useState<DrawnEdge[]>([])
  const markerId = `flow-arrow-${useId().replace(/[^A-Za-z0-9_-]/g, "")}`
  const edgesKey = edges.map((edge) => `${edge.from}>${edge.to}`).join(",")

  useLayoutEffect(() => {
    const root = svg.current?.parentElement
    if (!root) return
    const pairs = edgesKey ? edgesKey.split(",").map((pair) => pair.split(">") as [string, string]) : []
    const measure = () => {
      const box = root.getBoundingClientRect()
      const next = pairs.flatMap(([from, to]) => {
        const source = root.querySelector(`[data-flow-node="${nodeKey("branch", from)}"]`)
        const target = root.querySelector(`[data-flow-node="${nodeKey("gate", to)}"]`)
        if (!source || !target) return []
        return [{ key: `${from}>${to}`, d: edgePath(relativeBox(source.getBoundingClientRect(), box), relativeBox(target.getBoundingClientRect(), box)) }]
      })
      setDrawn((previous) => (same(previous, next) ? previous : next))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    window.addEventListener("resize", measure)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [edgesKey, layoutKey])

  return (
    <svg ref={svg} data-slot="flow-edges" aria-hidden="true" className="pointer-events-none absolute inset-0 size-full overflow-visible">
      <defs>
        <marker id={markerId} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0 0 L8 4 L0 8 z" fill="var(--muted-foreground)" />
        </marker>
      </defs>
      {drawn.map((edge) => (
        <path key={edge.key} data-edge={edge.key} d={edge.d} fill="none" stroke="var(--muted-foreground)" strokeWidth={1.5} strokeLinecap="round" markerEnd={`url(#${markerId})`} />
      ))}
    </svg>
  )
}
