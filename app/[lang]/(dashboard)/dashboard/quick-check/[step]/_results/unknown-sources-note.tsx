"use client"

import { ArrowRightIcon, HelpCircleIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { dashboardHref } from "@/lib/dashboard/routes"
import { joinList } from "@/lib/dashboard/result-text"
import { interpolate } from "@/lib/i18n/interpolate"
import type { SourceKey } from "@/lib/project"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"

/** QCT-KF-06: the potential of these sources must be clarified before a reliable assessment. */
export function UnknownSourcesNote({ sources }: { sources: readonly SourceKey[] }) {
  const lang = useLocale()
  const copy = useDictionary("quick-check")
  const ui = copy.ui.results.unknown
  const names = joinList(
    sources.map((source) => copy.sources[source].inText),
    lang,
  )
  return (
    <section
      aria-labelledby="unknown-title"
      data-slot="unknown-sources"
      className="flex flex-col gap-4 border border-foreground/30 bg-card p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6"
    >
      <span className="inline-flex size-11 shrink-0 items-center justify-center border border-foreground/40">
        <HelpCircleIcon className="size-5" strokeWidth={1.6} aria-hidden="true" />
      </span>
      <div className="flex flex-1 flex-col gap-1">
        <h2 id="unknown-title" className="text-lg leading-tight font-[560] tracking-[-0.03em] [font-stretch:86%]">
          {ui.title}
        </h2>
        <p className="max-w-[72ch] text-[15px] leading-relaxed text-text-secondary">{interpolate(ui.body, { sources: names })}</p>
      </div>
      <Button asChild variant="secondary" className="shrink-0">
        <Link href={dashboardHref(lang, { page: "quick-check", step: "sources" })}>
          {ui.action}
          <ArrowRightIcon strokeWidth={1.6} aria-hidden="true" />
        </Link>
      </Button>
    </section>
  )
}
