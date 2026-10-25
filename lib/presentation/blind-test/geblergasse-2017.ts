import { applyPatch, createProject, type Project, type ProjectPatch } from "@/lib/project"

/**
 * The blind test of the presentation (slide 5): a real Vienna project whose outcome is public,
 * entered the way its team could have filled First Move BEFORE it was built.
 *
 * Every value comes from one source written before construction, the Klima- und Energiefonds
 * report "SMART BLOCK II Energy" (created 30.10.2017; [11] in
 * `docs/90_work/research/seed-sources.md`). Nothing from later sources (AnergieUrban 2020, the
 * 2021 press, the award) and nothing the research agent proposed. Fields the report does not
 * cover stay empty. Street, owner and team names are left out, so the engine cannot recognise a
 * known project; the city and district stay, so the Vienna checks still apply.
 */
export const BLIND_SOURCE = {
  title: "SMART BLOCK II Energy, publishable final report (Klima- und Energiefonds, Blue Globe Report Smart Cities #6/2018)",
  created: "2017-10-30",
  url: "https://www.klimafonds.gv.at/wp-content/uploads/2025/06/Endbericht-Smart-Block-II-Geblergasse.pdf",
} as const

/** What happened after the plan, revealed only after the blind score (sources [7], [36], [9]). */
export const KNOWN_OUTCOME = {
  name: "Smart Block Geblergasse, Vienna 17",
  sources: {
    built: "https://digital.wienbibliothek.at/download/pdf/3645878.pdf",
    running: "https://futurezone.at/digital-life/gasheizung-altbau-smartblock-geblergasse-anergienetze/401762391",
    award: "https://socialhousing.wien/best-practice/rehabilitation-modernisation-and-safety/smart-block-geblergasse",
  },
} as const

/** The plan as of autumn 2017. Free text, English, as the engine reads it. */
export const GEBLERGASSE_2017: ProjectPatch = {
  "site.name": "Shared renewable heat for two Gründerzeit houses in one block",
  "site.location": "Vienna, 17th district (Hernals): a dense perimeter block of 18 properties",
  "site.siteType": "Dense Gründerzeit perimeter block, existing buildings, shared courtyard",
  "site.ownership":
    "Two private rental houses, being refurbished in 2017 with subsidies (Wiener Wohnbaufonds) and let afterwards. The block has 18 properties with separate owners; 12 are unrenovated, and only the owners of half of those could be reached. Under the Vienna building code, the tenancy law (MRG) and the heating-cost law, using on-site renewables costs owners about three times a gas central heating.",
  "site.units": "2 houses, 25 flats (16 + 9), about 2,000 m² gross floor area (1,100 + 900); 18 properties in the block",
  "site.currentSupply": [
    "Unrenovated block houses: mostly gas storey heaters (about 65%)",
    "Single stoves, night-storage heaters, central oil or gas heating (about 10% each)",
    "District heating in one house of the block",
  ],
  "site.stakeholders": [
    "Owners of the two houses (core team; one is part of the research team)",
    "Tenants of the 25 flats",
    "Owners of the 16 other properties in the block",
    "City of Vienna, MA 25 (refurbishment grant)",
    "Area renewal office (Gebietsbetreuung) as a possible moderator",
  ],
  "site.partners": [
    "Interdisciplinary research team: planning, energy, mobility, financing, communication",
    "Building-services engineering office (energy concept)",
    "An energy contractor (being examined)",
    "National climate and energy fund (research funding)",
  ],

  "businessPlan.opportunity.customerSegments":
    "Tenants of the 25 flats (16 in one house, 9 in the other), who buy heat, hot water and some cooling, and the two owners as contract partners. Later customers: neighbouring owners who plan works, such as a house starting a refurbishment and a house to be rebuilt.",
  "businessPlan.opportunity.needs":
    "Design values after the refurbishment: space heat 90 + 67 MWh/a, hot water 30 + 20 MWh/a, heat load 60 + 45 kW. Moderate summer cooling in the larger house through its floor heating (change-over, about 3 weeks on the hottest days, 10:00 to 14:00).",
  "businessPlan.opportunity.heatSources":
    "A ground store under the courtyard, reached by 8 boreholes of about 120 m; 2 × 54 m² hybrid PV-T collectors on the roofs; outdoor air through an air-water heat exchanger down to about −5 °C; one 110 kW heat pump that also makes cold water in summer; a 2,000 l buffer. A gas condensing boiler for the full 105 kW stays as backup.",
  "businessPlan.opportunity.painPoint":
    "Gründerzeit houses lack central heating and space. Under current rules and costs, owners fit gas storey heaters, which locks in fossil heat. A shared renewable plant costs about three times a gas central heating, and the owners' condition is that tenants pay no more than with district heating.",
  "businessPlan.opportunity.alternatives":
    "A gas central heating (cheapest up front) or gas storey heaters. District heating: Wien Energie puts the connection at about €60,000 per Gründerzeit house, and its annual costs in unrenovated houses stay clearly above gas.",
  "businessPlan.opportunity.advantage":
    "One plant serves both houses: the larger house holds the heat centre and the courtyard store, the smaller one needs no plant of its own. Heat, hot water and some cooling with as little fossil energy and grid electricity as possible. Over 20 years the full costs are about the same as district heating; with grants, owner and tenant costs together are €7.89 per m² a year.",

  "businessPlan.canvas.keyPartners":
    "The two owners (one in the research team); the building-services engineers; the research team for process and financing; the City of Vienna (MA 25 grant); an energy contractor, if contracting is chosen.",
  "businessPlan.canvas.keyActivities":
    "A joint tender and refurbishment of both houses; building the shared plant (boreholes, collectors, heat centre); operating it.",
  "businessPlan.canvas.keyResources":
    "The courtyard for the boreholes, two roofs for the collectors, the heat centre in the basement of the larger house with a 2,000 l buffer.",
  "businessPlan.canvas.valueProposition":
    "Tenants: renewable heat, hot water and summer cooling at no more than the cost of district heating. Owners: refurbished houses with almost no fossil energy, and an example that neighbours can join.",
  "businessPlan.canvas.customerRelationships":
    "Tenants pay energy costs that must not exceed district heating; the owners' construction-cost contribution that guarantees this is still to be negotiated.",
  "businessPlan.canvas.channels":
    "A core team of two owners; if others join, a steering group of all owners, elected resident representatives, the city administration, funders and experts; external moderation, for example by the area renewal office.",
  "businessPlan.canvas.customerSegments": "Tenants of 25 flats (end users) and the two owners (contract partners); later, neighbouring owners.",
  "businessPlan.canvas.costStructure":
    "The shared plant costs about €320,000 after the tender, about three times a gas central heating. Running costs are mainly heat-pump electricity, partly covered by the houses' own PV.",
  "businessPlan.canvas.revenueStreams":
    "Energy fees from tenants, capped at the cost of district heating; a construction-cost contribution from the owners (to be negotiated); the MA 25 grant of 30% (about €95,000).",
  "businessPlan.canvas.operatorResponsibilities":
    "Either the owners run the plant, or an energy contractor finances, builds and operates it and refinances itself through the heat supply. Contracting is being examined.",
  "businessPlan.allocation": [
    {
      id: "owners",
      stakeholder: "Owners of the two houses",
      investment: "The net plant cost of about €225,000 if they finance it, or a construction-cost contribution if a contractor does (amount to be negotiated).",
      risk: "An investment of about three times a gas central heating; tenant costs must stay at or below district heating.",
      benefit: "Refurbished, nearly fossil-free houses; one plant for two houses.",
    },
    {
      id: "contractor",
      stakeholder: "Energy contractor (option)",
      investment: "Finances the plant: about €225,000 after the 30% grant.",
      risk: "Recovers the cost only through the heat supply over the years.",
      benefit: "Income from supplying heat.",
    },
    {
      id: "tenants",
      stakeholder: "Tenants of the 25 flats",
      investment: "Nothing up front.",
      risk: "Their energy costs depend on the contribution the owners agree to.",
      benefit: "Costs no higher than district heating, and summer cooling in the larger house.",
    },
  ],

  "businessPlan.assumptions.connectionRate":
    "Both houses, all 25 flats (100%). Later, a house starting a refurbishment and a house to be rebuilt consider joining an anergy network with the two houses; the 12 unrenovated houses are meant for district heating instead.",
  "businessPlan.assumptions.tariffs":
    "Rule: tenant energy costs no higher than district heating. With grants, owner and tenant costs together come to €7.89 per m² a year. Against a gas central heating, the system only wins if the gas price rises by about 70% (from €0.072 to €0.125 per kWh).",
  "businessPlan.assumptions.capex": "About €320,000 at tender for the shared plant of both houses, about three times a gas central heating.",
  "businessPlan.assumptions.financing":
    "Either the owners pay the net €225,000, or an energy contractor finances the plant and refinances itself through the heat supply; a construction-cost contribution from the owners keeps tenant costs at district-heating level. Contracting is being examined.",
  "businessPlan.assumptions.subsidies": "MA 25 grant: 30% of the plant cost, about €95,000.",
  "businessPlan.criticalAssumptions": [
    {
      id: "tenant-cost",
      statement: "Tenant energy costs stay at or below the cost of district heating.",
      validation: "Size the owners' construction-cost contribution so that this holds (still to be negotiated).",
    },
    {
      id: "full-cost",
      statement: "Over 20 years, the full costs of the shared plant are about the same as district heating.",
      validation: "A heating full-cost comparison over 20 years (ÖGUT method) for both houses.",
    },
  ],
  "businessPlan.risks": [
    {
      id: "tenant-cost",
      title: "Tenant costs above district heating",
      description: "The owners' precondition. The plant costs about three times a gas central heating and only beats gas if gas rises about 70%.",
      dealBreaker: true,
      validation: "Negotiate the owners' construction-cost contribution, or hand the plant to a contractor (being examined).",
    },
    {
      id: "neighbours",
      title: "Neighbours do not join",
      description: "Only the owners of half of the 12 unrenovated houses could be reached; each owner decides alone.",
      dealBreaker: false,
      validation: "A steering group of all owners and residents, moderated externally, for example by the area renewal office.",
    },
  ],

  "businessPlan.refinements.feedback":
    "The exploratory study found that a core team of two owners carries the strategy, that other owners join once they see shared benefits (one plant, cheaper tenders, shared management), and that managing the interfaces between actor groups is decisive.",
  "businessPlan.refinements.changes": "The two houses are tendered and refurbished together, with one plant across both properties instead of two.",
  "businessPlan.scalability.geographical": "An integrated energy concept for every block of this kind, with owners acting when they build anyway.",
  "businessPlan.scalability.economic":
    "Under current law and business models, the on-site solution suits mainly owners with high commitment and the means; gas would have to rise about 70% for it to beat gas heating.",
  "businessPlan.scalability.organisational":
    "A refurbishment manager could start and guide the process; joint action of interested owners lowers their costs; residents are involved early.",
  "businessPlan.nextSteps.stakeholders":
    "The owners of the house starting a refurbishment and of the house to be rebuilt, who consider joining; the city councillor's office and Wien Energie for the unrenovated houses.",
  "businessPlan.nextSteps.partnerships": "An energy contractor for the plant (being examined); external moderation, for example by the area renewal office.",
  "businessPlan.nextSteps.pilots": "The shared plant of the two houses first; an anergy network with neighbouring houses is considered.",
  "businessPlan.nextSteps.decisions": "Owner financing or contracting; the size of the owners' construction-cost contribution.",
}

/** The blind project: Business Plan only (the report gives no project area for a Quick Check). */
export function blindProject(now = new Date("2026-10-25T00:00:00.000Z")): Project {
  const project = createProject({ modules: { businessPlan: true }, name: "Blind test, plan of autumn 2017", id: "00000000-0000-4000-8000-000000002017", now })
  const result = applyPatch(project, GEBLERGASSE_2017, { atomic: true, now })
  if (!result.ok) throw new Error(`Blind input does not apply: ${result.errors.map((error) => error.path).join(", ")}`)
  return result.project
}
