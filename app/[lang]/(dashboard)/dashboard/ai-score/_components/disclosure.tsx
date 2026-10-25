"use client"

import { ChevronDownIcon, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

/**
 * A quiet disclosure, collapsed by default, styled like "How we calculate" (D-33) with the
 * Business Plan's orange rule: for the explanations of computed numbers and of what is sent.
 */
export function Disclosure({
  icon: Icon,
  title,
  defaultOpen = false,
  children,
  className,
}: {
  icon: LucideIcon
  title: string
  defaultOpen?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <Collapsible data-slot="ai-disclosure" defaultOpen={defaultOpen} className={cn("group/disclosure", className)}>
      <CollapsibleTrigger className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 text-left font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase transition-colors duration-[180ms] hover:text-foreground data-[state=open]:text-hot">
        <Icon className="size-4 shrink-0" strokeWidth={1.6} aria-hidden="true" />
        {title}
        <ChevronDownIcon
          className="size-4 shrink-0 transition-transform duration-[220ms] ease-signature group-data-[state=open]/disclosure:rotate-180"
          strokeWidth={1.6}
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0">
        <div className="mt-1 flex flex-col gap-3 border-l-2 border-hot bg-muted/40 px-4 py-4 text-sm leading-relaxed text-text-secondary sm:px-5">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
