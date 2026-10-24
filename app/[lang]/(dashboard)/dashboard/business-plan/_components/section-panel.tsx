import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * A panel of the Business Plan: a 2px orange rule on top (DESIGN-TOKENS §6, Business Model
 * panels use orange emphasis), a mono index, the title and its help, then the content.
 */
export function SectionPanel({
  id,
  index,
  title,
  help,
  actions,
  children,
  className,
}: {
  id?: string
  /** Position in the step, shown as `01`. */
  index?: number
  title: string
  help?: string | null
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  const headingId = id ? `${id}-title` : undefined

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "relative flex scroll-mt-24 flex-col gap-7 border bg-card p-[clamp(20px,3vw,40px)]",
        "before:absolute before:inset-x-0 before:-top-px before:h-0.5 before:bg-hot",
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
        <div className="flex max-w-[68ch] min-w-0 flex-col gap-2">
          {index !== undefined && (
            <span className="font-mono text-xs tracking-[0.075em] text-hot uppercase tabular-nums">
              {String(index).padStart(2, "0")}
            </span>
          )}
          <h2 id={headingId} className="text-[clamp(22px,2.2vw,28px)] leading-[1.12] font-[540] tracking-[-0.035em] text-balance [font-stretch:86%]">
            {title}
          </h2>
          {help && <p className="text-base leading-relaxed text-text-secondary">{help}</p>}
        </div>
        {actions}
      </header>
      {children}
    </section>
  )
}
