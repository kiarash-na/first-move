"use client"

import { ArrowLeftIcon, SlidersHorizontalIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { dashboardHref } from "@/lib/dashboard/routes"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { useQuickCheck } from "../../../_components/use-quick-check"
import { Stepper } from "../../_components/stepper"
import { CoveragePanel } from "../../../_components/results/coverage-panel"
import { DriversPanel } from "../../../_components/results/drivers-panel"
import { IndicatorGrid } from "../../../_components/results/indicator-grid"
import { KeyFigures } from "../../../_components/results/key-figures"
import { ResultsIncomplete } from "../../../_components/results/results-incomplete"
import { ScreeningNote } from "../../../_components/results/screening-note"
import { UnknownSourcesNote } from "../../../_components/results/unknown-sources-note"
import { VerdictPanel } from "../../../_components/results/verdict-panel"

/**
 * The full Quick Check result (PLAN-DASH-08 step 3): verdict and reasons, unknown-source note,
 * drivers, coverage per demand, one card per indicator, key figures and the screening line,
 * all in one view (DESIGN-TOKENS §6). Every number has its info popover (D-33).
 */
export function ResultsView() {
  const lang = useLocale()
  const ui = useDictionary("quick-check").ui.results
  const { result } = useQuickCheck()
  if (!result) return null
  const unknown = result.status === "complete" ? result.assessment.reasons.find((reason) => reason.code === "unknown_source") : undefined

  return (
    <div data-slot="results-view" className="flex flex-col gap-10">
      <Stepper current="results" />
      {result.status === "incomplete" ? (
        <ResultsIncomplete result={result} />
      ) : (
        <>
          <VerdictPanel result={result} />
          {unknown?.sources && <UnknownSourcesNote sources={unknown.sources} />}
          <DriversPanel drivers={result.drivers} />
          <CoveragePanel result={result} />
          <IndicatorGrid result={result} />
          <KeyFigures result={result} />
        </>
      )}
      <ScreeningNote />
      <div className="flex flex-wrap gap-3 border-t pt-6">
        <Button asChild variant="secondary">
          <Link href={dashboardHref(lang, { page: "quick-check", step: "area" })}>
            <ArrowLeftIcon strokeWidth={1.6} aria-hidden="true" />
            {ui.edit}
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href={dashboardHref(lang, { page: "assumptions" })}>
            <SlidersHorizontalIcon strokeWidth={1.6} aria-hidden="true" />
            {ui.assumptions}
          </Link>
        </Button>
      </div>
    </div>
  )
}
