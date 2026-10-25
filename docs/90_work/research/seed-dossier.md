---
id: RESEARCH-SEED-DOSSIER
title: 'Reference cases: seed dossier (3 Vienna, 3 fictional)'
source: [web research by a Claude sub-agent, 2026-10-24; every link opened and every DOI resolved on that day]
---

# Seed dossier: six Business Plan examples (Vienna, 5GDHC / Anergienetz)

Access date for all sources: **2026-10-24**. Numbers in square brackets, e.g. [11], point to the global bibliography in `seed-sources.md`; each example also ends with its own reference list. Field ids are the registry ids of `lib/project/fields/business-plan.ts`.

Markers used in the text:

- **[n]**: the fact comes from source n.
- **(proposed)**: a plan element we suggest for a *real* project (validation, decision gate, cost key). It is not a claim about what the real organisations did.
- **(illustrative)**: an invented detail in a *fictional* example.
- **not public**: we searched and found no public figure.

Short fields (`site.name`, `site.location`, `site.siteType`, `site.units`, list items, `allocation.stakeholder`, `risks.title`) stay under 200 characters; long fields stay under 1,000 characters. Rubric tiers are deliberate: within each group of three, one example is weak, one middling and one strong.

## Contents

| # | id | Real or fictional | Tier |
|---|---|---|---|
| R1 | `smart-block-geblergasse` | real (17th district) | **strong** |
| R2 | `kraftwerk-seebogen-aspern` | real (22nd district) | **middling** |
| R3 | `village-im-dritten` | real (3rd district) | **weak** |
| F1 | `hospital-anchor-quarter` | fictional | **strong** |
| F2 | `pool-anchor-campus` | fictional | **middling** |
| F3 | `data-centre-waste-heat` | fictional | **weak** |

## Scoring rubric used for the tiers

The rubric combines the jury criteria (BM-SCOPE-08), the step requirements (BM-STEP-01..04) and the e7 tips (ALG-09, ALG-10).

| Code | Criterion | Source in repo |
|---|---|---|
| C1 | Site, segments and demand are quantified (buildings, m², MWh/a) | BM-STEP-01, BM-SCOPE-08 "problem-solution fit" |
| C2 | An anchor customer is named and its commitment is planned | ALG-10 "start small: anchor customers" |
| C3 | System boundary and operator are clear (who owns source, network, heat pumps) | ALG-10 "system boundary", BM-STEP-02 |
| C4 | Investment, risk and benefit are allocated, with a fair cost key | BM-STEP-02 item 2, ALG-10 "fair cost key" |
| C5 | Connection rate, tariffs, capex, financing and subsidies are quantified and sourced | BM-STEP-03 items 1-2 |
| C6 | Each critical assumption has a concrete validation | BM-STEP-03 item 4 |
| C7 | Exactly one *real* deal-breaker is flagged, with a validation | BM-STEP-03 item 3 |
| C8 | Refinements, scalability and next steps end in a realistic decision gate | BM-STEP-04 (V01: "realistic decision gate") |

| Example | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | Tier |
|---|---|---|---|---|---|---|---|---|---|
| R1 Geblergasse | meets | meets | meets | meets | meets | meets | meets | meets | strong |
| R2 Seebogen | meets | partial | fails | partial | partial | partial | partial | fails | middling |
| R3 Village im Dritten | partial | fails | fails | fails | fails | fails | fails | fails | weak |
| F1 Hospital | meets | meets | meets | meets | meets | meets | meets | meets | strong |
| F2 Pool | meets | partial | partial | meets | partial | partial | partial | partial | middling |
| F3 Data centre | fails | fails | fails | fails | fails | fails | fails | fails | weak |

## How the three real projects were chosen

Candidates checked (details and links in `seed-sources.md`, section "Dropped or unverified"):

| Candidate | Finding | Used? |
|---|---|---|
| Smart Block Geblergasse (17th) | City report (AnergieUrban, MA 20) and Klima- und Energiefonds report give demand, cost, grant, contracting and expansion plans [7][11] | **yes, R1** |
| Kraftwerk Seebogen, Seestadt Aspern H6 (22nd) | City page gives probes, demand, sources, operation year, CO2 [1] | **yes, R2** |
| Village im Dritten (3rd) | Wien Energie slides, ARE folder and news give area, GFA, probes, capacities [30][31][34][35] | **yes, R3** |
| Viertel Zwei (2nd) | City page confirms "the largest Anergie-Netz in Austria", 16 ha [2]; the detailed klimaaktiv evaluation is offline (404) and the Energie Krieau PDF is gone, so key numbers cannot be verified | no (too few verifiable numbers) |
| MGG22, Mühlgrundgasse (22nd) | 30 probes × ~150 m and 9 heat pumps (300 kW) across three plots, two developers, 160 flats [12][14]; documented as thermal mass activation, not as an anergy network | no (good reserve) |
| Wildgarten (12th) | City page: all buildings in the quarter are on district heating [10] | no (not 5GDHC) |
| Neu Leopoldau, Gräf & Stift, Nordbahnhof | No public source found that describes an anergy network there | no |
| SmartCity Baumgarten (14th) | Ongoing demonstration of a cross-property anergy network in existing stock [41]; final results not found | no (later candidate) |

---

## R1 · `smart-block-geblergasse` · STRONG · real

**Summary (EN):** Two Gründerzeit houses in Hernals share courtyard geothermal probes, PV-T and one heat pump: Vienna's first anergy "start cell" in an existing block, built to grow.
**Summary (DE):** Zwei Gründerzeithäuser in Hernals teilen Erdsonden im Hof, PVT-Kollektoren und eine Wärmepumpe: Wiens erste Anergie-Startzelle im Bestand, ausgelegt zum Wachsen.
**Site name (DE):** SMART BLOCK Geblergasse – Anergienetz 1170 Wien

**Why strong:** C1 demand, flats and GFA are quantified from the city and Klimafonds reports [7][11]. C2 the two owners form a committed core [11]. C3 the contracting boundary is explicit [36]. C4 three stakeholder rows plus a cost key. C5 capex, grant, tariff rule and benchmark are all sourced [6][7][11]. C6 every assumption has a measurable test. C7 one real deal-breaker (drilling space for phase 2 [7]). C8 a four-condition decision gate. The facts are documented; validation and gate are marked (proposed).

**Source conflicts to keep visible:** the 2017 design had 8 probes of about 120 m [11], while a 2021 news report gives 18 probes of 110 m [36]. Costs are €320,000 (2017 tender) [11] and €350,000 (2021) [36]. There are 25 flats (16 + 9) [11][9]; an AEE INTEC slide on a probably identical pilot says 20 [15].

### Site

- `site.name`: SMART BLOCK Geblergasse (Anergienetz 1170 Wien) [7][9]
- `site.location`: Geblergasse 11 and 13, 1170 Vienna (Hernals); block Geblergasse / Hernalser Gürtel / Ottakringer Straße / Veronikagasse [7][9]
- `site.siteType`: Dense Gründerzeit perimeter block, existing buildings, shared inner courtyard [7][11]
- `site.ownership`: Two private rental houses whose flats are let after a subsidised refurbishment (Wiener Wohnbaufonds) [11]. The block holds 18 properties with separate owners; 12 were unrenovated in 2017 and only half of those owners could be reached [11]. Under building, tenancy and heating-cost law (Bauordnung, MRG, Heizkostenabrechnungsgesetz), on-site renewable supply is costly for owners [11].
- `site.units`: 2 buildings, 25 flats (16 + 9), ~2,000 m² GFA; block of 18 properties for later phases [11][9]
- `site.currentSupply`:
  - Start cell (from 2018): geothermal probes, one heat pump and PV-T, shared by No. 11 and 13 [7]
  - Gas storey heaters in ~65% of the unrenovated block houses [11]
  - Single stoves, night-storage heaters, central oil/gas (~10% each) [11]
  - District heating in one house (Ottakringer Straße 20) [11]
  - Gas condensing boiler as backup for 105 kW (2017 design) [11]
- `site.stakeholders`:
  - Owners of Geblergasse 11 and 13 (core team) [11]
  - Tenants of the 25 flats [11][9]
  - Owners of the 16 other block properties [11]
  - City of Vienna: MA 25 (grant), MA 20 (energy planning) [11][7]
  - Area renewal office (Gebietsbetreuung) as possible moderator [11]
- `site.partners`:
  - Smart Block II team: Burtscher-Durig ZT, ÖGUT, Komobile w7, M. Gruber, J. Zeininger [11]
  - Technisches Büro Käferhaus (building-services concept) [11]
  - Klima- und Energiefonds (research funding, Smart Cities Demo) [11]
  - Energy contractor that pre-financed the plant (name not public) [36]

### Step 1 · Opportunity

- `businessPlan.opportunity.customerSegments`: Tenants of 25 flats (16 in No. 11, 9 in No. 13) who buy heat, hot water and some cooling, and the two owners as contract partners [11]. Expansion customers are the owners of the 16 other houses in the block, from unrenovated Gründerzeit stock to recently renovated houses [11][7].
- `businessPlan.opportunity.needs`: Design values after renovation: space heat 90 + 67 MWh/a, hot water 30 + 20 MWh/a, heat load 60 + 45 kW [11]. Moderate summer cooling in No. 11 through the floor heating (change-over, about 3 weeks, 10:00-14:00) [11]. Unrenovated block houses need about 125 kWh/m²a of heat plus ~25 kWh/m²a of hot water [11].
- `businessPlan.opportunity.heatSources`: The ground under the courtyard as a seasonal store: 18 probes of 110 m reported in 2021 [36] (2017 design: 8 × ~120 m [11]). Two 54 m² PV-T hybrid roofs, outdoor air through an air-water exchanger down to about −5 °C, and one 110 kW heat pump that also makes summer cold [11].
- `businessPlan.opportunity.painPoint`: Gründerzeit houses lack central heating and space; under current rules and costs, owners fit gas storey heaters, which locks in fossil heat [11]. A shared renewable plant costs about three times a gas central heating, and the owners' condition is that tenants pay no more than with district heating [11].
- `businessPlan.opportunity.alternatives`: Gas central or storey heating, which is cheapest up front [11]. District heating, which Wien Energie put at about €60,000 per Gründerzeit house to connect, with higher annual costs in unrenovated houses [11]. One heat pump per house, limited by courtyard space and small drilling rigs [7].
- `businessPlan.opportunity.advantage`: Linking houses lets a house without drilling space feed solar heat into the shared store and take it back later, a balance a single building cannot reach [7]. Over 20 years the full costs match gas at about €10/m² net floor area per year, and the network adds moderate cooling almost for free [7].

### Step 2 · Business Model Canvas

- `businessPlan.canvas.keyPartners`: The two owners (one is part of the research team) [11]; an energy contractor that finances, builds and runs the plant [36]; the City of Vienna (MA 25 grant, MA 20 planning) [11][7]; planners Zeininger and Käferhaus; ÖGUT for process and financing (SEFIPA) [11][16][7].
- `businessPlan.canvas.keyActivities`: A joint tender and renovation of both houses [11]; drilling and courtyard restoration [7]; running the heat pump and store so the annual ground balance stays even [6]; metering and billing tenants [36]; recruiting neighbours for phase 2 (proposed).
- `businessPlan.canvas.keyResources`: Courtyard land for probes, two roofs with PV-T, and the heat centre in No. 11 with a 2,000 l buffer [11]; pipe connections already prepared for further houses in the block [7].
- `businessPlan.canvas.valueProposition`: Tenants get fossil-free heat, hot water and moderate cooling at no more than district-heating cost [11][7]. Owners avoid their own boiler investment and get a renovated, future-proof house [36]. The block gets a start cell that neighbours can join step by step [7].
- `businessPlan.canvas.customerRelationships`: A long-term supply contract between contractor and owners; tenants pay monthly fees to the contractor [36]. The 2017 plan foresaw a one-off construction-cost contribution by the owners, sized so that tenant costs stay at district-heating level [11].
- `businessPlan.canvas.channels`: Owner-to-owner contact from the two-owner core team; a steering group of all owners, resident representatives, city departments and funders; external moderation, e.g. by the area renewal office [11].
- `businessPlan.canvas.customerSegments`: End users are the tenants of 25 flats and contract partners are the two owners. Expansion customers are owners of neighbouring houses, starting with those already planning works (e.g. Ottakringer Straße 18, Veronikagasse 36) [11].
- `businessPlan.canvas.costStructure`: The plant cost ~€320,000 at tender for both houses, about 3× a gas central heating (2017) [11]; ~€350,000 was reported for the start-cell technology (2021) [36]. Running costs: heat-pump electricity (partly from own PV-T), maintenance, metering and billing [11][36].
- `businessPlan.canvas.revenueStreams`: Monthly heat and cooling fees from tenants via the contractor [36]; the owners' construction-cost contribution [11]; the MA 25 grant of 30% (~€95,000) [11]; connection fees from houses that join later (proposed).
- `businessPlan.canvas.operatorResponsibilities`: Proposed system boundary, in line with the contracting set-up [36]: the contractor owns and runs probes, heat pump, buffer, PV-T and the courtyard loop up to a heat meter at each house; owners own the building pipes and floor heating. The contractor guarantees supply, with a gas boiler as backup [11].
- `businessPlan.allocation[0]`
  - `stakeholder`: Owners of Geblergasse 11 and 13
  - `investment`: A planned construction-cost contribution (amount not public) plus the building-side heating system in the refurbishment [11].
  - `risk`: Tenants may reject the costs; the contractor may default; probes stay on their land for decades (risk wording proposed) [11][36].
  - `benefit`: No own boiler investment, renovated houses ready for the gas phase-out, and a reference project that won the Vienna urban renewal award (Goldenes Güteziegel, "Pioneering Achievement") [9].
- `businessPlan.allocation[1]`
  - `stakeholder`: Energy contractor (name not public)
  - `investment`: Pre-finances the plant: ~€320,000 minus the 30% MA 25 grant ≈ €225,000 (2017 figures) [11][36].
  - `risk`: Heat demand, ground performance, electricity prices and tenant payments over about 20 years (proposed list).
  - `benefit`: Fee income over the contract term; the project reports that the higher build cost amortises within 20 years [36].
- `businessPlan.allocation[2]`
  - `stakeholder`: Tenants of the 25 flats
  - `investment`: Nothing up front; monthly fees to the contractor [36].
  - `risk`: Fees depend on electricity prices and the contract terms; tenants have little say in the decision (proposed).
  - `benefit`: Heat at no more than district-heating cost (the owners' condition) and summer cooling in No. 11 [11].

### Step 3 · Reality check

- `businessPlan.assumptions.connectionRate`: Phase 1 connects both houses, 25 of 25 flats (100%) [11][9]. For phase 2, 4 more houses were planned for 2019-20 [15] and 5 were in talks in 2020 [7]. The plan assumes 4 of the 16 other houses (25%), with 0 and 6 as sensitivities (proposed). The status of phase 2 is not public.
- `businessPlan.assumptions.tariffs`: The rule is tenant cost ≤ district heating [11]. Benchmark: full cost ~€10/m² net floor area per year for heat, hot water and moderate cooling (20 years, June 2018 prices) [7]. With grants, owner plus tenant cost was ~€7.89/m²a in the renovated houses [11]. In 2017 gas had to rise ~70% (to €0.125/kWh) before this system beat gas central heating [11].
- `businessPlan.assumptions.capex`: Start cell: €320,000 at tender (≈€160/m² GFA) [11]; €350,000 reported in 2021 [36]. Phase-2 drilling: €65/m at ~60 m depth in courtyards and €50/m at ~120 m on public land (2020 expert survey) [7]. Extra loop at the Quick Check default of €500/m [39].
- `businessPlan.assumptions.financing`: Contracting: the contractor pre-finances construction and recovers it through monthly fees; the higher cost is amortised over 20 years [36]. The 2017 plan added a construction-cost contribution by the owners so fees stay at district-heating level [11].
- `businessPlan.assumptions.subsidies`: MA 25 paid 30% (~€95,000) of the start cell [11]. For phase 2, the city's anergy grant paid 30%, max €200,000 per case, for ≥2 buildings incl. 1 residential, once fossil heating incl. cooking gas is removed (applications 01.10.2024-31.12.2025; successor not verified) [6]. UFI micro-networks pay up to 40% [13].
- `businessPlan.criticalAssumptions[0]`
  - `statement`: The courtyard store stays in balance: summer solar and cooling heat recharge what winter heating removes, also after new houses join.
  - `validation`: Meter heat flows and probe temperatures and check them against the city rule of ±20% per year and ±10% over 5 years; simulate 30 years of operation before phase 2 [6].
- `businessPlan.criticalAssumptions[1]`
  - `statement`: Tenant costs stay at or below district-heating costs over the whole contract term [11].
  - `validation`: Each year, compare the cost per m² with the current district-heating price and the €10/m²a benchmark [7]; share the result with tenants (proposed).
- `businessPlan.criticalAssumptions[2]`
  - `statement`: At least 4 more owners join phase 2 and pay a connection fee [15].
  - `validation`: Signed letters of intent covering ≥50% of the extra heat sales before any order, the threshold UFI applies to external networks [13].
- `businessPlan.risks[0]` · **deal-breaker**
  - `title`: No drilling space for phase 2
  - `description`: Courtyards only allow small rigs and ~60 m probes. In the Gründerzeit test area, 61% of the storage capacity lies under public land, but rules for probes on public land were still missing [7]. Without new probe sites, extra houses would overdraw the store.
  - `dealBreaker`: true
  - `validation`: Map probe sites per house with the AnergieUrban method, and get the city's written position on probes under sidewalks or parking lanes before any phase-2 contract (proposed) [7].
- `businessPlan.risks[1]`
  - `title`: Neighbours do not join
  - `description`: Owners lack money or see no return; in 2017 only half of the unrenovated owners could even be reached [11].
  - `dealBreaker`: false
  - `validation`: A steering group and owner workshops moderated by the area renewal office [11], ending in letters of intent [13].
- `businessPlan.risks[2]`
  - `title`: Heat-pump electricity costs rise
  - `description`: Electricity is the main running cost; a price jump pushes tenant fees towards the district-heating cap (proposed).
  - `dealBreaker`: false
  - `validation`: Track the annual efficiency against the design assumption of 6 for a regenerated store [7], use more own PV-T power and index fees transparently (proposed).

### Step 4 · Implementation

- `businessPlan.refinements.feedback`: Smart Block II found that a core team of two owners works, that others join once they see shared benefits, and that managing the interfaces between actor groups is decisive [11]. AnergieUrban adds that courtyard drilling is limited and public land is needed for a full supply [7].
- `businessPlan.refinements.changes`: Phase 2 extends the existing loop through the prepared pipe connections [7]. The cost key is fixed before recruiting: source by connected load, pipes by those who use them [40]. Contracting stays, so owners need no capital [36] (proposed).
- `businessPlan.scalability.geographical`: Vienna's heat plan marks dense areas as "Lokale Wärme gemeinsam", meant for shared local networks [5]. TU Wien estimates 2-3 TWh/a for local networks in Vienna, about 43% of it via anergy networks [17].
- `businessPlan.scalability.economic`: Probe-based networks reach cost parity only with optimisation, extra sources and renovation; groundwater is cheaper but limited [17][18]. Higher gas prices help: in 2017 gas had to rise ~70% to break even [11].
- `businessPlan.scalability.organisational`: The start-cell model is being repeated: ÖGUT screened nine housing blocks for anergy start cells [8]. A block contractor plus a steering group per block can be copied (proposed) [11].
- `businessPlan.nextSteps.data`: Two years of metered heat, cooling, electricity and probe temperatures from the start cell; heat demand, renovation dates and free drilling area for each of the 16 other houses (proposed) [11][7].
- `businessPlan.nextSteps.stakeholders`: Owners already considering the loop (Ottakringer Straße 18, Veronikagasse 36) [11]; tenants; MA 20 on public land and grants [7][6].
- `businessPlan.nextSteps.partnerships`: A phase-2 contract with the contractor; ÖGUT or the area renewal office as moderator [11][8]; grant applications to MA 20 and UFI before any binding order [6][13].
- `businessPlan.nextSteps.pilots`: Phase 2: connect 4 houses to the existing loop, as planned for 2019-20 [15] (current status not public).
- `businessPlan.nextSteps.decisions`: Decision gate (proposed): build phase 2 only if (a) letters of intent cover ≥50% of the extra heat [13], (b) probe sites incl. any public land are secured [7], (c) a 30-year simulation shows a balanced store [6], and (d) tenant cost stays ≤ district heating [11].

### Quick-Check facts

| Input | Value | Source |
|---|---|---|
| Buildings (QCT-IN-01) | 2 (start cell); 18 properties in the block | [11] |
| Project area (QCT-IN-02) | not public (two plots with a shared courtyard) | – |
| Floor area | 2,000 m² GFA (1,100 + 900); ~1,770 m² useful area | [11], [9] |
| Building type / period (QCT-IN-04) | residential, until 1919 (Gründerzeit): 100% | [11] |
| Heating demand (QCT-IN-05 manual) | 157 MWh/a space heat + 50 MWh/a hot water = 207 MWh/a (design, after renovation); heat load 105 kW | [11] |
| Cooling demand | not quantified (moderate floor cooling in No. 11 only) | [11] |
| Sources (QCT-IN-06) | geothermal (probes); solar_thermal (PV-T, 2 × 54 m²); ambient_air (air-water exchanger); PV: yes | [11], [36] |
| Source potential (QCT-IN-07) | geothermal: 18 × 110 m = 1,980 m × 62.5 kWh/m·a (AnergieUrban specific yield for a regenerated store) ≈ 124 MWh/a, between TBL-4 "medium" (50 MWh/a) and "high" (150 MWh/a) | [36], [7], [39] |
| Network length (QCT-IN-08) | not public (courtyard loop, short) | – |
| Heat pumps | 1 × 110 kW | [11] |
| Year | implementation started August 2018; in operation by 2021 | [7], [36] |
| Operator | energy contractor (name not public) | [36] |
| Cost | €320,000 (2017 tender) / €350,000 (2021); grant 30% (~€95,000) | [11], [36] |

### References (R1)

[5] Wiener Wärmeplan 2040 · [6] MA 20 anergy grant 2024/25 · [7] AnergieUrban Stufe 1 · [8] WieNeu+ im Grätzl 20+2 · [9] socialhousing.wien Smart Block · [11] Smart Block II Energy final report · [13] UFI Erneuerbare Mikronetze · [15] AEE INTEC SEFIPA slide · [16] ÖGUT SEFIPA · [17] Kranzl et al. 2026 abstract · [18] Kranzl et al. 2026 slides · [36] futurezone 2021 · [39] Quick Check tables · [40] e7 ALG talk

---

## R2 · `kraftwerk-seebogen-aspern` · MIDDLING · real

**Summary (EN):** Five developers on plot H6 in Seestadt Aspern share 92 geothermal probes, an anergy loop, supermarket waste heat and rooftop PV.
**Summary (DE):** Fünf Bauträger am Bauplatz H6 der Seestadt Aspern teilen 92 Erdsonden, ein Anergienetz, Supermarkt-Abwärme und Dach-PV.
**Site name (DE):** Kraftwerk Seebogen, Quartier Am Seebogen (Bauplatz H6), Seestadt Aspern

**Why middling:** C1 is met: the technical facts are specific and official [1]. C2 is partial: the supermarket is named as a source, but no anchor customer or commitment is described. C3 fails: who owns and runs probes, loop and heat pumps is "not public". C4 is partial: the rows exist, but the splits are unknown. C5 is partial: only a rough drilling-cost check; tariffs, financing and subsidies are "not public". C6 is partial: validations are vague ("ask the operator"). C7 is partial: the deal-breaker is plausible, but its validation is a document nobody has seen. C8 fails: no decision gate. Every stated fact is true; the gaps are honest gaps.

### Site

- `site.name`: Kraftwerk Seebogen, quarter Am Seebogen (plot H6), aspern Seestadt [1]
- `site.location`: Plot H6 between the U2 line, Sonnenallee, Mela-Köhler-Straße and Eileen-Gray-Gasse, 1220 Vienna (Donaustadt) [1]
- `site.siteType`: New-build mixed residential and commercial block in an urban development area [1]
- `site.ownership`: Five developers share plot H6 and most of the energy system [1]; their names and tenure mix are not on the city page. The Vienna Business Agency's commercial hall on the same plot uses district heating instead [1].
- `site.units`: ~270 flats and ~250 workplaces; nearly 20,000 m² of new floor area [1][32]
- `site.currentSupply`:
  - Anergy loop with 2 probe fields, 92 boreholes × 150 m [1]
  - Heat pumps in each connected building [1]
  - Ambient air and supermarket waste heat [1]
  - 4 rooftop PV systems [1]
  - District heating (commercial hall only) [1]
- `site.stakeholders`:
  - Five developers on plot H6 [1]
  - Residents of ~270 flats [1]
  - Businesses with ~250 workplaces in production, crafts and services [1]
  - Supermarket (also a heat source) [1]
  - Wien 3420 aspern Development AG (area developer) [32]
- `site.partners`:
  - beyond carbon energy (built the plant) [32]
  - Owners of the 4 rooftop PV systems [1]

### Step 1 · Opportunity

- `businessPlan.opportunity.customerSegments`: Residents of about 270 flats and about 250 workplaces in production, crafts and services, all on one block shared by five developers [1].
- `businessPlan.opportunity.needs`: Space heating of about 1,600 MWh/a, plus hot water and summer cooling; the latter two are not quantified publicly [1].
- `businessPlan.opportunity.heatSources`: Two independent probe fields with 92 boreholes of 150 m used as a seasonal store; ambient air; waste heat from a supermarket and from other commercial and residential spaces [1].
- `businessPlan.opportunity.painPoint`: Without a shared system, five developers on one plot would plan five separate systems, and the supermarket's waste heat would go to the air (our reasoning, not from a source).
- `businessPlan.opportunity.alternatives`: District heating, which the commercial hall on the same plot uses [1], or separate heat pumps per building (not assessed).
- `businessPlan.opportunity.advantage`: The loop runs at 4-16 °C with hardly any losses, can heat and cool at the same time and saves about 440 t CO2/a [1]. The aspern Seestadt blog states that it costs residents no more than conventional systems [32].

### Step 2 · Business Model Canvas

- `businessPlan.canvas.keyPartners`: The five developers, beyond carbon energy as plant builder [32], the supermarket as heat supplier and the owners of four rooftop PV systems [1].
- `businessPlan.canvas.keyActivities`: Run two probe fields and the loop, balance heating and cooling, operate the building heat pumps and bill users. Who does which part is not public.
- `businessPlan.canvas.keyResources`: 92 boreholes × 150 m ≈ 13.8 km of probes, the anergy loop, heat pumps in each building and 4 rooftop PV systems [1].
- `businessPlan.canvas.valueProposition`: Fossil-free heating, hot water and cooling for a mixed block, at no higher cost to residents than conventional systems [1][32].
- `businessPlan.canvas.customerRelationships`: Long-term supply to the developers and their residents; the contract form is not public.
- `businessPlan.canvas.channels`: The developers' sales and letting; aspern Seestadt communication [32].
- `businessPlan.canvas.customerSegments`: Housing developers and residents, commercial users, and the supermarket as both customer and source [1].
- `businessPlan.canvas.costStructure`: Drilling, loop, building heat pumps, electricity and maintenance; amounts are not public. Rough check: 13,800 m of probes at €50-65/m ≈ €0.7-0.9 m for drilling alone [7][1].
- `businessPlan.canvas.revenueStreams`: Heat and cooling fees from users; structure and prices are not public.
- `businessPlan.canvas.operatorResponsibilities`: beyond carbon energy built the plant [32]. Public sources do not say who owns the probes, loop and heat pumps or who operates them.
- `businessPlan.allocation[0]`
  - `stakeholder`: Five developers
  - `investment`: Building heat pumps and a share of the shared plant (split not public).
  - `risk`: They depend on one shared system and on each other.
  - `benefit`: No separate heating plants and a fossil-free selling point [1].
- `businessPlan.allocation[1]`
  - `stakeholder`: Plant builder / operator
  - `investment`: Probe fields and loop (amount not public).
  - `risk`: Ground balance and demand over decades.
  - `benefit`: Long-term supply revenue (assumed).
- `businessPlan.allocation[2]`
  - `stakeholder`: Supermarket
  - `investment`: The heat-recovery connection (assumed).
  - `risk`: Low.
  - `benefit`: Its waste heat is used instead of dumped [1].

### Step 3 · Reality check

- `businessPlan.assumptions.connectionRate`: All buildings on H6 except the district-heated commercial hall are connected [1].
- `businessPlan.assumptions.tariffs`: Not public; the aspern Seestadt blog states there is no extra cost for residents [32]. For screening, the Quick Check defaults could be used (€0.12/kWh heat, €0.08/kWh cooling) [39].
- `businessPlan.assumptions.capex`: Not public; drilling alone ≈ €0.7-0.9 m (13,800 m at €50-65/m, 2020 survey prices) [7][1].
- `businessPlan.assumptions.financing`: Not public.
- `businessPlan.assumptions.subsidies`: Not public. The city's 2024/25 anergy grant would not apply to a new-build-only network [6].
- `businessPlan.criticalAssumptions[0]`
  - `statement`: The ground store stays balanced with ~1,600 MWh/a of heating, cooling and air regeneration [1].
  - `validation`: Ask the operator for probe temperatures since 2022.
- `businessPlan.criticalAssumptions[1]`
  - `statement`: The supermarket keeps operating and delivering waste heat.
  - `validation`: Check the supermarket's lease term.
- `businessPlan.risks[0]` · **deal-breaker**
  - `title`: Five developers disagree
  - `description`: Changes, cost splits or extensions need all five owners; the governance is not public.
  - `dealBreaker`: true
  - `validation`: Review the shared-system agreement (not yet seen).
- `businessPlan.risks[1]`
  - `title`: Supermarket leaves
  - `description`: One waste-heat source would be lost [1].
  - `dealBreaker`: false
  - `validation`: The air heat exchanger serves as backup [1].

### Step 4 · Implementation

- `businessPlan.refinements.feedback`: No expert feedback is recorded yet; an internal review found that the cost split and the tariffs are missing.
- `businessPlan.refinements.changes`: Add a cost key (source by connected load, pipes by users) [40] before proposing the model for other plots.
- `businessPlan.scalability.geographical`: Other development plots shared by several developers, in Seestadt and elsewhere in Vienna [1].
- `businessPlan.scalability.economic`: Depends on drilling costs and on extra sources such as waste heat [17].
- `businessPlan.scalability.organisational`: A plot-level shared energy system could become a standard for multi-developer plots; details still to be worked out.
- `businessPlan.nextSteps.data`: Operating data since 2022: heat, cooling, electricity and probe temperatures.
- `businessPlan.nextSteps.stakeholders`: The five developers, the operator, the supermarket and aspern Development AG.
- `businessPlan.nextSteps.partnerships`: Talk to the developers of the next Seestadt plots.
- `businessPlan.nextSteps.pilots`: Not defined.
- `businessPlan.nextSteps.decisions`: Whether to replicate; no gate or criteria are defined yet.

### Quick-Check facts

| Input | Value | Source |
|---|---|---|
| Buildings (QCT-IN-01) | not public (five developers' buildings plus a district-heated commercial hall on H6) | [1] |
| Project area (QCT-IN-02) | not public (plot H6) | – |
| Floor area | "nearly 20,000 m²" of new residential and commercial space; an interview with beyond carbon energy mentions ~23,000 m² of usable area for its Seestadt project (not clearly H6) | [32], [33] |
| Building types (QCT-IN-04) | residential 2011-today; category_a (supermarket, retail, offices); industry (production, crafts). Shares not public | [1] |
| Heating demand (QCT-IN-05) | ~1,600 MWh/a space heat (hot water extra, not public) | [1] |
| Cooling demand | not public | – |
| Sources (QCT-IN-06) | geothermal (92 × 150 m in 2 fields); ambient_air; waste_heat (supermarket); PV: yes (4 roofs) | [1] |
| Source potential (QCT-IN-07) | geothermal: 13,800 m × 62.5 kWh/m·a ≈ 860 MWh/a (AnergieUrban yield), far above TBL-4 "high" (150 MWh/a): use a capacity override (D-10) | [1], [7], [39] |
| Network temperature | 4 °C (spring) to 16 °C (autumn) | [1] |
| Network length (QCT-IN-08) | not public | – |
| Heat pumps | one per connected building; number not public | [1] |
| Year | in operation since 2022 | [1], [32] |
| Operator | not stated; plant built by beyond carbon energy | [32] |
| CO2 | ~440 t/a saved | [1] |

### References (R2)

[1] Stadt Wien, Kraftwerk Seebogen · [6] MA 20 anergy grant 2024/25 · [7] AnergieUrban Stufe 1 · [17] Kranzl et al. 2026 · [32] aspern Seestadt blog 2022 · [33] Erste Sparkasse interview with BCE 2022 · [39] Quick Check tables · [40] e7 ALG talk

---

## R3 · `village-im-dritten` · WEAK · real

**Summary (EN):** A new 11.5 ha quarter in Landstraße with about 2,000 flats, where ARE and Wien Energie drill 500 geothermal probes for an anergy network.
**Summary (DE):** Ein neues 11,5-ha-Quartier in der Landstraße mit rund 2.000 Wohnungen, in dem ARE und Wien Energie 500 Erdwärmesonden für ein Anergienetz bohren.
**Site name (DE):** Village im Dritten (Aspanggründe), Wien-Landstraße

**Why weak:** This is an honest early-stage write-up: every stated fact is true and sourced, but it stays vague. C1 is partial: the site numbers exist, but needs are not quantified, although Wien Energie published 8.6 MW of heat and 1 MW of cooling demand [31]. C2 fails: no anchor customer. C3 fails: ownership and operation are "not yet clear". C4 fails: allocation rows are generic. C5 fails: no numbers for tariffs, capex or financing. C6 fails: validations are "later" or "to be checked". C7 fails: the deal-breaker flag sits on a generic "construction delays" risk; the real candidates (who owns the probe field and loop, and whether 22 plot developers accept one cost key) are not identified. C8 fails: no refinements and no gate. The full public facts are listed under Quick-Check facts, so the example can later be upgraded.

### Site

- `site.name`: Village im Dritten (Aspanggründe) [30]
- `site.location`: Landstraße, 1030 Vienna, at Landstraßer Gürtel / Landstraßer Hauptstraße [35]
- `site.siteType`: New urban quarter on a large development site [30]
- `site.ownership`: Developed by ARE Austrian Real Estate with the City of Vienna, wohnfonds_wien and UBM Development [35]. Housing will be rented and owned, privately financed and subsidised [30].
- `site.units`: About 2,000 flats plus offices, shops and schools [35]
- `site.currentSupply`:
  - Geothermal probes with heat pumps (under construction) [34]
  - District heating [31]
  - Photovoltaics [34]
- `site.stakeholders`:
  - ARE Austrian Real Estate [30]
  - Wien Energie [34]
  - Future residents [30]
  - City of Vienna [35]
- `site.partners`:
  - Wien Energie [34]
  - UBM Development [35]
  - Ampeers Energy (software) [34]

### Step 1 · Opportunity

- `businessPlan.opportunity.customerSegments`: Future residents and businesses of the new quarter [30].
- `businessPlan.opportunity.needs`: Heating and cooling for a big new quarter.
- `businessPlan.opportunity.heatSources`: Geothermal probes and solar power [34].
- `businessPlan.opportunity.painPoint`: Vienna wants to move away from gas [34].
- `businessPlan.opportunity.alternatives`: Normal heating systems.
- `businessPlan.opportunity.advantage`: Anergy networks are innovative and climate-friendly.

### Step 2 · Business Model Canvas

- `businessPlan.canvas.keyPartners`: ARE and Wien Energie [34].
- `businessPlan.canvas.keyActivities`: Build the quarter and the energy system.
- `businessPlan.canvas.keyResources`: 500 geothermal probes [35].
- `businessPlan.canvas.valueProposition`: Green heating and cooling for the quarter [34].
- `businessPlan.canvas.customerRelationships`: To be defined.
- `businessPlan.canvas.channels`: Marketing of the flats.
- `businessPlan.canvas.customerSegments`: Residents.
- `businessPlan.canvas.costStructure`: Drilling and heat pumps; costs not known.
- `businessPlan.canvas.revenueStreams`: Heat sales.
- `businessPlan.canvas.operatorResponsibilities`: Not yet clear who owns and operates which part.
- `businessPlan.allocation[0]`
  - `stakeholder`: ARE
  - `investment`: The buildings.
  - `risk`: Delays.
  - `benefit`: An attractive quarter.
- `businessPlan.allocation[1]`
  - `stakeholder`: Wien Energie
  - `investment`: Its role as energy partner; investment share not public [31][34].
  - `risk`: Costs.
  - `benefit`: Customers.
- `businessPlan.allocation[2]`
  - `stakeholder`: Residents
  - `investment`: Rent or purchase price.
  - `risk`: Not assessed.
  - `benefit`: Cooling in summer [34].

### Step 3 · Reality check

- `businessPlan.assumptions.connectionRate`: All buildings.
- `businessPlan.assumptions.tariffs`: Market prices.
- `businessPlan.assumptions.capex`: High.
- `businessPlan.assumptions.financing`: Developer and partners.
- `businessPlan.assumptions.subsidies`: Maybe available.
- `businessPlan.criticalAssumptions[0]`
  - `statement`: There is enough heat in the ground.
  - `validation`: Later.
- `businessPlan.criticalAssumptions[1]`
  - `statement`: Residents like the system.
  - `validation`: To be checked.
- `businessPlan.risks[0]` · deal-breaker (misplaced, see "Why weak")
  - `title`: Construction delays
  - `description`: A large project could be delayed.
  - `dealBreaker`: true
  - `validation`: Project management.
- `businessPlan.risks[1]`
  - `title`: Costs
  - `description`: Costs could be higher than expected.
  - `dealBreaker`: false
  - `validation`: Monitor.

### Step 4 · Implementation

- `businessPlan.refinements.feedback`: None yet.
- `businessPlan.refinements.changes`: None.
- `businessPlan.scalability.geographical`: Other new quarters.
- `businessPlan.scalability.economic`: If costs are acceptable.
- `businessPlan.scalability.organisational`: Same partners.
- `businessPlan.nextSteps.data`: Collect more data.
- `businessPlan.nextSteps.stakeholders`: Talk to the partners.
- `businessPlan.nextSteps.partnerships`: Continue with Wien Energie.
- `businessPlan.nextSteps.pilots`: The quarter itself.
- `businessPlan.nextSteps.decisions`: To be decided.

### Quick-Check facts (full public data, independent of the tier)

| Input | Value | Source |
|---|---|---|
| Project area (QCT-IN-02) | ~11.5 ha (ARE folder); "11 ha" in news | [30], [34], [35] |
| Plots / buildings (QCT-IN-01) | 22 building plots; number of buildings not public | [30], [31] |
| Floor area | ~250,000 m² GFA: ~190,000 m² housing, ~60,000 m² non-residential incl. ~20,000 m² schools | [30], [31] |
| Flats / people | ~1,900 flats for ~4,000 people (ARE 2021); ~2,000 flats (Wien Energie 2023, news) | [30], [31], [35] |
| Building types (QCT-IN-04) | by GFA: residential 2011-today ~76%; category_a (offices, retail, schools) ~24% | derived from [30] |
| Heating / cooling demand | 8.6 MW heat and 1 MW cooling demand (capacities, not MWh/a); annual MWh not public | [31] |
| Sources (QCT-IN-06) | geothermal: 500 probes × 150 m (= 75 km); PV ~1 MW peak in total; district heating covers the rest of the heat incl. hot water | [34], [35], [31] |
| Supply temperatures | heat pumps lift probe water of 5-19 °C to max. 37 °C for floor heating; free cooling through the floors | [34] |
| Network length (QCT-IN-08) | not public | – |
| Heat pumps | number not public | – |
| Year | planned completion 2025 (ARE 2021), 2026 (Wien Energie 2023), 2027 (news 2023); 10 of 22 plots under construction in May 2024 | [30], [31], [34], [35] |
| Operator | not public; ARE implements the project with Wien Energie | [34] |
| Other | energy community across plots planned; operations software by Ampeers Energy | [31], [34] |

### References (R3)

[30] ARE project folder 2021 · [31] Wien Energie slides 2023 · [34] futurezone 2023 · [35] wien.ORF.at 2024

---

## F1 · `hospital-anchor-quarter` · STRONG · fictional

**Summary (EN):** A 450-bed hospital with 24/7 heating and cooling anchors a groundwater anergy loop for 600 neighbouring flats and a school (illustrative).
**Summary (DE):** Ein Spital mit 450 Betten und ganzjährigem Wärme- und Kältebedarf trägt als Ankerkunde ein Grundwasser-Anergienetz für 600 Nachbarwohnungen und eine Schule (illustrativ).
**Site name (DE):** Spitalsquartier mit Ankerkunde, Nordosten Wiens (illustrativ)

**Why strong:** C1 every demand figure is derived from a cited benchmark: hospital heat per bed [20], cooling from metered chiller electricity [20], and housing from the Quick Check tables [39]. C2 the hospital is the anchor, with a take-or-pay contract and an LOI threshold [13]. C3 explicit boundary: the ESCO owns wells, loop and heat pumps, and the hospital keeps district heating as backup. C4 the cost key follows the e7 tip [40]. C5 capex, revenue and annual costs are computed with Quick Check defaults and an outside reference [3][37][39]. C6 three assumptions, each with a test. C7 one real deal-breaker: groundwater yield or permit. C8 two gates with dates and criteria. No real hospital or housing company is modelled; the real Klinik Floridsdorf project [3] is used only as an evidence point.

**Derivations (all illustrative unless sourced):**

- Hospital heat: 450 beds × 29 MWh/bed·a (German average [20]) ≈ 13.0 GWh/a. Cross-checks: Klinik Floridsdorf ≈ 21 GWh/a for ~800 beds = 26 MWh/bed [37][3]; an NRW hospital with 660 beds used 22.0 GWh/a = 33 MWh/bed [21].
- Hospital cooling: Klinikum Magdeburg (779 beds) used ~560 MWh/a of electricity for compression chillers [20]. With an assumed EER of 3 (illustrative), that is ~1.7 GWh/a of cooling, or 2.2 MWh/bed, so 450 beds ≈ 1.0 GWh/a.
- Loop-served heat: 50% of the hospital's heat (6.5 GWh/a, the lower end of Klinik Floridsdorf's 50-70% [3]) + housing 42,000 m² × 109.3 kWh/m²a = 4.6 GWh/a + school 6,000 m² × 104.3 kWh/m²a = 0.63 GWh/a [39] → **~11.7 GWh/a**.
- Line density: 11.7 GWh/a ÷ 2,500 m trench ≈ **4.7 MWh/m**, against the e7 rule of thumb of ~1 MWh/m [40].
- Cooling sold: hospital 1.0 GWh/a + housing 42,000 m² × 11.0 kWh/m²a = 0.46 GWh/a [39] → ~1.46 GWh/a.
- Hospital floor area, if needed: ~150 m² GFA per bed, from the NRW case (100,000 m² for 660 beds) [21] → ~68,000 m².

### Site

- `site.name`: Hospital anchor quarter, north-east Vienna (illustrative)
- `site.location`: Vienna, Floridsdorf or Donaustadt, areas where groundwater use is realistic [18] (illustrative site; no real hospital modelled)
- `site.siteType`: Urban edge: hospital campus next to 1960s-80s housing and a school (illustrative)
- `site.ownership`: A public hospital campus (3 buildings), 5 rental blocks of a limited-profit housing association (WGG), 1 condominium block (WEG) and a municipal school (illustrative). Each owner decides separately; the WEG block needs an owners' vote (illustrative).
- `site.units`: 10 buildings: 3 hospital (450 beds), 6 housing (600 flats), 1 school (illustrative)
- `site.currentSupply`:
  - District heating for the hospital, incl. steam (illustrative)
  - Electric chillers with dry coolers at the hospital (illustrative)
  - Gas boilers in the housing blocks and the school (illustrative)
- `site.stakeholders`:
  - Hospital operator and its technical department (illustrative)
  - Limited-profit housing association (illustrative)
  - Condominium owners (WEG) (illustrative)
  - Municipality as school owner and landowner (illustrative)
  - Water authority (groundwater permit) (illustrative)
- `site.partners`:
  - Energy-services company (ESCO) running a project company (SPV) (illustrative)
  - Hydrogeology office (illustrative)
  - District-heating supplier as backup supplier (illustrative)

### Step 1 · Opportunity

- `businessPlan.opportunity.customerSegments`: The anchor is a 450-bed hospital with 24/7 heat, hot water and cooling (illustrative). Next door are 600 rental and condominium flats and a school (illustrative).
- `businessPlan.opportunity.needs`: Hospital heat ~13 GWh/a (450 beds × 29 MWh/bed, the German average [20]; cross-check: 21 GWh/a for ~800 beds at Klinik Floridsdorf [37][3]) and cooling ~1 GWh/a (from Magdeburg chiller data with an illustrative EER of 3) [20]. Housing ~4.6 GWh/a and school ~0.6 GWh/a (Quick Check Table 1, 1961-1990) [39].
- `businessPlan.opportunity.heatSources`: Groundwater from one or two well pairs, ≥50 m apart as in the TU Wien criteria [18]; heat rejected by the hospital's 24/7 cooling (operating rooms, IT, labs), fed into the loop instead of the air (illustrative); rooftop PV for pump power (illustrative).
- `businessPlan.opportunity.painPoint`: The hospital pays twice: for district heat in winter and for chillers that dump heat into the air all year (illustrative). The housing next door burns gas and has no summer cooling, and no single owner can justify a groundwater source alone (illustrative).
- `businessPlan.opportunity.alternatives`: The hospital could stay on district heating plus chillers; the housing could install air or ground heat pumps per block, or connect to district heating where it is offered (illustrative). Klinik Floridsdorf shows that a bilateral waste-heat deal can cover 50-70% of a hospital's heat [3].
- `businessPlan.opportunity.advantage`: The hospital's cooling waste heat and steady demand give the loop a 24/7 base load. At ~11.7 GWh/a on 2.5 km the line density is ~4.7 MWh/m, far above the ~1 MWh/m threshold [40] (illustrative). Groundwater concepts are the anergy option closest to cost parity in Vienna [17].

### Step 2 · Business Model Canvas

- `businessPlan.canvas.keyPartners`: The hospital operator (anchor), the housing association and the WEG, the municipality (school, land for wells), an ESCO as operator, the water authority, and the district-heating supplier as backup (illustrative).
- `businessPlan.canvas.keyActivities`: Get permits for and drill the wells, build a 2.5 km ambient loop, install a ~1.8 MW high-temperature heat pump at the hospital and heat pumps in each block, then operate, meter and bill and manage the groundwater balance (illustrative).
- `businessPlan.canvas.keyResources`: Groundwater rights, the hospital plant room, a trench corridor on hospital and public land, a long-term anchor contract and the ESCO's balance sheet (illustrative).
- `businessPlan.canvas.valueProposition`: The hospital gets cheaper cooling, ~50% of its heat from renewable sources and a hedge against heat prices, with district heating kept as backup (illustrative; compare Klinik Floridsdorf [3]). Residents get a gas exit plus summer cooling at a regulated price (illustrative).
- `businessPlan.canvas.customerRelationships`: A 20-year take-or-pay heat and cooling contract with the hospital and 15-year supply contracts with the housing owners. Prices are indexed to electricity and CPI, as UFI requires indexed heat prices [13] (illustrative terms).
- `businessPlan.canvas.channels`: The hospital board and technical department, the housing association board, the WEG owners' assembly, the district council and tenant information events (illustrative).
- `businessPlan.canvas.customerSegments`: A public hospital (anchor, ~56% of loop heat), limited-profit rental housing, a condominium and a municipal school (illustrative).
- `businessPlan.canvas.costStructure`: Network 2.5 km × €500/m = €1.25 m [39]; groundwater source at the Quick Check default of €1.00 per kWh/a = €11.7 m (an upper bound) [39]; hospital heat-pump plant ~€2.1 m, scaled from €3.5 m for 3 MW at Klinik Floridsdorf [37]; building heat pumps €0.15 m at the default [39]. Electricity ~€0.47 m/a; O&M 2% of capex [39] (illustrative).
- `businessPlan.canvas.revenueStreams`: Heat 11.7 GWh/a × €0.12/kWh = €1.40 m; base price €6/m² on 48,000 m² of housing and school = €0.29 m; cooling 1.46 GWh/a × €0.08/kWh = €0.12 m; connection fees of €1,000 per building (Quick Check defaults) [39]. Total ~€1.8 m/a (illustrative).
- `businessPlan.canvas.operatorResponsibilities`: System boundary: the ESCO's project company owns wells, loop, the hospital heat-pump plant and the building heat pumps up to each building's heat meter; owners keep their internal distribution. The hospital keeps its district-heating connection for steam and peaks, so the ESCO is never the only supplier for critical care (illustrative).
- `businessPlan.allocation[0]`
  - `stakeholder`: Hospital operator (anchor, illustrative)
  - `investment`: Plant-room space, hydraulic changes and a 20-year take-or-pay contract for ~6.5 GWh/a of heat and all its cooling (illustrative).
  - `risk`: Supply security for critical care, reduced by keeping district heating as backup; at Klinik Floridsdorf, heat pumps cover 50-70% [3].
  - `benefit`: Lower cooling cost, price stability and CO2 savings; Klinik Floridsdorf saves up to 4,000 t CO2/a at a larger scale [3] (illustrative).
- `businessPlan.allocation[1]`
  - `stakeholder`: ESCO / project company (illustrative)
  - `investment`: ~€15 m upper bound before grants (wells, loop, heat pumps), financed with 30% equity and 70% loans at 3% (illustrative; default interest rate [39]).
  - `risk`: Groundwater yield, connection rate, electricity price and anchor default. Cost key: source cost by connected load, pipe cost by the users of each branch [40].
  - `benefit`: ~€1.8 m/a revenue over 20 years (Quick Check defaults [39]) and a first-mover position for further anchors (illustrative).
- `businessPlan.allocation[2]`
  - `stakeholder`: Housing owners: association and WEG (illustrative)
  - `investment`: A €1,000 connection fee per building [39], plus radiator checks and hydraulic balancing (illustrative).
  - `risk`: The WEG vote may fail or come late; tenant cost rules limit what can be passed on (illustrative).
  - `benefit`: A gas exit without their own heat source, summer cooling and a stable regulated price (illustrative).

### Step 3 · Reality check

- `businessPlan.assumptions.connectionRate`: The hospital connects at 100% (anchor contract), the association with 5 of 5 blocks, and the WEG block in year 3. The base case is 90% of loop heat, with 60%, 80% and 100% as sensitivities (illustrative). Every building that stays out raises costs for the rest [40].
- `businessPlan.assumptions.tariffs`: Quick Check defaults: heat €6/m² + €0.12/kWh, cooling €3/m² + €0.08/kWh [39]; the hospital pays a capacity price instead of the m² base price (illustrative). Test: the price must stay ≤ the hospital's current district-heating plus chiller cost per MWh (to be measured).
- `businessPlan.assumptions.capex`: €15.2 m upper bound: loop €1.25 m; groundwater source €11.7 m at the tool default, to be replaced by a well-pair quote; hospital heat pumps €2.1 m, scaled from Klinik Floridsdorf [37]; building heat pumps €0.15 m [39] (illustrative).
- `businessPlan.assumptions.financing`: A project company with 30% ESCO equity and 70% long-term loans at 3% over 20 years: annuity factor 0.067 → ~€1.0 m/a; O&M 2% → €0.3 m/a; electricity €0.47 m/a [39]. At the upper-bound capex, costs ≈ revenues (€1.8 m/a), so grants or a cheaper source decide the case (illustrative).
- `businessPlan.assumptions.subsidies`: The base case without grants breaks even; a 30% capex grant cuts annual costs by ~€0.3 m (illustrative). The UFI micro-network module (up to 40%) only covers 2-9 external customers or <800 MWh/a [13], so the module and rate for a larger network must be confirmed with KPC. The city's anergy grant paid 30%, max €200,000 (2024/25 rules) [6].
- `businessPlan.criticalAssumptions[0]`
  - `statement`: The hospital signs a 20-year contract for ~6.5 GWh/a of heat (50% of its demand) and all its cooling (illustrative).
  - `validation`: Heads of terms approved by the hospital board before the feasibility study. Together with housing letters of intent, they must cover ≥50% of planned heat sales, the UFI rule for networks [13].
- `businessPlan.criticalAssumptions[1]`
  - `statement`: Groundwater can deliver ~8-9 GWh/a of source energy with well pairs ≥50 m apart (illustrative).
  - `validation`: A desk study with the city's groundwater data, then one test well pair with a pumping test. Kranzl et al. see groundwater use as realistic only in areas with enough groundwater, e.g. Floridsdorf and Donaustadt [18].
- `businessPlan.criticalAssumptions[2]`
  - `statement`: Heat pumps can supply the hospital's heating circuits at ≤82 °C for ~50% of its demand.
  - `validation`: Log supply and return temperatures of every hospital circuit for one heating season. Klinik Floridsdorf reaches 82 °C with 3 MW of heat pumps and covers 50-70% of its heat [3].
- `businessPlan.risks[0]` · **deal-breaker**
  - `title`: Groundwater yield or permit fails
  - `description`: Without a water-rights permit and enough yield, the loop loses its main source. Probes cannot replace ~8 GWh/a on this site, and air would lower efficiency (illustrative).
  - `dealBreaker`: true
  - `validation`: A test well pair and a pre-consultation with the water authority before Gate 1; no design money is spent until both are positive (illustrative).
- `businessPlan.risks[1]`
  - `title`: Housing connects late or not at all
  - `description`: WEG votes and tenancy rules slow connections, and every building that stays out raises costs for the rest [40].
  - `dealBreaker`: false
  - `validation`: Phase 1 covers only the hospital and association blocks; model 60/80/100% connection in the Quick Check; offer the WEG a price fixed for 5 years (illustrative).
- `businessPlan.risks[2]`
  - `title`: Electricity price and low COP at 82 °C
  - `description`: If the hospital heat pumps run below the default COP of 5 [39], electricity costs rise; a 50% higher power price alone adds ~€0.24 m/a (illustrative).
  - `dealBreaker`: false
  - `validation`: An indexed heat price, as UFI requires [13]; a COP guarantee in the heat-pump tender; PV on hospital roofs (illustrative).

### Step 4 · Implementation

- `businessPlan.refinements.feedback`: Illustrative expert feedback: keep district heating for steam and peaks; do not size the loop on the hospital's full heat; start where the anchor and the nearest housing sit.
- `businessPlan.refinements.changes`: The scope is cut to ~50% of hospital heat via heat pumps, the lower end of what Klinik Floridsdorf achieves [3]. Phase 1 is the hospital plus 3 association blocks on 1.2 km; phase 2 adds the rest (illustrative).
- `businessPlan.scalability.geographical`: Hospitals, care homes and campuses next to housing, in Vienna's groundwater areas (e.g. Floridsdorf, Donaustadt) [18] and in "Lokale Wärme gemeinsam" zones [5].
- `businessPlan.scalability.economic`: The model works where line density is well above ~1 MWh/m [40] and a 24/7 cooling user exists; probe-only sites need more optimisation to pay off [17] (illustrative).
- `businessPlan.scalability.organisational`: An ESCO project company with one public anchor contract and standard connection offers for neighbours can be repeated for other public anchors (illustrative).
- `businessPlan.nextSteps.data`: Hospital: 15-minute heat and cooling loads and circuit temperatures for 12 months. Housing: 3 years of gas bills per block. Groundwater: city data plus a test well pair (illustrative).
- `businessPlan.nextSteps.stakeholders`: The hospital board and technical director, the housing association board, the WEG assembly, the school owner, the water authority and the district council (illustrative).
- `businessPlan.nextSteps.partnerships`: Tender the ESCO role and pre-check grants with KPC (UFI) and the city's energy planning department [13][6] (illustrative).
- `businessPlan.nextSteps.pilots`: Phase 1: the hospital plus 3 association blocks, a 1.2 km loop, one well pair and ~8.8 GWh/a (illustrative).
- `businessPlan.nextSteps.decisions`: Gate 1 (month 6): test well and permit outlook positive, hospital heads of terms signed, LOIs ≥50% of phase-1 heat [13] → fund detailed design. Gate 2 (month 12): grant decision taken and the Quick Check reality check positive at 80% connection → investment decision (illustrative).

### Quick-Check facts (illustrative inputs)

| Input | Value | Basis |
|---|---|---|
| Buildings (QCT-IN-01) | 10 | illustrative |
| Project area (QCT-IN-02) | 120,000 m² (12 ha) | illustrative |
| Shares (QCT-IN-04, % of buildings) | residential 1961-1990: 60; category_c 1991-2010: 30; category_a 1961-1990: 10 | illustrative; types per [39] |
| Manual demand (QCT-IN-05) | heating 11,700 MWh/a (loop-served); cooling 1,460 MWh/a | derived above from [20], [39], [3] |
| Why manual | Table 3 default floor areas (e.g. 866.9 m² per category C building) would understate a hospital by far | [39] |
| Sources (QCT-IN-06/07) | ground_water: high, with a capacity override (~8-9 GWh/a source energy, D-10); waste_heat (hospital chillers): medium; PV: yes | illustrative; [18] |
| Network length (QCT-IN-08) | 2,500 m | illustrative |
| Line density | ~4.7 MWh/m | derived |
| Heat pumps | 1 high-temperature plant ~1.8 MW at the hospital + 7 building heat pumps | illustrative; scale from [3] |
| Year / operator | design 2027, operation 2029; ESCO project company | illustrative |

### References (F1)

[3] Stadt Wien, Klinik Floridsdorf · [5] Wiener Wärmeplan 2040 · [6] MA 20 anergy grant 2024/25 · [13] UFI Erneuerbare Mikronetze · [17] Kranzl et al. 2026 abstract · [18] Kranzl et al. 2026 slides · [20] LENA hospital guide 2020 · [21] NRW hospital brochure 2003 · [27] Bawaneh et al. 2019 (background: hospitals use ~2.6× the energy per m² of other commercial buildings in the US) · [37] ZFK 2024 · [39] Quick Check tables · [40] e7 ALG talk

---

## F2 · `pool-anchor-campus` · MIDDLING · fictional

**Summary (EN):** A combined indoor and outdoor pool takes summer waste heat from a supermarket and an office, and anchors a low-temperature loop for a school and 250 flats (illustrative).
**Summary (DE):** Ein Hallen- und Freibad nimmt im Sommer Abwärme von Supermarkt und Büro auf und trägt als Ankerkunde ein Niedertemperaturnetz für eine Schule und 250 Wohnungen (illustrativ).
**Site name (DE):** Hallen- und Freibad als Ankerkunde am Wiener Stadtrand (illustrativ)

**Why middling:** C1 is met: demand is derived from a federal sports-institute benchmark [22] and the Quick Check tables [39]. C2 is partial: the pool is the anchor, but its owner has not committed. C3 is partial: two operator options remain open. C4 is met: three allocation rows with clear stakes. C5 is partial: loop capex and default tariffs are given, but the source cost, a comparison with today's bill and grant eligibility are missing. C6 is partial: two of three assumptions have concrete tests, and the third has none. C7 is partial: a sensible deal-breaker, but a vague validation ("date not set"). C8 is partial: next steps exist, but the decision has no criteria or date.

**Derivations (illustrative unless sourced):** indoor pool water area 750 m² × 3-7 MWh/m²a (BISp) [22] = 2.25-5.25 GWh/a, taking the low end, **2.25 GWh/a**, because efficient pools recover heat [26]. Outdoor pool water area 1,500 m² × 0.3-0.7 MWh/m²a [22] = 0.45-1.05 GWh per season, taking the middle, **0.75 GWh/a**. School 5,000 m² × 104.3 kWh/m²a = 0.52 GWh/a; flats 17,500 m² × 92.5 kWh/m²a = 1.62 GWh/a [39]. Total ≈ **5.1 GWh/a**; on a 1.6 km trench ≈ 3.2 MWh/m.

### Site

- `site.name`: Indoor-outdoor pool quarter, Vienna outskirts (illustrative)
- `site.location`: Outer district of Vienna in a groundwater area (illustrative; no real pool modelled)
- `site.siteType`: Suburban mixed area: public pool, school, supermarket, office and housing (illustrative)
- `site.ownership`: A municipal pool and school (public), a supermarket and an office building (private commercial), and 250 flats of a limited-profit housing association (illustrative).
- `site.units`: 6 buildings: pool, school, supermarket, office, 2 housing blocks with 250 flats (illustrative)
- `site.currentSupply`:
  - District heating for pool and school (illustrative)
  - Gas boilers in housing and office (illustrative)
  - Air-cooled chillers and refrigeration in supermarket and office (illustrative)
- `site.stakeholders`:
  - Municipality as owner of pool and school (illustrative)
  - Pool operator (illustrative)
  - Limited-profit housing association (illustrative)
  - Supermarket and office owners (illustrative)
  - Pool visitors, pupils and residents (illustrative)
- `site.partners`:
  - Energy contractor or utility, not yet chosen (illustrative)
  - Hydrogeology office (illustrative)

### Step 1 · Opportunity

- `businessPlan.opportunity.customerSegments`: The pool is the anchor: indoor all year, outdoor from May to September. Other customers are a school, 250 flats, an office and a supermarket (illustrative).
- `businessPlan.opportunity.needs`: Indoor pool with 750 m² of water: 2.25 GWh/a at the low end of 3-7 MWh/m²a [22]. Outdoor pool with 1,500 m² of water: ~0.75 GWh per season (0.3-0.7 MWh/m²a) [22]. School ~0.52 GWh/a and flats ~1.62 GWh/a (Quick Check Table 1) [39]. Office and supermarket need cooling in summer (illustrative).
- `businessPlan.opportunity.heatSources`: Groundwater, as at Hallenbad Floridsdorf, which now runs on a groundwater heat pump [38][4]; waste heat from supermarket refrigeration and office cooling, as a supermarket feeds Kraftwerk Seebogen [1]; ambient air as backup (illustrative).
- `businessPlan.opportunity.painPoint`: Swimming facilities have particularly high energy use [26][22]. The outdoor pool needs heat in summer, exactly when the supermarket and office reject heat into the air (illustrative).
- `businessPlan.opportunity.alternatives`: Stay on district heating; install a pool-only groundwater heat pump, as Hallenbad Floridsdorf did [4][38]; keep separate air chillers for office and supermarket (illustrative).
- `businessPlan.opportunity.advantage`: A shared loop moves summer waste heat into the outdoor pool instead of the air; in a field test, heat from one air conditioner cut a pool's heating by 29% [23]. The pool's steady low-temperature demand suits heat pumps (illustrative).

### Step 2 · Business Model Canvas

- `businessPlan.canvas.keyPartners`: The municipality (pool, school), the housing association, the supermarket, the office owner, and an energy contractor still to be chosen (illustrative).
- `businessPlan.canvas.keyActivities`: Drill and get a permit for a well pair, build a ~1.6 km loop, install heat pumps in pool, school and housing, recover supermarket and office heat, then operate and bill (illustrative).
- `businessPlan.canvas.keyResources`: Groundwater rights, the pool plant room, roofs for PV, and the outdoor pool as a summer heat sink (illustrative).
- `businessPlan.canvas.valueProposition`: Lower and more stable heat costs for the pool, cheaper cooling for the supermarket and office, and fossil-free heat for the school and flats (illustrative).
- `businessPlan.canvas.customerRelationships`: 20-year supply contracts with the municipality and the housing association; heat-recovery agreements with the supermarket and the office (illustrative).
- `businessPlan.canvas.channels`: The municipal council and the pool operator, the housing association board, and direct talks with the supermarket chain (illustrative).
- `businessPlan.canvas.customerSegments`: Pool and school (public), housing (limited-profit), supermarket and office (private) (illustrative).
- `businessPlan.canvas.costStructure`: Loop 1.6 km × €500/m = €0.8 m [39]; heat pumps at the default €15,000 per building × 6 = €0.09 m [39], far too low for a pool, so a quote is needed; groundwater source not yet estimated; electricity at €0.20/kWh [39] (illustrative).
- `businessPlan.canvas.revenueStreams`: Heat €0.12/kWh plus €6/m² base; cooling €0.08/kWh plus €3/m² base; a connection fee of €1,000 per building (Quick Check defaults) [39].
- `businessPlan.canvas.operatorResponsibilities`: Open: either the municipality runs the loop through its pool operator, or a contractor owns source and loop and sells heat. Heat pumps in the buildings stay with the owners (illustrative).
- `businessPlan.allocation[0]`
  - `stakeholder`: Municipality (pool and school) (illustrative)
  - `investment`: Pool and school heat pumps, and wells on municipal land (illustrative).
  - `risk`: Budget approval; pool closures cut the demand (illustrative).
  - `benefit`: Lower pool energy costs and CO2 emissions (illustrative).
- `businessPlan.allocation[1]`
  - `stakeholder`: Housing association (illustrative)
  - `investment`: Connection fees and building heat pumps (illustrative).
  - `risk`: Tenant cost rules limit what can be passed on (illustrative).
  - `benefit`: A gas exit and summer cooling (illustrative).
- `businessPlan.allocation[2]`
  - `stakeholder`: Supermarket and office owners (illustrative)
  - `investment`: The heat-recovery connection (illustrative).
  - `risk`: Their cooling depends on the loop (illustrative).
  - `benefit`: Lower cooling electricity and a possible heat credit (illustrative).

### Step 3 · Reality check

- `businessPlan.assumptions.connectionRate`: All 6 buildings connect; housing joins in year 2 (illustrative). No sensitivity has been tested.
- `businessPlan.assumptions.tariffs`: Quick Check defaults [39]; not yet compared with the pool's current district-heating bill.
- `businessPlan.assumptions.capex`: ~€0.8 m for the loop [39] plus source and heat pumps; the source cost is not yet estimated.
- `businessPlan.assumptions.financing`: Municipal budget plus a bank loan at 3% (default) [39] (illustrative).
- `businessPlan.assumptions.subsidies`: UFI micro-networks may pay up to 40% (municipalities get 60% of the business rate) for 2-9 external customers or <800 MWh/a of heat sales [13]; eligibility has not been checked yet.
- `businessPlan.criticalAssumptions[0]`
  - `statement`: Groundwater can supply the pool and the loop with roughly 4 GWh/a of source heat (illustrative).
  - `validation`: A hydrogeological desk study and a test well pair before design (illustrative).
- `businessPlan.criticalAssumptions[1]`
  - `statement`: The supermarket and the office will feed their cooling waste heat into the loop (illustrative).
  - `validation`: Letters of intent from both owners (illustrative).
- `businessPlan.criticalAssumptions[2]`
  - `statement`: The outdoor pool can absorb most of the summer waste heat (illustrative).
  - `validation`: Not yet defined.
- `businessPlan.risks[0]` · **deal-breaker**
  - `title`: Council does not approve the pool investment
  - `description`: The pool is the anchor; without the municipality's budget decision, the loop loses its main customer (illustrative).
  - `dealBreaker`: true
  - `validation`: Present to the council (date not set).
- `businessPlan.risks[1]`
  - `title`: Pool closes for renovation
  - `description`: Demand drops for more than a year; Hallenbad Floridsdorf was closed for 15 months for its conversion [38].
  - `dealBreaker`: false
  - `validation`: Align the loop's start with the pool's renovation plan (illustrative).
- `businessPlan.risks[2]`
  - `title`: Groundwater permit delays
  - `description`: Permits for well pairs take time and may limit the flow rate (illustrative).
  - `dealBreaker`: false
  - `validation`: An early meeting with the water authority (illustrative).

### Step 4 · Implementation

- `businessPlan.refinements.feedback`: Illustrative expert feedback: indoor-pool heat demand ranges from 3 to 7 MWh/m² of water per year [22], so heat recovery in the pool comes first [26].
- `businessPlan.refinements.changes`: Use the low end (3 MWh/m²a) and plan heat recovery in the pool before sizing the loop (illustrative).
- `businessPlan.scalability.geographical`: Many municipal pools sit next to schools and shops; Vienna has already converted Hallenbad Floridsdorf to groundwater heat pumps [4][38].
- `businessPlan.scalability.economic`: Best where the pool already plans a renovation and its current heat is expensive (illustrative).
- `businessPlan.scalability.organisational`: The municipal pool operator acts as anchor and owner of the source; this is repeatable in other districts (illustrative).
- `businessPlan.nextSteps.data`: Monthly pool heat-meter data, supermarket and office cooling loads, and groundwater data (illustrative).
- `businessPlan.nextSteps.stakeholders`: The council, the pool operator, the housing association and the supermarket chain (illustrative).
- `businessPlan.nextSteps.partnerships`: Choose an operator model and check UFI eligibility with KPC [13].
- `businessPlan.nextSteps.pilots`: Start with the pool, the school and the supermarket (illustrative).
- `businessPlan.nextSteps.decisions`: A council decision on the anchor investment (timing open).

### Quick-Check facts (illustrative inputs)

| Input | Value | Basis |
|---|---|---|
| Buildings (QCT-IN-01) | 6 | illustrative |
| Project area (QCT-IN-02) | 40,000 m² (4 ha) | illustrative |
| Shares (QCT-IN-04, % of buildings) | category_c 1961-1990 (pool): 16.6; category_a 1961-1990 (school): 16.6; category_a 2011-today (supermarket): 16.7; category_a 1991-2010 (office): 16.7; residential 1991-2010: 33.4 (1 of 6 buildings each, housing 2 of 6; rounded to sum 100) | illustrative; pools are category C, schools and supermarkets category A [39] |
| Manual demand (QCT-IN-05) | heating ~5,140 MWh/a; cooling: tool defaults give ~0.2 GWh/a (flats and office); supermarket refrigeration is a source, not a demand | derived from [22], [39] |
| Sources (QCT-IN-06/07) | ground_water: high (capacity override needed, D-10); waste_heat (supermarket, office): medium; ambient_air: medium; PV: yes | illustrative; analogues [1], [4] |
| Network length (QCT-IN-08) | 1,600 m | illustrative |
| Line density | ~3.2 MWh/m | derived |
| Heat pumps | 5 (pool, school, office, 2 housing blocks) | illustrative |

### References (F2)

[1] Stadt Wien, Kraftwerk Seebogen · [4] Stadt Wien, Hallenbad Floridsdorf · [13] UFI Erneuerbare Mikronetze · [22] BISp-Jahrbuch 2001 (Schlesiger) · [23] UC Davis WCEC 2018 · [26] Kampel et al. 2014 · [38] wien.ORF.at 2025 · [39] Quick Check tables

---

## F3 · `data-centre-waste-heat` · WEAK · fictional

**Summary (EN):** A data centre has waste heat to give away; businesses and flats nearby might use it, but nobody has committed yet (illustrative).
**Summary (DE):** Ein Rechenzentrum hat Abwärme abzugeben; Betriebe und Wohnungen in der Nähe könnten sie nutzen, aber noch hat niemand zugesagt (illustrativ).
**Site name (DE):** Rechenzentrums-Abwärme für ein Betriebsgebiet im Süden Wiens (illustrativ)

**Why weak:** C1 fails: no waste-heat quantity, no demand, no building count in the plan text. C2 fails: no anchor customer, although the real Vienna case worked because a hospital sat next door [3]. C3 fails: "not decided". C4 fails: generic rows. C5 fails: "cheaper than gas" with no numbers. The plan also claims the heat is "free", while the literature names low-grade heat and high investment as the main barriers [29] and data-centre cooling water is only ~26 °C [3]. C6 fails: validations are "ask" and "later". C7 fails: the flag sits on "pipe construction in streets"; the real deal-breaker, a binding heat-offtake agreement with the data-centre operator (volume, temperature, price, who pays the heat pumps), is missing, and business models between data centres and heat networks are often opaque [29]. C8 fails: no feedback, no gate. Also, industrial buildings have no default demand in the Quick Check (Table 1 shows "-", OQ-02), so the tool cannot estimate demand without manual input [39].

### Site

- `site.name`: Data-centre waste heat for a southern Vienna business park (illustrative)
- `site.location`: Industrial area in southern Vienna (illustrative)
- `site.siteType`: Industrial and commercial area with some housing nearby (illustrative)
- `site.ownership`: A private data centre, several businesses, and housing nearby (illustrative).
- `site.units`: The data centre and neighbouring buildings (illustrative)
- `site.currentSupply`:
  - Gas (illustrative)
  - Data-centre cooling to the air (illustrative)
- `site.stakeholders`:
  - Data-centre operator (illustrative)
  - Neighbouring businesses (illustrative)
  - Residents (illustrative)
- `site.partners`:
  - To be identified

### Step 1 · Opportunity

- `businessPlan.opportunity.customerSegments`: Businesses and households near the data centre (illustrative).
- `businessPlan.opportunity.needs`: Heating in winter (illustrative).
- `businessPlan.opportunity.heatSources`: Waste heat from the data centre's servers (illustrative). In Vienna a data centre already heats a hospital [3].
- `businessPlan.opportunity.painPoint`: The waste heat is lost today (illustrative).
- `businessPlan.opportunity.alternatives`: Gas or district heating (illustrative).
- `businessPlan.opportunity.advantage`: Free heat that is otherwise wasted (illustrative).

### Step 2 · Business Model Canvas

- `businessPlan.canvas.keyPartners`: The data centre (illustrative).
- `businessPlan.canvas.keyActivities`: Build pipes (illustrative).
- `businessPlan.canvas.keyResources`: Waste heat (illustrative).
- `businessPlan.canvas.valueProposition`: Cheap green heat (illustrative).
- `businessPlan.canvas.customerRelationships`: To be defined.
- `businessPlan.canvas.channels`: Direct contact (illustrative).
- `businessPlan.canvas.customerSegments`: Neighbours (illustrative).
- `businessPlan.canvas.costStructure`: Pipes and heat pumps (illustrative).
- `businessPlan.canvas.revenueStreams`: Selling heat (illustrative).
- `businessPlan.canvas.operatorResponsibilities`: Not decided.
- `businessPlan.allocation[0]`
  - `stakeholder`: Data centre (illustrative)
  - `investment`: Not decided.
  - `risk`: None.
  - `benefit`: A green image (illustrative).
- `businessPlan.allocation[1]`
  - `stakeholder`: Neighbours (illustrative)
  - `investment`: The connection.
  - `risk`: Not assessed.
  - `benefit`: Cheap heat (illustrative).
- `businessPlan.allocation[2]`
  - `stakeholder`: City (illustrative)
  - `investment`: Funding, perhaps.
  - `risk`: Not assessed.
  - `benefit`: Climate goals (illustrative).

### Step 3 · Reality check

- `businessPlan.assumptions.connectionRate`: Most neighbours will connect (illustrative).
- `businessPlan.assumptions.tariffs`: Cheaper than gas (illustrative).
- `businessPlan.assumptions.capex`: Moderate (illustrative).
- `businessPlan.assumptions.financing`: Grants and partners (illustrative).
- `businessPlan.assumptions.subsidies`: EU and city funding expected (illustrative).
- `businessPlan.criticalAssumptions[0]`
  - `statement`: The data centre gives its waste heat for free (illustrative).
  - `validation`: Ask the data centre.
- `businessPlan.criticalAssumptions[1]`
  - `statement`: Neighbours want the heat (illustrative).
  - `validation`: Later.
- `businessPlan.risks[0]` · deal-breaker (misplaced, see "Why weak")
  - `title`: Pipe construction in streets
  - `description`: Digging may be disruptive (illustrative).
  - `dealBreaker`: true
  - `validation`: Plan carefully.
- `businessPlan.risks[1]`
  - `title`: Heat price
  - `description`: Customers may find it expensive (illustrative).
  - `dealBreaker`: false
  - `validation`: A market study.

### Step 4 · Implementation

- `businessPlan.refinements.feedback`: Not collected yet.
- `businessPlan.refinements.changes`: None so far.
- `businessPlan.scalability.geographical`: Every data centre in Vienna (illustrative).
- `businessPlan.scalability.economic`: Data centres are growing (illustrative).
- `businessPlan.scalability.organisational`: A partnership model (illustrative).
- `businessPlan.nextSteps.data`: Get data from the data centre.
- `businessPlan.nextSteps.stakeholders`: The data centre and the neighbours.
- `businessPlan.nextSteps.partnerships`: Find an operator.
- `businessPlan.nextSteps.pilots`: Start with one building.
- `businessPlan.nextSteps.decisions`: Decide later.

### Quick-Check facts (illustrative inputs; a better plan would state these)

| Input | Value | Basis |
|---|---|---|
| Buildings (QCT-IN-01) | 12 | illustrative |
| Project area (QCT-IN-02) | 150,000 m² (15 ha) | illustrative |
| Shares (QCT-IN-04, % of buildings) | industry 1961-1990: 50; category_a 1991-2010: 30; residential 1961-1990: 20 | illustrative; industry has no defaults (OQ-02) [39] |
| Manual demand (QCT-IN-05) | needed for the industry share; not stated in the plan | gap |
| Sources (QCT-IN-06/07) | waste_heat: high (capacity override needed, D-10); ambient_air: medium; PV: no | illustrative |
| Waste-heat temperature | ~26 °C server cooling water, cooled to 16 °C, in the Vienna reference case; heat pumps are needed to use it | [3] |
| What a strong plan would add | IT load and hours (e.g. 5 MW IT × 8,000 h ≈ 40 GWh/a of low-grade heat, illustrative), an anchor offtaker, an offtake contract and heat-pump ownership | illustrative; [3], [28], [29] |
| Network length (QCT-IN-08) | not stated | gap |

### References (F3)

[3] Stadt Wien, Klinik Floridsdorf · [28] Huang et al. 2020 · [29] Wahlroos et al. 2018 · [39] Quick Check tables

---

## Open doubts for the owner

1. **Viertel Zwei** is the best-known Vienna anergy example (also in the e7 talk) but is not used: the detailed klimaaktiv evaluation now returns 404, the Wayback Machine is blocked from this environment, and the Energie Krieau PDF is gone. Search snippets of that evaluation suggest a planning change and a remaining gas share, which we could not verify, so nothing from it is used.
2. **Geblergasse numbers diverge** between the 2017 design and the 2021 news (probes, cost). Both are shown with dates. The AEE INTEC slide [15] almost certainly describes Geblergasse (block of 18 houses, 157 MWh/a), but it does not name the site and says 20 flats, not 25.
3. **The Vienna anergy grant [6]** applied to applications until 31.12.2025. No 2026 successor was found; the examples say "successor not verified".
4. **Hospital cooling** has no clean public benchmark. F1 derives it from metered chiller electricity [20] with an assumed EER of 3, marked illustrative. The Quick Check default for category C (4-7.5 kWh/m²a) would understate hospital cooling.
5. **Quick Check source capacities (TBL-4)** top out at 150 MWh/a, and default source cost is €1.00 per kWh/a supplied. For district-scale examples, both need overrides (D-10) or they dominate the result; this is flagged in F1 and R2.
6. **The BISp pool benchmarks [22]** are from 2001/2002 and the NRW hospital brochure [21] from 2003; both are official, but old.
