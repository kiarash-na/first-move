import type { DimensionId } from "./dimensions"

/**
 * General, feasible improvements per dimension (PLAN-AI-SCORE-01 § Suggestions), each from a
 * verified source. The on-demand suggestion run (D-77) may only adapt these to the plan; it must
 * not invent facts, programmes or figures.
 */
export const HINTS: Record<DimensionId, readonly { text: string; sources: readonly string[] }[]> = {
  value: [
    { text: "Compare the yearly cost for one typical customer on the network with gas and with an individual heat pump over the same 20 to 30 years.", sources: ["BM-STEP-01", "ALG-10", "SRC-GHNF-2026"] },
    { text: "Quantify the cooling demand and make cooling a stated reason to connect where it exists.", sources: ["ALG-06", "ALG-10", "SRC-WIRTZ-2020-EB"] },
    { text: "Do not rely on customers paying extra for green heat; lead with price stability, comfort and avoided replacement costs.", sources: ["SRC-LYGNERUD-2019"] },
  ],
  technology: [
    { text: "State the trench length and the heat demand per metre of trench, and connect close buildings first.", sources: ["ALG-09", "SRC-REIDHAV-WERNER-2008"] },
    { text: "Replace benchmark demand with billed or metered consumption, at least for the anchor buildings.", sources: ["SRC-GHNF-2026"] },
    { text: "Check the groundwater and borehole potential in public maps and book an early meeting with the water authority.", sources: ["SRC-WIEN-WWP-METHOD", "SRC-WRG-1959"] },
  ],
  economics: [
    { text: "Spread the investment over its depreciation period and compare it each year with the revenues and the running costs.", sources: ["ALG-10", "SRC-HMT-BC-2026"] },
    { text: "Change the connection rate, the tariff, the investment and the electricity price one at a time and note the value at which the plan breaks even.", sources: ["SRC-EC-CBA-2014"] },
    { text: "Add a contingency for optimism and show the plan without any subsidy.", sources: ["SRC-HMT-BC-2026", "ALG-10", "SRC-ARENA-CRI-2014"] },
  ],
  governance: [
    { text: "Draw the system boundary: who owns, finances and operates the source, the network and the heat pumps.", sources: ["ALG-10"] },
    { text: "Write the cost key as a rule, for example the source by connected load and the pipes by those who use them, and check that no party carries a risk without a matching benefit.", sources: ["ALG-10", "BM-STEP-02", "SRC-HMT-BC-2026"] },
    { text: "List the contract points to settle: supply details, renegotiation, mitigation and a simple contract.", sources: ["SRC-LYGNERUD-2019"] },
  ],
  participation: [
    { text: "Name one anchor customer and aim for a letter of intent.", sources: ["ALG-10", "SRC-GHNF-2026"] },
    { text: "For each owner type, write who decides and by which rule, for example condominium, rental and non-profit housing.", sources: ["ALG-05", "ALG-10", "BM-SCN-03"] },
    { text: "Involve the municipality early as a partner, and develop the offer with a small group of committed first customers.", sources: ["ALG-05", "SRC-BUSH-2016", "SRC-LYGNERUD-2023"] },
  ],
  evidence: [
    { text: "Rank the assumptions by importance and by evidence, and test the important ones without evidence first.", sources: ["SRC-BLAND-2020"] },
    { text: "Make the deal-breaker concrete: what would stop the project, which test shows it, who runs it and by when.", sources: ["BM-STEP-03"] },
    { text: "Record what changed after feedback, and why.", sources: ["BM-STEP-04", "SRC-BRINCKMANN-2010"] },
  ],
  path: [
    { text: "Define a first phase as a small cluster or micro-network, and the steps to grow from it.", sources: ["ALG-09", "ALG-10", "SRC-BOESTEN-2019"] },
    { text: "State under which conditions the model transfers to other sites, and where it does not.", sources: ["BM-STEP-04", "SRC-D2GRIDS-2020"] },
    { text: "Set a go or no-go gate with measurable criteria, a decision-maker and a date.", sources: ["BM-STEP-04", "SRC-HMT-BC-2026"] },
  ],
}
