import type { CanvasBlock, ConstructionPeriod, BuildingType, Potential, ScenarioId, SourceKey } from "@/lib/project/catalog"
import type { BusinessAssumptions, Opportunity, Refinements, Scalability, NextSteps, Site } from "@/lib/project/schema"

/**
 * Text of an example in both languages (PLAN-DASH-06, an allowed exception to the dictionary
 * rule). German may be missing (D-32): the English text is used then.
 */
export interface Localized {
  en: string
  de?: string
}

/** A `Localized` text; the German part is optional until the translation pass (D-32). */
export const text = (en: string, de?: string): Localized => (de === undefined ? { en } : { en, de })

/** A schema type with every free-text value replaced by a `Localized` text. */
type Texts<T> = { [K in keyof T]: Localized }

/** Share grid in % as typed (0-100): only the cells that are filled in. */
export type ExampleShares = {
  [Type in BuildingType]?: { [Period in ConstructionPeriod]?: number }
}

/** A row of an item list: a stable id plus the localized cells. */
type Row<Cells extends string> = { id: string } & Record<Cells, Localized>

export interface ExampleRisk {
  id: string
  title: Localized
  description: Localized
  dealBreaker: boolean
  validation: Localized
}

/** Business Plan content of an example (BM-STEP-01..04), the free texts as `Localized`. */
export interface ExampleBusinessPlan {
  opportunity: Texts<Opportunity>
  canvas: Record<CanvasBlock, Localized>
  allocation: Row<"stakeholder" | "investment" | "risk" | "benefit">[]
  assumptions: Texts<BusinessAssumptions>
  criticalAssumptions: Row<"statement" | "validation">[]
  risks: ExampleRisk[]
  refinements: Texts<Refinements>
  scalability: Texts<Scalability>
  nextSteps: Texts<NextSteps>
}

/**
 * An example project: both modules filled (D-04). Text is `Localized`, everything else is
 * what the project stores. `localizeExample` turns it into a valid `Project`.
 */
export interface ExampleDefinition {
  /** Becomes `meta.exampleId`: lower case letters, digits and hyphens. */
  id: string
  /** The BM-SCN scenario it is based on, or `custom` for the two extra examples. */
  scenarioId: ScenarioId
  name: Localized
  /** One sentence for the start screen. */
  summary: Localized
  site: { [K in keyof Site]: Site[K] extends string ? Localized : Localized[] }
  buildings: { total: number; areaM2: number; shares: ExampleShares }
  /** Selected sources with their potential; the others are not selected. */
  sources: { potentials: Partial<Record<SourceKey, Potential>>; pv: boolean }
  /** Known network length in m (QCT-IN-08); omitted = estimated by EQ-3.4a/b. */
  networkLengthM?: number
  businessPlan: ExampleBusinessPlan
}
