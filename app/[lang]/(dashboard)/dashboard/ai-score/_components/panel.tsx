import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * A panel of the AI Plan Score page: the Business Plan's 2px orange rule on top (DESIGN-TOKENS §6),
 * a mono eyebrow, the title and its lead, then the content.
 */
export function Panel({
  id,
  eyebrow,
  title,
  lead,
  actions,
  children,
  className,
}: {
  id: string
  eyebrow?: ReactNode
  title: string
  lead?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  const headingId = `${id}-title`
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "relative flex min-w-0 scroll-mt-24 flex-col gap-6 border bg-card p-5 sm:p-[clamp(20px,3vw,40px)]",
        "before:absolute before:inset-x-0 before:-top-px before:h-0.5 before:bg-hot",
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
        <div className="flex max-w-[68ch] min-w-0 flex-col gap-2">
          {eyebrow && <span className="font-mono text-xs tracking-[0.075em] text-hot uppercase">{eyebrow}</span>}
          <h2 id={headingId} className="text-[clamp(22px,2.2vw,28px)] leading-[1.12] font-[540] tracking-[-0.035em] text-balance [font-stretch:86%]">
            {title}
          </h2>
          {lead && <p className="text-base leading-relaxed text-text-secondary">{lead}</p>}
        </div>
        {actions}
      </header>
      {children}
    </section>
  )
}
