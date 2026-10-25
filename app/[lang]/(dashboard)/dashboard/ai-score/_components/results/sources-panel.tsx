"use client"

import { ArrowRightIcon, ChevronDownIcon } from "lucide-react"
import Link from "next/link"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { docHref } from "@/lib/docs/pages"
import { REFERENCES } from "@/lib/docs/references"
import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { ProviderSources } from "./provider-sources"
import { ReferenceItem } from "./reference-item"
import { ResultsSection } from "./results-section"

/**
 * The sources the scoring was built on (PLAN-AI-SCORE-01 § Sources): the provider's material
 * first (D-75), then every verified method reference with its link (collapsed, the list is
 * long), and the public docs page.
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
      <div className="flex flex-col gap-6">
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
          <p className="text-xs text-muted-foreground">{text.methodLead}</p>
          <Collapsible className="group/refs">
            <CollapsibleTrigger className="inline-flex min-h-11 cursor-pointer items-center gap-2 font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase transition-colors duration-[180ms] hover:text-foreground data-[state=open]:text-hot">
              {interpolate(text.showMethod, { count: formatNumber(REFERENCES.length, lang) })}
              <ChevronDownIcon className="size-4 transition-transform duration-[220ms] ease-signature group-data-[state=open]/refs:rotate-180" strokeWidth={1.6} aria-hidden="true" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="flex flex-col divide-y divide-border border-y">
                {REFERENCES.map((reference) => (
                  <ReferenceItem key={reference.id} reference={reference} />
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </section>
      </div>
    </ResultsSection>
  )
}
