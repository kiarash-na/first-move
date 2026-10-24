import { text, type ExampleDefinition } from "./types"

/**
 * BM-SCN-01 · rural village with a hotel. Stated by the scenario: rural village, private
 * households and a hotel, municipality and ski resort as partners, 20-70 units in phases,
 * supply not specified. Everything else is illustrative.
 */
export const ruralVillageHotel: ExampleDefinition = {
  id: "rural-village-hotel",
  scenarioId: "BM-SCN-01",
  name: text("Rural village with a hotel"),
  summary: text("Scattered households and a hotel in a rural village, developed in phases."),
  site: {
    name: text("Rural village (illustrative)"),
    location: text("Rural village"),
    siteType: text("Rural village"),
    ownership: text("Private ownership, tourist accommodation, commercial."),
    units: text("20-70 units (phased development)"),
    currentSupply: [],
    stakeholders: [text("Private households"), text("Hotel")],
    partners: [text("Municipality"), text("Ski resort")],
  },
  buildings: {
    total: 45,
    areaM2: 1_500_000,
    shares: {
      residential: { until_1919: 10, "1919_1960": 20, "1961_1990": 30, "1991_2010": 22, "2011_today": 8 },
      category_a: { "1991_2010": 6 },
      category_b: { "1961_1990": 4 },
    },
  },
  // Illustrative: the village is spread along a valley road, so the network would be long.
  networkLengthM: 7_000,
  sources: { potentials: { ambient_air: "low", solar_thermal: "low" }, pv: false },
  businessPlan: {
    opportunity: {
      customerSegments: text(
        "Private households and the hotel. The scenario also names commercial uses and tourist accommodation. Between 20 and 70 units, connected in phases.",
      ),
      needs: text(
        "Space heating and hot water for the households; year-round heating for the hotel, with peaks in the ski season. Cooling is a minor need (illustrative).",
      ),
      heatSources: text(
        "No large local source is known. Ambient air and solar thermal are the only options screened, both with low potential (illustrative).",
      ),
      painPoint: text(
        "Houses are far apart, so every connection needs a long pipe. The current energy supply is not specified in the scenario (illustrative: individual boilers).",
      ),
      alternatives: text(
        "Individual air-source heat pumps or biomass boilers per building. The municipality and the ski resort could also lead a smaller network around the hotel only (illustrative).",
      ),
      advantage: text(
        "A shared network could pool the hotel's load with the households' and share the cost of a heat source. Whether it pays off at this density is the open question.",
      ),
    },
    canvas: {
      keyPartners: text("Municipality, ski resort, a local installer (illustrative)."),
      keyActivities: text("Plan the phases, build and operate the network, bill heat to customers."),
      keyResources: text("Heat source, pipes, heat pumps, access to public roads and land."),
      valueProposition: text(
        "Stable heat prices and no boiler or heat pump to maintain for the households; reliable heat for the hotel guests.",
      ),
      customerRelationships: text(
        "Long-term heat supply contracts. The municipality hosts information evenings; the hotel is the anchor customer (illustrative).",
      ),
      channels: text("Municipal information evenings, the municipality website, direct talks with owners."),
      customerSegments: text("Private households; the hotel; commercial users."),
      costStructure: text("Network pipes (long distances), heat source, heat pumps, operation and maintenance."),
      revenueStreams: text("Connection fees, a base price per m², energy price per kWh (rough, as in the Quick Check)."),
      operatorResponsibilities: text(
        "Open: a municipal utility, a village cooperative or a private operator could own and run the source, the network and the heat pumps (illustrative).",
      ),
    },
    allocation: [
      {
        id: "municipality",
        stakeholder: text("Municipality"),
        investment: text("Possibly the first pipe sections and the permits (illustrative)."),
        risk: text("Carries the risk if too few owners connect."),
        benefit: text("Local energy supply and a climate goal for the village."),
      },
      {
        id: "hotel",
        stakeholder: text("Hotel"),
        investment: text("Connection to its own building and an internal heat exchanger (illustrative)."),
        risk: text("Depends on the network being ready before the season."),
        benefit: text("Predictable heat cost for a year-round operation."),
      },
      {
        id: "households",
        stakeholder: text("Private households"),
        investment: text("Connection fee; the building's internal changes."),
        risk: text("Pay for a connection before the whole network is built."),
        benefit: text("No boiler to replace; comfort and fixed prices."),
      },
    ],
    assumptions: {
      connectionRate: text(
        "Plausible: only part of the owners connect in each phase. The phases decide how many (illustrative).",
      ),
      tariffs: text("Use the Quick Check defaults for base price, energy price and connection fee."),
      capex: text("Dominated by the long network (about 7 km, illustrative) and the heat pumps."),
      financing: text("Municipal loans and owner contributions; no commercial investor assumed (illustrative)."),
      subsidies: text("Likely to be needed, because the density is low. Not quantified here."),
    },
    criticalAssumptions: [
      {
        id: "anchor",
        statement: text("The hotel connects and stays connected."),
        validation: text("Ask for a letter of intent from the hotel owner."),
      },
      {
        id: "phases",
        statement: text("Enough owners connect in the first phase to justify the main pipe."),
        validation: text("Collect non-binding interest from every owner before planning the route."),
      },
    ],
    risks: [
      {
        id: "density",
        title: text("Low connection density"),
        description: text("Few customers per metre of pipe make the heat price too high."),
        dealBreaker: true,
        validation: text("Rerun the Quick Check with the real route and the number of owners who say yes."),
      },
      {
        id: "source",
        title: text("No strong heat source"),
        description: text("Ambient air and solar thermal alone may not cover the demand."),
        dealBreaker: false,
        validation: text("Look for a local source: river, ground water or waste heat from the ski resort."),
      },
    ],
    refinements: {
      feedback: text("Illustrative: a mentor suggests starting with the hotel and the nearest houses only."),
      changes: text("Reduce phase 1 to a short cluster around the hotel; extend only when connections are signed."),
    },
    scalability: {
      geographical: text("Other villages along the valley with a similar mix of households and tourism."),
      economic: text("Works only where owners accept a connection fee and where subsidies exist."),
      organisational: text("A municipal or cooperative operator that can run several villages."),
    },
    nextSteps: {
      data: text("Meter or invoice data from the hotel and a sample of households; the real route length."),
      stakeholders: text("Hotel owner, a group of households, municipal council."),
      partnerships: text("Ski resort for a possible heat source or land; a local installer."),
      pilots: text("A small cluster around the hotel."),
      decisions: text("Go/no-go after the interest survey: continue only if a clear majority in phase 1 signs."),
    },
  },
}
