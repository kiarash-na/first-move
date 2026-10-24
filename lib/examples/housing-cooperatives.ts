import { text, type ExampleDefinition } from "./types"

/**
 * BM-SCN-03 · housing cooperatives with mixed ownership. Stated by the scenario: urban
 * outskirts; private homeowners, housing cooperatives, municipality and educational
 * facilities; condominium (WEG), rental (MRG) and non-profit (WGG) housing; partners still to
 * be identified; 3-20 buildings; natural gas and biomass. Everything else is illustrative.
 */
export const housingCooperatives: ExampleDefinition = {
  id: "housing-cooperatives",
  scenarioId: "BM-SCN-03",
  name: text("Housing cooperatives with mixed ownership"),
  summary: text("Condominiums, rental and non-profit housing next to a school: strong heat density, spread-out buildings."),
  site: {
    name: text("Mixed-ownership housing district (illustrative)"),
    location: text("Urban outskirts"),
    siteType: text("Urban outskirts"),
    ownership: text("Condominium ownership (WEG), rental housing (MRG), non-profit housing (WGG)."),
    units: text("3-20 buildings"),
    currentSupply: [text("Natural gas"), text("Biomass")],
    stakeholders: [
      text("Private homeowners"),
      text("Housing cooperatives"),
      text("Municipality"),
      text("Educational facilities"),
    ],
    partners: [text("To be identified")],
  },
  buildings: {
    total: 8,
    areaM2: 100_000,
    shares: {
      residential: { "1961_1990": 37.5, "1991_2010": 37.5, "2011_today": 12.5 },
      category_a: { "1991_2010": 12.5 },
    },
  },
  sources: { potentials: { ground_water: "high", ambient_air: "high" }, pv: true },
  businessPlan: {
    opportunity: {
      customerSegments: text(
        "Private homeowners (WEG), rental housing (MRG), non-profit housing cooperatives (WGG), the municipality and educational facilities.",
      ),
      needs: text("Heating and hot water for all housing; a school with daytime demand (illustrative)."),
      heatSources: text("Ground water and ambient air, both with high potential (illustrative). Partners for further sources are still to be identified."),
      painPoint: text(
        "Heat comes from natural gas and biomass in separate systems. Owners decide separately, so no one coordinates a shared solution.",
      ),
      alternatives: text(
        "Each owner replaces its own boiler: biomass or gas stays, or individual heat pumps (illustrative).",
      ),
      advantage: text(
        "A shared network lets the mixed owners pool the demand and the investment, and use one ground-water source for all. The buildings are far apart, so building density is the challenge.",
      ),
    },
    canvas: {
      keyPartners: text("Housing cooperatives, owner associations, the municipality, partners still to be identified."),
      keyActivities: text("Agree on the shared model, build the network, operate the source and the heat pumps."),
      keyResources: text("Ground-water rights, land for pipes, heat pumps, the cooperatives' building stock."),
      valueProposition: text(
        "A common heat supply that removes gas and biomass boilers, with the cooperatives' non-profit logic: cost-covering prices.",
      ),
      customerRelationships: text("Heat supply contracts with each owner type; owner-association votes for the WEG buildings."),
      channels: text("Cooperative boards, owner assemblies and the municipality."),
      customerSegments: text("WEG, MRG and WGG housing; educational facilities."),
      costStructure: text("Wells, heat pumps and a longer network, electricity, operation."),
      revenueStreams: text("Base price per m², energy price, connection fees (Quick Check defaults)."),
      operatorResponsibilities: text(
        "Open question: a cooperative-owned operating company, the municipal utility or a contractor (illustrative).",
      ),
    },
    allocation: [
      {
        id: "cooperatives",
        stakeholder: text("Housing cooperatives"),
        investment: text("Connection of their buildings; possibly shares in the operator."),
        risk: text("Tenants may not accept rent increases."),
        benefit: text("Cost-covering heat and a plan to leave gas and biomass."),
      },
      {
        id: "homeowners",
        stakeholder: text("Private homeowners (WEG)"),
        investment: text("Connection fee after an owner-association vote."),
        risk: text("Vote may fail or be delayed."),
        benefit: text("No boiler replacement."),
      },
      {
        id: "municipality",
        stakeholder: text("Municipality"),
        investment: text("Possibly the school connection and support for permits."),
        risk: text("Reputation if the project fails."),
        benefit: text("Climate target and local control."),
      },
    ],
    assumptions: {
      connectionRate: text("WGG and MRG decide centrally; WEG buildings need a vote. Assume all but one connect (illustrative)."),
      tariffs: text("Quick Check defaults; a lower base price for non-profit housing is possible."),
      capex: text("Wells, heat pumps and a network over a large area."),
      financing: text("Cooperative equity, bank loans and municipal support (illustrative)."),
      subsidies: text("Not decisive in this scenario, but would help the longer pipe routes."),
    },
    criticalAssumptions: [
      {
        id: "vote",
        statement: text("The owner associations of the WEG buildings approve the connection."),
        validation: text("Present the offer at the next owner assemblies."),
      },
      {
        id: "source",
        statement: text("One ground-water source can supply all buildings."),
        validation: text("Hydrogeological study and a test well."),
      },
    ],
    risks: [
      {
        id: "ownership",
        title: text("Mixed ownership slows decisions"),
        description: text("Three different ownership forms follow three different decision rules."),
        dealBreaker: true,
        validation: text("Map decision rules and timelines per owner group."),
      },
      {
        id: "spread",
        title: text("Buildings too far apart"),
        description: text("Long pipes can raise the heat cost."),
        dealBreaker: false,
        validation: text("Check the real route length and rerun the Quick Check."),
      },
    ],
    refinements: {
      feedback: text("Illustrative: experts recommend one lead cooperative and a phased connection."),
      changes: text("Start with the cooperative buildings next to the school; add the WEG buildings later."),
    },
    scalability: {
      geographical: text("Other districts with several cooperatives and one educational facility."),
      economic: text("Works where gas and biomass prices are rising."),
      organisational: text("A cooperative operating company could serve other districts."),
    },
    nextSteps: {
      data: text("Heat consumption per building and the actual building positions."),
      stakeholders: text("Cooperative boards, owner associations, school, municipality."),
      partnerships: text("Identify further partners (named as 'to be identified' in the scenario)."),
      pilots: text("A first cluster of cooperative buildings."),
      decisions: text("Decide on the operator form before approaching the owner associations."),
    },
  },
}
