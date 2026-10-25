import { text } from "../types"
import { REFERENCE_CASE_CARDS } from "./catalog"
import { withFictionalDisclaimer, type ReferenceCase } from "./types"

/**
 * F3 · fictional · weak. A fictional, early idea to sell waste heat from the cold stores of
 * Großmarkt Wien (Laxenburger Straße 365-367, 1230 Vienna). The market facts are real (the
 * operator's pages and its anniversary brochure, the Wien Geschichte Wiki, MA 20 district data);
 * the plan states nothing false about the market but stays vague, leaves fields empty, marks the
 * wrong risk as the deal-breaker and enters the waste-heat potential as unknown. Research log:
 * `docs/90_work/research/seed-dossier.md` § F3.
 */
export const grossmarktWien: ReferenceCase = {
  ...REFERENCE_CASE_CARDS.grossmarktWien,
  scenarioId: "custom",
  references: ["RC-GMW-FACTS", "RC-GMW-OPERATOR", "RC-GMW-50-YEARS", "RC-WGW-GROSSMARKT", "RC-WIEN-ENERGIE-INFO-23", "RC-GIUNTA-SAWALHA-2021"],
  site: {
    name: text("Großmarkt Wien waste-heat plan (fictional plan)", "Abwärmeplan Großmarkt Wien (fiktiver Plan)"),
    location: text("Laxenburger Straße 365-367, 1230 Vienna (Liesing)", "Laxenburger Straße 365-367, 1230 Wien (Liesing)"),
    siteType: text("Wholesale market with halls and cold stores", "Großmarkt mit Hallen und Kühlräumen"),
    ownership: withFictionalDisclaimer(
      "The market is run by GMW Großmarkt Wien Betrieb GmbH, part of the Wien Holding group.",
      "Der Markt wird von der GMW Großmarkt Wien Betrieb GmbH geführt, einem Unternehmen der Wien Holding.",
    ),
    units: text("About 220 tenants on about 30 ha", "Rund 220 Bestandnehmer*innen auf rund 30 ha"),
    currentSupply: [text("Not known", "Nicht bekannt")],
    stakeholders: [
      text("GMW Großmarkt Wien Betrieb GmbH", "GMW Großmarkt Wien Betrieb GmbH"),
      text("Tenants of the market", "Bestandnehmer*innen des Marktes"),
      text("Neighbours", "Nachbarn"),
    ],
    partners: [],
  },
  // The published total area is about 300,000 m²; the building count is a guess and the halls
  // are entered as Category A (docs page § Quick Check inputs). Waste heat is "unknown" on purpose.
  buildings: {
    total: 12,
    areaM2: 300_000,
    shares: { category_a: { "1961_1990": 100 } },
  },
  sources: { potentials: { waste_heat: "unknown" }, pv: false },
  businessPlan: {
    opportunity: {
      customerSegments: text("Neighbours of the market.", "Nachbarn des Marktes."),
      needs: text("Heating.", "Heizen."),
      heatSources: text("Waste heat from the cold stores (amount not measured).", "Abwärme aus den Kühlräumen (Menge nicht gemessen)."),
      painPoint: text(
        "The plan assumes the cooling heat is not used today (not checked).",
        "Der Plan nimmt an, dass die Kühlwärme heute nicht genutzt wird (nicht geprüft).",
      ),
      alternatives: text(""),
      advantage: text("Using waste heat is good for the climate.", "Abwärme zu nutzen ist gut fürs Klima."),
    },
    canvas: {
      keyPartners: text("GMW and an energy company (illustrative).", "GMW und ein Energieunternehmen (illustrativ)."),
      keyActivities: text("Build pipes.", "Leitungen bauen."),
      keyResources: text("The cold stores.", "Die Kühlräume."),
      valueProposition: text("Cheap green heat.", "Günstige grüne Wärme."),
      customerRelationships: text(""),
      channels: text(""),
      customerSegments: text("Neighbours.", "Nachbarn."),
      costStructure: text("Pipes and heat pumps.", "Leitungen und Wärmepumpen."),
      revenueStreams: text("Selling heat.", "Wärmeverkauf."),
      operatorResponsibilities: text(""),
    },
    allocation: [
      {
        id: "gmw",
        stakeholder: text("GMW", "GMW"),
        investment: text("Not decided.", "Nicht entschieden."),
        risk: text("Unclear.", "Unklar."),
        benefit: text("Income from heat.", "Einnahmen aus Wärme."),
      },
      {
        id: "energy-company",
        stakeholder: text("Energy company (illustrative)", "Energieunternehmen (illustrativ)"),
        investment: text("The pipes.", "Die Leitungen."),
        risk: text("Unclear.", "Unklar."),
        benefit: text("New customers.", "Neue Kund*innen."),
      },
    ],
    assumptions: {
      connectionRate: text("Most neighbours (illustrative).", "Die meisten Nachbarn (illustrativ)."),
      tariffs: text("Cheaper than gas (illustrative).", "Günstiger als Gas (illustrativ)."),
      capex: text(""),
      financing: text(""),
      subsidies: text("Grants from the city.", "Förderungen der Stadt."),
    },
    criticalAssumptions: [
      {
        id: "enough-heat",
        statement: text("There is enough waste heat.", "Es gibt genug Abwärme."),
        validation: text(""),
      },
    ],
    risks: [
      {
        id: "street-works",
        title: text("Pipe construction in streets", "Leitungsbau in Straßen"),
        description: text("Streets have to be dug up.", "Straßen müssen aufgegraben werden."),
        dealBreaker: true,
        validation: text("Good planning.", "Gute Planung."),
      },
      {
        id: "interest",
        title: text("Low interest", "Geringes Interesse"),
        description: text("Neighbours may not want it.", "Die Nachbarn wollen es vielleicht nicht."),
        dealBreaker: false,
        validation: text(""),
      },
    ],
    refinements: {
      feedback: text(""),
      changes: text(""),
    },
    scalability: {
      geographical: text("Other markets.", "Andere Märkte."),
      economic: text(""),
      organisational: text(""),
    },
    nextSteps: {
      data: text("Measure the waste heat.", "Die Abwärme messen."),
      stakeholders: text("Talk to GMW.", "Mit GMW sprechen."),
      partnerships: text(""),
      pilots: text(""),
      decisions: text(""),
    },
  },
}
