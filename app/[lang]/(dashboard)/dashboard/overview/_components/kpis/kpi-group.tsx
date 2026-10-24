import type { ReactNode } from "react"

/** A labelled group of KPI cards (Energy, Economics) under a small mono heading. */
export function KpiGroup({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-3">
      <h3 id={id} className="font-mono text-xs tracking-[0.075em] text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </div>
  )
}
