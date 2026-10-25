import type { ReactNode } from "react"

/** A labelled group of nodes inside a column ("Plan parts", "Checks", "Branches"); hidden when empty. */
export function FlowGroup({ label, items }: { label: string; items: readonly { key: string; node: ReactNode }[] }) {
  if (items.length === 0) return null
  return (
    <div data-slot="flow-group" className="flex flex-col gap-1.5">
      <p className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">{label}</p>
      <ul aria-label={label} className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.key} className="min-w-0">
            {item.node}
          </li>
        ))}
      </ul>
    </div>
  )
}
