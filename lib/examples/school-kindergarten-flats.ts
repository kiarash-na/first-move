import { text, type ExampleDefinition } from "./types"

/**
 * BM-SCN-02 · school, kindergarten and flats on gas. Stated by the scenario: urban outskirts,
 * no district heating planned, a secondary school, a kindergarten and multi-family buildings,
 * municipal ownership and rental apartments, the owner of the educational facilities as
 * partner, about 80 units, natural gas. Everything else is illustrative.
 */
export const schoolKindergartenFlats: ExampleDefinition = {
  id: "school-kindergarten-flats",
  scenarioId: "BM-SCN-02",
  name: text("School, kindergarten and flats"),
  summary: text("A compact municipal cluster on natural gas, close to ground water and a stream."),
  site: {
    name: text("Municipal education and housing cluster (illustrative)"),
    location: text("Urban outskirts; no district heating planned"),
    siteType: text("Urban outskirts"),
    ownership: text("Municipal ownership, rental apartments."),
    units: text("Approx. 80 units"),
    currentSupply: [text("Natural gas")],
    stakeholders: [text("Secondary school"), text("Kindergarten"), text("Multi-family buildings")],
    partners: [text("Owner of educational facilities")],
  },
  buildings: {
    total: 8,
    areaM2: 7_200,
    shares: {
      residential: { "1961_1990": 25, "1991_2010": 25, "2011_today": 25 },
      category_a: { "1991_2010": 12.5 },
      category_b: { "2011_today": 12.5 },
    },
  },
  sources: { potentials: { ground_water: "high", surface_water: "high", ambient_air: "high" }, pv: false },
  businessPlan: {
    opportunity: {
      customerSegments: text(
        "The secondary school, the kindergarten and the multi-family buildings with about 80 rental units. All are under municipal ownership.",
      ),
      needs: text(
        "Heating and hot water all year for the flats; daytime heating for the school and the kindergarten. Cooling in summer is wanted for the school (illustrative).",
      ),
      heatSources: text(
        "Ground water and a nearby surface water body, both with high potential (illustrative), plus ambient air as a back-up.",
      ),
      painPoint: text(
        "All buildings run on natural gas and no district heating is planned, so the municipality has no low-carbon plan for them.",
      ),
      alternatives: text(
        "A heat pump per building, or a gas-boiler replacement. Hydrogen or biomass are not assumed (illustrative).",
      ),
      advantage: text(
        "One municipal owner, short distances and complementary load profiles (school by day, flats by night) make a shared low-temperature network attractive.",
      ),
    },
    canvas: {
      keyPartners: text("Municipality, owner of the educational facilities, a utility or installer (illustrative)."),
      keyActivities: text("Drill and operate the wells, build the network, run the central heat pumps, bill the buildings."),
      keyResources: text("Ground water and surface water rights, network corridors, heat pumps."),
      valueProposition: text(
        "Heat without gas for all municipal buildings at a stable price, with cooling for the school.",
      ),
      customerRelationships: text("Internal supply contracts between the municipality's departments and the tenants' billing."),
      channels: text("The municipal housing company and the school administration."),
      customerSegments: text("School, kindergarten, rental apartments."),
      costStructure: text("Wells and heat pumps, a short network, electricity for the pumps, operation and maintenance."),
      revenueStreams: text("Base and energy price per building, connection fees for the buildings, tenant billing."),
      operatorResponsibilities: text(
        "Proposal: the municipality or its housing company owns the network and wells; a contractor operates them (illustrative).",
      ),
    },
    allocation: [
      {
        id: "municipality",
        stakeholder: text("Municipality"),
        investment: text("Wells, network and central heat pumps (illustrative)."),
        risk: text("Water permits; cost overruns."),
        benefit: text("Gas-free municipal buildings; lower exposure to gas prices."),
      },
      {
        id: "education-owner",
        stakeholder: text("Owner of educational facilities"),
        investment: text("Connection of the school and the kindergarten."),
        risk: text("Heat must be available at the start of the school year."),
        benefit: text("Comfortable rooms and summer cooling."),
      },
      {
        id: "tenants",
        stakeholder: text("Tenants"),
        investment: text("None directly."),
        risk: text("Higher rents if costs are passed on."),
        benefit: text("Stable heating costs."),
      },
    ],
    assumptions: {
      connectionRate: text("All eight buildings connect: one municipal owner decides (illustrative)."),
      tariffs: text("Quick Check defaults for the prices; the municipality could set a social tariff for tenants."),
      capex: text("Wells and heat pumps are the largest items; the network is short."),
      financing: text("Municipal budget and a green loan (illustrative)."),
      subsidies: text("Municipal climate funding is plausible, but the plan should not depend on it."),
    },
    criticalAssumptions: [
      {
        id: "water",
        statement: text("Ground water and surface water can be used at the planned flow rates."),
        validation: text("Apply for a water-use permit and drill a test well."),
      },
      {
        id: "decision",
        statement: text("The municipality and the education owner agree on one operator model."),
        validation: text("Write a short term sheet and take it to both councils."),
      },
    ],
    risks: [
      {
        id: "permits",
        title: text("Water permits"),
        description: text("The authority may limit the extraction or the return temperature."),
        dealBreaker: true,
        validation: text("Early talks with the water authority."),
      },
      {
        id: "tenants",
        title: text("Tenant costs"),
        description: text("Rents could rise if the investment is passed on."),
        dealBreaker: false,
        validation: text("Model the heating bill per flat before and after."),
      },
    ],
    refinements: {
      feedback: text("Illustrative: a mentor asks how summer cooling would be billed."),
      changes: text("Add a cooling base price for the school and keep the flats on heating only."),
    },
    scalability: {
      geographical: text("Other municipal clusters on the urban outskirts with a school and housing."),
      economic: text("Depends on gas prices and the cost of water permits."),
      organisational: text("A municipal housing company that runs several clusters."),
    },
    nextSteps: {
      data: text("Gas bills of all buildings; water-quality and flow data."),
      stakeholders: text("Municipal departments, school management, tenants' association."),
      partnerships: text("An installer for the wells and heat pumps."),
      pilots: text("Start with the school and the kindergarten, then add the flats."),
      decisions: text("Council decision on the operator model before the detailed design."),
    },
  },
}
