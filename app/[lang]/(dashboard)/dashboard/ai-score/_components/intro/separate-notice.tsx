"use client"

import { ArrowRightIcon, SparklesIcon } from "lucide-react"
import Link from "next/link"

import { docHref } from "@/lib/docs/pages"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"

/**
 * The notice at the top of the page (D-71, D-74): the AI Plan Score is a separate AI scoring of
 * the written plan, an AI opinion, not the app's calculation and not a feasibility or funding
 * verdict; Pitch completeness still counts filled fields only.
 */
export function SeparateNotice() {
  const lang = useLocale()
  const copy = useDictionary("ai-score").intro

  return (
    <aside
      data-slot="separate-notice"
      aria-labelledby="ai-score-notice-title"
      className="flex flex-col gap-4 border border-l-2 border-l-hot bg-muted/40 p-5 sm:flex-row sm:gap-5 sm:p-6"
    >
      <SparklesIcon className="size-6 shrink-0 text-hot" strokeWidth={1.6} aria-hidden="true" />
      <div className="flex max-w-[78ch] min-w-0 flex-col gap-3">
        <h2 id="ai-score-notice-title" className="text-lg leading-snug font-[560] tracking-[-0.02em] [font-stretch:88%]">
          {copy.title}
        </h2>
        <p className="text-base leading-relaxed text-text-secondary">{copy.body}</p>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-base leading-relaxed text-text-secondary marker:text-hot">
          <li>{copy.points.calculation}</li>
          <li>{copy.points.verdict}</li>
          <li>{copy.points.models}</li>
        </ul>
        <Link
          href={docHref(lang, "ai-plan-score")}
          className="inline-flex min-h-11 w-fit items-center gap-2 text-sm underline decoration-1 underline-offset-4 transition-colors hover:text-hot"
        >
          {copy.docs}
          <ArrowRightIcon className="size-4" strokeWidth={1.6} aria-hidden="true" />
        </Link>
      </div>
    </aside>
  )
}
