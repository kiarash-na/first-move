import type { ReactNode } from "react"

/** Term and value rows of a node's detail; rows without a value are left out. */
export function DetailList({ rows }: { rows: readonly (readonly [term: string, value: ReactNode | null | undefined])[] }) {
  const shown = rows.filter(([, value]) => value !== null && value !== undefined && value !== "")
  return (
    <dl data-slot="detail-list" className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5">
      {shown.map(([term, value]) => (
        <div key={term} className="contents">
          <dt className="font-mono text-xs leading-5 tracking-[0.04em] text-muted-foreground uppercase">{term}</dt>
          <dd className="text-sm leading-5">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
