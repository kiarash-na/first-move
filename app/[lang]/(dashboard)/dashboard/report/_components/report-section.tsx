import { useId, type ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * One part of the report: a title with its module colour on the rule (cyan Quick Check, orange
 * Business Plan, DESIGN-TOKENS §1), an optional lead and the content. `pageBreak` starts it on a
 * new printed page.
 */
export function ReportSection({
  title,
  lead,
  tone = "neutral",
  pageBreak = false,
  children,
}: {
  title: string
  lead?: string
  tone?: "cool" | "hot" | "neutral"
  pageBreak?: boolean
  children: ReactNode
}) {
  const titleId = useId()
  return (
    <section
      aria-labelledby={titleId}
      data-slot="report-section"
      className={cn("flex flex-col gap-6", pageBreak && "print:break-before-page")}
    >
      <header
        className={cn(
          "flex flex-col gap-2 border-t-2 pt-4 break-after-avoid",
          tone === "cool" && "border-primary",
          tone === "hot" && "border-hot",
          tone === "neutral" && "border-foreground",
        )}
      >
        <h2 id={titleId} className="text-2xl leading-tight font-[590] tracking-[-0.04em] [font-stretch:84%]">
          {title}
        </h2>
        {lead && <p className="max-w-[68ch] text-sm leading-relaxed text-text-secondary">{lead}</p>}
      </header>
      {children}
    </section>
  )
}
