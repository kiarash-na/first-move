---
id: PLAN-AI-SCORE-01
date: 2026-10-24
status: in-progress
challenge: [business-models]
covers: [D-71, D-73, D-74, D-75, D-77, D-27, D-30, D-33, BM-STEP-01, BM-STEP-02, BM-STEP-03, BM-STEP-04, BM-SCOPE-02, BM-SCOPE-03]
blocked_by: []
---

# AI Plan Score: the method (version 1.0.0)

This is the method behind [PLAN-AI-SCORE-00](2026-10-24_ai-score-00_plan.md): what the AI Plan Score judges, how it turns answers into a number, and why. It describes method version 1.0.0 as built in `lib/ai/plan-score/`. The code is the reference for every value; this file gives the reasons, and `lib/ai/plan-score/method.test.ts` checks the structure (27 judgements that read every Business Plan field once, 14 gates plus the water-law follow-up, weights that sum to 1, a source on every item).

Research behind it: [RESEARCH-AI-SCORE-RUBRIC](../research/scoring-rubric-proposal.md) and the [scoring sources](../research/scoring-sources.md). Where the built method differs from that proposal, this file says so under [Deviations from the research proposal](#deviations-from-the-research-proposal). The public, user-facing version is `content/docs/{en,de}/ai-plan-score.mdx`; `content/docs/content.test.ts` checks its numbers against the engine constants.

## Purpose

- Estimate the **quality of the written Business Plan**: is each part specific, quantified and backed by evidence, and does the plan settle what a solid 5GDHC business plan must settle (D-75)?
- **Show every decision**: each part's level with its probabilities, each gate, each branch. The route's flow graph draws exactly the decided nodes (`nodes.ts`).
- **Point to the next step**: the weakest parts and the failed or unclear gates, with general, feasible improvements on demand (D-77).

## Non-goals

- **No calculation and no feasibility verdict.** The Quick Check stays the only calculation (D-27). It enters the score only as a deterministic signal for Jev to read and for one conditional cap.
- **No jury score, no funding prediction, no ranking of teams.** A plan document is only weakly linked to funding decisions (SRC-KIRSCH-2009); the score says how well a plan is written, not whether the project will succeed.
- **Not the Pitch completeness.** That checklist counts filled fields (D-30) and keeps doing so under its new name (D-74). The AI Plan Score judges content and sits before it, bolder.
- **No legal, engineering or subsidy advice.** A gate asks whether the plan addresses a topic, never whether the answer is legally or technically right. Subsidy rates, eligibility and programme status are never stated (they change too often, SRC-SANOFF-2026).
- **No decision about a person.** The input is the text of a plan; the output is an opinion for the team that wrote it.

## The run at a glance

| Turn | Decided by | What |
|---|---|---|
| 0 | Rules, no AI | Which judgements have content. Empty ones get level 0 with certainty and are never sent. The Quick Check signal, when the module is on and its result complete. Rule gates (prechecks) that already know the outcome. |
| 1 | Jev, one call | BM-STEP-01 Define the opportunity: up to 8 judgements, 4 gates, 2 branches (14 questions). |
| 2 | Jev, one call | BM-STEP-02 Build the business logic: up to 8 judgements, 4 gates, up to 2 follow-up gates, 1 branch (15). |
| 3 | Jev, one call | BM-STEP-03 Run the reality check: up to 5 judgements, 4 gates, up to 1 follow-up gate (10). |
| 4 | Jev, one call | BM-STEP-04 Improve and prepare implementation: up to 6 judgements, 2 gates (8). |
| Aggregation | Code, no AI | Expected levels, caps, dimension scores, weighted score, band, label. |
| Report | Text model the user picks | Headline, summary, strengths, gaps and next actions from the final numbers. |
| Suggestions | Text model, on demand only | One to three improvements per weak judgement and per failed or unclear gate. |

At most 47 questions in four calls; fewer when parts are empty or a rule decides a gate. Every call reads the whole plan, so cross-field gates work, and every later call also reads the branch choices of the earlier ones (`decisions` in the state). The turns follow the order of the plan, from the first field to the last.

Every question starts with the same trusted context (`CONTEXT` in `questions.ts`): what a 5GDHC plan is, what the parts of the state are, that the plan may be English or German, and "Judge the substance, not the length or the style." The plan itself only ever travels as the state, never as instructions.

## Scale

Every judgement is scored on one ordered scale of five levels (`scale.ts`). Jev's `score` answer gives a probability for each level, so the expected level is a number from 0 to 4.

| Level | Id | Criterion Jev reads | Grounding |
|---|---|---|---|
| 0 | `missing` | Missing or irrelevant: empty, a placeholder such as 'tbd', or not about this item or this site. | Decided by rule when empty |
| 1 | `vague` | Vague: a general claim that could fit any project, such as 'customers save money' or 'the municipality supports us'. No named actor, place or number. | ARENA CRI level 1, "little or no evidence of verifiable technical or financial data" (SRC-ARENA-CRI-2014) |
| 2 | `specific` | Specific: names the actors, buildings, sources or mechanisms of this site, but gives no numbers or no basis for them. | Levels describe quality, not a count of items (SRC-BROOKHART-2018) |
| 3 | `quantified` | Specific and quantified: the key quantities with units and a stated basis or assumption, such as '14 of 20 buildings, 70 %' or '500 € per metre of trench'. A figure quoted from the tool's Quick Check counts as a stated basis here, not as evidence. | CRI "key costs based on projections"; variables must be explicit to test them (SRC-EC-CBA-2014) |
| 4 | `evidenced` | Quantified and evidenced or tested: the numbers are backed by named data or commitments (metered consumption, a letter of intent, an authority pre-check, a quote, a survey), or they are tested (a sensitivity or break-even value, a case in which the plan fails), and the text says what happens if a number is wrong. Claiming 'validated' without naming the evidence is not enough. | GHNF evidence ladder (SRC-GHNF-2026), observable evidence (SRC-BLAND-2020), switching values (SRC-EC-CBA-2014) |

Rules for the descriptors: they describe quality, never length (verbosity bias of model judges, SRC-ZHENG-2023). Level 4 needs evidence that is named. A Quick Check number quoted correctly is a basis (level 3), not evidence, because its defaults are preliminary assumptions.

## Judgements

27 judgements read every Business Plan field exactly once (the scenario choice aside, which travels as `scenario`). Fields that say the same thing from two angles are merged into one judgement so the same content is not scored twice, for example the customer segments of the opportunity step and of the canvas. A judgement is judged in the turn of its first field and belongs to one dimension. Jev reads its label, its fields' sub-labels when merged, the text "what a strong answer contains" below and the five criteria of the scale, and is told to judge only this part and use the others only to understand the project.

Per step: 8, 8, 5 and 6 judgements. Per dimension: value 5, technology 3, economics 4, governance 3, participation 4, evidence 3, path 5.

| # | Id | Step (turn) | Dimension | Fields | What a strong answer contains | Sources |
|---|---|---|---|---|---|---|
| 1 | `site` | 1 Opportunity | technology | `site.name`, `site.location`, `site.siteType`, `site.units`, `site.currentSupply` | The exact location and settlement type, the number of buildings and units, building ages and the current supply. Level 3 gives numbers (units, buildings, area, rough network length); level 4 names the data source (cadastre, energy certificates). | BM-STEP-01, ALG-09 |
| 2 | `ownership` | 1 Opportunity | participation | `site.ownership` | The owner types and their decision rules (for example condominium, rental and non-profit housing), who must agree before a building can connect, and split incentives between landlord and tenant. | ALG-05, ALG-10, BM-SCN-03 |
| 3 | `stakeholders` | 1 Opportunity | participation | `site.stakeholders`, `site.partners` | All decision-makers and affected parties, including authorities (water, planning), the municipality, owners, tenants and neighbours, with their interest and influence. | ALG-05, SRC-WUSTENHAGEN-2007, SRC-BUSH-2016 |
| 4 | `segments` | 1 Opportunity | value | `businessPlan.opportunity.customerSegments`, `businessPlan.canvas.customerSegments` | Segments tied to the site's buildings (for example 'housing cooperative, 6 buildings, 240 flats; a school; a hotel') with owner type and share of demand, separating who uses from who pays. Level 4: demand per segment from metered or billed data. | BM-STEP-01, BM-SCOPE-03, SRC-OSTERWALDER-2010, SRC-GHNF-2026 |
| 5 | `needs` | 1 Opportunity | value | `businessPlan.opportunity.needs` | Heating and cooling needs, hot water and the temperature level (radiators or floor heating), quantified (MWh per year, kW), with the balance between heating and cooling. Level 4: measured, or consistent with the Quick Check demand. | BM-STEP-01, ALG-06, SRC-WIRTZ-2020-EB |
| 6 | `pain-point` | 1 Opportunity | value | `businessPlan.opportunity.painPoint` | A concrete problem of named customers (boilers at the end of their life, price swings, no district heating planned, summer overheating) with a number such as boiler age or cost. Level 4: evidence from a survey or bills. | BM-STEP-01, BM-SCOPE-02, SRC-BROWN-2008 |
| 7 | `advantage` | 1 Opportunity | value | `businessPlan.opportunity.alternatives`, `businessPlan.opportunity.advantage` | The realistic alternatives (individual air or ground heat pumps, district heating where available, staying on gas) compared with the network on cost per customer over the same years, plus space, noise, cooling and price stability, including where the network does not win. Level 4: a quantified lifetime comparison. | BM-STEP-01, BM-SCOPE-02, ALG-10, SRC-GHNF-2026 |
| 8 | `heat-sources` | 1 Opportunity | technology | `businessPlan.opportunity.heatSources` | Named sources with location, temperature, annual energy or capacity against the demand, storage or balancing, and who owns the source; for waste heat its continuity, for groundwater or surface water the permit route. Level 4: an atlas or measurement, or a letter from the supplier. | ALG-06, ALG-09, SRC-LYGNERUD-2019, SRC-WIEN-WWP-METHOD |
| 9 | `value-proposition` | 2 Business logic | value | `businessPlan.canvas.valueProposition` | A value per customer segment (no own heating system to replace, cooling, stable prices, no own drilling, less space), not only 'green'. Level 4: tested with customers, for example interviews or letters of intent. | SRC-OSTERWALDER-2010, SRC-LYGNERUD-2019, SRC-LYGNERUD-2023 |
| 10 | `resources` | 2 Business logic | technology | `businessPlan.canvas.keyResources` | The physical and legal assets: access to the source (water rights, land for boreholes), public land for pipes, the network, storage or an energy centre, data and skills. | SRC-OSTERWALDER-2010, ALG-10, ALG-09 |
| 11 | `partners` | 2 Business logic | governance | `businessPlan.canvas.keyPartners` | Named partners with their role, contribution and motivation: the municipality, a utility, a housing association, the source owner, an installer, a bank. | SRC-OSTERWALDER-2010, ALG-05, ALG-08, SRC-HAWKEY-2013 |
| 12 | `engagement` | 2 Business logic | participation | `businessPlan.canvas.customerRelationships`, `businessPlan.canvas.channels` | How owners are approached and by whom (a trusted local initiator), the connection contract (duration, exit, price adjustment) and co-creation with early customers. Level 4: signed letters of intent or survey results. | ALG-05, SRC-LYGNERUD-2023, SRC-GHNF-2026 |
| 13 | `cost-basis` | 2 Business logic | economics | `businessPlan.canvas.costStructure`, `businessPlan.assumptions.capex` | Investment split by system part (source, network per metre of trench, house connections, heat pumps, storage) and running costs (heat-pump electricity, maintenance, metering), with units and a basis. Level 4: quotes or comparable projects, plus an explicit contingency for optimism. | ALG-09, SRC-NUSSBAUMER-2016, SRC-HMT-BC-2026, SRC-ARENA-CRI-2014 |
| 14 | `revenue` | 2 Business logic | economics | `businessPlan.canvas.revenueStreams`, `businessPlan.assumptions.tariffs` | The tariff structure (connection fee, base price per m² or kW, energy price per kWh for heating and cooling), who pays what, indexation and contract length, compared with the customer's alternative. Level 4: revenue tested separately for quantity and tariff, or the customers' reaction known. | SRC-EC-CBA-2014, SRC-ARENA-CRI-2014, ALG-10 |
| 15 | `operations` | 2 Business logic | governance | `businessPlan.canvas.keyActivities`, `businessPlan.canvas.operatorResponsibilities` | Who plans, builds, finances, owns, operates, maintains, meters and bills, balances the network and handles faults and security of supply. Level 4: a draft operator or connection agreement covering supply details, renegotiation and mitigation. | BM-STEP-02, BM-SCOPE-03, SRC-HMT-BC-2026, SRC-LYGNERUD-2019 |
| 16 | `allocation` | 2 Business logic | governance | `businessPlan.allocation` | Each stakeholder row states investment, risk and benefit, and they fit together: no one carries a risk without a benefit, a cost key is visible, and each risk sits with the party that controls it. Level 4: quantified shares. | BM-STEP-02, BM-SCOPE-03, ALG-10, SRC-HMT-BC-2026 |
| 17 | `connection-rate` | 3 Reality check | participation | `businessPlan.assumptions.connectionRate` | A rate (share of buildings or of demand) with its basis and timeline, the lowest rate at which the plan still works, and what happens below it. Level 4: backed by commitments, with a break-even value. | ALG-10, SRC-EC-CBA-2014, SRC-GHNF-2026, BM-STEP-03 |
| 18 | `financing` | 3 Reality check | economics | `businessPlan.assumptions.financing` | Who finances which asset (source, network, heat pumps) and with what (equity, loan, contracting, citizen participation, municipal infrastructure finance), with a term that matches the asset life of 25 to 30 years and an interest assumption. Level 4: an indication from a lender or the municipality. | ALG-04, ALG-10, SRC-STEFFEN-2018, SRC-HMT-BC-2026 |
| 19 | `subsidies` | 3 Reality check | economics | `businessPlan.assumptions.subsidies` | The programme counted on, the assumed amount or rate, which owner is eligible, the timing, and the case without the subsidy. | ALG-10, SRC-UFI-WKV, SRC-ARENA-CRI-2014 |
| 20 | `assumptions` | 3 Reality check | evidence | `businessPlan.criticalAssumptions` | The few assumptions whose failure would sink the plan, each with a concrete validation (what, who, by when), ordered by importance and by how little evidence there is yet. | BM-STEP-03, SRC-BLAND-2020, SRC-EC-CBA-2014, SRC-HMT-BC-2026 |
| 21 | `risks` | 3 Reality check | evidence | `businessPlan.risks` | Risks of different kinds (source yield, electricity price for the heat pumps, connection uptake, permits, operator capacity), each with impact, mitigation and validation, one flagged as the potential deal-breaker. | BM-STEP-03, BM-SCOPE-03, SRC-LYGNERUD-2019, SRC-ARENA-CRI-2014 |
| 22 | `learning` | 4 Implementation | evidence | `businessPlan.refinements.feedback`, `businessPlan.refinements.changes` | Specific feedback and from whom, what changed in the model and why, and what was dropped. | BM-STEP-04, SRC-BRINCKMANN-2010 |
| 23 | `scalability` | 4 Implementation | path | `businessPlan.scalability.geographical`, `businessPlan.scalability.economic`, `businessPlan.scalability.organisational` | The conditions under which the model transfers (density, source type, owner structure, regulation), which parts are standardised (contracts, cost key, operator model) and where it does not work. Level 4: checked against another scenario or site. | BM-STEP-04, ALG-05, SRC-D2GRIDS-2020, SRC-BOESTEN-2019 |
| 24 | `data` | 4 Implementation | path | `businessPlan.nextSteps.data` | Each data item tied to the assumption it tests: metered consumption, a groundwater test, the trench route, an owner survey. | BM-STEP-04, SRC-GHNF-2026, ALG-09 |
| 25 | `next-partners` | 4 Implementation | path | `businessPlan.nextSteps.stakeholders`, `businessPlan.nextSteps.partnerships` | Who comes next, in which order, and which agreement to obtain (letter of intent, partnership agreement, a meeting with the authority), with dates. | BM-STEP-04, ALG-05 |
| 26 | `pilot` | 4 Implementation | path | `businessPlan.nextSteps.pilots` | A small first step (an anchor cluster, a micro-network between neighbours) with scope, cost and success criteria. | ALG-09, ALG-10, SRC-ARENA-CRI-2014 |
| 27 | `decisions` | 4 Implementation | path | `businessPlan.nextSteps.decisions` | A go or no-go gate with explicit criteria (for example letters of intent covering a share of the demand, a positive permit pre-check, a financing indication), a decision-maker and a date. | BM-STEP-04, SRC-HMT-BC-2026 |

## Gates

Gates are cross-field questions about the whole plan (`gates.ts`). They never add points. Each belongs to one dimension and has one effect when it fails:

- **Cap at level 2 (must-have)**: the dimension cannot score more than 50 of 100.
- **Cap at level 3 (should-have)**: the dimension cannot score more than 75 of 100.
- **Flag**: shown in the flow and the report, no effect on the score.

The analogy is the gated metrics of the Green Heat Network Fund, which must be passed before deliverability is scored, with bounded adjustments (SRC-GHNF-2026); a cap is the simple equivalent.

**How an answer becomes an outcome.** Every gate question ends with "Answer from what the plan states; what it only implies counts as not stated."

- A boolean gate passes when P(yes) ≥ 0.8 (`GATE_PASS`) and fails when P(yes) ≤ 0.2 (`GATE_FAIL`). In between it is **unclear**: shown, offered for suggestions, never a cap.
- A choice gate turns its option probabilities into one pass probability, weighting each option by its verdict (pass 1, partial 0.5, fail 0) over the options that apply, and then uses the same two thresholds. Options marked not applicable would skip the gate once they hold half the probability; no gate of version 1.0.0 has one.
- Only a **failed** gate caps, and only its own dimension. When several caps hit one dimension, the lowest wins.
- A refused question is **skipped**: no cap.
- A **rule** (precheck) decides some gates in code before any AI call: it fails a gate whose required field is empty, or skips a gate that does not apply. Such a gate is not sent to Jev.

The ids G1 to G15 are those of the research proposal; G9 is the water-law follow-up of the source branch (see [Branches](#branches)).

| G | Id | Turn | Dimension | Question Jev answers | Type | Effect if failed | Rule before AI | Sources |
|---|---|---|---|---|---|---|---|---|
| G1 | `anchor` | 1 | participation | Does the plan name at least one specific anchor customer, a large or early connection, and its role? | boolean | cap 2 | – | ALG-10, SRC-GHNF-2026, SRC-LYGNERUD-2023 |
| G12 | `extra-value` | 1 | value | Does the plan use cooling or another extra value, such as stable prices or relief for the power grid, as a reason to connect, where it applies? | boolean | flag | – | ALG-06, ALG-10, SRC-WIRTZ-2020-EB |
| G8 | `heat-density` | 1 | technology | Does the plan address network length or heat line density as a cost driver, for example trench length, clustering close buildings or micro-networks? | boolean | cap 2 **only when** the Quick Check is complete and its heat density is below 0.5 MWh/m (`LOW_HEAT_DENSITY`, TBL-9, OQ-10); otherwise a flag | – | ALG-09, SRC-PERSSON-WERNER-2011, SRC-REIDHAV-WERNER-2008, SRC-BUFFA-2019 |
| G10 | `vienna-zone` | 1 | technology | Does the plan state the site's zone in the Vienna Heating Plan 2040 (Wiener Wärmeplan 2040) and explain why a 5GDHC network fits it? | boolean | flag | skipped unless the site name or location contains the word "Wien" or "Vienna" | ALG-07, SRC-WIEN-WWP-2040, SRC-WIEN-WWP-METHOD |
| G3 | `boundary` | 2 | governance | Who owns the heat source, the network and the heat pumps in the buildings, according to the plan? | choice: `all` pass · `partial` fail · `none` fail | cap 2 | – | ALG-10, ALG-05, BM-SCOPE-03 |
| G4 | `operator` | 2 | governance | Does the plan name an operator and its operational duties, such as maintenance, billing, faults and security of supply? | boolean | cap 3 | – | BM-STEP-02, BM-SCOPE-03, SRC-HMT-BC-2026 |
| G5 | `cost-key` | 2 | governance | Does the plan state a rule for splitting the costs of the source, the pipes and the connections among the users? | boolean | cap 3 | – | ALG-10, SRC-LYGNERUD-2019 |
| G11 | `price-vs-alternative` | 2 | value | Is the customer's price compared with the customer's realistic alternative, such as gas or an individual heat pump, including price stability? | boolean | cap 2 | – | BM-STEP-01, BM-SCOPE-02, SRC-GHNF-2026, SRC-LYGNERUD-2019 |
| G2 | `connection-threshold` | 3 | participation | Does the plan state a connection rate and what happens to the costs or the viability if fewer buildings connect, for example a minimum rate or the effect per customer? | boolean | cap 2 | fails when the connection rate is empty | ALG-10, SRC-EC-CBA-2014, SRC-GHNF-2026, SRC-EWG-2024 |
| G6 | `lifetime-cover` | 3 | economics | Does the plan compare the yearly revenues with the yearly cost of the investment plus the running costs, heat-pump electricity included, over 20 to 30 years? | choice: `yes` pass · `partly` partial · `no` fail | cap 2 | – | ALG-10, SRC-HMT-BC-2026, SRC-ARENA-CRI-2014 |
| G7 | `subsidy-dependence` | 3 | economics | How does the plan depend on subsidies? | choice: `none` pass · `fallback` pass · `no-fallback` fail · `unclear` partial | cap 2 | – | ALG-10, SRC-ARENA-CRI-2014, SRC-SANOFF-2026, SRC-GHNF-2026 |
| G13 | `deal-breaker` | 3 | evidence | Is one risk marked as the potential deal-breaker, could it really stop the project, and does it have a concrete validation step (what, who, when)? | boolean | cap 2 | fails when no risk row is marked as the deal-breaker | BM-STEP-03, SRC-BLAND-2020, SRC-EC-CBA-2014 |
| G14 | `start-small` | 4 | path | Is a first phase defined, such as an anchor cluster or a micro-network, with later steps to grow? | boolean | cap 3 | – | ALG-10, ALG-09, SRC-BOESTEN-2019, SRC-D2GRIDS-2020 |
| G15 | `decision-gate` | 4 | path | Do the next steps contain a go or no-go decision with explicit, checkable criteria? | boolean | cap 2 | fails when the key decisions are empty | BM-STEP-04, SRC-HMT-BC-2026 |

Why these effects:

- **Must-have (cap 2)**: without it the plan cannot work as written. No anchor means the connection rate is speculation (G1); connecting is voluntary, so uptake is the critical variable (G2; SRC-EWG-2024 covers new buildings only); funding, tariffs and liability all depend on who owns what (G3); a price above the customer's alternative stops voluntary uptake (G11); viability is a lifetime question (G6); a plan that only works with one grant is fragile (G7); the brief asks for a deal-breaker with its validation (G13) and for a decision gate (G15); density drives the cost of the pipes, but 5GDHC cases exist below classic thresholds, so G8 caps only when the Quick Check and the text point the same way.
- **Should-have (cap 3)**: important for a solid plan, but a plan without it can still be sound at its stage: an operator (G4), a cost key (G5), a first phase (G14).
- **Flag**: useful but not universal: cooling as an extra reason to connect (G12, not every site has cooling demand), the Vienna zone (G10, only in Vienna).

Gates per dimension: value G11, G12 · technology G8, G9, G10 · economics G6, G7 · governance G3, G4, G5 and the ownership follow-ups · participation G1, G2 and the anchor follow-ups · evidence G13 · path G14, G15.

## Branches

Branches are choice questions that steer the flow (`branches.ts`). Jev picks the option the plan describes; the next turn then asks the follow-up gate of that option only, in the branch's follow-up dimension. So the questions a plan gets depend on what the plan is: a groundwater plan is asked about the water-law permit, a contracting plan about the contract term. An option without a follow-up (no anchor, source unclear, ownership unclear) asks nothing more, and neither does a refused branch.

The chosen option is the one Jev picks; its option probabilities are stored. Earlier choices enter the state of later turns as `decisions`, written as the branch question and the chosen option's text. Follow-up gates are decided like boolean gates (thresholds 0.8 and 0.2). 13 follow-up gates in all: 4 for the anchor type, 4 for the source type (the water-law permit shared by three options) and 5 for the ownership model. Twelve are flags; the water-law permit (G9) caps technology at level 2, because a missing permit is a typical deal-breaker and approvals under § 31c (5) WRG are limited to 25 years, close to the 25 to 30 year revenue horizon of ALG-10.

### `anchor-type` (turn 1, follow-up in turn 2, participation)

Which kind of anchor customer does the plan mainly rely on? Sources: ALG-10, ALG-05.

| Option | Jev reads | Follow-up gate | Effect if it fails | Sources |
|---|---|---|---|---|
| `public` | A public building: a school, hospital, swimming pool, administration building or similar | `anchor-public`: Does the plan address the public owner's decision path: a council or board decision, the budget, or public procurement? | flag | ALG-05, SRC-BUSH-2016 |
| `commercial` | A commercial customer: a hotel, spa, shop, office or similar | `anchor-commercial`: Does the plan address how long the commercial anchor customer commits (contract term) compared with the payback period of the network? | flag | ALG-10, SRC-LYGNERUD-2019 |
| `residential` | A housing company, a housing cooperative or another large residential owner | `anchor-residential`: Does the plan address how the individual owners or tenants decide, for example owners' votes, tenancy rules or consent of the tenants? | flag | ALG-10, ALG-05 |
| `industry` | A company that supplies waste heat, or a large cooling user such as a data centre, an ice rink or a supermarket | `anchor-industry`: Does the plan address how secure the waste heat or the cooling demand is over time: a contract, and a backup if the company leaves? | flag | ALG-06, SRC-LYGNERUD-WERNER-2018 |
| `none` | No anchor customer can be identified in the plan | none | – | – |

### `source-type` (turn 1, follow-up in turn 2, technology)

Which heat source does the plan mainly rely on? Sources: ALG-06, ALG-09.

| Option | Jev reads | Follow-up gate | Effect if it fails | Sources |
|---|---|---|---|---|
| `groundwater` | Groundwater, with wells | `water-permit`: Does the plan name the permit route for using the groundwater, the ground or the surface water, or an early check with the water authority? | cap technology at 2 | SRC-WRG-1959, SRC-OOE-GWWP, ALG-05, ALG-09 |
| `borehole` | A borehole field (geothermal probes) or other shallow geothermal energy | `water-permit`: Does the plan name the permit route for using the groundwater, the ground or the surface water, or an early check with the water authority? | cap technology at 2 | SRC-WRG-1959, SRC-OOE-GWWP, ALG-05, ALG-09 |
| `surface-water` | Water from a lake, river or the sea | `water-permit`: Does the plan name the permit route for using the groundwater, the ground or the surface water, or an early check with the water authority? | cap technology at 2 | SRC-WRG-1959, SRC-OOE-GWWP, ALG-05, ALG-09 |
| `wastewater` | Wastewater from a sewer or treatment plant | `source-wastewater`: Does the plan address an agreement with the sewer operator and the measured flow and temperature of the wastewater? | flag | ALG-06 |
| `waste-heat` | Waste heat from industry, commerce, a data centre or cooling plants | `source-waste-heat`: Does the plan address a supply agreement with the owner of the waste heat and what happens if that supply stops? | flag | SRC-LYGNERUD-2019, SRC-LYGNERUD-WERNER-2018 |
| `air` | Ambient air only | `source-air`: Does the plan address the lower efficiency of air as a source in cold weather and the noise of the outdoor units? | flag | ALG-06 |
| `unclear` | The plan names no main source, or the source is unclear | none | – | – |

### `ownership` (turn 2, follow-up in turn 3, governance)

Which ownership and operating model does the plan describe for the network? Sources: ALG-04, ALG-05, BM-SCOPE-03, SRC-HAWKEY-2013.

| Option | Jev reads | Follow-up gate | Effect if it fails | Sources |
|---|---|---|---|---|
| `utility` | A municipal or regional utility owns and operates it | `owner-utility`: Does the plan state the utility's commitment: a decision, a letter of intent or its defined role in the project? | flag | ALG-05, ALG-08 |
| `municipal` | The municipality or a municipal company owns it | `owner-municipal`: Does the plan address the municipal decision path: a council decision, the budget or a municipal company? | flag | ALG-05, SRC-BUSH-2016 |
| `community` | The users own it together: a cooperative, an owners' association or an energy community | `owner-community`: Does the plan address the rules of the community: members' votes, joining and leaving, liability and how members finance their share? | flag | ALG-05, ALG-10 |
| `contracting` | A contractor or energy service company owns and operates it and sells heat and cooling | `owner-contracting`: Does the plan address the contract term, how prices may change over time and what happens when the contract ends? | flag | SRC-LYGNERUD-2019 |
| `developer` | The developer or owner of a single estate builds and runs it for its own buildings | `owner-developer`: Does the plan address who operates and maintains the network after the buildings are handed over or sold? | flag | ALG-05 |
| `unclear` | The plan leaves ownership and operation open or unclear | none | – | – |

## Dimensions

Seven dimensions of a solid 5GDHC business plan (D-75, `dimensions.ts`). They start from the provider's own study: ALG-04 names the aspects for successful implementation (technology, costs, implementation models with ownership and operation, organisation and governance, and (re-)financing, and participation), ALG-05 says most challenges are organisational rather than technical, and ALG-09 and ALG-10 add the learnings from the use cases. Costs and financing form one dimension; the organisational sub-aspects form their own. The reality check (BM-STEP-03) and the path with scalability (BM-STEP-04) come from the brief, and customer value from BM-SCOPE-02 ("address a real demand, offer a convincing alternative").

| Id | Name (prompt) | Weight | Judgements | Gates | Provider grounding | Cross-check |
|---|---|---|---|---|---|---|
| `value` | Customer value and demand | 0.15 | segments, needs, pain-point, advantage, value-proposition | G11, G12 | BM-SCOPE-02, BM-STEP-01, ALG-06, ALG-10 | desirability (SRC-BROWN-2008, SRC-BLAND-2020); canvas segments and value proposition (SRC-OSTERWALDER-2010); CRI market opportunities; HMT strategic case; GHNF price against the counterfactual |
| `technology` | Technical and site fit | 0.10 | site, heat-sources, resources | G8, G9, G10 | ALG-04 technology, ALG-06, ALG-09 | feasibility; key resources; CRI technical performance and regulatory environment; GHNF demand data and permits |
| `economics` | Costs, revenues and financing | 0.20 | cost-basis, revenue, financing, subsidies | G6, G7 | ALG-04 costs and (re-)financing, ALG-09, ALG-10 | viability; cost structure and revenue streams; CRI financial proposition (costs, revenue); HMT economic and financial cases |
| `governance` | Ownership, operation and governance | 0.20 | partners, operations, allocation | G3, G4, G5, ownership follow-ups | ALG-04 implementation models, ALG-05, ALG-10, BM-STEP-02, BM-SCOPE-03 | organisational feasibility; key partners and activities; CRI company maturity; HMT commercial and management cases (SRC-HAWKEY-2013) |
| `participation` | Participation and commitment | 0.15 | ownership, stakeholders, engagement, connection-rate | G1, G2, anchor follow-ups | ALG-04 participation, ALG-05, ALG-10 | desirability (will they sign?); customer relationships and channels; CRI stakeholder acceptance (SRC-WUSTENHAGEN-2007, SRC-BUSH-2016) |
| `evidence` | Risks, assumptions and evidence | 0.10 | assumptions, risks, learning | G13 | BM-STEP-03, BM-SCOPE-03 | assumptions mapping (SRC-BLAND-2020); sensitivity and optimism bias (SRC-EC-CBA-2014, SRC-HMT-BC-2026) |
| `path` | Implementation path and scalability | 0.10 | scalability, data, next-partners, pilot, decisions | G14, G15 | BM-STEP-04, ALG-05, ALG-10 | HMT management case; modular roll-out (SRC-BOESTEN-2019, SRC-D2GRIDS-2020) |

**Why these weights.** No source prescribes numbers; the weights are reasoned defaults that sum to 1 (tested).

- **Economics 0.20.** ALG-10: "Costs come first", investment up front, revenues over 25 to 30 years. Costs and revenue are two of the eight CRI indicators, and two of the five HM Treasury cases concern them.
- **Governance 0.20.** ALG-04 calls the implementation models the focus of the project, and ALG-05 says most challenges are organisational. Two key questions of the brief (BM-SCOPE-03) target it; local actors must negotiate risks and responsibilities (SRC-HAWKEY-2013).
- **Value 0.15.** BM-SCOPE-02 asks for a real demand and a convincing alternative; GHNF makes a customer price no higher than the counterfactual an entry gate.
- **Participation 0.15.** ALG-04 lists participation as an aspect of its own; ALG-10: connecting is voluntary, and every building that stays out raises the costs for the rest. GHNF calls connecting buildings one of the largest challenges.
- **Evidence 0.10.** The reality check matters (BM-STEP-03), but evidence is already rewarded inside every judgement (levels 3 and 4), so the dimension stays small to avoid counting it twice.
- **Technology 0.10.** Challenges are mostly not technical (ALG-05), the deterministic Quick Check already screens coverage and densities, and the brief asks for business models rather than detailed engineering design.
- **Path 0.10.** BM-STEP-04 asks for it; GHNF uses expansion potential only as an adjustment metric, not a core score.

## Aggregation

From the decided nodes to the score, in code, without AI (`distribution.ts`, `aggregate.ts`).

1. **Judgement.** Jev's level probabilities p(0..4) are renormalised. The expected level is E = Σ k·p(k), the probability-weighted score of G-Eval (SRC-GEVAL-2023), and the spread SD = √(Σ p(k)·(k − E)²). An answer without a distribution counts with Jev's score, clamped to 0..4, and no spread. An empty judgement counts as 0 with no spread. A refused judgement does not count.
2. **Dimension.** Level = mean of E over its counted judgements, then cut by the lowest cap of its failed gates: level = min(mean, cap). Score = level / 4, shown as 0 to 100 (25 points a level). Band = √(Σ SD²) / n / 4, the judgements taken as independent, which probably understates it. A dimension with no counted judgement scores 0.
3. **AI Plan Score.** Score = 100 × Σ weight × dimension score; band = 100 × √(Σ (weight × dimension band)²). Stored with one decimal, with the raw (uncapped) and capped score and the band of each dimension.
4. **Label.** See [Labels](#labels).
5. **Display.** `displayScore` (core, `lib/business-plan/ai-score-status.ts`) rounds the score to the nearest 5 points and the band to whole points, at least 1: "60 ± 8". The route, the Business Plan badge, the completeness panel, the overview tile and the report all use it, so they always show the same number. Rounding to 5 avoids false precision, as the Quick Check does with its three levels (QCT-RES-LEVELS).
6. **Outdated.** Each judgement stores an 8-character hash (FNV-1a) of its fields' values when scored. `aiScoreStatus` compares them with the current values: any difference marks the score outdated and counts the changed judgements ("N of M scored parts changed since the run"). Nothing runs again by itself.

Worked example. A judgement with p = (0, 0.1, 0.5, 0.3, 0.1) has E = 0.1 + 1.0 + 0.9 + 0.4 = 2.4 and SD = √(0.1·1.96 + 0.5·0.16 + 0.3·0.36 + 0.1·2.56) = √0.64 = 0.8. Its dimension also holds a judgement at E = 3.0 with no spread: mean 2.7, which is 67.5 of 100. If a must-have gate of that dimension failed, the level is cut to 2: 50 of 100, and the plan cannot be labelled Solid.

What a saved score holds (`aiScoreSchema`, schema v3, D-73): the method version, the time, the decision model, score, band, label, whether a must-have cap is active; per dimension its weight, score, raw score, band and cap; per judgement its fields, hash, source (empty, model, refused), expected level and probabilities; per gate its source (rule, model, refused), pass probability, outcome and applied cap; per branch its choice and probabilities; the Quick Check level, heat density and economic ratio when used; token usage; the report and the suggestions. Lengths and counts are bounded by `AI_SCORE_LIMITS`.

## Labels

| Label | Rule | Copy (EN / DE) |
|---|---|---|
| `early` | score < 40 (`PROMISING_FROM`) | Early / Früh |
| `promising` | 40 ≤ score < 70, or score ≥ 70 while a must-have cap (level 2) is active in any dimension | Promising / Vielversprechend |
| `solid` | score ≥ 70 (`SOLID_FROM`) and no must-have cap active | Solid / Solide |

The thresholds are a design choice (research proposal § 4), not taken from a source: wide bands, because the band of a typical plan is several points and the probabilities are not calibrated. The rule "a must-have keeps it below Solid" makes sure a plan that misses something essential is never called solid, however well the rest is written. The label is computed on the score as stored (one decimal), not on the display rounded to 5, so a saved score and its label always agree.

## Turn and token budget

- **Jev's limit** is 32,000 tokens for the state plus the longest question. The state is kept below **20,000 tokens** (`STATE_TOKEN_BUDGET`), estimated as the length of the JSON divided by 3, as the email guard does.
- **The state** holds the scenario id, the filled judgements only (key, label, value; lists without blank entries, rows without ids and blank cells), the Quick Check signal and the earlier decisions. Empty judgements never leave the browser.
- **Long plans** are cut per text, from generous to tight (1,500, then 1,000, 600 and 300 characters, marked with "…"), until the state fits.
- **Each call** has a 60-second timeout and up to 2 retries for transient errors (SDK `maxRetries`); the user can stop a run at any time.
- **Usage** is recorded: input tokens of the decision calls as the provider reports them, else estimated from state and questions; input and output tokens of the text calls.
- **Text calls**: the report allows 6,000 output tokens (`REPORT_MAX_OUTPUT_TOKENS`), the suggestions 8,000 (`SUGGESTIONS_MAX_OUTPUT_TOKENS`), each with up to 2 retries. The caps count the reasoning tokens of a model that thinks before it answers; the first caps (1,500 and 2,500) cut German answers off mid-JSON in the presentation's blind test. The stored lengths below still cut every text. The text model is not part of the method, so the caps are not either.

## Refusals and errors

- Jev may decline questions. The turn is then asked once more without the declined ones; the declined ones are recorded as refused. If every question was declined, there is no second call; if the second call declines again, its remaining questions count as refused too. One refusal never sinks a turn.
- A refused judgement is shown as refused and does not count in its dimension's mean. A refused gate is skipped and caps nothing. A refused or invalid branch choice asks no follow-up.
- Any other error (key, credits, permission, model, rate limit, provider, network, abort) stops the run; nothing is saved, and the route shows the matching message (`lib/assistant/gateway/errors.ts`).
- A failed report never loses the score: the score is saved without a report and the report can be written again, also in the other language or with another model.

## Versioning

- **Method version** `METHOD_VERSION = "1.0.0"` (`run.ts`), stored in every saved score as `method`. The method covers the scale, the judgements (fields and "what a strong answer contains"), the gates and branches (wording, options, effects, rules), the shared question context, the weights, the thresholds and the aggregation; the question wording is part of it (`questions.ts`). Proposed rule for changes (owner to confirm): a change that makes old and new scores incomparable (scale, weights, caps, thresholds, aggregation) raises the major number; an added, removed or regrouped question raises the minor number; a wording fix that should not move scores raises the patch number and is checked against the labelled set first.
- **Pinned decision model**: Jev, version 1.14.0, pinned in `DECISION_MODEL_ID` (`run.ts`) so that a new release cannot change scores silently (D-71). The model id is stored with every score. Moving to a new Jev version is a method change.
- **The text model is free.** Its id is stored with the report and the suggestions; it changes no number, so it is not part of the method version.
- A saved score keeps the method version and the model it was made with. Scores of different versions are not comparable.

## The text model: role and guards

The user picks any language model of the AI Gateway (curated list or a custom id, D-71). It writes words, never numbers.

- **Role.** The short report: a headline, a summary of two to four sentences, up to three strengths and three gaps, each pointing to the judgements or gates it rests on, and up to three next actions. On demand, the suggestions (D-77).
- **Input.** The final numbers (`scoreFacts`: the displayed score and band, the label, whether a must-have failed, each dimension's percent and cap, the branch answers, the gate outcomes, each judgement's level), plus excerpts of the plan, at most 280 characters per part, wrapped as untrusted data (`UNTRUSTED_RULE`).
- **Rules** (`TEXT_RULES`): the scores were decided by a separate model and are final; never change, recompute, round differently or contradict them; never invent figures, sources, organisations or quotes; plain sentences, no markdown, no links; the report states no number that is not in the scores.
- **Checks on the output.** Structured output against a schema, then: empty items dropped, at most three per list, texts cut at a word boundary to the stored limits (headline 160, summary 900, item 320 characters), pointer keys kept only when they name a real judgement or gate (at most 8), and the result validated against the saved schema.
- **Suggestions.** Targets are the judgements with an expected level below 2 (`WEAK_LEVEL`) and the gates that failed or stayed unclear. The prompt gives, per target, what a strong answer contains and the sourced hints of its dimension (below); the model may adapt them to the plan and must not invent programmes, prices, laws, organisations or figures. One to three suggestions per target. New suggestions replace those for the same keys and keep the others of the same language.
- **Privacy options.** Decision calls ask the Gateway for zero data retention and no training on prompts. Text calls ask for both when the model is on the curated list (all of which had a zero-retention route in the Gateway catalogue on 2026-10-24), and for no training on prompts for a custom model id.

## Suggestions

The hints the suggestion run may adapt (`hints.ts`), three per dimension, each with its sources.

| Dimension | Hint | Sources |
|---|---|---|
| value | Compare the yearly cost for one typical customer on the network with gas and with an individual heat pump over the same 20 to 30 years. | BM-STEP-01, ALG-10, SRC-GHNF-2026 |
| value | Quantify the cooling demand and make cooling a stated reason to connect where it exists. | ALG-06, ALG-10, SRC-WIRTZ-2020-EB |
| value | Do not rely on customers paying extra for green heat; lead with price stability, comfort and avoided replacement costs. | SRC-LYGNERUD-2019 |
| technology | State the trench length and the heat demand per metre of trench, and connect close buildings first. | ALG-09, SRC-REIDHAV-WERNER-2008 |
| technology | Replace benchmark demand with billed or metered consumption, at least for the anchor buildings. | SRC-GHNF-2026 |
| technology | Check the groundwater and borehole potential in public maps and book an early meeting with the water authority. | SRC-WIEN-WWP-METHOD, SRC-WRG-1959 |
| economics | Spread the investment over its depreciation period and compare it each year with the revenues and the running costs. | ALG-10, SRC-HMT-BC-2026 |
| economics | Change the connection rate, the tariff, the investment and the electricity price one at a time and note the value at which the plan breaks even. | SRC-EC-CBA-2014 |
| economics | Add a contingency for optimism and show the plan without any subsidy. | SRC-HMT-BC-2026, ALG-10, SRC-ARENA-CRI-2014 |
| governance | Draw the system boundary: who owns, finances and operates the source, the network and the heat pumps. | ALG-10 |
| governance | Write the cost key as a rule, for example the source by connected load and the pipes by those who use them, and check that no party carries a risk without a matching benefit. | ALG-10, BM-STEP-02, SRC-HMT-BC-2026 |
| governance | List the contract points to settle: supply details, renegotiation, mitigation and a simple contract. | SRC-LYGNERUD-2019 |
| participation | Name one anchor customer and aim for a letter of intent. | ALG-10, SRC-GHNF-2026 |
| participation | For each owner type, write who decides and by which rule, for example condominium, rental and non-profit housing. | ALG-05, ALG-10, BM-SCN-03 |
| participation | Involve the municipality early as a partner, and develop the offer with a small group of committed first customers. | ALG-05, SRC-BUSH-2016, SRC-LYGNERUD-2023 |
| evidence | Rank the assumptions by importance and by evidence, and test the important ones without evidence first. | SRC-BLAND-2020 |
| evidence | Make the deal-breaker concrete: what would stop the project, which test shows it, who runs it and by when. | BM-STEP-03 |
| evidence | Record what changed after feedback, and why. | BM-STEP-04, SRC-BRINCKMANN-2010 |
| path | Define a first phase as a small cluster or micro-network, and the steps to grow from it. | ALG-09, ALG-10, SRC-BOESTEN-2019 |
| path | State under which conditions the model transfers to other sites, and where it does not. | BM-STEP-04, SRC-D2GRIDS-2020 |
| path | Set a go or no-go gate with measurable criteria, a decision-maker and a date. | BM-STEP-04, SRC-HMT-BC-2026 |

## Known limits

- **Not calibrated.** The probabilities say how sure Jev is which descriptor fits the text, not how likely the project is to succeed, and the SDK promises no calibration. There is no labelled set yet: agreement with human raters is unmeasured. First candidate: the six reference cases (D-76), one weak, one middling and one strong plan per group, in English and German.
- **Model-judge biases.** Judges can favour longer texts (SRC-ZHENG-2023) and text written by a language model (SRC-GEVAL-2023). The scale describes quality, not length, and the context says so, but a padding test (words without substance must not raise E) is still open.
- **German plans** have not been evaluated separately.
- **The band** treats judgements as independent and probably understates the uncertainty; caps are not part of it. No sensitivity check with equal weights (1/7 each) exists yet.
- **Rounding and labels.** The label uses the score as stored (one decimal), while the display rounds to 5: a plan at 68 shows 70 and is labelled Promising; a plan at 38 shows 40 and is labelled Early.
- **Heat density.** The Quick Check measures MWh per metre of network (OQ-10); the provider's rule of thumb of about 1 MWh/m is per metre of trench (ALG-09), and 5GDHC cases exist below classic district heating thresholds (SRC-BUFFA-2019). Hence the conditional cap only.
- **Vienna by name.** The Vienna zone question depends on "Wien" or "Vienna" in the site's name or location. A site in Vienna described otherwise is not asked (the gate is only a flag).
- **One option per branch.** A plan with two main sources or anchors gets the follow-up of the one Jev picks.
- **Long plans are clipped** down to 300 characters per text in the worst case, so details further in can be missed. The token estimate (three characters a token) is rough.
- **Outdated covers the scored fields only.** A changed Quick Check input or scenario choice does not mark the score outdated, although Jev read the Quick Check signal.
- **Analogues, not rules.** HM Treasury and GHNF guidance are UK structural analogues, not Austrian requirements. The water-law gate asks whether the plan names a permit route, not whether the route is right (WRG § 10; procedures differ by Land); none of this is legal advice.
- **Weights and thresholds are reasoned, not sourced**, and open to calibration.

## Deviations from the research proposal

- **One Jev call per Business Plan step** (four turns in the order of the plan) instead of one per dimension: cross-field gates and branches need the whole plan and the earlier choices.
- **Choice gates** use a verdict-weighted pass probability with the boolean thresholds, instead of "the selected option counts only at ≥ 0.9".
- **The water-law permit (G9)** is the follow-up of the source branch instead of a choice with "not applicable"; **the Vienna zone (G10)** is a boolean behind a rule (skipped unless the site is in Vienna) instead of a three-way choice.
- **Lifetime cover (G6)** has no separate "contradicts the Quick Check" flag; the Quick Check signal is in the state for Jev to read.
- **Branches** (anchor type, source type, ownership model) and their 13 follow-up gates are new.
- **Label names** are Early, Promising and Solid (for "Early draft", "Promising, gaps to close" and "Solid basis"), with the same thresholds and the same must-have rule.

## Sources

**Provider sources** (cited by id, no public link): the challenge brief in `docs/20_business-models/` and the talk of the research project Anergie Leicht Gemacht in `docs/01_shared/alg-project/`.

| Id | Title | File |
|---|---|---|
| BM-SCOPE-02 | Challenge Description and Problem Statement | `docs/20_business-models/00_scope/bm-scope-02_problem-statement.md` |
| BM-SCOPE-03 | Key questions | `docs/20_business-models/00_scope/bm-scope-03_key-questions.md` |
| BM-SCN-03 | Scenario 03 | `docs/20_business-models/00_scope/scenarios/scenario-03.md` |
| BM-STEP-01 | Define the opportunity | `docs/20_business-models/01_define-the-opportunity/bm-step-01_define-the-opportunity.md` |
| BM-STEP-02 | Build the business logic | `docs/20_business-models/02_build-the-business-logic/bm-step-02_build-the-business-logic.md` |
| BM-STEP-03 | Run the Reality Check | `docs/20_business-models/03_run-the-reality-check/bm-step-03_run-the-reality-check.md` |
| BM-STEP-04 | Improve and prepare implementation | `docs/20_business-models/04_improve-and-prepare-implementation/bm-step-04_improve-and-prepare-implementation.md` |
| ALG-04 | Project Focus (aspects for successful implementation) | `docs/01_shared/alg-project/project-focus.md` |
| ALG-05 | Organisational Learnings | `docs/01_shared/alg-project/organisational-learnings.md` |
| ALG-06 | What Is an Anergy/5GDHC Network? | `docs/01_shared/alg-project/what-is-5gdhc.md` |
| ALG-07 | Heat Demand According to the Vienna Heating Plan 2040 | `docs/01_shared/alg-project/vienna-heating-plan.md` |
| ALG-08 | Examples in Practice | `docs/01_shared/alg-project/examples-in-practice.md` |
| ALG-09 | Learnings from Our Use Cases | `docs/01_shared/alg-project/use-case-learnings.md` |
| ALG-10 | Tips for the Challenge | `docs/01_shared/alg-project/tips-for-the-challenge.md` |

Also cited: TBL-9 and OQ-10 (heat density classes of the Quick Check) and QCT-RES-LEVELS (broad result levels).

**External sources** (`lib/docs/references.ts`, the only external links the public docs may use). Every link was opened and every DOI resolved on 2026-10-24; `pnpm check:references` fetches them again.

| Id | Kind | Reference | Link |
|---|---|---|---|
| SRC-BUFFA-2019 | peer-reviewed | Buffa, S., Cozzini, M., D'Antoni, M., Baratieri, M., Fedrizzi, R. (2019). 5th generation district heating and cooling systems: A review of existing cases in Europe. Renewable and Sustainable Energy Reviews 104, 504–522. | <https://doi.org/10.1016/j.rser.2018.12.059> |
| SRC-GJOKA-2023 | peer-reviewed | Gjoka, K., Rismanchi, B., Crawford, R.H. (2023). Fifth-generation district heating and cooling systems: A review of recent advancements and implementation barriers. Renewable and Sustainable Energy Reviews 171, 112997. | <https://doi.org/10.1016/j.rser.2022.112997> |
| SRC-LYGNERUD-2019 | peer-reviewed | Lygnerud, K., Wheatcroft, E., Wynn, H. (2019). Contracts, business models and barriers to investing in low temperature district heating projects. Applied Sciences 9(15), 3142. | <https://doi.org/10.3390/app9153142> |
| SRC-LYGNERUD-2023 | peer-reviewed | Lygnerud, K., Popovic, T., Schultze, S., Støchkel, H.K. (2023). District heating in the future – thoughts on the business model. Energy 278, 127714. | <https://doi.org/10.1016/j.energy.2023.127714> |
| SRC-LYGNERUD-WERNER-2018 | peer-reviewed | Lygnerud, K., Werner, S. (2018). Risk assessment of industrial excess heat recovery in district heating systems. Energy 151, 430–441. | <https://doi.org/10.1016/j.energy.2018.03.047> |
| SRC-BOESTEN-2019 | peer-reviewed | Boesten, S., Ivens, W., Dekker, S.C., Eijdems, H. (2019). 5th generation district heating and cooling systems as a solution for renewable urban thermal energy supply. Advances in Geosciences 49, 129–136. | <https://doi.org/10.5194/adgeo-49-129-2019> |
| SRC-PERSSON-WERNER-2011 | peer-reviewed | Persson, U., Werner, S. (2011). Heat distribution and the future competitiveness of district heating. Applied Energy 88(3), 568–576. | <https://doi.org/10.1016/j.apenergy.2010.09.020> |
| SRC-NUSSBAUMER-2016 | peer-reviewed | Nussbaumer, T., Thalmann, S. (2016). Influence of system design on heat distribution costs in district heating. Energy 101, 496–505. | <https://doi.org/10.1016/j.energy.2016.02.062> |
| SRC-REIDHAV-WERNER-2008 | peer-reviewed | Reidhav, C., Werner, S. (2008). Profitability of sparse district heating. Applied Energy 85(9), 867–877. | <https://doi.org/10.1016/j.apenergy.2008.01.006> |
| SRC-WIRTZ-2020-EB | peer-reviewed | Wirtz, M., Kivilip, L., Remmen, P., Müller, D. (2020). Quantifying demand balancing in bidirectional low temperature networks. Energy and Buildings 224, 110245. | <https://doi.org/10.1016/j.enbuild.2020.110245> |
| SRC-HAWKEY-2013 | peer-reviewed | Hawkey, D., Webb, J., Winskel, M. (2013). Organisation and governance of urban energy systems: district heating and cooling in the UK. Journal of Cleaner Production 50, 22–31. | <https://doi.org/10.1016/j.jclepro.2012.11.018> |
| SRC-BUSH-2016 | peer-reviewed | Bush, R.E., Bale, C.S.E., Taylor, P.G. (2016). Realising local government visions for developing district heating: Experiences from a learning country. Energy Policy 98, 84–96. | <https://doi.org/10.1016/j.enpol.2016.08.013> |
| SRC-WUSTENHAGEN-2007 | peer-reviewed | Wüstenhagen, R., Wolsink, M., Bürer, M.J. (2007). Social acceptance of renewable energy innovation: An introduction to the concept. Energy Policy 35(5), 2683–2691. | <https://doi.org/10.1016/j.enpol.2006.12.001> |
| SRC-STEFFEN-2018 | peer-reviewed | Steffen, B. (2018). The importance of project finance for renewable energy projects. Energy Economics 69, 280–294. | <https://doi.org/10.1016/j.eneco.2017.11.006> |
| SRC-KIRSCH-2009 | peer-reviewed | Kirsch, D., Goldfarb, B., Gera, A. (2009). Form or substance: the role of business plans in venture capital decision making. Strategic Management Journal 30(5), 487–515. | <https://doi.org/10.1002/smj.751> |
| SRC-BRINCKMANN-2010 | peer-reviewed | Brinckmann, J., Grichnik, D., Kapsa, D. (2010). Should entrepreneurs plan or just storm the castle? A meta-analysis on contextual factors impacting the business planning–performance relationship in small firms. Journal of Business Venturing 25(1), 24–40. | <https://doi.org/10.1016/j.jbusvent.2008.10.007> |
| SRC-BROOKHART-2018 | peer-reviewed | Brookhart, S.M. (2018). Appropriate criteria: Key to effective rubrics. Frontiers in Education 3, 22. | <https://doi.org/10.3389/feduc.2018.00022> |
| SRC-GEVAL-2023 | peer-reviewed | Liu, Y., Iter, D., Xu, Y., Wang, S., Xu, R., Zhu, C. (2023). G-Eval: NLG evaluation using GPT-4 with better human alignment. Proceedings of EMNLP 2023, 2511–2522. | <https://doi.org/10.18653/v1/2023.emnlp-main.153> |
| SRC-ZHENG-2023 | peer-reviewed | Zheng, L., Chiang, W.-L., Sheng, Y., et al. (2023). Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena. NeurIPS 2023 Datasets and Benchmarks Track (arXiv:2306.05685). | <https://arxiv.org/abs/2306.05685> |
| SRC-OSTERWALDER-2010 | book | Osterwalder, A., Pigneur, Y. (2010). Business Model Generation: A Handbook for Visionaries, Game Changers, and Challengers. Wiley, ISBN 978-0-470-87641-1. | <https://www.wiley.com/en-us/Business+Model+Generation%3A+A+Handbook+for+Visionaries%2C+Game+Changers%2C+and+Challengers-p-9780470876411> |
| SRC-BLAND-2020 | company | Bland, D.J. (2020). How assumptions mapping can focus your teams on running experiments that matter. Strategyzer. | <https://strategyzer.com/library/how-assumptions-mapping-can-focus-your-teams-on-running-experiments-that-matter> |
| SRC-BROWN-2008 | company | Brown, T. (2008). Design thinking. Harvard Business Review 86(6). | <https://hbr.org/2008/06/design-thinking> |
| SRC-ARENA-CRI-2014 | standard | Australian Renewable Energy Agency (2014). Commercial Readiness Index for Renewable Energy Sectors. ARENA, Canberra. | <https://arena.gov.au/assets/2014/02/Commercial-Readiness-Index.pdf> |
| SRC-EC-CBA-2014 | official | European Commission, DG Regional and Urban Policy (2014). Guide to Cost-Benefit Analysis of Investment Projects: Economic appraisal tool for Cohesion Policy 2014–2020. European Commission. | <https://jaspers.eib.org/LibraryNP/EC%20Reports/DG%20REGIO%20CBA%20Guide%20for%202014-2020.pdf> |
| SRC-HMT-BC-2026 | official | HM Treasury (2026). Guidance on developing business cases for projects and programmes. HM Treasury, London. | <https://assets.publishing.service.gov.uk/media/6a4390675b6406df58c14006/Guidance_on_Developing_Business_Cases.pdf> |
| SRC-GHNF-2026 | official | Department for Energy Security and Net Zero (2026). Green Heat Network Fund: Guidance for Applicants, version 12.0. UK Government. | <https://assets.publishing.service.gov.uk/media/698c8f63547c54ae7c023662/GHNF-guidance-for-applicants-R11.pdf> |
| SRC-D2GRIDS-2020 | official | Ivens, W., Boesten, S. (2020). D2Grids WP LT Deliverable DEL.1.1: Roll-out strategy, preliminary version. Interreg North-West Europe. | <https://vb.nweurope.eu/media/11178/wplt-d11-roll-out-strategy-preliminary-version-final.pdf> |
| SRC-WIEN-WWP-2040 | official | Stadt Wien, MA 20 Energieplanung (2024). Wiener Wärmeplan 2040 (Vienna Heating Plan 2040). City of Vienna. | <https://www.wien.gv.at/umwelt/waermeplan-2040> |
| SRC-WIEN-WWP-METHOD | official | Stadt Wien, MA 20 Energieplanung (2025). Beschreibung der Methodik und der Vorgehensweise zur Entwicklung des Konzeptes „Raus aus Gas – Wiener Wärme und Kälte 2040“ und „Wiener Wärmeplan 2040“. City of Vienna. | <https://www.wien.gv.at/pdf/ma20/methoden-beschreibung-waermeplan.pdf> |
| SRC-WRG-1959 | official | Republik Österreich (1959). Wasserrechtsgesetz 1959 (WRG 1959), § 10. Rechtsinformationssystem des Bundes (RIS). | <https://ogd.ris.bka.gv.at/Dokumente/Bundesnormen/NOR12141151/NOR12141151.html> |
| SRC-OOE-GWWP | official | Land Oberösterreich, Bezirkshauptmannschaft Steyr-Land (2026). Grundwasserwärmepumpen. Land Oberösterreich. | <https://www.land-oberoesterreich.gv.at/29454.htm> |
| SRC-EWG-2024 | official | Republik Österreich (2024). Erneuerbare-Wärme-Gesetz (EWG), BGBl. I Nr. 8/2024. Rechtsinformationssystem des Bundes (RIS). | <https://ogd.ris.bka.gv.at/Dokumente/Bundesnormen/NOR40260603/NOR40260603.html> |
| SRC-UFI-WKV | official | Kommunalkredit Public Consulting (Umweltförderung im Inland) (2024). Gewerbliche Wärme- und Kälteversorgung. umweltfoerderung.at. | <https://www.umweltfoerderung.at/betriebe/wkv/unterkategorie-waermekaelte> |
| SRC-SANOFF-2026 | official | Bundesministerien, Kommunalkredit Public Consulting (2026). Sanierungsoffensive. sanierungsoffensive.gv.at. | <https://www.sanierungsoffensive.gv.at/> |
