"use client"

import { CheckIcon, CircleAlertIcon, LoaderCircleIcon, PenLineIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { GatewayErrorCode } from "@/lib/assistant/gateway/errors"
import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { AiReport } from "@/lib/project"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import type { ResultActions } from "../types"
import { AiBadge } from "./ai-badge"
import { KeyChips } from "./key-chips"
import { RequestError } from "./request-error"
import { ResultsSection } from "./results-section"

/**
 * The short report (PLAN-AI-SCORE-00 step 4): written by the chosen text model from Jev's final
 * numbers, never changing one. Headline, summary, strengths and gaps with chips to the parts they
 * rest on, next actions. When it is missing or in the other language, the page can write it
 * (again) in the page language; busy and error states come from the page's actions.
 */
export function ReportPanel({ report, actions, error }: { report: AiReport | null; actions: ResultActions; error: GatewayErrorCode | null }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score").results
  const text = copy.report
  const busy = actions.busy === "report"
  const otherLanguage = report !== null && report.lang !== lang
  const label = report === null ? text.write : otherLanguage ? interpolate(text.writeIn, { language: copy.languages[lang] }) : text.rewrite

  const write = (
    <Button
      type="button"
      variant={report === null || otherLanguage ? "hot" : "secondary"}
      size="sm"
      className="h-auto min-h-11 py-2 text-left leading-tight whitespace-normal"
      aria-busy={busy || undefined}
      disabled={!actions.canUseAi || actions.busy !== null}
      onClick={actions.rewriteReport}
    >
      {busy ? <LoaderCircleIcon className="animate-spin" strokeWidth={1.6} aria-hidden="true" /> : <PenLineIcon strokeWidth={1.6} aria-hidden="true" />}
      {busy ? text.writing : label}
    </Button>
  )

  return (
    <ResultsSection title={text.title} lead={text.lead} actions={write} data-slot="report-panel" data-state={report === null ? "none" : otherLanguage ? "other-language" : "current"}>
      {!actions.canUseAi && <p className="text-xs leading-snug text-muted-foreground">{copy.needsAi}</p>}
      <RequestError code={error} />
      {report === null ? (
        <p className="text-sm text-muted-foreground">{text.none}</p>
      ) : (
        <article lang={report.lang} data-ai-generated="true" className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <AiBadge />
            <span className="font-mono text-xs text-muted-foreground">{interpolate(text.by, { model: report.model })}</span>
          </div>
          {otherLanguage && (
            <p lang={lang} className="border border-l-2 border-l-hot px-4 py-2 text-sm">
              {interpolate(text.otherLanguage, { language: copy.languages[report.lang] })}
            </p>
          )}
          <p className="max-w-[60ch] text-xl leading-snug font-[560] tracking-[-0.02em] text-balance">{report.headline}</p>
          <p className="max-w-[72ch] text-[15px] leading-relaxed text-text-secondary">{report.summary}</p>
          <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
            {(["strengths", "gaps"] as const).map((kind) => (
              <section key={kind} aria-label={text[kind]} data-kind={kind} className="flex flex-col gap-3">
                <h4 lang={lang} className={kind === "strengths" ? "font-mono text-xs tracking-[0.075em] text-primary uppercase" : "font-mono text-xs tracking-[0.075em] text-hot uppercase"}>
                  {text[kind]}
                </h4>
                <ul className="flex flex-col gap-3">
                  {report[kind].map((item) => (
                    <li key={item.text} className="flex items-start gap-2.5">
                      {kind === "strengths" ? (
                        <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.8} aria-hidden="true" />
                      ) : (
                        <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-hot" strokeWidth={1.6} aria-hidden="true" />
                      )}
                      <div className="flex min-w-0 flex-col gap-1.5">
                        <span className="text-sm leading-snug">{item.text}</span>
                        <KeyChips keys={item.keys} />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          {report.actions.length > 0 && (
            <section aria-label={text.actions} className="flex flex-col gap-3">
              <h4 lang={lang} className="font-mono text-xs tracking-[0.075em] text-muted-foreground uppercase">
                {text.actions}
              </h4>
              <ol className="flex flex-col gap-2">
                {report.actions.map((action, index) => (
                  <li key={action} className="flex items-start gap-3 text-sm leading-snug">
                    <span className="font-mono text-xs text-hot tabular-nums">{formatNumber(index + 1, lang)}</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </article>
      )}
    </ResultsSection>
  )
}
