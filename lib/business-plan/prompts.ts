import type { BusinessPlanStep } from "@/lib/project/fields/steps"

/**
 * Guiding prompts of the Business Plan (PLAN-DASH-10 step 3): the key questions of BM-SCOPE-03
 * and the learnings and tips of ALG-04, ALG-05, ALG-06, ALG-09 and ALG-10, each tied to the
 * step it helps. Copy lives in the `business-plan` dictionary at `prompts.<id>`; `source` is
 * shown as a tag.
 */
export type PromptKind = "question" | "learning" | "tip"

export interface Prompt {
  /** Dictionary key under `prompts`. */
  id: string
  step: BusinessPlanStep
  kind: PromptKind
  /** Requirement or knowledge ID the prompt comes from. */
  source: string
}

const question = (id: string, step: BusinessPlanStep, source: string): Prompt => ({ id, step, kind: "question", source })
const learning = (id: string, step: BusinessPlanStep, source: string): Prompt => ({ id, step, kind: "learning", source })
const tip = (id: string, step: BusinessPlanStep, source: string): Prompt => ({ id, step, kind: "tip", source })

export const PROMPTS: readonly Prompt[] = [
  // 1 · Define the opportunity
  question("motivation", "opportunity", "BM-SCOPE-03"),
  question("resilience", "opportunity", "BM-SCOPE-03"),
  learning("existingBuildings", "opportunity", "ALG-09"),
  learning("heatLineDensity", "opportunity", "ALG-09"),
  learning("groundwater", "opportunity", "ALG-09"),
  learning("bothDirections", "opportunity", "ALG-06"),
  tip("extraValue", "opportunity", "ALG-10"),

  // 2 · Build the business logic
  question("whoPays", "business-logic", "BM-SCOPE-03"),
  question("whoOperates", "business-logic", "BM-SCOPE-03"),
  question("distribution", "business-logic", "BM-SCOPE-03"),
  learning("ownership", "business-logic", "ALG-05"),
  learning("implementationModels", "business-logic", "ALG-04"),
  tip("systemBoundary", "business-logic", "ALG-10"),
  tip("costKey", "business-logic", "ALG-10"),
  tip("infrastructure", "business-logic", "ALG-10"),

  // 3 · Run the reality check
  question("framework", "reality-check", "BM-SCOPE-03"),
  question("reliability", "reality-check", "BM-SCOPE-03"),
  learning("pipesDriveCost", "reality-check", "ALG-09"),
  tip("costsFirst", "reality-check", "ALG-10"),
  tip("stayingOut", "reality-check", "ALG-10"),
  tip("voluntary", "reality-check", "ALG-10"),
  tip("funding", "reality-check", "ALG-10"),

  // 4 · Improve and prepare implementation
  question("scaleHere", "implementation", "BM-SCOPE-03"),
  question("whatWorks", "implementation", "BM-SCOPE-09"),
  learning("organisational", "implementation", "ALG-05"),
  learning("alignment", "implementation", "ALG-05"),
  learning("leadership", "implementation", "ALG-05"),
  learning("scalableModels", "implementation", "ALG-05"),
  tip("startSmall", "implementation", "ALG-10"),
]

/** The prompts of one step, in order. */
export function promptsFor(step: BusinessPlanStep): Prompt[] {
  return PROMPTS.filter((prompt) => prompt.step === step)
}
