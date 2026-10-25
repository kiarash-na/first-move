"use client"

import type { AiScore } from "@/lib/project"
import { useDictionary } from "../../../_components/i18n-provider"
import type { ResultActions } from "../types"
import { BranchDecision } from "./branch-decision"
import { GateRow } from "./gate-row"
import { ResultsSection } from "./results-section"
import { CHECKS_SECTION_ID } from "./score-summary"

/**
 * The checks (gates) and decisions (branches) of the run, in the order they were asked: every
 * check with its outcome and cap, then the three branches with the option each chose.
 */
export function ChecksPanel({ score, actions }: { score: AiScore; actions: ResultActions }) {
  const copy = useDictionary("ai-score").results.checks
  const saved = new Map((score.suggestions?.items ?? []).map((item) => [item.key, item.texts]))

  return (
    <ResultsSection id={CHECKS_SECTION_ID} title={copy.title} lead={copy.lead} data-slot="checks-panel" data-ai-generated="true">
      <div className="grid gap-x-10 gap-y-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section aria-labelledby="ai-score-gates" className="flex min-w-0 flex-col">
          <h4 id="ai-score-gates" className="font-mono text-xs tracking-[0.075em] text-hot uppercase">
            {copy.gates}
          </h4>
          <ul className="flex flex-col divide-y divide-border border-b">
            {score.gates.map((gate) => (
              <GateRow key={gate.id} gate={gate} score={score} suggestions={saved.get(gate.id) ?? []} suggestionsLang={score.suggestions?.lang} actions={actions} />
            ))}
          </ul>
        </section>
        <section aria-labelledby="ai-score-branches" className="flex min-w-0 flex-col">
          <h4 id="ai-score-branches" className="font-mono text-xs tracking-[0.075em] text-hot uppercase">
            {copy.branches}
          </h4>
          <ul className="flex flex-col divide-y divide-border border-b">
            {score.branches.map((branch) => (
              <BranchDecision key={branch.id} branch={branch} />
            ))}
          </ul>
        </section>
      </div>
    </ResultsSection>
  )
}
