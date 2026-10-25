"use client"

import { ArrowRightIcon, BookOpenIcon, Building2Icon, InfoIcon, PencilRulerIcon } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { headingId } from "@/lib/docs/heading-id"
import { docHref } from "@/lib/docs/pages"
import { REFERENCE_TIERS, type ReferenceCaseCard as ReferenceCaseCardData } from "@/lib/examples/reference-cases/types"
import { resolveTexts } from "@/lib/examples/resolve-texts"
import { useDictionary, useLocale } from "../_components/i18n-provider"

/**
 * One reference case from Vienna (D-76): real or fictional, the plan quality it was written to
 * show, its summary, the disclaimer of a fictional plan, a link to its section on the public
 * docs page (sources and details) and the action that opens a copy.
 */
export function ReferenceCaseCard({ card, busy, onOpen }: { card: ReferenceCaseCardData; busy: boolean; onOpen: (id: string) => void }) {
  const lang = useLocale()
  const copy = useDictionary("start").referenceCases
  const name = resolveTexts(card.name, lang) as string
  const summary = resolveTexts(card.summary, lang) as string
  const titleId = `reference-case-${card.id}`
  const filled = REFERENCE_TIERS.indexOf(card.tier) + 1
  const KindIcon = card.kind === "real" ? Building2Icon : PencilRulerIcon

  return (
    <article aria-labelledby={titleId} data-reference-case={card.id} data-kind={card.kind} data-tier={card.tier} className="flex flex-col border bg-card">
      <div className="flex flex-1 flex-col gap-3 px-5 pt-5 pb-4">
        <Badge variant="outline">
          <KindIcon strokeWidth={1.6} aria-hidden="true" />
          {copy.kinds[card.kind]}
        </Badge>
        <h3 id={titleId} className="text-xl leading-[1.15] font-[560] tracking-[-0.035em] [font-stretch:86%]">
          {name}
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">{summary}</p>
        {card.kind === "fictional" && (
          <p data-disclaimer="" className="flex gap-2 border-l-2 border-hot/60 pl-3 text-xs leading-relaxed text-muted-foreground">
            <InfoIcon className="mt-px size-3.5 shrink-0 text-hot" strokeWidth={1.6} aria-hidden="true" />
            {copy.disclaimer}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 border-t px-5 py-4">
        <span className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">{copy.quality}</span>
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex gap-1">
            {REFERENCE_TIERS.map((tier, index) => (
              <span key={tier} data-filled={index < filled} className="h-2 w-6 border border-hot data-[filled=true]:bg-hot" />
            ))}
          </span>
          <span className="font-mono text-xs tracking-[0.06em] text-hot uppercase">{copy.tiers[card.tier]}</span>
        </div>
      </div>
      <Link
        href={`${docHref(lang, "reference-cases")}#${headingId(name)}`}
        aria-describedby={titleId}
        className="flex h-12 items-center justify-between border-t px-5 text-sm hover:bg-accent/60 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
      >
        {copy.sources}
        <BookOpenIcon className="size-4" strokeWidth={1.6} aria-hidden="true" />
      </Link>
      <Button
        variant="ghost"
        disabled={busy}
        onClick={() => onOpen(card.id)}
        aria-describedby={titleId}
        className="h-12 justify-between border-t px-5 hover:bg-accent/60 hover:text-primary"
      >
        {copy.open}
        <ArrowRightIcon strokeWidth={1.6} aria-hidden="true" />
      </Button>
    </article>
  )
}
