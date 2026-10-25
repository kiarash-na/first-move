import { isTextFilled } from "@/lib/business-plan"
import type { Project } from "@/lib/project"
import type { DimensionId } from "./dimensions"
import type { Turn } from "./judgements"
import type { QuickCheckSignal } from "./quick-check-signal"

/**
 * Gates: cross-field questions about the whole plan (PLAN-AI-SCORE-01 § Gates). They never add
 * points. A gate that fails with confidence caps its dimension at level 2 (a must-have) or 3; an
 * unclear answer is a flag only; a flag gate never caps. The analogy is the gated metrics of
 * SRC-GHNF-2026, with bounded effects. Some gates are decided by a rule before any AI (`precheck`).
 */
export type GateEffect = { kind: "cap"; level: 2 | 3 } | { kind: "flag" }

/** How an option of a choice gate counts: pass 1, partial 0.5, fail 0; neutral = not applicable. */
export type OptionVerdict = "pass" | "partial" | "fail" | "neutral"

export interface GateOption {
  id: string
  criterion: string
  verdict: OptionVerdict
}

export interface GateContext {
  project: Project
  signal: QuickCheckSignal | null
}

export interface Gate {
  id: string
  turn: Turn
  dimension: DimensionId
  question: string
  /** A choice gate's options; a boolean gate has none. */
  options?: readonly GateOption[]
  effect: GateEffect
  /** A rule that decides before any AI: `fail`, `skip` (not applicable), or null to ask Jev. */
  precheck?: (context: GateContext) => "fail" | "skip" | null
  /** A cap that applies only under a condition; without it the gate is a flag. */
  capWhen?: (context: GateContext) => boolean
  sources: readonly string[]
}

/** P(true) from which a gate passes, and up to which it fails (repo research note: 0.8 for booleans). */
export const GATE_PASS = 0.8
export const GATE_FAIL = 0.2

/** TBL-9: below 0.5 MWh/m the Quick Check classes the heat density as low (OQ-10). */
export const LOW_HEAT_DENSITY = 0.5

const cap = (level: 2 | 3): GateEffect => ({ kind: "cap", level })
const FLAG: GateEffect = { kind: "flag" }
const option = (id: string, criterion: string, verdict: OptionVerdict): GateOption => ({ id, criterion, verdict })
const empty = (project: Project, path: (project: Project) => string) => !isTextFilled(path(project))
const VIENNA = /\b(wien|vienna)\b/i

export const GATES: readonly Gate[] = [
  // Turn 1
  {
    id: "anchor",
    turn: 1,
    dimension: "participation",
    question: "Does the plan name at least one specific anchor customer, a large or early connection, and its role?",
    effect: cap(2),
    sources: ["ALG-10", "SRC-GHNF-2026", "SRC-LYGNERUD-2023"],
  },
  {
    id: "extra-value",
    turn: 1,
    dimension: "value",
    question: "Does the plan use cooling or another extra value, such as stable prices or relief for the power grid, as a reason to connect, where it applies?",
    effect: FLAG,
    sources: ["ALG-06", "ALG-10", "SRC-WIRTZ-2020-EB"],
  },
  {
    id: "heat-density",
    turn: 1,
    dimension: "technology",
    question: "Does the plan address network length or heat line density as a cost driver, for example trench length, clustering close buildings or micro-networks?",
    effect: cap(2),
    capWhen: ({ signal }) => signal !== null && signal.heatDensityMwhPerM < LOW_HEAT_DENSITY,
    sources: ["ALG-09", "SRC-PERSSON-WERNER-2011", "SRC-REIDHAV-WERNER-2008", "SRC-BUFFA-2019"],
  },
  {
    id: "vienna-zone",
    turn: 1,
    dimension: "technology",
    question: "Does the plan state the site's zone in the Vienna Heating Plan 2040 (Wiener Wärmeplan 2040) and explain why a 5GDHC network fits it?",
    effect: FLAG,
    precheck: ({ project }) => (VIENNA.test(`${project.site.name} ${project.site.location}`) ? null : "skip"),
    sources: ["ALG-07", "SRC-WIEN-WWP-2040", "SRC-WIEN-WWP-METHOD"],
  },
  // Turn 2
  {
    id: "boundary",
    turn: 2,
    dimension: "governance",
    question: "Who owns the heat source, the network and the heat pumps in the buildings, according to the plan?",
    options: [
      option("all", "The plan states the owner of all three: the source, the network and the building heat pumps", "pass"),
      option("partial", "The plan states the owner of one or two of them", "fail"),
      option("none", "The plan states none of them", "fail"),
    ],
    effect: cap(2),
    sources: ["ALG-10", "ALG-05", "BM-SCOPE-03"],
  },
  {
    id: "operator",
    turn: 2,
    dimension: "governance",
    question: "Does the plan name an operator and its operational duties, such as maintenance, billing, faults and security of supply?",
    effect: cap(3),
    sources: ["BM-STEP-02", "BM-SCOPE-03", "SRC-HMT-BC-2026"],
  },
  {
    id: "cost-key",
    turn: 2,
    dimension: "governance",
    question: "Does the plan state a rule for splitting the costs of the source, the pipes and the connections among the users?",
    effect: cap(3),
    sources: ["ALG-10", "SRC-LYGNERUD-2019"],
  },
  {
    id: "price-vs-alternative",
    turn: 2,
    dimension: "value",
    question: "Is the customer's price compared with the customer's realistic alternative, such as gas or an individual heat pump, including price stability?",
    effect: cap(2),
    sources: ["BM-STEP-01", "BM-SCOPE-02", "SRC-GHNF-2026", "SRC-LYGNERUD-2019"],
  },
  // Turn 3
  {
    id: "connection-threshold",
    turn: 3,
    dimension: "participation",
    question: "Does the plan state a connection rate and what happens to the costs or the viability if fewer buildings connect, for example a minimum rate or the effect per customer?",
    effect: cap(2),
    precheck: ({ project }) => (empty(project, (p) => p.businessPlan.assumptions.connectionRate) ? "fail" : null),
    sources: ["ALG-10", "SRC-EC-CBA-2014", "SRC-GHNF-2026", "SRC-EWG-2024"],
  },
  {
    id: "lifetime-cover",
    turn: 3,
    dimension: "economics",
    question: "Does the plan compare the yearly revenues with the yearly cost of the investment plus the running costs, heat-pump electricity included, over 20 to 30 years?",
    options: [
      option("yes", "Yes, revenues are compared with annualised investment and running costs over the long term", "pass"),
      option("partly", "Partly: some costs or years are compared, not all", "partial"),
      option("no", "No such comparison is made", "fail"),
    ],
    effect: cap(2),
    sources: ["ALG-10", "SRC-HMT-BC-2026", "SRC-ARENA-CRI-2014"],
  },
  {
    id: "subsidy-dependence",
    turn: 3,
    dimension: "economics",
    question: "How does the plan depend on subsidies?",
    options: [
      option("none", "It assumes no subsidy", "pass"),
      option("fallback", "It assumes a subsidy and says what happens with less or none", "pass"),
      option("no-fallback", "It assumes a subsidy and gives no fallback", "fail"),
      option("unclear", "It is unclear whether and how it depends on subsidies", "partial"),
    ],
    effect: cap(2),
    sources: ["ALG-10", "SRC-ARENA-CRI-2014", "SRC-SANOFF-2026", "SRC-GHNF-2026"],
  },
  {
    id: "deal-breaker",
    turn: 3,
    dimension: "evidence",
    question: "Is one risk marked as the potential deal-breaker, could it really stop the project, and does it have a concrete validation step (what, who, when)?",
    effect: cap(2),
    precheck: ({ project }) => (project.businessPlan.risks.some((risk) => risk.dealBreaker) ? null : "fail"),
    sources: ["BM-STEP-03", "SRC-BLAND-2020", "SRC-EC-CBA-2014"],
  },
  // Turn 4
  {
    id: "start-small",
    turn: 4,
    dimension: "path",
    question: "Is a first phase defined, such as an anchor cluster or a micro-network, with later steps to grow?",
    effect: cap(3),
    sources: ["ALG-10", "ALG-09", "SRC-BOESTEN-2019", "SRC-D2GRIDS-2020"],
  },
  {
    id: "decision-gate",
    turn: 4,
    dimension: "path",
    question: "Do the next steps contain a go or no-go decision with explicit, checkable criteria?",
    effect: cap(2),
    precheck: ({ project }) => (empty(project, (p) => p.businessPlan.nextSteps.decisions) ? "fail" : null),
    sources: ["BM-STEP-04", "SRC-HMT-BC-2026"],
  },
]

/** The cap a failed gate applies in this context, or null for a flag. */
export function capOf(gate: Gate, context: GateContext): 2 | 3 | null {
  if (gate.effect.kind !== "cap") return null
  if (gate.capWhen && !gate.capWhen(context)) return null
  return gate.effect.level
}

/** P(pass) of a choice answer: verdict-weighted, without the not-applicable options; null when those win. */
export function choicePassProbability(gate: Gate, probabilities: Readonly<Record<string, number>>): number | null {
  const options = gate.options ?? []
  const neutral = options.filter((entry) => entry.verdict === "neutral").reduce((sum, entry) => sum + (probabilities[entry.id] ?? 0), 0)
  if (neutral >= 0.5) return null
  const weight = { pass: 1, partial: 0.5, fail: 0 } as const
  const counted = options.filter((entry) => entry.verdict !== "neutral")
  const total = counted.reduce((sum, entry) => sum + (probabilities[entry.id] ?? 0), 0)
  if (total <= 0) return null
  return counted.reduce((sum, entry) => sum + weight[entry.verdict as keyof typeof weight] * (probabilities[entry.id] ?? 0), 0) / total
}
