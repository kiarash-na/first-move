"use client"

import { HistoryIcon } from "lucide-react"
import { useId } from "react"

import type { AiScore } from "@/lib/project"
import { useDictionary } from "../../../_components/i18n-provider"
import { judgementName } from "./labels"
import { stepsOf } from "./plan-steps"
import { StepLinks } from "./step-links"

/**
 * Says the saved score is outdated (D-73) once a scored field changed: the changed plan parts,
 * each with links to the Business Plan steps of its fields, and that a new run is above.
 */
export function OutdatedBanner({ score, changed }: { score: AiScore; changed: readonly string[] }) {
  const copy = useDictionary("ai-score")
  const titleId = useId()
  const parts = score.judgements.filter((entry) => changed.includes(entry.id)).flatMap((entry) => {
    const name = judgementName(copy.labels, entry.id)
    return name ? [{ id: entry.id, name, steps: stepsOf(entry.fields) }] : []
  })
  if (changed.length === 0) return null

  return (
    <aside aria-labelledby={titleId} data-slot="outdated-banner" className="flex flex-col gap-3 border border-l-2 border-l-hot bg-card px-5 py-4">
      <h3 id={titleId} className="flex items-center gap-2.5 text-base leading-tight font-[560] tracking-[-0.02em]">
        <HistoryIcon className="size-4 shrink-0 text-hot" strokeWidth={1.6} aria-hidden="true" />
        {copy.results.outdated.title}
      </h3>
      <p className="max-w-[72ch] text-sm leading-relaxed text-text-secondary">{copy.results.outdated.body}</p>
      {parts.length > 0 && (
        <ul className="flex flex-col divide-y divide-border border-y">
          {parts.map((part) => (
            <li key={part.id} className="flex flex-wrap items-center justify-between gap-x-4 py-1">
              <span className="text-sm">{part.name}</span>
              <StepLinks steps={part.steps} template={copy.results.outdated.edit} />
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
