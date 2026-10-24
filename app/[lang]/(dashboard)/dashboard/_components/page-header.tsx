import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * The heading block of a dashboard page: mono eyebrow in the module's colour, the page title
 * (DESIGN-TOKENS §3 page title) and an optional lead and actions.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  tone = "neutral",
  actions,
  className,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  tone?: "neutral" | "cool" | "hot"
  actions?: ReactNode
  className?: string
}) {
  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-x-8 gap-y-5", className)}>
      <div className="flex max-w-[68ch] min-w-0 flex-col gap-2.5">
        {eyebrow && (
          <p
            className={cn(
              "font-mono text-xs tracking-[0.075em] uppercase",
              tone === "cool" && "text-primary",
              tone === "hot" && "text-hot",
              tone === "neutral" && "text-muted-foreground",
            )}
          >
            {eyebrow}
          </p>
        )}
        <h1 className="text-[clamp(28px,3vw,38px)] leading-[1.08] font-[560] tracking-[-0.045em] text-balance [font-stretch:84%]">
          {title}
        </h1>
        {description && <p className="text-base leading-relaxed text-text-secondary sm:text-[17px]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}
