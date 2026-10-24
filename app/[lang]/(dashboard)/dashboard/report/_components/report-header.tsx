"use client"

import { BrandMark } from "@/components/brand/brand-mark"
import { formatDate } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { Project } from "@/lib/project"
import { IllustrativeBadge } from "../../_components/illustrative-badge"
import { ModuleBadges } from "../../_components/module-badges"
import { useDictionary, useLocale } from "../../_components/i18n-provider"

/** The top of the report: the First Move mark and name, the project and the day it was made (ISO). */
export function ReportHeader({ project, created }: { project: Project; created: string }) {
  const lang = useLocale()
  const copy = useDictionary("report").header
  const name = useDictionary("common").app.name
  const untitled = useDictionary("shell").fields.meta.name.placeholder

  return (
    <header data-slot="report-header" className="flex flex-col gap-6 border-b pb-8">
      <div className="flex items-center justify-between gap-4">
        <span className="inline-flex items-center gap-2.5">
          <BrandMark className="size-7" />
          <span className="text-xl leading-none font-[755] tracking-[-0.045em] [font-stretch:82%]">{name}</span>
        </span>
        <span className="font-mono text-xs tracking-[0.075em] text-muted-foreground uppercase">{copy.eyebrow}</span>
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="text-[clamp(2rem,4vw,2.75rem)] leading-[1.05] font-[590] tracking-[-0.045em] text-balance [font-stretch:82%]">
          {project.meta.name || untitled}
        </h1>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-secondary">
          <span>{interpolate(copy.created, { date: formatDate(created, lang) })}</span>
          <ModuleBadges modules={project.meta.modules} />
          <IllustrativeBadge />
        </p>
      </div>
    </header>
  )
}
