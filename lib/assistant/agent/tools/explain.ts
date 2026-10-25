import { tool } from "ai"
import { z } from "zod"
import { lookup } from "@/lib/i18n/lookup"
import { explainResult, formulaNameKey, run, RESULT_EXPLAIN, STEP_EXPLAIN, type ExplainedResult, type ExplainedStep, type Explanation, type QuickCheckFlags } from "@/lib/quick-check"
import type { AgentContext } from "../context"

const STEPS = Object.keys(STEP_EXPLAIN) as ExplainedStep[]
const RESULTS = Object.keys(RESULT_EXPLAIN) as ExplainedResult[]

/** Topic ids the model may ask for: `step.<step>` or `result.<value>`. */
export const EXPLAIN_TOPICS = [...STEPS.map((step) => `step.${step}`), ...RESULTS.map((result) => `result.${result}`)] as [string, ...string[]]

const NO_FLAGS: QuickCheckFlags = {
  incomplete: true,
  manualHeatingDemand: false,
  manualCoolingDemand: false,
  manualNetworkLength: false,
  estimatedNetworkLength: true,
  customParameters: false,
  pv: false,
  industry: false,
  unknownSources: false,
}

/**
 * `explain`: the same "How we calculate" text the page shows (D-33), with the equation ids and
 * names it uses, for the open project's options (a manual demand or PV changes the formulas).
 */
export function explainTool(context: AgentContext) {
  return tool({
    description:
      "Explain how First Move calculates a Quick Check step or result: the plain-language 'How we calculate' text with its equation ids (EQ-…, OQ-…) and tables. Use it instead of explaining the method from memory.",
    inputSchema: z.object({ topic: z.enum(EXPLAIN_TOPICS).describe("step.<area|buildings|sources|options|assumptions> or result.<value>") }),
    execute: async ({ topic }) => {
      const [kind, key] = topic.split(".") as ["step" | "result", string]
      const project = context.project()
      const flags = project ? run(project).flags : NO_FLAGS
      const explanation: Explanation = kind === "step" ? STEP_EXPLAIN[key as ExplainedStep] : explainResult(key as ExplainedResult, flags)
      return {
        text: lookup(context.texts.calc, explanation.text) ?? "",
        formulas: explanation.formulas.map((id) => ({ id, name: lookup(context.texts.calc, formulaNameKey(id)) ?? id })),
        tables: explanation.tables,
      }
    },
  })
}
