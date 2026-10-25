"use client"

import { CheckIcon, RotateCw, ScanSearchIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { formatNumber, formatQuantity } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { Locale } from "@/lib/i18n/locales"
import type { QuickCheckDemoResult } from "@/lib/presentation/run-demo"
import type { Project } from "@/lib/project"
import type { ResultLevel } from "@/lib/quick-check/overall-rule"

export interface DeterminismCopy {
  demoLabel: string
  heating: string
  heatDensity: string
  economic: string
  fingerprint: string
  run: string
  runs: string
  runsDiffer: string
  levelsLabel: string
}

const LEVELS: readonly { level: ResultLevel; icon: typeof CheckIcon }[] = [
  { level: "promising", icon: CheckIcon },
  { level: "further_analysis", icon: ScanSearchIcon },
  { level: "not_promising", icon: XIcon },
]

/**
 * Slide 3's console: the real Quick Check result of an illustrative example. "Run again" loads
 * the engine in the browser, runs it on the same inputs and compares the fingerprint of the
 * whole result with the server's.
 */
export function DeterminismDemo({
  lang,
  project,
  initial,
  copy,
  levelNames,
}: {
  lang: Locale
  project: Project
  initial: QuickCheckDemoResult
  copy: DeterminismCopy
  levelNames: Record<ResultLevel, string>
}) {
  const [result, setResult] = useState(initial)
  const [runs, setRuns] = useState(1)
  const [busy, setBusy] = useState(false)

  const again = async () => {
    setBusy(true)
    try {
      const { runDemo } = await import("@/lib/presentation/run-demo")
      setResult(runDemo(project))
      setRuns((count) => count + 1)
    } finally {
      setBusy(false)
    }
  }

  const same = result.fingerprint === initial.fingerprint
  const figures = [
    { label: copy.heating, value: formatQuantity(result.heatingDemandMwh, "MWh/a", lang, { maximumFractionDigits: 0 }) },
    { label: copy.heatDensity, value: formatQuantity(result.heatDensityMwhPerM, "MWh/m", lang, { maximumFractionDigits: 2 }) },
    { label: copy.economic, value: formatNumber(result.economicRatio, lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
  ]

  return (
    <div className="console console--cool">
      <p className="console__head">
        <span className="deck-label">{copy.demoLabel}</span>
        <span className="console__name">{project.meta.name}</span>
      </p>
      <dl key={runs} className="console__figures" data-run={runs > 1 ? "again" : "first"}>
        {figures.map((figure) => (
          <div key={figure.label} className="console__figure">
            <dt>{figure.label}</dt>
            <dd>{figure.value}</dd>
          </div>
        ))}
      </dl>
      <div className="levels" role="group" aria-label={copy.levelsLabel}>
        {LEVELS.map(({ level, icon: Icon }) => (
          <p key={level} className="levels__item" data-level={level} data-current={level === result.level || undefined}>
            <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
            {levelNames[level]}
          </p>
        ))}
      </div>
      <div className="console__foot">
        <p className="console__fingerprint">
          <span className="deck-label">{copy.fingerprint}</span>
          <code key={runs} data-run={runs > 1 ? "again" : "first"}>
            {result.fingerprint}
          </code>
        </p>
        <div className="console__actions">
          <button type="button" className="deck-button" onClick={() => !busy && void again()} aria-disabled={busy}>
            <RotateCw size={16} strokeWidth={1.6} aria-hidden="true" />
            {copy.run}
          </button>
          <p className="console__runs" aria-live="polite" data-same={same}>
            {runs > 1 ? interpolate(same ? copy.runs : copy.runsDiffer, { count: runs }) : null}
          </p>
        </div>
      </div>
    </div>
  )
}
