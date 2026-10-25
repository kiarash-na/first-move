"use client"

import { ArrowRightIcon, PlayIcon, RotateCcwIcon, SquareStopIcon } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { JUDGEMENTS } from "@/lib/ai/plan-score/judgements"
import { isJudgementFilled } from "@/lib/ai/plan-score/state"
import type { GatewayErrorCode } from "@/lib/assistant/gateway/errors"
import { dashboardHref } from "@/lib/dashboard/routes"
import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { Project } from "@/lib/project"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { Panel } from "../panel"
import { RunOutcome } from "./run-outcome"
import { RunProgressList } from "./run-progress"
import type { AnalysisRun } from "./use-analysis"

export interface RunReadiness {
  key: boolean
  ack: boolean
  model: boolean
}

/** How many plan parts have text: a run needs at least one. */
export function filledCount(project: Project): number {
  return JUDGEMENTS.filter((judgement) => isJudgementFilled(project, judgement)).length
}

/**
 * Step 2 of the page: start, cancel and follow a run (PLAN-AI-SCORE-00 step 6). Disabled until a
 * key is set, what is sent is confirmed, the text model is valid and a plan part has text; says
 * which is missing. While a report or suggestions are being written, a new run waits. Errors come as copy per Gateway error code, never raw; a failed report keeps
 * the score and offers to write it again.
 */
export function RunPanel({
  project,
  run,
  readiness,
  hasScore,
  hasReport,
  writing,
  textBusy = false,
  textError,
  onStart,
  onCancel,
  onWriteAgain,
}: {
  project: Project
  run: AnalysisRun
  readiness: RunReadiness
  hasScore: boolean
  /** The saved score has a report (after a successful rewrite). */
  hasReport: boolean
  writing: boolean
  /** A report or suggestions request is running; a new run waits until it ends. */
  textBusy?: boolean
  textError: GatewayErrorCode | null
  onStart: () => void
  onCancel: () => void
  onWriteAgain: () => void
}) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const text = copy.run
  const filled = useMemo(() => filledCount(project), [project])
  const running = run.phase === "running"
  const missing = [!readiness.key && text.needs.key, !readiness.ack && text.needs.ack, !readiness.model && text.needs.model].filter(Boolean) as string[]
  const canStart = !running && !textBusy && filled > 0 && missing.length === 0
  const ready = missing.length === 0

  return (
    <Panel id="ai-score-run" eyebrow="02" title={text.title} lead={text.lead} className="@container">
      <p className="font-mono text-xs tracking-[0.06em] text-text-secondary uppercase">
        {interpolate(text.filled, { filled: formatNumber(filled, lang), total: formatNumber(JUDGEMENTS.length, lang) })}
      </p>
      {filled === 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-base">{text.needs.filled}</p>
          <Link
            href={dashboardHref(lang, { page: "business-plan", step: "opportunity" })}
            className="inline-flex min-h-11 items-center gap-2 text-sm underline decoration-1 underline-offset-4 hover:text-hot"
          >
            {text.openPlan}
            <ArrowRightIcon className="size-4" strokeWidth={1.6} aria-hidden="true" />
          </Link>
        </div>
      )}
      {missing.length > 0 && (
        <ul data-slot="run-needs" className="flex flex-col gap-1 text-sm text-text-secondary">
          {missing.map((need) => (
            <li key={need}>{need}</li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="hot" size="lg" disabled={!canStart} onClick={onStart}>
          {hasScore ? text.again : text.start}
          {hasScore ? <RotateCcwIcon strokeWidth={1.6} aria-hidden="true" /> : <PlayIcon strokeWidth={1.6} aria-hidden="true" />}
        </Button>
        {running && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            <SquareStopIcon strokeWidth={1.6} aria-hidden="true" />
            {text.cancel}
          </Button>
        )}
        {hasScore && !running && <p className="text-sm text-text-secondary">{text.againNote}</p>}
      </div>
      {run.progress && <RunProgressList progress={run.progress} />}
      <RunOutcome
        run={run}
        hasReport={hasReport}
        textError={textError}
        writeAgain={
          <Button type="button" variant="secondary" disabled={!ready || writing} onClick={onWriteAgain}>
            <RotateCcwIcon strokeWidth={1.6} aria-hidden="true" />
            {writing ? copy.flow.node.reportWriting : text.writeAgain}
          </Button>
        }
      />
    </Panel>
  )
}
