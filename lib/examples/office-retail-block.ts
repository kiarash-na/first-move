import { text, type ExampleDefinition } from "./types"

/**
 * Extra example (OQ-23): an office and retail block with waste heat. Not based on a BM
 * scenario; all details are illustrative.
 */
export const officeRetailBlock: ExampleDefinition = {
  id: "office-retail-block",
  scenarioId: "custom",
  name: text("Office and retail block"),
  summary: text("Offices and shops with waste heat, ground water and surface water; a lot of cooling."),
  site: {
    name: text("Office and retail block (illustrative)"),
    location: text("Illustrative site"),
    siteType: text("Commercial city block"),
    ownership: text("Several commercial owners (illustrative)."),
    units: text("8 buildings (illustrative)"),
    currentSupply: [text("Gas boilers and electric chillers (illustrative)")],
    stakeholders: [text("Office owners"), text("Retail owners"), text("A data-centre operator (illustrative)")],
    partners: [text("City utility (illustrative)")],
  },
  buildings: {
    total: 8,
    areaM2: 6_800,
    shares: {
      category_a: { "1991_2010": 25, "2011_today": 62.5 },
      residential: { "2011_today": 12.5 },
    },
  },
  sources: {
    potentials: { waste_heat: "high", ground_water: "high", surface_water: "high", ambient_air: "high" },
    pv: false,
  },
  businessPlan: {
    opportunity: {
      customerSegments: text("Office and retail owners and the tenants of one apartment building in the block."),
      needs: text("Heating in winter; strong cooling demand for the offices all year."),
      heatSources: text("Waste heat from a data-centre-like facility, ground water, surface water and ambient air (illustrative potentials)."),
      painPoint: text("Gas boilers and electric chillers are separate in each building; waste heat is lost."),
      alternatives: text("Individual heat pumps per building, or district heating if the city extends the network (not planned)."),
      advantage: text("A shared network lets the block use the same pipes for heating and cooling and balances heat from the data centre against the cooling demand."),
    },
    canvas: {
      keyPartners: text("Data-centre operator, city utility, building owners."),
      keyActivities: text("Build a heating and cooling network, operate heat pumps, bill customers."),
      keyResources: text("Waste-heat connection, wells, a water intake, heat pumps."),
      valueProposition: text("Lower energy cost for heating and cooling, and a lower carbon footprint for tenants who report on it."),
      customerRelationships: text("Long-term contracts with commercial owners."),
      channels: text("Property managers and the owners' association."),
      customerSegments: text("Offices, retail, one apartment building."),
      costStructure: text("Source connection, heat pumps, short network, electricity, operation."),
      revenueStreams: text("Heating and cooling base and energy prices; connection fees."),
      operatorResponsibilities: text("The city utility operates the network; the data centre delivers heat under a contract (illustrative)."),
    },
    allocation: [
      {
        id: "owners",
        stakeholder: text("Building owners"),
        investment: text("Connection fees and substations."),
        risk: text("Tenant vacancy."),
        benefit: text("Lower energy costs and better ratings."),
      },
      {
        id: "data-centre",
        stakeholder: text("Data-centre operator"),
        investment: text("Heat exchanger on site."),
        risk: text("Load changes."),
        benefit: text("Revenue and sustainability reporting."),
      },
      {
        id: "utility",
        stakeholder: text("City utility"),
        investment: text("Network and central heat pumps (illustrative)."),
        risk: text("Utilisation risk."),
        benefit: text("New customers and revenue."),
      },
    ],
    assumptions: {
      connectionRate: text("All commercial owners connect; the apartment building follows (illustrative)."),
      tariffs: text("Quick Check defaults for both heating and cooling."),
      capex: text("Heat pumps and the source connections are the main items."),
      financing: text("The utility's balance sheet with owner contributions."),
      subsidies: text("Not required (illustrative)."),
    },
    criticalAssumptions: [
      {
        id: "dc-heat",
        statement: text("The data centre delivers waste heat all year at a stable temperature."),
        validation: text("Request the heat-load profile and sign a supply term sheet."),
      },
      {
        id: "cooling",
        statement: text("Owners accept switching their chillers to the shared network."),
        validation: text("Ask each owner for the age and the replacement date of the chillers."),
      },
    ],
    risks: [
      {
        id: "data-centre",
        title: text("Waste-heat provider leaves"),
        description: text("The facility could move or change its process."),
        dealBreaker: true,
        validation: text("Get a long-term contract and a back-up source (ground water)."),
      },
      {
        id: "tenants",
        title: text("Vacancy"),
        description: text("Empty offices lower the demand."),
        dealBreaker: false,
        validation: text("Check vacancy rates with the property managers."),
      },
    ],
    refinements: {
      feedback: text("Illustrative: reviewers point out that cooling revenue is highly sensitive to occupancy."),
      changes: text("Add a minimum-take clause to the supply contracts."),
    },
    scalability: {
      geographical: text("Other commercial blocks near data centres or large cooling plants."),
      economic: text("Works where cooling demand is high and electricity prices are favourable."),
      organisational: text("A utility with experience in heat contracting can replicate it."),
    },
    nextSteps: {
      data: text("Hourly heating and cooling profiles for each building."),
      stakeholders: text("Data-centre operator, property managers, city utility."),
      partnerships: text("Supply agreement with the data centre."),
      pilots: text("Connect the two largest office buildings first."),
      decisions: text("Decide on the utility's role before the owners are asked to commit."),
    },
  },
}
