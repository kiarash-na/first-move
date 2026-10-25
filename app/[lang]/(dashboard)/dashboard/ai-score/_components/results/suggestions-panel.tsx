"use client"

import { WEAK_LEVEL } from "@/lib/ai/plan-score/report"
import { suggestionTargets } from "@/lib/ai/plan-score/suggest"
import type { GatewayErrorCode } from "@/lib/assistant/gateway/errors"
import { formatDateTime, formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { AiScore } from "@/lib/project"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import type { ResultActions } from "../types"
import { AiBadge } from "./ai-badge"
import { checkAnchor, partAnchor } from "./anchors"
import { gateCopy, judgementName } from "./labels"
import { RequestError } from "./request-error"
import { ResultsSection } from "./results-section"
import { SuggestButton } from "./suggest-button"
import { SuggestionTexts } from "./suggestion-texts"

/**
 * Improvement suggestions on demand (D-77): one request for every weak plan part and every check
 * that failed or stayed unclear, and the saved suggestions grouped by part and check, marked as AI
 * output with the model and the date.
 */
export function SuggestionsPanel({ score, actions, error }: { score: AiScore; actions: ResultActions; error: GatewayErrorCode | null }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const text = copy.results.suggestions
  const targets = suggestionTargets(score)
  const saved = score.suggestions
  const named = (saved?.items ?? []).flatMap((item): { key: string; texts: string[]; kind: "parts" | "checks"; name: string; anchor: string }[] => {
    const part = judgementName(copy.labels, item.key)
    if (part) return [{ ...item, kind: "parts", name: part, anchor: partAnchor(item.key) }]
    const check = gateCopy(copy.labels, item.key)?.name
    return check ? [{ ...item, kind: "checks", name: check, anchor: checkAnchor(item.key) }] : []
  })
  const groups = (["parts", "checks"] as const).map((kind) => ({ kind, items: named.filter((item) => item.kind === kind) }))

  return (
    <ResultsSection
      title={text.title}
      lead={interpolate(text.lead, { level: formatNumber(WEAK_LEVEL, lang) })}
      actions={targets.length > 0 ? <SuggestButton actions={actions} label={saved ? text.askAgain : text.ask} variant="hot" /> : undefined}
      data-slot="suggestions-panel"
    >
      <p className="font-mono text-xs text-muted-foreground">{targets.length > 0 ? interpolate(text.targets, { count: formatNumber(targets.length, lang) }) : text.nothing}</p>
      <RequestError code={error} />
      {saved && saved.items.length > 0 ? (
        <div lang={saved.lang} data-ai-generated="true" className="flex flex-col gap-5">
          <div lang={lang} className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <AiBadge />
            <span className="font-mono text-xs text-muted-foreground">
              {interpolate(text.by, { model: saved.model, date: formatDateTime(saved.at, lang) })}
            </span>
          </div>
          {saved.lang !== lang && (
            <p lang={lang} className="border border-l-2 border-l-hot px-4 py-2 text-sm">
              {interpolate(text.otherLanguage, { language: copy.results.languages[saved.lang], current: copy.results.languages[lang] })}
            </p>
          )}
          {groups
            .filter((group) => group.items.length > 0)
            .map((group) => (
              <section key={group.kind} aria-label={text[group.kind]} data-group={group.kind} className="flex flex-col gap-3">
                <h4 lang={lang} className="font-mono text-xs tracking-[0.075em] text-hot uppercase">
                  {text[group.kind]}
                </h4>
                <ul className="flex flex-col divide-y divide-border border-y">
                  {group.items.map((item) => (
                    <li key={item.key} data-key={item.key} className="flex flex-col gap-2 py-3">
                      <a lang={lang} href={`#${item.anchor}`} className="w-fit text-[15px] font-[520] underline-offset-4 hover:text-hot hover:underline">
                        {item.name}
                      </a>
                      <SuggestionTexts texts={item.texts} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{text.none}</p>
      )}
    </ResultsSection>
  )
}
