"use client"

import { useState } from "react"

import { CoveragePanel } from "../../_components/results/coverage-panel"
import { DriversPanel } from "../../_components/results/drivers-panel"
import { IndicatorGrid } from "../../_components/results/indicator-grid"
import { KeyFigures } from "../../_components/results/key-figures"
import { ResultsIncomplete } from "../../_components/results/results-incomplete"
import { UnknownSourcesNote } from "../../_components/results/unknown-sources-note"
import { VerdictPanel } from "../../_components/results/verdict-panel"
import { useDictionary } from "../../_components/i18n-provider"
import { useQuickCheck } from "../../_components/use-quick-check"
import { ReportBusinessPlan } from "./report-business-plan"
import { ReportCalculation } from "./report-calculation"
import { ReportFooter } from "./report-footer"
import { ReportHeader } from "./report-header"
import { ReportInputs } from "./report-inputs"
import { ReportParameters } from "./report-parameters"
import { ReportReadiness } from "./report-readiness"
import { ReportSection } from "./report-section"
import { ReportToolbar } from "./report-toolbar"
import "./report.css"

/**
 * The report of the open project (D-09, D-70, QCT-SCOPE-06 "Export Results"): one light sheet
 * (DESIGN-TOKENS §1, reports on light surfaces) with the Quick Check result and its reasons, the
 * inputs, the parameters and the equations, then the Business Plan as written and its pitch
 * readiness. Every number comes from `run()` through `useQuickCheck`, as on the other pages.
 * The browser prints it; "Save as PDF" in the print dialog makes the PDF.
 */
export function ReportView() {
  const copy = useDictionary("report").sections
  const { project, result } = useQuickCheck()
  const [created] = useState(() => new Date().toISOString())
  if (!project || !result) return null
  const { modules } = project.meta
  const unknown = result.status === "complete" ? result.assessment.reasons.find((reason) => reason.code === "unknown_source") : undefined

  return (
    <div className="flex flex-col gap-6">
      <ReportToolbar />
      <article
        data-slot="report"
        data-theme="light"
        className="report-sheet mx-auto flex w-full max-w-[60rem] flex-col gap-14 border bg-background p-[clamp(20px,5vw,56px)] text-foreground shadow-panel"
      >
        <ReportHeader project={project} created={created} />

        {modules.quickCheck && (
          <>
            <ReportSection title={copy.quickCheck} tone="cool">
              {result.status === "complete" ? (
                <div className="flex flex-col gap-10">
                  <VerdictPanel result={result} />
                  {unknown?.sources && <UnknownSourcesNote sources={unknown.sources} />}
                  <DriversPanel drivers={result.drivers} />
                  <CoveragePanel result={result} />
                  <IndicatorGrid result={result} />
                  <KeyFigures result={result} />
                </div>
              ) : (
                <ResultsIncomplete result={result} />
              )}
            </ReportSection>
            <ReportSection title={copy.inputs} lead={copy.inputsLead} tone="cool" pageBreak>
              <ReportInputs project={project} />
            </ReportSection>
            <ReportSection title={copy.parameters} lead={copy.parametersLead} tone="cool" pageBreak>
              <ReportParameters />
            </ReportSection>
            <ReportSection title={copy.calculation} lead={copy.calculationLead} tone="cool" pageBreak>
              <ReportCalculation />
            </ReportSection>
          </>
        )}

        {modules.businessPlan && (
          <>
            <ReportSection title={copy.businessPlan} tone="hot" pageBreak={modules.quickCheck}>
              <ReportBusinessPlan project={project} />
            </ReportSection>
            <ReportSection title={copy.readiness} tone="hot">
              <ReportReadiness project={project} />
            </ReportSection>
          </>
        )}

        <ReportFooter created={created} />
      </article>
    </div>
  )
}
