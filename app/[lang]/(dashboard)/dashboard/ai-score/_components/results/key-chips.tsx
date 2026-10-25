"use client"

import { CornerDownRightIcon } from "lucide-react"

import { useDictionary } from "../../../_components/i18n-provider"
import { keyAnchor } from "./anchors"
import { keyName } from "./labels"

/**
 * The plan parts and checks a report line rests on, as chips that jump to their row. A key the
 * engine does not know, or one without a row in this run (`rows`, from `rowKeys`), is left out.
 * `lang` is the page's: the chips are app copy inside AI text that may be in the other language.
 */
export function KeyChips({ keys, rows, lang }: { keys: readonly string[]; rows: ReadonlySet<string>; lang?: string }) {
  const copy = useDictionary("ai-score")
  const chips = [...new Set(keys)].flatMap((key) => {
    if (!rows.has(key)) return []
    const anchor = keyAnchor(key)
    const name = keyName(copy.labels, key)
    return anchor && name ? [{ key, anchor, name }] : []
  })
  if (chips.length === 0) return null

  return (
    <ul lang={lang} aria-label={copy.results.report.pointsTo} data-slot="key-chips" className="flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <li key={chip.key}>
          <a
            href={`#${chip.anchor}`}
            data-key={chip.key}
            className="inline-flex min-h-8 items-center gap-1.5 border border-border bg-muted/40 px-2 py-1 text-xs leading-none text-text-secondary transition-colors duration-[180ms] hover:border-hot hover:text-foreground"
          >
            <CornerDownRightIcon className="size-3.5 text-hot" strokeWidth={1.6} aria-hidden="true" />
            {chip.name}
          </a>
        </li>
      ))}
    </ul>
  )
}
