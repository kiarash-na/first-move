import { run } from "@/lib/quick-check"
import type { QuickCheckComplete, QuickCheckFlags } from "@/lib/quick-check"
import type { Potential } from "@/lib/project/catalog/potentials"
import { SOURCES, type SourceKey } from "@/lib/project/catalog/sources"
import { QUICK_CHECK_STEPS, type QuickCheckStep } from "@/lib/project/fields/steps"
import type { Project } from "@/lib/project/schema/project"

/** The data both modules share (D-01), as the Business Plan shows it (ALG-09). */
export interface SharedSiteData {
  totalBuildings: number | null
  areaM2: number | null
  /** Selected sources with their potential, in table order. */
  sources: { source: SourceKey; potential: Potential }[]
}

/** The Quick Check numbers the Business Plan shows read-only (D-27). */
export interface QcNumbers {
  heatingDemandKwh: number
  coolingDemandKwh: number
  /** R_overall in €/a (EQ-3.9c). */
  overallRevenue: number
  /** C_overall in € (OQ-17). */
  overallInvestment: number
  flags: QuickCheckFlags
}

export type QcPrefill =
  /** The Quick Check module is off: link to it, show no numbers. */
  | { status: "off"; shared: SharedSiteData }
  /** The module is on but its inputs are not enough for a result (R-03). */
  | { status: "incomplete"; shared: SharedSiteData; nextStep: QuickCheckStep | null; flags: QuickCheckFlags }
  | { status: "ready"; shared: SharedSiteData; numbers: QcNumbers; result: QuickCheckComplete }

/** Shared site, buildings and sources of a project (the Quick Check inputs BP step 1 shows). */
export function sharedSiteData(project: Project): SharedSiteData {
  return {
    totalBuildings: project.buildings.total,
    areaM2: project.buildings.areaM2,
    sources: SOURCES.flatMap((source) => {
      const potential = project.sources.potentials[source]
      return potential ? [{ source, potential }] : []
    }),
  }
}

/**
 * Quick Check prefill for the Business Plan (ALG-09, D-27): the shared inputs, and, when the
 * module is on and complete, demand, revenue and investment from `run(project)`. The Business
 * Plan never calculates anything of its own.
 */
export function qcPrefill(project: Project): QcPrefill {
  const shared = sharedSiteData(project)
  if (!project.meta.modules.quickCheck) return { status: "off", shared }
  const result = run(project)
  if (result.status === "incomplete") {
    const nextStep = result.incompleteSteps.find((step): step is QuickCheckStep =>
      (QUICK_CHECK_STEPS as readonly string[]).includes(step),
    )
    return { status: "incomplete", shared, nextStep: nextStep ?? null, flags: result.flags }
  }
  const { values, flags } = result
  return {
    status: "ready",
    shared,
    result,
    numbers: {
      heatingDemandKwh: values.heatingDemandKwh,
      coolingDemandKwh: values.coolingDemandKwh,
      overallRevenue: values.overallRevenue,
      overallInvestment: values.overallInvestment,
      flags,
    },
  }
}
