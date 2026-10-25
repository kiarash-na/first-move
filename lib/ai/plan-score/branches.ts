import type { Gate } from "./gates"
import type { Turn } from "./judgements"

/**
 * Branches: choice questions that steer the flow (PLAN-AI-SCORE-01 § Branches). Jev picks the
 * option the plan describes; the next turn then asks the follow-up gate of that option only, so
 * the questions a plan gets depend on what it is. An option without a follow-up (unclear, none)
 * asks nothing more. Most follow-ups are flags; the water-law permit caps technology (G9).
 */
export interface BranchOption {
  id: string
  /** What Jev reads for this option. */
  criterion: string
  followUp: Pick<Gate, "id" | "question" | "effect" | "sources"> | null
}

export interface Branch {
  id: string
  turn: Turn
  /** The turn whose questions include the chosen option's follow-up gate. */
  followUpTurn: Turn
  followUpDimension: Gate["dimension"]
  question: string
  options: readonly BranchOption[]
  sources: readonly string[]
}

const FLAG = { kind: "flag" } as const
const option = (id: string, criterion: string, followUp: BranchOption["followUp"] = null): BranchOption => ({ id, criterion, followUp })
const flag = (id: string, question: string, sources: readonly string[]) => ({ id, question, effect: FLAG, sources })

/** G9 of the method: a typical deal-breaker, so it caps technology at level 2. */
const WATER_PERMIT = {
  id: "water-permit",
  question: "Does the plan name the permit route for using the groundwater, the ground or the surface water, or an early check with the water authority?",
  effect: { kind: "cap", level: 2 },
  sources: ["SRC-WRG-1959", "SRC-OOE-GWWP", "ALG-05", "ALG-09"],
} as const satisfies BranchOption["followUp"]

export const BRANCHES: readonly Branch[] = [
  {
    id: "anchor-type",
    turn: 1,
    followUpTurn: 2,
    followUpDimension: "participation",
    question: "Which kind of anchor customer does the plan mainly rely on?",
    sources: ["ALG-10", "ALG-05"],
    options: [
      option(
        "public",
        "A public building: a school, hospital, swimming pool, administration building or similar",
        flag("anchor-public", "Does the plan address the public owner's decision path: a council or board decision, the budget, or public procurement?", ["ALG-05", "SRC-BUSH-2016"]),
      ),
      option(
        "commercial",
        "A commercial customer: a hotel, spa, shop, office or similar",
        flag("anchor-commercial", "Does the plan address how long the commercial anchor customer commits (contract term) compared with the payback period of the network?", ["ALG-10", "SRC-LYGNERUD-2019"]),
      ),
      option(
        "residential",
        "A housing company, a housing cooperative or another large residential owner",
        flag("anchor-residential", "Does the plan address how the individual owners or tenants decide, for example owners' votes, tenancy rules or consent of the tenants?", ["ALG-10", "ALG-05"]),
      ),
      option(
        "industry",
        "A company that supplies waste heat, or a large cooling user such as a data centre, an ice rink or a supermarket",
        flag("anchor-industry", "Does the plan address how secure the waste heat or the cooling demand is over time: a contract, and a backup if the company leaves?", ["ALG-06", "SRC-LYGNERUD-WERNER-2018"]),
      ),
      option("none", "No anchor customer can be identified in the plan"),
    ],
  },
  {
    id: "source-type",
    turn: 1,
    followUpTurn: 2,
    followUpDimension: "technology",
    question: "Which heat source does the plan mainly rely on?",
    sources: ["ALG-06", "ALG-09"],
    options: [
      option("groundwater", "Groundwater, with wells", WATER_PERMIT),
      option("borehole", "A borehole field (geothermal probes) or other shallow geothermal energy", WATER_PERMIT),
      option("surface-water", "Water from a lake, river or the sea", WATER_PERMIT),
      option(
        "wastewater",
        "Wastewater from a sewer or treatment plant",
        flag("source-wastewater", "Does the plan address an agreement with the sewer operator and the measured flow and temperature of the wastewater?", ["ALG-06"]),
      ),
      option(
        "waste-heat",
        "Waste heat from industry, commerce, a data centre or cooling plants",
        flag("source-waste-heat", "Does the plan address a supply agreement with the owner of the waste heat and what happens if that supply stops?", ["SRC-LYGNERUD-2019", "SRC-LYGNERUD-WERNER-2018"]),
      ),
      option(
        "air",
        "Ambient air only",
        flag("source-air", "Does the plan address the lower efficiency of air as a source in cold weather and the noise of the outdoor units?", ["ALG-06"]),
      ),
      option("unclear", "The plan names no main source, or the source is unclear"),
    ],
  },
  {
    id: "ownership",
    turn: 2,
    followUpTurn: 3,
    followUpDimension: "governance",
    question: "Which ownership and operating model does the plan describe for the network?",
    sources: ["ALG-04", "ALG-05", "BM-SCOPE-03", "SRC-HAWKEY-2013"],
    options: [
      option(
        "utility",
        "A municipal or regional utility owns and operates it",
        flag("owner-utility", "Does the plan state the utility's commitment: a decision, a letter of intent or its defined role in the project?", ["ALG-05", "ALG-08"]),
      ),
      option(
        "municipal",
        "The municipality or a municipal company owns it",
        flag("owner-municipal", "Does the plan address the municipal decision path: a council decision, the budget or a municipal company?", ["ALG-05", "SRC-BUSH-2016"]),
      ),
      option(
        "community",
        "The users own it together: a cooperative, an owners' association or an energy community",
        flag("owner-community", "Does the plan address the rules of the community: members' votes, joining and leaving, liability and how members finance their share?", ["ALG-05", "ALG-10"]),
      ),
      option(
        "contracting",
        "A contractor or energy service company owns and operates it and sells heat and cooling",
        flag("owner-contracting", "Does the plan address the contract term, how prices may change over time and what happens when the contract ends?", ["SRC-LYGNERUD-2019"]),
      ),
      option(
        "developer",
        "The developer or owner of a single estate builds and runs it for its own buildings",
        flag("owner-developer", "Does the plan address who operates and maintains the network after the buildings are handed over or sold?", ["ALG-05"]),
      ),
      option("unclear", "The plan leaves ownership and operation open or unclear"),
    ],
  },
]

/** Every follow-up gate id once, for checks and copy. */
export const FOLLOW_UP_GATE_IDS: readonly string[] = [
  ...new Set(BRANCHES.flatMap((branch) => branch.options.flatMap((entry) => (entry.followUp ? [entry.followUp.id] : [])))),
]

/** The follow-up gate of a chosen option as a full gate, or null. */
export function followUpGate(branch: Branch, choice: string): Gate | null {
  const chosen = branch.options.find((entry) => entry.id === choice)
  if (!chosen?.followUp) return null
  return { ...chosen.followUp, turn: branch.followUpTurn, dimension: branch.followUpDimension }
}
