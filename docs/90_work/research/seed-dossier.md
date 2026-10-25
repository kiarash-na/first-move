---
id: RESEARCH-SEED-DOSSIER
title: 'Reference cases: seed dossier (3 Vienna, 3 fictional)'
source: [web research by a Claude sub-agent, 2026-10-24; fictional cases re-anchored on real Vienna buildings and all app sources re-opened on 2026-10-25]
---

# Seed dossier: six Business Plan examples (Vienna, 5GDHC / Anergienetz)

**Revised 2026-10-25** (see "Revision log" before the open doubts): the three fictional cases are now fictional plans around real, named Vienna buildings, news sources are no longer used, and the field text of all six cases lives in `lib/examples/reference-cases/`. The public page is `content/docs/{en,de}/reference-cases.mdx`.

Access date: **2026-10-24** for the first research, **2026-10-25** for every source the app cites (`lib/examples/reference-cases/sources.ts`). Numbers in square brackets, e.g. [11], point to the global bibliography in `seed-sources.md`; each example also ends with its own reference list. Field ids are the registry ids of `lib/project/fields/business-plan.ts`.

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
| F1 | `klinik-donaustadt-groundwater-loop` | fictional plan around Klinik Donaustadt (22nd district) | **strong** |
| F2 | `ottakringer-bad-summer-loop` | fictional plan around the Ottakringer Bad (16th district) | **middling** |
| F3 | `grossmarkt-wien-waste-heat` | fictional plan around Großmarkt Wien (23rd district) | **weak** |

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
| F1 Klinik Donaustadt | meets | meets | meets | meets | meets | meets | meets | meets | strong |
| F2 Ottakringer Bad | meets | partial | partial | meets | partial | partial | partial | partial | middling |
| F3 Großmarkt Wien | fails | fails | fails | fails | fails | fails | fails | fails | weak |

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

## F1 · `klinik-donaustadt-groundwater-loop` · STRONG · fictional (re-anchored 2026-10-25)

Replaces the anonymous `hospital-anchor-quarter` of 2026-10-24. Code: `lib/examples/reference-cases/klinik-donaustadt-groundwater-loop.ts` (every field in EN and DE). Disclaimer first in `site.ownership`, on the card and on the docs page.

**Real anchor and its facts (only these are claimed):** Klinik Donaustadt, Langobardenstraße 122, 1220 Vienna [49]; a municipal hospital with 963 systemised beds [48], run by the Wiener Gesundheitsverbund; a low building of at most 5 storeys "auf insgesamt 170.000 m²" [49]. No energy project of the hospital is published, and its heat supply is not public: the plan says so and keeps "the existing supply" as backup without naming it. Donaustadt: about 12,010 buildings on gas, about 1,500 on district heating [43]. A TU Wien study for the city names Floridsdorf and Donaustadt as areas where groundwater use is realistic [18], and finds groundwater concepts close to economic viability against building-by-building supply, while probe concepts need optimisation, extra sources, good areas or renovation [17].

**Why Klinik Donaustadt:** a large public anchor with year-round heat and cooling, in a district the city's own study names for groundwater, with no published energy project that a fictional plan could be confused with. The real Klinik Floridsdorf data-centre project [3] is used only as evidence that hospital heat pumps work at this scale (26 °C to 82 °C, 50 to 70 % of the heat, up to 4,000 t CO2/a).

**Derivations (illustrative unless sourced):**

- Hospital heat: 963 beds × 29 MWh per bed and year (German average [20]) = 27.9 GWh/a, to be replaced by metered data. The loop takes 25 %: about 7.0 GWh/a (low-temperature circuits and hot-water preheating).
- Hospital cooling: 1.5 GWh/a (illustrative; no clean public benchmark, see open doubt 4).
- Housing: 42,000 m² × 109.3 kWh/m²a = 4.6 GWh/a; school: 6,000 m² × 104.3 kWh/m²a = 0.6 GWh/a; housing cooling 42,000 m² × 11.0 kWh/m²a = 0.46 GWh/a [39].
- Loop heat 12.2 GWh/a; hospital share about 57 %; on a 2.5 km trench 4.9 MWh/m, above the 1.5 MWh/m from which the Quick Check rates heat density as high (TBL-9 [39]). The old dossier compared against the ~1 MWh/m rule of thumb of the e7 talk [40]; the app now cites only the Quick Check table, which users can see.
- Source: groundwater, two well pairs at least 50 m apart, about 8 GWh/a.
- Capex €12.9 m: loop 2.5 km × €500/m = €1.25 m; wells at the Quick Check default of €1.00 per kWh/a × 8 GWh/a = €8.0 m (an upper bound); hospital heat-pump plant ~2 MW €2.0 m and block heat pumps €1.6 m (illustrative).
- Annual costs: annuity factor 0.0672 (3 %, 20 years [39]) → €0.86 m; maintenance 2 % → €0.26 m; electricity 2.44 GWh × €0.20 → €0.49 m; total ≈ €1.61 m.
- Revenue: heat 12.2 GWh × €0.12 = €1.46 m; base price €6/m² × 48,000 m² = €0.29 m; hospital capacity price €0.15 m (illustrative); cooling 2.0 GWh × €0.08 = €0.16 m; total ≈ €2.06 m; margin ≈ €0.45 m/a.
- Sensitivities: without the housing ≈ −€0.2 m/a; break-even with the hospital and about a third of the housing floor area; a €4 m well quote adds ≈ €0.35 m/a; electricity +50 % costs ≈ €0.24 m/a.
- A 70 m² flat using 7,650 kWh pays ≈ €1,340 a year at the Quick Check defaults.
- Grants: the city's anergy grant (30 %, at most €200,000 per case, 2024/25 rules, successor not verified) [6]; UFI micro-networks only for 2 to 9 external customers or under 800 MWh/a [13], so this network needs another programme. The 50 % letters-of-intent rule and indexed prices are taken from the UFI micro-network sheet [13].
- Deal-breaker: groundwater yield or permit fails; test well pair and water-authority pre-consultation before gate 1.
- Gates: month 6 (test well and permit outlook positive, heads of terms with the hospital, letters of intent ≥ 50 % of phase-1 heat); month 12 (grant decision known, Quick Check and lifetime check positive at 80 % connection). Phase 1: hospital + 3 association blocks on 1.2 km, ≈ 9.3 GWh/a.

**Quick Check inputs:** 8 buildings (category_c 1991-2010 12.5 %, residential 1961-1990 75 %, category_a 1961-1990 12.5 %), 250,000 m² project area, network 2,500 m, ground_water high and waste_heat medium, PV, and the plan's demand as known demand (12,200,000 kWh/a heat, 2,000,000 kWh/a cooling; QCT-IN-05). Result through the engine: **further analysis required** (heat density high, economics favorable, heating coverage not feasible because TBL-4 capacities are absolute, building density low). Without the known demand the engine would count 8 buildings at TBL-3 floor areas (0.55 GWh/a) and answer "not promising"; that is why examples can now carry a known demand.

**References (F1):** [3] [6] [13] [17] [18] [20] [39] [43] [48] [49]; in the app: RC-KDO-STATUTE, RC-KDO-HOUSE, RC-WIEN-ENERGIE-INFO-22, RC-KRANZL-2026-SLIDES, RC-KRANZL-2026-PAPER, RC-LENA-HOSPITALS, RC-WIEN-KLINIK-FLORIDSDORF, RC-UFI-MIKRONETZE, RC-WIEN-ANERGY-GRANT, RC-WIEN-WAERMEPLAN.

---

## F2 · `ottakringer-bad-summer-loop` · MIDDLING · fictional (re-anchored 2026-10-25)

Replaces the anonymous `pool-anchor-campus`. Code: `lib/examples/reference-cases/ottakringer-bad-summer-loop.ts`.

**Real anchor and its facts:** Ottakringer Bad, Johann-Staud-Straße 11, 1160 Vienna, a combined pool of the City of Vienna (Wiener Bäder) with indoor pool, saunas and an outdoor pool open 2 May to mid-September [45]; built by the city in 1926 as Vienna's first outdoor pool able to warm its water, rebuilt 1966 to 1972, indoor pool added from 1971 [46]. The heat supply is not published ("not checked" in the plan). Ottakring: about 3,380 buildings on gas, about 180 on district heating [42].

**Why the Ottakringer Bad:** a public anchor whose outdoor pool needs heat exactly when supermarket refrigeration rejects most heat, in a gas-heavy district. The supermarket and the three housing blocks are invented and unnamed, so no real business is implied.

**Derivations (illustrative unless sourced):** outdoor pool 0.3 to 0.7 MWh per m² of water and year [22] × an assumed 2,000 m² of water → about 1.0 GWh/a (the water area is not published); indoor pools 3 to 7 MWh/m²a [22], left out of phase 1 on purpose; housing 15,000 m² × 131.5 kWh/m²a (TBL-1, 1919-1960 [39]) ≈ 2.0 GWh/a; supermarket waste heat about 0.3 GWh/a (illustrative, not measured; such recovery is studied in [54], and Kraftwerk Seebogen uses supermarket heat [1]); loop 700 m × €500 = €0.35 m; probes about 1.5 GWh/a × €1.50 = €2.3 m [39]. Evidence points: the most efficient pools recover heat from outgoing water and air [26]; the renovated Hallenbad Floridsdorf cut district heat by 95 %, electricity by 25 % and water by 55 % with heat pumps, PV and thermal renovation [4].

**Why middling:** every field is filled and the demand is quantified, but there is no lifetime check, the third critical assumption's validation is "Not yet defined.", the deal-breaker "Council does not approve the pool investment" has no date, the decision is "A council decision on the anchor investment (timing open)." and the indoor pool is left out. UFI eligibility (2 to 9 external customers [13]) is noted, not checked.

**Quick Check inputs:** 5 buildings (category_c 1961-1990 20 %, category_a 1991-2010 20 %, residential 1919-1960 60 %), 40,000 m², network 700 m, waste_heat and geothermal medium, no PV; demand estimated by the engine. Result: **further analysis required** (heating coverage not feasible, building density low, economics favorable).

**References (F2):** [1] [4] [13] [22] [26] [42] [45] [46] [54].

---

## F3 · `grossmarkt-wien-waste-heat` · WEAK · fictional (re-anchored 2026-10-25)

Replaces the anonymous `data-centre-waste-heat` (data centres were dropped, see `seed-sources.md`, "Dropped or unverified"). Code: `lib/examples/reference-cases/grossmarkt-wien-waste-heat.ts`.

**Real anchor and its facts:** Großmarkt Wien, Laxenburger Straße 365-367, 1230 Vienna; the operator calls it Austria's most important trading hub for fruit, vegetables, food and flowers; about 30 ha, about 220 tenants, about 1,400 employees [51]; run by GMW Großmarkt Wien Betrieb GmbH, part of the Wien Holding group since January 2019 [52]; opened 30 October 1972, modernised 1987 and 2001 with more cold and storage rooms; 2022: about 300,000 m² in total, about 76,000 m² buildings and halls [53][47]. Liesing: about 7,570 buildings on gas, about 680 on district heating [44]. No public figure on its cooling capacity or waste heat.

**Why weak (by omission only):** short, vague texts; empty fields (alternatives, customer relationships, channels, operator responsibilities, capex, financing, two validations, refinements, economic and organisational scalability, partnerships, pilots, decisions); one critical assumption without a test; the deal-breaker sits on "Pipe construction in streets" instead of the unknown heat amount; the pain point "assumes the cooling heat is not used today (not checked)". Nothing it says about the market is false. A few invented items are marked (illustrative).

**Quick Check inputs:** 12 buildings (a guess) on 300,000 m², all category_a 1961-1990, waste_heat **unknown**, no PV. Result: **further analysis required, forced** by the unknown-source rule.

**References (F3):** [44] [47] [51] [52] [53] [54].

---

## Revision log (2026-10-25)

What changed against the dossier of 2026-10-24, and what was dropped:

- **The fictional cases were re-anchored** on real, named Vienna buildings (owner): F1 hospital → Klinik Donaustadt; F2 pool campus → Ottakringer Bad; F3 data centre → Großmarkt Wien. The old anonymous texts (450-bed hospital, pool campus, data centre) were removed from this dossier; their derivation method stays (F1 now uses 963 real beds instead of 450).
- **Every fictional case carries one plain disclaimer** ("neither the owner nor the operator has planned or endorsed it") and marks invented details "(illustrative)". The weak and middling tiers are reached by omission and vagueness only.
- **News sources dropped** from the app: [34] to [38]. R1 no longer uses the 2021 news figures (18 probes × 110 m, €350,000; it states the 2017 design of 8 probes × about 120 m and the AnergieUrban expert survey of probes drilled to about 100 to 110 m [7][11]); R3 uses the developer's own pages [30][50] and Wien Energie's slides [31] instead of [34][35]; the Klinik Floridsdorf heat demand and investment [37] and the Hallenbad Floridsdorf cost [38] are not used.
- **Dropped candidates:** data centres (Equinix pages 404, VSC-5 site 502, overlap with the real Klinik Floridsdorf project); site-level potentials from the city's WFS layers (no features returned); archived pages (Wayback blocked).
- **Field-level text** for all six cases now lives in `lib/examples/reference-cases/*.ts` (EN and DE); the R1 to R3 field lists above are the research draft they were built from. Where they differ, the code is current.
- **Review fixes (2026-10-25):** the aspern Seestadt blog post [32] is no longer cited, so R2 drops the floor area, the plant builder and the residents' cost; R2's text now says the five developers *largely* share the energy system. F1 and F2 apply the UFI rule as the sheet [13] states it (2 to 9 external customers or under 800 MWh/a sold; for waste heat only the heat sold counts; at most €6 m per project). The Kranzl et al. (2026) study is credited to TU Wien and e-think, and Smart Block II is cited as the 2018 report with 2017 data.
- **Quick Check:** examples can now carry a known demand (QCT-IN-05). R1 (207 MWh/a design heat), R2 (1,600 MWh/a space heating) and F1 (the plan's 12.2 GWh/a heat and 2.0 GWh/a cooling) use it. All six cases end at "further analysis required" through the engine; F3 is forced by the unknown source.

---

## Open doubts for the owner

1. **Viertel Zwei** is the best-known Vienna anergy example (also in the e7 talk) but is not used: the detailed klimaaktiv evaluation now returns 404, the Wayback Machine is blocked from this environment, and the Energie Krieau PDF is gone. Search snippets of that evaluation suggest a planning change and a remaining gas share, which we could not verify, so nothing from it is used.
2. **Geblergasse numbers diverge** between the 2017 design and the 2021 news (probes, cost). Since 2026-10-25 the app uses only the 2017 design and the AnergieUrban survey [7][11]; the news figures [36] are not cited. The AEE INTEC slide [15] almost certainly describes Geblergasse (block of 18 houses, 157 MWh/a), but it does not name the site and says 20 flats, not 25.
3. **The Vienna anergy grant [6]** applied to applications until 31.12.2025. No 2026 successor was found; the examples say "successor not verified".
4. **Hospital cooling** has no clean public benchmark. F1 now states 1.5 GWh/a as illustrative, to be replaced by the hospital's metered chiller data (critical assumption "hospital-demand"). The Quick Check default for category C (4-7.5 kWh/m²a) would understate hospital cooling.
5. **Quick Check source capacities (TBL-4)** top out at 150 MWh/a, and default source cost is €1.00 per kWh/a supplied. For district-scale cases the heating coverage stays "not feasible" even with a known demand; all six cases therefore end at "further analysis required". Overrides of TBL-4/TBL-6 (D-10) are not part of an example definition; the docs page says so.
6. **The BISp pool benchmarks [22]** are from 2001/2002 and the NRW hospital brochure [21] from 2003; both are official, but old. [21] is no longer cited in the app.
7. **Real buildings in fictional plans** (Klinik Donaustadt, Ottakringer Bad, Großmarkt Wien): the owner asked for this on 2026-10-25. The plans name the buildings and their public owners or operators, carry the disclaimer, and claim nothing about them beyond [42] to [53]. If any of these organisations objects, swap the anchor; the case files keep all invented content in one place.
