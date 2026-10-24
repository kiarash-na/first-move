import { EXAMPLES, localizeExample } from "@/lib/examples"
import { resolveTexts } from "@/lib/examples/resolve-texts"
import type { Locale } from "@/lib/i18n/locales"
import type { ScenarioId } from "@/lib/project"
import { run, type ResultLevel } from "@/lib/quick-check"

/** What an example card on the start screen shows (D-04). Plain data, safe to pass to a client component. */
export interface ExampleCard {
  id: string
  scenarioId: ScenarioId
  name: string
  summary: string
  buildings: number | null
  areaM2: number | null
  /** The Quick Check verdict of the example's inputs, from the real engine (`run`). */
  level: ResultLevel | null
  /** The verdict was forced by a rule (unknown source, industry), QCT-RULE-*. */
  forced: boolean
}

/** The six example cards in demo order, with their verdicts computed by `run()`. */
export function exampleCards(lang: Locale): ExampleCard[] {
  return EXAMPLES.map((example) => {
    const project = localizeExample(example, lang)
    const result = run(project)
    const complete = result.status === "complete"
    return {
      id: example.id,
      scenarioId: example.scenarioId,
      name: project.meta.name,
      summary: resolveTexts(example.summary, lang) as string,
      buildings: project.buildings.total,
      areaM2: project.buildings.areaM2,
      level: complete ? result.assessment.level : null,
      forced: complete ? result.assessment.forced : false,
    }
  })
}
