"use client"

import { HammerIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { HowWeCalculate, type CalcSource } from "./how-we-calculate"
import { useDictionary } from "./i18n-provider"
import { PageHeader } from "./page-header"

/**
 * A dashboard page that later phases fill in (PLAN-DASH-07 step 1): its header, an
 * "in development" panel, and the page's "How we calculate" when it has one (D-33).
 */
export function PlaceholderPage({
  eyebrow,
  title,
  tone = "neutral",
  explain,
  children,
}: {
  eyebrow: string
  title: string
  tone?: "neutral" | "cool" | "hot"
  explain?: CalcSource
  children?: ReactNode
}) {
  const shell = useDictionary("shell")

  return (
    <div className="flex flex-col gap-10">
      <PageHeader eyebrow={eyebrow} title={title} tone={tone} />
      <section
        className={cn(
          "relative flex flex-col gap-5 border bg-card p-[clamp(22px,3vw,40px)]",
          "before:absolute before:inset-x-0 before:-top-px before:h-0.5",
          tone === "cool" && "before:bg-primary",
          tone === "hot" && "before:bg-hot",
          tone === "neutral" && "before:bg-foreground/40",
        )}
      >
        <Badge variant="secondary">
          <HammerIcon strokeWidth={1.6} aria-hidden="true" />
          {shell.placeholder.badge}
        </Badge>
        <p className="max-w-[58ch] text-base leading-relaxed text-text-secondary">{shell.placeholder.body}</p>
        {explain && <HowWeCalculate source={explain} tone={tone === "hot" ? "hot" : "cool"} className="border-t pt-3" />}
      </section>
      {children}
    </div>
  )
}
