import { text, type ExampleDefinition } from "./types"

/**
 * Extra example (OQ-23): a small new-build quarter with ground water and waste heat. Not
 * based on a BM scenario; all details are illustrative.
 */
export const newBuildQuarter: ExampleDefinition = {
  id: "new-build-quarter",
  scenarioId: "custom",
  name: text("New-build quarter"),
  summary: text("Ten new homes with ground water and nearby waste heat: a clear fit for a shared network."),
  site: {
    name: text("New-build quarter (illustrative)"),
    location: text("Illustrative site"),
    siteType: text("New development area"),
    ownership: text("A single developer, later sold as condominiums (illustrative)."),
    units: text("10 buildings (illustrative)"),
    currentSupply: [text("None yet (new build)")],
    stakeholders: [text("Developer"), text("Future residents")],
    partners: [text("Operator of the nearby waste-heat source (illustrative)")],
  },
  buildings: {
    total: 10,
    areaM2: 9_000,
    shares: { residential: { "2011_today": 100 } },
  },
  sources: { potentials: { ground_water: "high", waste_heat: "high" }, pv: true },
  businessPlan: {
    opportunity: {
      customerSegments: text("Future residents of ten new homes; the developer as first customer."),
      needs: text("Low heating demand (efficient new buildings), hot water, and some summer cooling."),
      heatSources: text("Ground water and waste heat from a nearby facility, both with high potential (illustrative)."),
      painPoint: text("Building law and the developer's climate target exclude gas; individual solutions add cost per house."),
      alternatives: text("An air-source heat pump per house, or a small building-block system."),
      advantage: text("The network is built once with the quarter, with two local sources, so there is no retrofit and the cost is shared."),
    },
    canvas: {
      keyPartners: text("Developer, waste-heat provider, municipality."),
      keyActivities: text("Plan the network with the roads, build, operate and bill."),
      keyResources: text("Wells, waste-heat connection, heat pumps, pipes in the new streets."),
      valueProposition: text("Low-carbon heat and cooling from day one, without a heat pump in each house."),
      customerRelationships: text("Supply contract signed with the purchase of each home."),
      channels: text("The developer's sales team."),
      customerSegments: text("Home buyers; the developer."),
      costStructure: text("Wells, heat pumps, pipes laid with the roads, operation."),
      revenueStreams: text("Connection fee included in the purchase price; base and energy price."),
      operatorResponsibilities: text("The developer sets up an operating company, or hands the network to a utility after the first phase (illustrative)."),
    },
    allocation: [
      {
        id: "developer",
        stakeholder: text("Developer"),
        investment: text("Network and sources up front (illustrative)."),
        risk: text("Delays in the building schedule."),
        benefit: text("Marketing value; saves individual systems."),
      },
      {
        id: "residents",
        stakeholder: text("Future residents"),
        investment: text("Connection fee in the price."),
        risk: text("Depend on one supplier."),
        benefit: text("Low running costs and no heat pump to maintain."),
      },
      {
        id: "waste-heat",
        stakeholder: text("Waste-heat provider"),
        investment: text("A heat exchanger on site (illustrative)."),
        risk: text("Their process may change."),
        benefit: text("Revenue from heat that is lost today."),
      },
    ],
    assumptions: {
      connectionRate: text("100 % of the homes: connection is part of the sale."),
      tariffs: text("Quick Check defaults."),
      capex: text("Cheap network because it is built with the streets; wells and heat pumps are the main cost."),
      financing: text("Developer equity plus a loan."),
      subsidies: text("Helpful but not needed (illustrative)."),
    },
    criticalAssumptions: [
      {
        id: "waste-heat",
        statement: text("The waste-heat provider guarantees heat for at least 15 years."),
        validation: text("A long-term supply agreement."),
      },
      {
        id: "wells",
        statement: text("Ground water can be used at the needed flow."),
        validation: text("Hydrogeological survey."),
      },
    ],
    risks: [
      {
        id: "waste-heat",
        title: text("Waste heat stops"),
        description: text("The facility may close or change its process."),
        dealBreaker: true,
        validation: text("Make the heat-supply contract part of the investment decision."),
      },
      {
        id: "schedule",
        title: text("Building schedule"),
        description: text("Late homes delay income."),
        dealBreaker: false,
        validation: text("Phase the network with the building stages."),
      },
    ],
    refinements: {
      feedback: text("Illustrative: reviewers ask for a back-up if the waste heat stops."),
      changes: text("Dimension the ground-water source so that it covers the quarter alone."),
    },
    scalability: {
      geographical: text("Any new quarter near an industrial or commercial heat source."),
      economic: text("Works best with low-cost financing."),
      organisational: text("A developer who builds several quarters can reuse the model."),
    },
    nextSteps: {
      data: text("Heat-load calculation per building; waste-heat profile."),
      stakeholders: text("Developer, waste-heat provider, municipality."),
      partnerships: text("Contract with the waste-heat provider; a utility as the future operator."),
      pilots: text("Phase 1: the first four homes."),
      decisions: text("Decide on the heat-supply contract before the street design is fixed."),
    },
  },
}
