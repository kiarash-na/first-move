import type { DimensionId } from "./dimensions"

/** The four Business Plan steps (BM-STEP-01..04) are the four AI turns, run from top to bottom. */
export const TURNS = [1, 2, 3, 4] as const
export type Turn = (typeof TURNS)[number]

/**
 * One judgement Jev scores on the evidence scale (PLAN-AI-SCORE-01 § Judgements): one field, or
 * several fields merged so the same content is not scored twice. It is judged in the turn of its
 * first field, belongs to one dimension, says what a strong answer contains and cites its sources
 * (ids in `lib/docs/references.ts` or provider ids such as ALG-10).
 */
export interface Judgement {
  id: string
  turn: Turn
  dimension: DimensionId
  /** English label for Jev and the text model; the UI uses `ai-score.json`. */
  label: string
  /** The registry ids it reads, each with an English sub-label for merged judgements. */
  fields: readonly { id: string; label: string }[]
  good: string
  sources: readonly string[]
}

const j = (id: string, turn: Turn, dimension: DimensionId, label: string, fields: Judgement["fields"], good: string, sources: readonly string[]): Judgement => ({
  id,
  turn,
  dimension,
  label,
  fields,
  good,
  sources,
})
const f = (id: string, label: string) => ({ id, label })

/** In the order of the plan, from the first field to the last. */
export const JUDGEMENTS: readonly Judgement[] = [
  // Turn 1 · BM-STEP-01 Define the opportunity
  j(
    "site",
    1,
    "technology",
    "Site description",
    [f("site.name", "Name"), f("site.location", "Location"), f("site.siteType", "Type of site"), f("site.units", "Units or buildings"), f("site.currentSupply", "Current energy supply")],
    "The exact location and settlement type, the number of buildings and units, building ages and the current supply. Level 3 gives numbers (units, buildings, area, rough network length); level 4 names the data source (cadastre, energy certificates).",
    ["BM-STEP-01", "ALG-09"],
  ),
  j(
    "ownership",
    1,
    "participation",
    "Property and usage types",
    [f("site.ownership", "Property and usage types")],
    "The owner types and their decision rules (for example condominium, rental and non-profit housing), who must agree before a building can connect, and split incentives between landlord and tenant.",
    ["ALG-05", "ALG-10", "BM-SCN-03"],
  ),
  j(
    "stakeholders",
    1,
    "participation",
    "Stakeholders and partners",
    [f("site.stakeholders", "Stakeholders"), f("site.partners", "Other partners")],
    "All decision-makers and affected parties, including authorities (water, planning), the municipality, owners, tenants and neighbours, with their interest and influence.",
    ["ALG-05", "SRC-WUSTENHAGEN-2007", "SRC-BUSH-2016"],
  ),
  j(
    "segments",
    1,
    "value",
    "Customer segments",
    [f("businessPlan.opportunity.customerSegments", "Customer segments (opportunity)"), f("businessPlan.canvas.customerSegments", "Customer segments (canvas)")],
    "Segments tied to the site's buildings (for example 'housing cooperative, 6 buildings, 240 flats; a school; a hotel') with owner type and share of demand, separating who uses from who pays. Level 4: demand per segment from metered or billed data.",
    ["BM-STEP-01", "BM-SCOPE-03", "SRC-OSTERWALDER-2010", "SRC-GHNF-2026"],
  ),
  j(
    "needs",
    1,
    "value",
    "Heating and cooling needs",
    [f("businessPlan.opportunity.needs", "Heating and cooling needs")],
    "Heating and cooling needs, hot water and the temperature level (radiators or floor heating), quantified (MWh per year, kW), with the balance between heating and cooling. Level 4: measured, or consistent with the Quick Check demand.",
    ["BM-STEP-01", "ALG-06", "SRC-WIRTZ-2020-EB"],
  ),
  j(
    "pain-point",
    1,
    "value",
    "Key pain point",
    [f("businessPlan.opportunity.painPoint", "Key pain point")],
    "A concrete problem of named customers (boilers at the end of their life, price swings, no district heating planned, summer overheating) with a number such as boiler age or cost. Level 4: evidence from a survey or bills.",
    ["BM-STEP-01", "BM-SCOPE-02", "SRC-BROWN-2008"],
  ),
  j(
    "advantage",
    1,
    "value",
    "Advantage over the alternatives",
    [f("businessPlan.opportunity.alternatives", "Available alternatives"), f("businessPlan.opportunity.advantage", "Why a shared low-temperature network")],
    "The realistic alternatives (individual air or ground heat pumps, district heating where available, staying on gas) compared with the network on cost per customer over the same years, plus space, noise, cooling and price stability, including where the network does not win. Level 4: a quantified lifetime comparison.",
    ["BM-STEP-01", "BM-SCOPE-02", "ALG-10", "SRC-GHNF-2026"],
  ),
  j(
    "heat-sources",
    1,
    "technology",
    "Heat sources",
    [f("businessPlan.opportunity.heatSources", "Relevant heat sources")],
    "Named sources with location, temperature, annual energy or capacity against the demand, storage or balancing, and who owns the source; for waste heat its continuity, for groundwater or surface water the permit route. Level 4: an atlas or measurement, or a letter from the supplier.",
    ["ALG-06", "ALG-09", "SRC-LYGNERUD-2019", "SRC-WIEN-WWP-METHOD"],
  ),

  // Turn 2 · BM-STEP-02 Build the business logic
  j(
    "value-proposition",
    2,
    "value",
    "Value proposition",
    [f("businessPlan.canvas.valueProposition", "Value proposition")],
    "A value per customer segment (no own heating system to replace, cooling, stable prices, no own drilling, less space), not only 'green'. Level 4: tested with customers, for example interviews or letters of intent.",
    ["SRC-OSTERWALDER-2010", "SRC-LYGNERUD-2019", "SRC-LYGNERUD-2023"],
  ),
  j(
    "resources",
    2,
    "technology",
    "Key resources",
    [f("businessPlan.canvas.keyResources", "Key resources")],
    "The physical and legal assets: access to the source (water rights, land for boreholes), public land for pipes, the network, storage or an energy centre, data and skills.",
    ["SRC-OSTERWALDER-2010", "ALG-10", "ALG-09"],
  ),
  j(
    "partners",
    2,
    "governance",
    "Key partners",
    [f("businessPlan.canvas.keyPartners", "Key partners")],
    "Named partners with their role, contribution and motivation: the municipality, a utility, a housing association, the source owner, an installer, a bank.",
    ["SRC-OSTERWALDER-2010", "ALG-05", "ALG-08", "SRC-HAWKEY-2013"],
  ),
  j(
    "engagement",
    2,
    "participation",
    "Customer relationships and channels",
    [f("businessPlan.canvas.customerRelationships", "Customer relationships"), f("businessPlan.canvas.channels", "Channels")],
    "How owners are approached and by whom (a trusted local initiator), the connection contract (duration, exit, price adjustment) and co-creation with early customers. Level 4: signed letters of intent or survey results.",
    ["ALG-05", "SRC-LYGNERUD-2023", "SRC-GHNF-2026"],
  ),
  j(
    "cost-basis",
    2,
    "economics",
    "Costs and capital expenditure",
    [f("businessPlan.canvas.costStructure", "Cost structure"), f("businessPlan.assumptions.capex", "Capital expenditure")],
    "Investment split by system part (source, network per metre of trench, house connections, heat pumps, storage) and running costs (heat-pump electricity, maintenance, metering), with units and a basis. Level 4: quotes or comparable projects, plus an explicit contingency for optimism.",
    ["ALG-09", "SRC-NUSSBAUMER-2016", "SRC-HMT-BC-2026", "SRC-ARENA-CRI-2014"],
  ),
  j(
    "revenue",
    2,
    "economics",
    "Revenue model and tariffs",
    [f("businessPlan.canvas.revenueStreams", "Revenue streams"), f("businessPlan.assumptions.tariffs", "Tariffs")],
    "The tariff structure (connection fee, base price per m² or kW, energy price per kWh for heating and cooling), who pays what, indexation and contract length, compared with the customer's alternative. Level 4: revenue tested separately for quantity and tariff, or the customers' reaction known.",
    ["SRC-EC-CBA-2014", "SRC-ARENA-CRI-2014", "ALG-10"],
  ),
  j(
    "operations",
    2,
    "governance",
    "Activities and operator responsibilities",
    [f("businessPlan.canvas.keyActivities", "Key activities"), f("businessPlan.canvas.operatorResponsibilities", "Operator responsibilities")],
    "Who plans, builds, finances, owns, operates, maintains, meters and bills, balances the network and handles faults and security of supply. Level 4: a draft operator or connection agreement covering supply details, renegotiation and mitigation.",
    ["BM-STEP-02", "BM-SCOPE-03", "SRC-HMT-BC-2026", "SRC-LYGNERUD-2019"],
  ),
  j(
    "allocation",
    2,
    "governance",
    "Allocation of investment, risk and benefit",
    [f("businessPlan.allocation", "Allocation rows")],
    "Each stakeholder row states investment, risk and benefit, and they fit together: no one carries a risk without a benefit, a cost key is visible, and each risk sits with the party that controls it. Level 4: quantified shares.",
    ["BM-STEP-02", "BM-SCOPE-03", "ALG-10", "SRC-HMT-BC-2026"],
  ),

  // Turn 3 · BM-STEP-03 Run the reality check
  j(
    "connection-rate",
    3,
    "participation",
    "Connection rate",
    [f("businessPlan.assumptions.connectionRate", "Connection rate")],
    "A rate (share of buildings or of demand) with its basis and timeline, the lowest rate at which the plan still works, and what happens below it. Level 4: backed by commitments, with a break-even value.",
    ["ALG-10", "SRC-EC-CBA-2014", "SRC-GHNF-2026", "BM-STEP-03"],
  ),
  j(
    "financing",
    3,
    "economics",
    "Financing",
    [f("businessPlan.assumptions.financing", "Financing")],
    "Who finances which asset (source, network, heat pumps) and with what (equity, loan, contracting, citizen participation, municipal infrastructure finance), with a term that matches the asset life of 25 to 30 years and an interest assumption. Level 4: an indication from a lender or the municipality.",
    ["ALG-04", "ALG-10", "SRC-STEFFEN-2018", "SRC-HMT-BC-2026"],
  ),
  j(
    "subsidies",
    3,
    "economics",
    "Subsidy dependence",
    [f("businessPlan.assumptions.subsidies", "Subsidy dependence")],
    "The programme counted on, the assumed amount or rate, which owner is eligible, the timing, and the case without the subsidy.",
    ["ALG-10", "SRC-UFI-WKV", "SRC-ARENA-CRI-2014"],
  ),
  j(
    "assumptions",
    3,
    "evidence",
    "Critical assumptions",
    [f("businessPlan.criticalAssumptions", "Critical assumption rows")],
    "The few assumptions whose failure would sink the plan, each with a concrete validation (what, who, by when), ordered by importance and by how little evidence there is yet.",
    ["BM-STEP-03", "SRC-BLAND-2020", "SRC-EC-CBA-2014", "SRC-HMT-BC-2026"],
  ),
  j(
    "risks",
    3,
    "evidence",
    "Risks and the deal-breaker",
    [f("businessPlan.risks", "Risk rows")],
    "Risks of different kinds (source yield, electricity price for the heat pumps, connection uptake, permits, operator capacity), each with impact, mitigation and validation, one flagged as the potential deal-breaker.",
    ["BM-STEP-03", "BM-SCOPE-03", "SRC-LYGNERUD-2019", "SRC-ARENA-CRI-2014"],
  ),

  // Turn 4 · BM-STEP-04 Improve and prepare implementation
  j(
    "learning",
    4,
    "evidence",
    "Feedback and what changed",
    [f("businessPlan.refinements.feedback", "Feedback and challenges"), f("businessPlan.refinements.changes", "What changed in the model, and why")],
    "Specific feedback and from whom, what changed in the model and why, and what was dropped.",
    ["BM-STEP-04", "SRC-BRINCKMANN-2010"],
  ),
  j(
    "scalability",
    4,
    "path",
    "Scalability and replication",
    [f("businessPlan.scalability.geographical", "Geographical conditions"), f("businessPlan.scalability.economic", "Economic conditions"), f("businessPlan.scalability.organisational", "Organisational conditions")],
    "The conditions under which the model transfers (density, source type, owner structure, regulation), which parts are standardised (contracts, cost key, operator model) and where it does not work. Level 4: checked against another scenario or site.",
    ["BM-STEP-04", "ALG-05", "SRC-D2GRIDS-2020", "SRC-BOESTEN-2019"],
  ),
  j(
    "data",
    4,
    "path",
    "Data to collect",
    [f("businessPlan.nextSteps.data", "Data to collect")],
    "Each data item tied to the assumption it tests: metered consumption, a groundwater test, the trench route, an owner survey.",
    ["BM-STEP-04", "SRC-GHNF-2026", "ALG-09"],
  ),
  j(
    "next-partners",
    4,
    "path",
    "Stakeholders and partnerships to secure",
    [f("businessPlan.nextSteps.stakeholders", "Stakeholders to engage"), f("businessPlan.nextSteps.partnerships", "Partnerships to secure")],
    "Who comes next, in which order, and which agreement to obtain (letter of intent, partnership agreement, a meeting with the authority), with dates.",
    ["BM-STEP-04", "ALG-05"],
  ),
  j(
    "pilot",
    4,
    "path",
    "Pilot",
    [f("businessPlan.nextSteps.pilots", "Pilot opportunities")],
    "A small first step (an anchor cluster, a micro-network between neighbours) with scope, cost and success criteria.",
    ["ALG-09", "ALG-10", "SRC-ARENA-CRI-2014"],
  ),
  j(
    "decisions",
    4,
    "path",
    "Key decisions and the decision gate",
    [f("businessPlan.nextSteps.decisions", "Key decisions and the decision gate")],
    "A go or no-go gate with explicit criteria (for example letters of intent covering a share of the demand, a positive permit pre-check, a financing indication), a decision-maker and a date.",
    ["BM-STEP-04", "SRC-HMT-BC-2026"],
  ),
]

export const JUDGEMENT_IDS: readonly string[] = JUDGEMENTS.map((entry) => entry.id)

export function judgementOf(id: string): Judgement | undefined {
  return JUDGEMENTS.find((entry) => entry.id === id)
}

/** The registry ids a judgement reads. */
export const fieldIdsOf = (judgement: Judgement): string[] => judgement.fields.map((field) => field.id)
