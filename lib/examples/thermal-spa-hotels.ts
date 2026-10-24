import { text, type ExampleDefinition } from "./types"

/**
 * BM-SCN-04 · thermal spa and hotels. Stated by the scenario: urban outskirts; thermal spa,
 * hotels and private households; mainly tourism and spa facilities, limited residential use;
 * partners still to be identified; 3-20 buildings; natural gas and biomass. Whether the
 * thermal water can serve as a source is not stated, so its potential is Unknown.
 */
export const thermalSpaHotels: ExampleDefinition = {
  id: "thermal-spa-hotels",
  scenarioId: "BM-SCN-04",
  name: text("Thermal spa and hotels"),
  summary: text("A spa, hotels and some homes. The thermal water is a promising source, but its potential is unknown."),
  site: {
    name: text("Spa quarter (illustrative)"),
    location: text("Urban outskirts"),
    siteType: text("Urban outskirts"),
    ownership: text("Mainly tourism and spa facilities, limited residential use."),
    units: text("3-20 buildings"),
    currentSupply: [text("Natural gas"), text("Biomass")],
    stakeholders: [text("Thermal spa"), text("Hotels"), text("Private households")],
    partners: [text("To be identified")],
  },
  buildings: {
    total: 8,
    areaM2: 7_500,
    shares: {
      category_c: { "2011_today": 12.5 },
      category_b: { "2011_today": 37.5 },
      residential: { "1991_2010": 12.5, "2011_today": 37.5 },
    },
  },
  sources: {
    // The spa's own thermal water: potential not known yet, so the result must stay open.
    potentials: { geothermal: "unknown", ground_water: "high", surface_water: "high", ambient_air: "high" },
    pv: true,
  },
  businessPlan: {
    opportunity: {
      customerSegments: text("The thermal spa, the hotels and a few private households."),
      needs: text(
        "Heating and hot water all year for the spa and hotel guests; cooling in summer; pool heating (illustrative).",
      ),
      heatSources: text(
        "Thermal water from the spa (its potential is unknown and must be clarified), plus ground water, surface water and ambient air (illustrative potentials).",
      ),
      painPoint: text("The spa and hotels use natural gas and biomass for a large, steady demand."),
      alternatives: text("Separate heat pumps per building, or using the thermal water only for the spa (illustrative)."),
      advantage: text(
        "A network can reuse the spa's thermal water for the hotels and homes, if the source turns out to be suitable. The spa and hotels also have steady, long operating hours.",
      ),
    },
    canvas: {
      keyPartners: text("Thermal spa, hotels, municipality, partners still to be identified."),
      keyActivities: text("Clarify the source, build and operate the network, bill the customers."),
      keyResources: text("Thermal water rights, wells, heat pumps, pipe corridors."),
      valueProposition: text("Reliable, low-carbon heat and cooling for tourism operators with long operating hours."),
      customerRelationships: text("Long-term contracts with the spa and the hotels; homes join later."),
      channels: text("Direct talks with the tourism operators; the municipality."),
      customerSegments: text("Spa, hotels, private households."),
      costStructure: text("Source development, heat pumps, short network, electricity, operation."),
      revenueStreams: text("Base and energy prices for heating and cooling, connection fees."),
      operatorResponsibilities: text(
        "Open: the spa could own the source and run the network, or a separate operator could. Legal rights to the thermal water must be clarified.",
      ),
    },
    allocation: [
      {
        id: "spa",
        stakeholder: text("Thermal spa"),
        investment: text("Contributes the thermal source, if suitable (illustrative)."),
        risk: text("Shared use may affect its own water supply."),
        benefit: text("Lower heating costs and a green image."),
      },
      {
        id: "hotels",
        stakeholder: text("Hotels"),
        investment: text("Connection fees and heat exchangers."),
        risk: text("Dependence on the spa's source."),
        benefit: text("Stable heat for guests."),
      },
      {
        id: "households",
        stakeholder: text("Private households"),
        investment: text("Connection fee."),
        risk: text("Small customers carry a share of fixed costs."),
        benefit: text("Cheaper heat than gas."),
      },
    ],
    assumptions: {
      connectionRate: text("Spa and hotels connect; households follow if the price is lower (illustrative)."),
      tariffs: text("Quick Check defaults; tourism customers may accept a higher share of fixed fees."),
      capex: text("Depends strongly on the thermal source, which is not yet known."),
      financing: text("The operators' own funds plus a bank loan (illustrative)."),
      subsidies: text("Geothermal projects often use subsidies and risk guarantees; not quantified here."),
    },
    criticalAssumptions: [
      {
        id: "thermal",
        statement: text("The thermal water can supply the network without harming the spa."),
        validation: text("Test the flow, temperature and legal status of the source."),
      },
      {
        id: "spa",
        statement: text("The spa operator is willing to share its source."),
        validation: text("Hold a first meeting with a draft agreement."),
      },
    ],
    risks: [
      {
        id: "source",
        title: text("Unknown source potential"),
        description: text("The thermal water may be unsuitable or protected."),
        dealBreaker: true,
        validation: text("Source survey and a talk with the authority."),
      },
      {
        id: "seasonal",
        title: text("Seasonal demand"),
        description: text("Tourist seasons may leave capacity unused."),
        dealBreaker: false,
        validation: text("Get occupancy data from hotels and spa."),
      },
    ],
    refinements: {
      feedback: text("Illustrative: an expert asks who owns the thermal water."),
      changes: text("Add a source-clarification step before any network design."),
    },
    scalability: {
      geographical: text("Other spa towns with thermal water and hotels."),
      economic: text("Depends on the thermal source and gas prices."),
      organisational: text("A local operating company jointly owned by spa and hotels."),
    },
    nextSteps: {
      data: text("Thermal water temperature and flow; hotels' heat and cooling demand."),
      stakeholders: text("Spa management, hotel owners, water authority."),
      partnerships: text("Identify a partner for drilling or source development ('to be identified')."),
      pilots: text("A first link between the spa and the closest hotel."),
      decisions: text("Go/no-go after the source survey."),
    },
  },
}
