import type { ReactNode } from "react"

/** One read-only number: label, value, and the info popover slot (D-33). */
export function QcFigure({ label, value, info, note }: { label: string; value: ReactNode; info?: ReactNode; note?: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 border-l-2 border-primary/60 pl-4">
      <dt className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">{label}</dt>
      <dd className="flex items-center gap-1">
        <span className="font-mono text-[clamp(20px,2vw,26px)] leading-tight tabular-nums">{value}</span>
        {info}
      </dd>
      {note && <dd className="text-sm text-muted-foreground">{note}</dd>}
    </div>
  )
}
