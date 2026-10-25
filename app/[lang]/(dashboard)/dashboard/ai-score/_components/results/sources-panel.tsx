"use client"

import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"

import { docHref } from "@/lib/docs/pages"
import { REFERENCES } from "@/lib/docs/references"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { ProviderSources } from "./provider-sources"
import { ReferenceItem } from "./reference-item"
import { ResultsSection } from "./results-section"

/**
 * The sources the scoring was built on (PLAN-AI-SCORE-01 § Sources): the provider's material
 * first (D-75), then every verified method reference with its link, and the public docs page.
 */
export function SourcesPanel() {
  const lang = useLocale()
  const text = useDictionary("ai-score").results.sources

  return (
    <ResultsSection
      title={text.title}
      lead={text.lead}
      actions={
        <Link href={docHref(lang, "ai-plan-score")} className="inline-flex min-h-11 items-center gap-2 font-mono text-xs tracking-[0.06em] text-hot uppercase underline-offset-4 hover:underline">
          {text.docs}
          <ArrowRightIcon className="size-4" strokeWidth={1.6} aria-hidden="true" />
        </Link>
      }
      data-slot="sources-panel"
    >
      <div className="grid gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <section aria-labelledby="ai-score-provider-sources" className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h4 id="ai-score-provider-sources" className="font-mono text-xs tracking-[0.075em] text-hot uppercase">
              {text.provider}
            </h4>
            <p className="text-xs text-muted-foreground">{text.providerLead}</p>
          </div>
          <ProviderSources />
        </section>
        <section aria-labelledby="ai-score-method-references" className="flex flex-col gap-1">
          <h4 id="ai-score-method-references" className="font-mono text-xs tracking-[0.075em] text-hot uppercase">
            {text.method}
          </h4>
          <ul className="flex flex-col divide-y divide-border border-b">
            {REFERENCES.map((reference) => (
              <ReferenceItem key={reference.id} reference={reference} />
            ))}
          </ul>
        </section>
      </div>
    </ResultsSection>
  )
}
