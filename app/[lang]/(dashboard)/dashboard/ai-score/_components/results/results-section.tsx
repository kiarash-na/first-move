import { useId, type ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * The frame of one part of the saved result: a card with the orange rule of the Business Plan
 * (DESIGN-TOKENS §1), a title, an optional lead, actions on the right and the body.
 */
export function ResultsSection({
  id,
  title,
  lead,
  actions,
  children,
  className,
  ...data
}: {
  id?: string
  title: ReactNode
  lead?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
} & { [key: `data-${string}`]: string | boolean | undefined }) {
  const titleId = useId()
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn("relative flex scroll-mt-24 flex-col gap-5 border bg-card p-5 before:absolute before:inset-x-0 before:-top-px before:h-0.5 before:bg-hot sm:p-6", className)}
      {...data}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 flex-1 basis-64 flex-col gap-1">
          <h3 id={titleId} className="text-lg leading-tight font-[560] tracking-[-0.03em] [font-stretch:86%]">
            {title}
          </h3>
          {lead && <p className="max-w-[72ch] text-sm leading-snug text-muted-foreground">{lead}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </header>
      {children}
    </section>
  )
}
