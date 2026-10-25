"use client"

import { ExternalLinkIcon } from "lucide-react"

import type { Reference } from "@/lib/docs/references"
import { formatDate } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { citedDimensions, METHOD_ROLES } from "./citations"

/**
 * One verified method reference (`lib/docs/references.ts`): authors, year, title, source and kind,
 * the external link (new tab, no referrer) and where the scoring uses it.
 */
export function ReferenceItem({ reference }: { reference: Reference }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const text = copy.results.sources
  const dimensions = citedDimensions(reference.id).map((id) => copy.labels.dimensions[id].name)
  const role = METHOD_ROLES[reference.id]

  return (
    <li data-reference={reference.id} className="flex flex-col gap-1 py-3 text-sm leading-snug">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="border border-border px-1.5 py-0.5 font-mono text-[11px] tracking-[0.06em] text-muted-foreground uppercase">{text.kinds[reference.kind]}</span>
        <span className="text-text-secondary">
          {reference.authors} ({reference.year})
        </span>
      </p>
      <a
        href={reference.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={interpolate(text.link, { title: reference.title })}
        className="inline-flex w-fit items-start gap-1.5 font-[520] underline-offset-4 hover:text-hot hover:underline"
      >
        <span>{reference.title}</span>
        <ExternalLinkIcon className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.6} aria-hidden="true" />
      </a>
      <p className="text-text-secondary">{reference.source}</p>
      <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
        {role && <span>{text.roles[role]}</span>}
        {dimensions.length > 0 && <span>{interpolate(text.citedBy, { dimensions: dimensions.join(" · ") })}</span>}
        <span>{interpolate(text.checked, { date: formatDate(reference.checked, lang) })}</span>
      </p>
    </li>
  )
}
