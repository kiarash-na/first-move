import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** A flat panel for "nothing here yet" states: icon, title, text and one action. */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  tone = "neutral",
  className,
}: {
  icon: LucideIcon
  title: ReactNode
  body?: ReactNode
  action?: ReactNode
  tone?: "neutral" | "cool" | "hot"
  className?: string
}) {
  return (
    <section
      data-slot="empty-state"
      className={cn("flex flex-col items-start gap-5 border bg-card p-[clamp(22px,3vw,40px)]", className)}
    >
      <span
        className={cn(
          "inline-flex size-14 items-center justify-center border",
          tone === "cool" && "border-primary/50 text-primary",
          tone === "hot" && "border-hot/50 text-hot",
          tone === "neutral" && "text-muted-foreground",
        )}
      >
        <Icon className="size-7" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <div className="flex max-w-[58ch] flex-col gap-2">
        <h2 className="text-2xl leading-[1.15] font-[560] tracking-[-0.04em] [font-stretch:84%]">{title}</h2>
        {body && <p className="text-base leading-relaxed text-text-secondary">{body}</p>}
      </div>
      {action}
    </section>
  )
}
