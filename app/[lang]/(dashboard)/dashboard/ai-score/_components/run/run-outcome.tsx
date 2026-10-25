"use client"

import { TriangleAlertIcon } from "lucide-react"
import type { ReactNode } from "react"

import type { GatewayErrorCode } from "@/lib/assistant/gateway/errors"
import { interpolate } from "@/lib/i18n/interpolate"
import { useDictionary } from "../../../_components/i18n-provider"
import type { AnalysisRun } from "./use-analysis"

function message(alert: boolean, children: ReactNode, extra?: ReactNode) {
  const text = (
    <p role={alert ? "alert" : "status"} data-alert={alert || undefined} className="flex items-start gap-2.5 text-base leading-relaxed">
      {alert && <TriangleAlertIcon className="mt-1 size-4 shrink-0 text-hot" strokeWidth={1.6} aria-hidden="true" />}
      {children}
    </p>
  )
  if (!extra) return text
  return (
    <div className="flex flex-col items-start gap-3">
      {text}
      {extra}
    </div>
  )
}

/**
 * How the last run ended, in plain words: saved, saved without a report (with "write the report
 * again"), not saved because the project was closed, or stopped with the Gateway error's copy.
 */
export function RunOutcome({
  run,
  hasReport,
  textError,
  writeAgain,
}: {
  run: AnalysisRun
  hasReport: boolean
  /** The error of a later "write the report again". */
  textError: GatewayErrorCode | null
  writeAgain: ReactNode
}) {
  const copy = useDictionary("ai-score")
  const text = copy.run
  if (run.phase === "failed" && run.error) return message(true, interpolate(text.failed, { reason: copy.errors[run.error] }))
  if (run.phase !== "done") return null
  if (!run.saved) return message(true, text.notSaved)
  const reportError = hasReport ? null : (textError ?? run.reportError)
  if (reportError) return message(true, interpolate(text.reportError, { reason: copy.errors[reportError] }), writeAgain)
  return message(false, text.done)
}
