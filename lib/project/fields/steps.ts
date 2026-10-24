/**
 * Input steps, in order (route segments of PLAN-DASH-00). The Quick Check steps are the
 * structured input process of QCT-IN-00; `results` is a page, not an input step.
 */
export const QUICK_CHECK_STEPS = ["area", "buildings", "sources", "options"] as const

export type QuickCheckStep = (typeof QUICK_CHECK_STEPS)[number]

/** The Business Plan steps BM-STEP-01..04 (free navigation, D-28). */
export const BUSINESS_PLAN_STEPS = ["opportunity", "business-logic", "reality-check", "implementation"] as const

export type BusinessPlanStep = (typeof BUSINESS_PLAN_STEPS)[number]

/**
 * Where a field is edited: a module step, `assumptions` (the parameter playground, D-10) or
 * `project` (name and modules: start screen and project menu).
 */
export type FieldStep = "project" | "assumptions" | QuickCheckStep | BusinessPlanStep
