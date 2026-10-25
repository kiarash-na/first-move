---
id: RESEARCH-AI-SCORE-RUBRIC
title: 'AI Plan Score: rubric, gates and aggregation (research proposal)'
source: [web research by a Claude sub-agent, 2026-10-24; every link opened and every DOI resolved on that day]
---

# Business Plan AI score: rubric, gates and aggregation (proposal)

Status: research proposal for the owner, 2026-10-24. Source IDs refer to `scoring-sources.md` in the same folder. Requirement IDs refer to `docs/`.

**What the score is.** It estimates the **quality** of what a team wrote: is it specific, quantified and backed by evidence, and does it cover what a solid 5GDHC business plan must settle? Completeness stays with `lib/business-plan/readiness-checks.ts` (D-30). The score is not a jury verdict, a funding prediction or a feasibility study. A business plan document is only weakly associated with funding decisions (SRC-KIRSCH-2009), while preparedness does count (SRC-CHEN-2009).

**Owner change of 2026-10-24.** The dimensions no longer follow the V01 jury criteria (BM-SCOPE-08) or the pitch sections (BM-SCOPE-07). They now follow "the criteria that make a business plan a solid one". These criteria start from the provider's own study, ALG-04 "Aspects for successful implementation" (Technology · Costs · Implementation models [Ownership/Operation · Organisation/Governance · (Re-)Financing] · Participation) plus ALG-05/09/10. They are cross-checked against the established literature on plan and venture evaluation.

---

## 0. One-screen summary

```
7 DIMENSIONS (weight)                     from ALG-04 / cross-check
D1 Customer value & demand        15 %    desirability · BMC customer side · CRI Market Opportunities
D2 Technical & site fit           10 %    ALG-04 Technology · ALG-09 · CRI Technical Performance
D3 Costs, revenues & financing    20 %    ALG-04 Costs + (Re-)Financing · ALG-10 · CRI Financial Proposition
D4 Ownership, operation & gov.    20 %    ALG-04 Ownership/Operation + Organisation/Governance · ALG-05
D5 Participation & commitment     15 %    ALG-04 Participation · ALG-10 · CRI Stakeholder Acceptance
D6 Risk, assumptions & evidence   10 %    BM-STEP-03 · assumptions mapping · EU CBA sensitivity
D7 Implementation path & scale    10 %    BM-STEP-04 · ALG-10 start small · HMT management case

SCALE per judgement (ordered, Jev "score" question)
0 missing/irrelevant · 1 vague · 2 specific · 3 specific + quantified · 4 quantified + evidenced/validated

FIELD SCORE   expected level E = Σ k·p(k), band = SD of p        (empty → 0, no AI call)
DIMENSION     mean of its judgements, then min(·, cap from gates) → 0–100
GATES (15)    yes/no or choice; fail (p ≤ 0.2) → cap that dimension at level 2 or 3; unclear → flag only
OVERALL       weighted mean of dimensions, ± band, shown as a broad label (3 levels), never 1 decimal
```

---

## 1. Dimensions (a: grounding, mapping, weights)

### 1.1 Why these seven

ALG-04 names four aspects: Technology, Costs, Implementation models (with three sub-aspects) and Participation. The provider calls implementation models the "Focus of the project", and ALG-05 says "Most challenges are organisational rather than technical". So the organisational sub-aspects get their own dimension (D4), and financing joins costs (D3). Two more dimensions come from the brief: BM-STEP-03 asks for a reality check (D6), and BM-STEP-04 asks for next steps and scalability (D7). Customer value (D1) is implicit in ALG-04, and BM-SCOPE-02 names it explicitly ("address a real demand, offer a convincing alternative").

Cross-check table (each cell names the source element that the dimension covers):

| Dim | Provider (ALG/BM) | Desirability–feasibility–viability (SRC-BROWN-2008, SRC-BLAND-2020) | Business Model Canvas (SRC-OSTERWALDER-2010) | ARENA CRI indicator (SRC-ARENA-CRI-2014) | HM Treasury five cases (SRC-HMT-BC-2026) | GHNF assessment (SRC-GHNF-2026) | Peer-reviewed support |
|---|---|---|---|---|---|---|---|
| D1 Customer value & demand | BM-SCOPE-02, BM-STEP-01, ALG-06, ALG-10 "Extra value" | Desirability | Customer segments, value proposition | Market Opportunities | Strategic case (case for change, business needs) | Gate "customer detriment" (price vs counterfactual) | SRC-LYGNERUD-2019 (no green premium), SRC-LYGNERUD-2023, SRC-WIRTZ-2020-EB |
| D2 Technical & site fit | ALG-04 Technology, ALG-09, SHARED-CONTEXT, TBL-7…10 | Feasibility | Key resources | Technical Performance, Regulatory Environment (permits) | Economic case (options) | Demand data quality; permits to access heat | SRC-PERSSON-WERNER-2011, SRC-REIDHAV-WERNER-2008, SRC-BUFFA-2019, SRC-GJOKA-2023 |
| D3 Costs, revenues & financing | ALG-04 Costs + (Re-)Financing, ALG-09 "Pipes… drive the cost", ALG-10 "Costs come first", TBL-6, OQ-21 | Viability | Cost structure, revenue streams | Financial Proposition – Costs and – Revenue | Economic and financial case | Social IRR gate, award cap, "access sufficient non-GHNF funds" | SRC-NUSSBAUMER-2016, SRC-STEFFEN-2018, SRC-EC-CBA-2014 |
| D4 Ownership, operation & governance | ALG-04 Ownership/Operation, Organisation/Governance; ALG-05; ALG-10 "System boundary", "Fair cost key"; BM-STEP-02 | Feasibility (organisational) | Key partners, key activities, + operator responsibilities (BM-STEP-02) | Company Maturity, Supply Chain and Skills | Commercial case (risk allocation, contracts) + management case (governance) | Customer protection (Heat Trust), CP1 compliance | SRC-HAWKEY-2013, SRC-HAWKEY-WEBB-2014, SRC-LYGNERUD-2019 (contract issues) |
| D5 Participation & commitment | ALG-04 Participation; ALG-05 "Early alignment…", "Local leadership…"; ALG-10 "Many owners…", "Connecting is voluntary", "anchor customers" | Desirability (will they sign?) | Customer relationships, channels | Stakeholder Acceptance | Strategic case (stakeholders) | Connection risk assessment: "one of the largest challenges" | SRC-WUSTENHAGEN-2007, SRC-BUSH-2016 |
| D6 Risk, assumptions & evidence | BM-STEP-03, BM-SCOPE-03 Q7, BM-SCOPE-09 | Assumptions mapping across all three | (cross-cutting) | Market Opportunities L1 "Key risks identified…" | Economic case: sensitivity, optimism bias | Deliverability evidence rules | SRC-EC-CBA-2014, SRC-BRINCKMANN-2010 |
| D7 Implementation path & scalability | BM-STEP-04, ALG-05 "Scalable business and governance models", ALG-10 "Start small" | (all three, over time) | (canvas variants per BM-STEP-04 V01) | Status Summary progression | Management case (plan for delivery, approvals) | Adjustment metric "expansion potential" | SRC-BOESTEN-2019 (modular), SRC-D2GRIDS-2020 |

### 1.2 Weights (default, owner-adjustable)

| Dim | Weight | Justification |
|---|---|---|
| D3 Costs, revenues & financing | **20** | ALG-10: "Costs come first: investment upfront, revenues over 25–30 years." The financial proposition is two of the eight CRI indicators (costs, revenue). Two of the five HMT cases (economic, financial) concern it. |
| D4 Ownership, operation & governance | **20** | ALG-04 marks implementation models as the "Focus of the project". ALG-05: "Most challenges are organisational rather than technical". Two key questions (BM-SCOPE-03 Q2, Q4) target it directly. SRC-HAWKEY-2013 shows local actors must "negotiate risks and responsibilities". |
| D1 Customer value & demand | **15** | BM-SCOPE-02: projects "must address a real demand, offer a convincing alternative". GHNF makes a customer price no higher than the counterfactual an entry gate. |
| D5 Participation & commitment | **15** | ALG-04 lists Participation as an aspect of its own. ALG-10: voluntary connection, and "Every building that stays out raises costs for the rest". GHNF: connecting buildings "is one of the largest challenges". |
| D6 Risk, assumptions & evidence | **10** | BM-STEP-03 and BM-SCOPE-09 ("critically evaluated approach"). Evidence quality is already rewarded inside every judgement (scale levels 3–4), so the dimension itself stays small to avoid counting evidence twice. |
| D2 Technical & site fit | **10** | ALG-05: challenges are mostly not technical. The deterministic Quick Check already screens coverage and densities (TBL-7…11), so a high AI weight here would count the same facts twice. The brief also asks teams to focus on business models "rather than detailed engineering design" (BM-SCOPE-01). |
| D7 Implementation path & scalability | **10** | BM-STEP-04. GHNF uses expansion potential only as an adjustment metric, not a core score. |

No source prescribes numeric weights. These are reasoned defaults, so record them as an owner decision (D-xx) and show the equal-weight result (1/7 each) in a test as a sensitivity check.

### 1.3 Generic 5-level quality scale (one scale for every judgement)

| Level | Name | Descriptor (shown to Jev as the ordered `criteria`, made field-specific in §2) | Grounding |
|---|---|---|---|
| 0 | Missing / irrelevant | Empty, placeholder ("tbd", "-"), or not about this field or this site. | Deterministic when empty |
| 1 | Vague | A generic claim that could fit any project ("customers save money", "the municipality supports us"). No named actor, place or number. | CRI level 1: "little or no evidence of verifiable technical or financial data" |
| 2 | Specific | Names the actors, buildings, sources or mechanisms of **this** site, but gives no numbers or basis. | Brookhart: levels must describe quality, not count items (SRC-BROOKHART-2018) |
| 3 | Specific and quantified | Key quantities with units and a stated basis or assumption (e.g. "14 of 20 buildings, 70 %", "500 €/m trench (TBL-6)"). | CRI Financial Proposition – Costs L2 "Key costs based on projections"; EU CBA: variables must be explicit to test them |
| 4 | Quantified and evidenced or validated | Numbers backed by data or commitments (metered consumption, letter of intent, authority pre-check, quote, survey), **or** tested (sensitivity or switching value, a scenario where the plan fails). Says what happens if the number is wrong. | GHNF evidence ladder (metered > certificates > benchmarks); SRC-BLAND-2020 "observable evidence"; SRC-EC-CBA-2014 switching values |

Rules for the descriptors: describe quality, never length (SRC-ZHENG-2023 verbosity bias). Level 4 requires evidence or a test that is **named**; claiming "validated" is not enough. A Quick Check number quoted correctly counts as a stated basis (level 3), not as evidence (level 4). Default values are "only preliminary assumptions" (QCT-REF-1.4).

---

## 2. Per-field rubric (a)

Every field maps to exactly one dimension. "Judgement" is the unit Jev scores. **Merged** means several fields go into one question, so the same content is not scored twice. That yields 27 judgements in total.

### D1 Customer value & demand (15 %)

| # | Judgement (fields) | What good looks like (levels 3–4) | Sources |
|---|---|---|---|
| J1 | **Customer segments** (merged: `businessPlan.opportunity.customerSegments` + `businessPlan.canvas.customerSegments`) | Segments tied to the site's buildings (e.g. "housing cooperative, 6 MFH, 240 flats; school; hotel"), with owner type and share of demand. Separates who uses from who pays (landlord/tenant). L4: demand per segment from metered or billed data. | BM-STEP-01, BM-SCOPE-03 Q1, SRC-OSTERWALDER-2010, SRC-GHNF-2026 (data ladder) |
| J2 | **Needs** (`businessPlan.opportunity.needs`) | Heating **and** cooling needs, hot water, temperature level (radiators vs floor heating), quantified (MWh/a, kW). Heating/cooling balance stated (C/H ratio, simultaneity). L4: consistent with the Quick Check demand, or measured. | BM-STEP-01, ALG-06, TBL-10, SRC-WIRTZ-2020-EB |
| J3 | **Pain point** (`businessPlan.opportunity.painPoint`) | A concrete problem of named customers (end-of-life gas boilers, price volatility, no district heating planned (BM-SCN-02), summer overheating), with a number (boiler age, cost). L4: evidence (survey, bills). | BM-SCOPE-02, BM-STEP-01, SRC-BROWN-2008 ("people's needs") |
| J4 | **Advantage over alternatives** (merged: `…opportunity.alternatives` + `…opportunity.advantage`) | Names the realistic alternatives (individual air or ground heat pump, district heating where available, staying on gas). Compares cost per customer over the same horizon, plus space, noise, cooling, price stability. Says where the network does **not** win. L4: a quantified lifetime comparison. | BM-STEP-01.2, BM-SCOPE-02, ALG-10 "Extra value", SRC-GHNF-2026 (customer detriment), SRC-WIEN-WWP-2040 (zone recommendation) |
| J5 | **Value proposition** (`businessPlan.canvas.valueProposition`) | A value per segment (relief from heating-system replacement, cooling, stable prices, no own drilling, less space), not only "green". L4: tested with customers (interviews, letters of intent). | SRC-OSTERWALDER-2010, SRC-LYGNERUD-2019 ("not willing to pay a premium" for green heat), SRC-LYGNERUD-2023 |

### D2 Technical & site fit (10 %)

| # | Judgement (fields) | What good looks like | Sources |
|---|---|---|---|
| J6 | **Site description** (merged: `site.name`, `site.location`, `site.siteType`, `site.units`, `site.currentSupply`) | Exact location, settlement type, number of buildings and units, building ages, current supply, area. L3: numbers (units, buildings, area, rough network length). L4: data source named (cadastre, energy certificates) and consistent with the Quick Check inputs. | BM-STEP-01.1, BM-SCN-01…04, ALG-09 (existing buildings) |
| J7 | **Heat sources** (`businessPlan.opportunity.heatSources`) | Named source(s) with location, temperature, annual energy or capacity against demand, storage or balancing, and owner of the source. Waste heat: continuity and a volume guarantee. Groundwater or surface water: permit route. L4: atlas or measurement (Geothermie-Atlas, erdwaerme-wien.info), supplier letter. | SHARED-CONTEXT, ALG-06, ALG-09 ("Groundwater is the most economical source"), TBL-7, SRC-LYGNERUD-2019 (volume guarantees), SRC-LYGNERUD-WERNER-2018, SRC-BOESTEN-2019, SRC-WIEN-WWP-METHOD, SRC-WRG-1959 |
| J8 | **Key resources** (`businessPlan.canvas.keyResources`) | Physical and legal assets: access to the source (water rights, land for boreholes), public land for pipes, network, storage or energy centre, data, skills. | SRC-OSTERWALDER-2010, ALG-10 ("public land"), ALG-09 (trench length), SRC-WRG-1959 |

### D3 Costs, revenues & financing (20 %)

| # | Judgement (fields) | What good looks like | Sources |
|---|---|---|---|
| J9 | **Cost basis** (merged: `businessPlan.canvas.costStructure` + `businessPlan.assumptions.capex`) | Capex split by system part (source, network per metre of **trench**, house connections, heat pumps, storage) and opex (heat-pump electricity, maintenance, metering), with units and basis (TBL-6 or better). L4: quotes or comparable projects, plus an explicit contingency for optimism bias. | ALG-09 ("Pipes and house connections drive the cost"), TBL-6, SRC-NUSSBAUMER-2016 (capital costs dominate), SRC-HMT-BC-2026 §8.59–8.60, SRC-ARENA-CRI-2014 (Costs indicator) |
| J10 | **Revenue model** (merged: `businessPlan.canvas.revenueStreams` + `businessPlan.assumptions.tariffs`) | Tariff structure (connection fee, base price per m² or kW, energy price per kWh for heating **and** cooling), who pays what, indexation, contract length; compared with the customer's alternative. L4: revenue tested for quantity and tariff separately (sensitivity), or customer reaction known. | TBL-6, SRC-EC-CBA-2014 ("revenue… depends on… 'quantity' and 'tariff'"), SRC-ARENA-CRI-2014 (Revenue indicator), ALG-10 ("stable prices") |
| J11 | **Financing** (`businessPlan.assumptions.financing`) | Who finances which asset (source, network, heat pumps), with what (equity, loan, contracting, citizen participation, municipal infrastructure finance), term matched to asset life (25–30 a), interest assumption. L4: indication from a lender or municipality. | ALG-04 "(Re-)Financing", ALG-10 ("Think infrastructure: long-term finance… the city as partner"), TBL-6 (3 %, 20 a), SRC-STEFFEN-2018, SRC-HMT-BC-2026 (financial case) |
| J12 | **Subsidies** (`businessPlan.assumptions.subsidies`) | Names the programme and module (e.g. UFI "Gewerbliche Wärme- und Kälteversorgung", module 2 networks or 3 micro-networks), assumed amount or rate, which owner is eligible, timing, **and the case without subsidy**. | ALG-10 ("Funding fits only partly and depends on who owns what"), SRC-UFI-WKV, SRC-SANOFF-2026 (budgets run out), SRC-ARENA-CRI-2014 (Market Opportunities L3 "Post subsidy revenues…") |

### D4 Ownership, operation & governance (20 %)

| # | Judgement (fields) | What good looks like | Sources |
|---|---|---|---|
| J13 | **Key partners** (`businessPlan.canvas.keyPartners`) | Named partners with role, contribution and motivation (municipality, utility or Stadtwerke, housing association, source owner, installer, bank). | SRC-OSTERWALDER-2010, ALG-05 ("Early alignment with municipalities…"), ALG-08 (Stadtwerke as operators), SRC-HAWKEY-2013 |
| J14 | **Activities and operator responsibilities** (merged: `businessPlan.canvas.keyActivities` + `businessPlan.canvas.operatorResponsibilities`) | Who plans, builds, finances, owns, operates, maintains, meters and bills, balances the network, and handles faults and supply security (24/7). L4: draft operator or connection agreement covering contract elements (supply details, renegotiation, mitigation). | BM-STEP-02, BM-SCOPE-03 Q2/Q7, SRC-HMT-BC-2026 (commercial and management case), SRC-LYGNERUD-2019 Table 3, SRC-GHNF-2026 (customer protection) |
| J15 | **Allocation of investment, risk and benefit** (`businessPlan.allocation` rows, judged as one list) | Each stakeholder row states investment, risk and benefit, and they are consistent (no one carries risk without benefit). A cost key is visible. Risks sit with the party that controls them. L4: quantified shares. | BM-STEP-02.2, BM-SCOPE-03 Q4, ALG-10 ("Fair cost key"), SRC-HMT-BC-2026 ("Risk allocation", "Payment mechanisms"), SRC-LYGNERUD-2019 ("Shared incentives") |

### D5 Participation & commitment (15 %)

| # | Judgement (fields) | What good looks like | Sources |
|---|---|---|---|
| J16 | **Stakeholder map** (merged: `site.stakeholders` + `site.partners`) | All decision-makers and affected parties, including authorities (water, planning), the municipality, owners, tenants and neighbours, with their interest and influence. | ALG-05, SRC-WUSTENHAGEN-2007 (socio-political, community, market acceptance), SRC-BUSH-2016, SRC-ARENA-CRI-2014 (Stakeholder Acceptance) |
| J17 | **Ownership of buildings** (`site.ownership`) | Owner types and their decision rules (e.g. WEG, MRG and WGG in BM-SCN-03), who must agree for a building to connect, split incentives between landlord and tenant. | ALG-05 ("Ownership structures determine implementation pathways"), ALG-10 ("Many owners decide individually"), BM-SCN-03 |
| J18 | **Engagement and contracting** (merged: `businessPlan.canvas.customerRelationships` + `businessPlan.canvas.channels`) | How owners are approached and by whom (a trusted local initiator), the connection contract (duration, exit, price adjustment), co-creation with early customers. L4: letters of intent signed, survey results. | ALG-05 ("Local leadership and committed initiators are critical"), SRC-LYGNERUD-2023 (co-creation), SRC-GHNF-2026 (letters of support, heads of terms), SRC-OSTERWALDER-2010 |
| J19 | **Connection rate** (`businessPlan.assumptions.connectionRate`) | Rate (share of buildings or demand) with basis, timeline, the minimum rate at which the plan still works, and what happens below it. L4: backed by commitments, with a switching value. | ALG-10 ("Every building that stays out…", "Connecting is voluntary"), SRC-EC-CBA-2014 (quantity as critical variable, switching value), SRC-GHNF-2026 (connection risk), BM-STEP-03.2 |

### D6 Risk, assumptions & evidence (10 %)

| # | Judgement (fields) | What good looks like | Sources |
|---|---|---|---|
| J20 | **Critical assumptions** (`businessPlan.criticalAssumptions` rows, judged as one list) | The few assumptions whose failure would sink the plan (V01: top 3), each with a concrete validation (what, who, by when), ordered by importance and lack of evidence. | BM-STEP-03.3–4, SRC-BLAND-2020 ("Focus on the top right quadrant…"), SRC-EC-CBA-2014 (critical variables), SRC-HMT-BC-2026 (optimism bias) |
| J21 | **Risks incl. deal-breaker** (`businessPlan.risks` rows incl. `dealBreaker`, judged as one list) | Risks across types: source yield, electricity price for heat pumps, connection uptake, permits, operator capacity. Each has impact, mitigation and validation; one is flagged as deal-breaker (gate G13 checks it). | BM-STEP-03, BM-SCOPE-03 Q7, SRC-LYGNERUD-2019 ("failure of the heat source, increasing electricity prices, and inadequate demand"), SRC-ARENA-CRI-2014 (Market Opportunities L1) |
| J22 | **Learning loop** (merged: `businessPlan.refinements.feedback` + `businessPlan.refinements.changes`) | Specific feedback (from whom), what changed in the model and why, what was dropped. | BM-STEP-04.1, BM-SCOPE-09, SRC-BRINCKMANN-2010 ("combines planning and learning") |

### D7 Implementation path & scalability (10 %)

| # | Judgement (fields) | What good looks like | Sources |
|---|---|---|---|
| J23 | **Scalability and replication** (merged: `businessPlan.scalability.geographical` + `.economic` + `.organisational`) | Conditions under which the model transfers (density, source type, owner structure, regulation), which parts are standardised (contracts, cost key, operator model), and where it does **not** work. L4: checked against another scenario or site. | BM-STEP-04.2, BM-SCOPE-04/09, ALG-05 ("Standardised implementation models can reduce complexity"), SRC-D2GRIDS-2020 (boundary conditions), SRC-BOESTEN-2019 (modular) |
| J24 | **Data to collect** (`businessPlan.nextSteps.data`) | Each data item tied to the assumption it validates (metered consumption, groundwater test, trench route, owner survey). | BM-STEP-04.3, SRC-GHNF-2026 (metered data best), ALG-09 |
| J25 | **Stakeholders and partnerships to secure** (merged: `businessPlan.nextSteps.stakeholders` + `.partnerships`) | Who comes next, in which order, and which agreement to obtain (letter of intent, partnership agreement, authority pre-meeting), with dates. | BM-STEP-04.3, ALG-05 |
| J26 | **Pilot** (`businessPlan.nextSteps.pilots`) | A small first step (anchor cluster, micro-network between neighbours) with scope, cost and success criteria. | ALG-09 ("Micro-networks between direct neighbours"), ALG-10 ("Start small"), SRC-ARENA-CRI-2014 (Status Summary 2 "Commercial trial") |
| J27 | **Decisions** (`businessPlan.nextSteps.decisions`) | A go/no-go gate with explicit criteria (e.g. letters of intent covering X % of demand, permit pre-check positive, financing indication), a decision-maker and a date. | BM-STEP-04 V01 ("a realistic decision gate"), SRC-HMT-BC-2026 (management case: approvals) |

Not scored: `businessPlan.scenarioId` (a choice). It is passed as context.

**Merges (summary):** customer segments (2 fields → J1), alternatives + advantage (J4), site facts (5 → J6), cost structure + capex (J9), revenue streams + tariffs (J10), key activities + operator responsibilities (J14), stakeholders + partners (J16), customer relationships + channels (J18), feedback + changes (J22), scalability ×3 (J23), next-step stakeholders + partnerships (J25). Row lists are judged as one list each (J15, J20, J21).

---

## 3. Decision gates (b)

Gates are cross-field `boolean` or `choice` questions. Each belongs to exactly one dimension. Effects are kept to two kinds:

- **Cap**: if the gate fails with confidence, the dimension cannot exceed level 2 (50/100, "must-have") or level 3 (75/100, "should-have").
- **Flag**: shown in the report, no score effect.

Decision rule (from the repo's Jev research note; calibrate later): a boolean counts as passed if p(yes) ≥ 0.8 and failed if p(yes) ≤ 0.2. In between it is **unclear** and becomes a flag, never a cap. For a choice, the selected option counts only if its probability is ≥ 0.9; otherwise unclear. When all input fields of a gate are empty, the gate fails deterministically with no AI call.

The analogy is GHNF: gated metrics must be passed before deliverability is scored, and adjustments to the score are bounded (max 30 %; SRC-GHNF-2026). Caps are the simple equivalent.

| Gate | Question (type) | Dim | Effect if failed | Deterministic part | Motivating sources | Why |
|---|---|---|---|---|---|---|
| G1 Anchor customer | Does the plan name at least one specific anchor customer (a large or early connection) and its role? (boolean) | D5 | Cap D5 at 2 | — | ALG-10 ("Start small: anchor customers"), SRC-GHNF-2026 (letters of support), SRC-LYGNERUD-2023 | Without a committed first load, the connection rate is speculation. |
| G2 Connection rate and threshold | Does the plan state a connection rate **and** what happens to cost or viability if fewer buildings connect (minimum rate or effect per customer)? (boolean) | D5 | Cap D5 at 2 | Fails if `connectionRate` is empty | ALG-10 ("Every building that stays out raises costs for the rest", "Connecting is voluntary"), SRC-EC-CBA-2014 (switching value), SRC-GHNF-2026 (minimum demand) | Connection is voluntary in Austria (SRC-EWG-2024 covers new buildings only), so uptake is the critical variable. |
| G3 System boundary | Who owns source, network and building heat pumps? (choice: `none` / `partial` / `all three defined`) | D4 | Cap D4 at 2 unless `all three defined` | — | ALG-10 ("System boundary: who owns source, network, heat pumps?"), ALG-05, BM-SCOPE-03 Q2 | Funding, tariffs and liability all depend on it ("Funding… depends on who owns what"). |
| G4 Operator | Does the plan name an operator and its operational duties (maintenance, billing, faults, supply security)? (boolean) | D4 | Cap D4 at 3 | — | BM-STEP-02, BM-SCOPE-03 Q2/Q7, SRC-HMT-BC-2026 (management case) | Long-term operation is one of the key factors named in ALG-05. |
| G5 Fair cost key | Does the plan state a rule for splitting source, pipe and connection costs among users? (boolean) | D4 | Cap D4 at 3 | — | ALG-10 ("Fair cost key: e.g. source by connected load, pipes by those who use them"), SRC-LYGNERUD-2019 ("Shared incentives") | Many individual owners decide (ALG-10); an unfair or missing key blocks participation. |
| G6 Lifetime cost coverage | Does the plan compare annual revenues with annualised capex plus operating costs (including heat-pump electricity) over 20–30 years? (choice: `yes` / `partly` / `no`) | D3 | Cap D3 at 2 if `no` | If the Quick Check is ready: show E (OQ-21). Flag "contradicts Quick Check" if E < 0.7 and the plan does not explain how the gap closes | ALG-10 ("revenues over 25–30 years"), TBL-6, OQ-21, SRC-HMT-BC-2026, SRC-ARENA-CRI-2014 | "Costs come first"; viability is a lifetime question, not a first-year one. |
| G7 Subsidy dependence | How does the plan depend on subsidies? (choice: `none assumed` / `assumed, with fallback` / `assumed, no fallback` / `unclear`) | D3 | Cap D3 at 2 if `assumed, no fallback` | — | ALG-10 ("Funding fits only partly"), SRC-ARENA-CRI-2014 (L3 "Post subsidy revenues…"), SRC-SANOFF-2026 (2026 budget exhausted), SRC-GHNF-2026 (must "access sufficient non-GHNF funds") | Budgets close (Sanierungsoffensive 2026 ran out on 10 July 2026); a plan that only works with one grant is fragile. |
| G8 Heat line density | Does the plan address network length or heat line density as a cost driver (trench length, clustering, micro-networks)? (boolean) | D2 | Cap D2 at 2 **only if** the Quick Check heat density is low (TBL-9 < 0.5 MWh/m) **and** the gate fails | Show ρ_heat from the Quick Check when ready (MWh/m, OQ-10) next to ALG-09's ~1 MWh/m; if no Quick Check: flag "density unknown" | ALG-09, TBL-9, OQ-10, SRC-PERSSON-WERNER-2011, SRC-REIDHAV-WERNER-2008, SRC-NUSSBAUMER-2016; caution SRC-BUFFA-2019 | The provider names density as decisive, but 5GDHC cases exist below classic DH thresholds, so the gate caps only when the data and the text both point the same way. |
| G9 Water-law permit | If the source uses groundwater, surface water or boreholes: does the plan name the permit route or an authority pre-check? (choice: `not applicable` / `addressed` / `not addressed`) | D2 | Cap D2 at 2 if `not addressed` | `not applicable` when no water or ground source is selected in the shared sources | SRC-WRG-1959 (§ 10 (2), § 31c (5); approvals limited to 25 years), SRC-OOE-GWWP, ALG-05 ("permits… strongly influence feasibility"), ALG-09 (groundwater), SRC-ARENA-CRI-2014 (Regulatory Environment) | A typical deal-breaker. The 25-year limit under § 31c (5) is also close to the 25–30-year revenue horizon of ALG-10. |
| G10 Vienna heating plan zone | If the site is in Vienna: does the plan state its Wärmeplan 2040 zone and explain why a 5GDHC network fits it? (choice: `not Vienna` / `stated` / `not stated`) | D2 | Flag only | `not Vienna` from `site.location` when clearly outside Vienna | ALG-07, SRC-WIEN-WWP-2040, SRC-WIEN-WWP-METHOD (400 MWh/(ha·a) suitability threshold) | Explains fit with city planning; useful but not universal. |
| G11 Price vs alternative | Is the customer price compared with the customer's realistic alternative (gas, individual heat pump), including price stability? (boolean) | D1 | Cap D1 at 2 | — | BM-STEP-01.2, BM-SCOPE-02, SRC-GHNF-2026 (customer detriment gate), SRC-LYGNERUD-2019 (no green premium) | If connecting costs customers more than the alternative, voluntary uptake fails. |
| G12 Cooling or extra value | Does the plan use cooling or another extra value (stable prices, grid relief) as a reason to connect, where it applies? (boolean) | D1 | Flag only (no penalty) | Show the C/H ratio class (TBL-10) when the Quick Check is ready | ALG-06 ("summer cooling becomes a reason to connect"), ALG-10, SRC-WIRTZ-2020-EB (DOC > 0.45) | A strength where cooling demand exists; not every site has it. |
| G13 Deal-breaker with validation | Is one risk marked as the potential deal-breaker, is it really able to stop the project, and does it have a concrete validation step (what, who, when)? (boolean) | D6 | Cap D6 at 2 | Fails if no row has `dealBreaker = true` (the readiness check already knows) | BM-STEP-03 ("including one potential deal-breaker… how each could be validated"), SRC-BLAND-2020, SRC-EC-CBA-2014 | Demanded by the brief; the AI checks substance, readiness checks presence. |
| G14 Start small | Is a first phase defined (anchor cluster or micro-network) with later growth steps? (boolean) | D7 | Cap D7 at 3 | — | ALG-10 ("Start small… modular growth, micro-networks"), ALG-09, SRC-BOESTEN-2019 ("intrinsically modular"), SRC-D2GRIDS-2020 | Lowers upfront risk and matches the provider's advice. |
| G15 Decision gate with criteria | Do the next steps contain a go/no-go decision with explicit, checkable criteria? (boolean) | D7 | Cap D7 at 2 | Fails if `nextSteps.decisions` is empty | BM-STEP-04 V01 ("a realistic decision gate for progressing the concept"), SRC-HMT-BC-2026 (management case) | Turns a plan into a path to implementation. |

Gates per dimension: D1 G11, G12 · D2 G8, G9, G10 · D3 G6, G7 · D4 G3, G4, G5 · D5 G1, G2 · D6 G13 · D7 G14, G15.

---

## 4. Aggregation (c)

Simple enough for one "How we calculate" panel (D-33).

1. **Empty means zero, without AI.** If every field of a judgement is blank after trimming, its level is 0 with probability 1 (no band). No Jev call is made for it. Gates whose inputs are all empty fail deterministically.
2. **One Jev call per dimension.** The `state` holds the dimension's field texts, the site facts, the scenario and, when the Quick Check is `ready`, its numbers (demand, R_overall, C_overall, ρ_heat, E, classes). The `questions` are that dimension's `score` judgements plus its gates. Plan text is user data: wrap it as untrusted state, never as instructions (PLAN-AGENT-00 threat table).
3. **Judgement score.** Jev returns a probability per level p(0…4) (plus a fractional score). Use the expected level E = Σ k·p(k), the probability-weighted score of G-Eval (SRC-GEVAL-2023), and its spread SD = √(Σ p(k)·(k − E)²) as the uncertainty band.
4. **Dimension score.** Mean of its judgements' E, then apply the lowest active cap: `level_d = min(mean E, cap_d)`, `score_d = 25 × level_d` (0–100). Band_d = √(Σ SD_j²) / n_d. This assumes independent judgements and probably understates the band; say so in the panel.
5. **Overall.** `overall = Σ w_d × score_d` with the weights of §1.2, band = √(Σ (w_d × 25 × band_d)²). Round to 5 points and show "≈ 60 (± 8)", never decimals.
6. **Broad label** (mirrors the Quick Check's "avoid false precision", QCT-RES-LEVELS): `Solid basis` (≥ 70 and no must-have cap active), `Promising, gaps to close` (40–69, or ≥ 70 with a must-have cap), `Early draft` (< 40). The thresholds are a design choice, not sourced; record them as an owner decision and calibrate.
7. **Show why.** Per dimension: the bar, the band, active caps with the gate's reason and source, and the weakest two judgements. The LLM report may only use these results, the rubric texts and the suggestion list in §5. It adds no new numbers or facts.

**Honest use of the probabilities.** The distribution expresses how sure Jev is about **which descriptor fits the text**. It does not say how likely the project is to succeed. The SDK promises no calibration (repo research note), so:

- Build a small labelled set (the 4 scenario presets at deliberately different quality levels, EN and DE) and measure agreement with a human rating before release.
- Run a padding test: adding words without substance must not raise E (SRC-ZHENG-2023 verbosity bias).
- Label AI-assisted text: LLM judges prefer LLM-written text (SRC-GEVAL-2023). Text drafted by the in-app assistant may be scored higher, so show the score as "AI estimate" and never rank teams by it alone.

---

## 5. General, feasible improvement suggestions per dimension (d)

Used by the on-demand improvement run. The model picks at most three per weak dimension and may not invent others.

**D1 Customer value & demand**
- Compare the yearly cost for one typical customer under the network vs gas vs an individual heat pump over the same 20–30 years (BM-STEP-01.2, ALG-10, TBL-6; SRC-GHNF-2026 uses exactly this counterfactual test).
- Quantify cooling demand and make cooling a stated reason to connect where it exists (ALG-06, ALG-10, SRC-WIRTZ-2020-EB).
- Do not rely on a green premium; lead with price stability, comfort and avoided replacement costs (SRC-LYGNERUD-2019).

**D2 Technical & site fit**
- State the trench length and heat line density (MWh per metre of trench), and cluster close buildings first (ALG-09, TBL-9, SRC-REIDHAV-WERNER-2008).
- Replace benchmark demand with billed or metered consumption for at least the anchor buildings (SRC-GHNF-2026 evidence ladder).
- Check groundwater and borehole potential (Vienna: erdwaerme-wien.info, Geothermie-Atlas) and book a pre-meeting with the water authority (SRC-WIEN-WWP-METHOD, SRC-WRG-1959).

**D3 Costs, revenues & financing**
- Annualise capex over the depreciation period (TBL-6: 20 a, 3 %) and compare it with revenues and operating costs, the way the Quick Check does (OQ-21).
- Test connection rate, tariff, capex and electricity price one at a time and give the value at which the plan breaks even (switching value) (SRC-EC-CBA-2014).
- Add a contingency for optimism bias and show the plan without any subsidy (SRC-HMT-BC-2026 §8.59–8.60, ALG-10, SRC-ARENA-CRI-2014).

**D4 Ownership, operation & governance**
- Draw the system boundary: who owns, finances and operates source, network and heat pumps (ALG-10).
- Write the cost key as a rule (source by connected load, pipes by users) and check that no party carries a risk without a matching benefit (ALG-10, BM-STEP-02.2, SRC-HMT-BC-2026 "Risk allocation").
- List the contract elements to settle (supply details, renegotiation, mitigation, simplicity) (SRC-LYGNERUD-2019 Table 3).

**D5 Participation & commitment**
- Name one anchor customer and aim for a letter of intent (ALG-10, SRC-GHNF-2026).
- For each owner type, write who decides and by which rule (e.g. condominium vs rental vs non-profit housing) (ALG-05, ALG-10, BM-SCN-03).
- Involve the municipality early as partner or initiator (ALG-05, SRC-BUSH-2016), and co-create with a small group of committed first customers (SRC-LYGNERUD-2023).

**D6 Risk, assumptions & evidence**
- Rank assumptions by importance and by evidence, and test the important, unevidenced ones first (SRC-BLAND-2020).
- Make the deal-breaker concrete: what would stop the project, which test shows it, who runs it and by when (BM-STEP-03).
- Record what changed after feedback and why (BM-STEP-04.1, SRC-BRINCKMANN-2010).

**D7 Implementation path & scalability**
- Define phase 1 as a small cluster or micro-network and the steps to grow (ALG-09, ALG-10, SRC-BOESTEN-2019).
- State under which conditions the model transfers (density, source, owner structure, regulation) and where it does not (BM-STEP-04.2, SRC-D2GRIDS-2020).
- Set a go/no-go gate with measurable criteria, a decision-maker and a date (BM-STEP-04 V01, SRC-HMT-BC-2026).

---

## 6. Cautions: claims we must not make

- Do not present the score as a funding, jury or success prediction (SRC-KIRSCH-2009). Do not call the V01 criteria official (D-30).
- Do not present ~1 MWh/m as a hard threshold. ALG-09 says "approx.", and some 5GDHC networks run below classic DH feasibility thresholds (SRC-BUFFA-2019). The Quick Check compares in MWh/m of network (OQ-10), while ALG-09 says "per metre of trench".
- Do not state subsidy rates, eligibility of anergy networks or open/closed status inside the score. These are volatile (SRC-SANOFF-2026) and the UFI information sheets were not verified (SRC-UFI-WKV). "Raus aus Öl und Gas" is not a current private programme name on official pages.
- Do not say every 5GDHC needs a full water-law permit. Groundwater use needs approval under WRG § 10 (2). The listed cases of § 31c (5) go through the § 114 notification procedure, with approvals limited to 25 years. Procedures vary by Land, and none of this is legal advice.
- Do not treat UK sources (HM Treasury, GHNF) as Austrian requirements; they are structural analogues only.
- Do not claim the probabilities are calibrated, and do not show more than the rounded score and band.
- Do not quote Lund et al. (2014) for the "sound business model" property; cite Boesten et al. (2019), who list it after Lund. Do not cite content from Jonsson & Svingby (2007), McGrath & MacMillan (1995) or IEA DHC Annex XI, which were not opened.

## 7. Open points for the owner (OQ candidates)

1. Approve the weights (§1.2) and label thresholds (§4.6), or choose equal weights.
2. Caps on or off at launch, or flags only until calibration exists?
3. Should a correctly cited Quick Check number count as evidence (level 4) or only as a basis (level 3)? Proposed: level 3.
4. Jev on German text: test DE inputs in the labelled set before enabling scoring for DE.
