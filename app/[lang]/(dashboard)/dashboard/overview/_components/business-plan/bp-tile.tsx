import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

/** The frame of a Business Plan tile: orange rule on top (DESIGN-TOKENS §1: orange = Business Plan / risk), icon, title, content. */
export function BpTile({ id, icon: Icon, title, children }: { id: string; icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <article
      data-slot="bp-tile"
      data-tile={id}
      aria-labelledby={`bp-${id}`}
      className="relative flex flex-col gap-4 border bg-card p-5 before:absolute before:inset-x-0 before:-top-px before:h-0.5 before:bg-hot"
    >
      <h3 id={`bp-${id}`} className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.075em] text-muted-foreground uppercase">
        <Icon className="size-4 text-hot" strokeWidth={1.6} aria-hidden="true" />
        {title}
      </h3>
      {children}
    </article>
  )
}
