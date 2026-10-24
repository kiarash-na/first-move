"use client"

import { CircleDashedIcon } from "lucide-react"
import type { QuickCheckIncomplete } from "@/lib/quick-check"
import { useDictionary } from "../../../_components/i18n-provider"
import { MissingSteps } from "../../_components/missing-steps"

/** No result without the required inputs (R-03, OQ-22): what is missing and where to add it. */
export function ResultsIncomplete({ result }: { result: QuickCheckIncomplete }) {
  const ui = useDictionary("quick-check").ui.results.incomplete
  return (
    <section data-slot="results-incomplete" className="flex flex-col gap-5 border bg-card p-[clamp(22px,3vw,40px)]">
      <span className="inline-flex size-14 items-center justify-center border text-muted-foreground">
        <CircleDashedIcon className="size-7" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <div className="flex max-w-[58ch] flex-col gap-2">
        <h2 className="text-2xl leading-[1.15] font-[560] tracking-[-0.04em] [font-stretch:84%]">{ui.title}</h2>
        <p className="text-base leading-relaxed text-text-secondary">{ui.body}</p>
      </div>
      <MissingSteps steps={result.incompleteSteps} className="max-w-md" />
    </section>
  )
}
