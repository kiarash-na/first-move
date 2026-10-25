import { text } from "../types"
import { REFERENCE_CASE_CARDS } from "./catalog"
import type { ReferenceCase } from "./types"

/**
 * R3 · real · weak. Village im Dritten (Aspanggründe, 1030 Vienna). An honest early-stage write-up:
 * every statement is true, but it stays vague and leaves fields empty, although the developer and
 * Wien Energie published more (the docs page lists the full facts). Research log:
 * `docs/90_work/research/seed-dossier.md` § R3.
 */
export const villageImDritten: ReferenceCase = {
  ...REFERENCE_CASE_CARDS.villageImDritten,
  scenarioId: "custom",
  references: ["RC-ARE-VILLAGE-PROJECT", "RC-ARE-VILLAGE-ENERGY", "RC-ARE-VILLAGE-FOLDER", "RC-WIEN-ENERGIE-ZEC-2023"],
  site: {
    name: text("Village im Dritten (Aspanggründe)", "Village im Dritten (Aspanggründe)"),
    location: text("Landstraße, 1030 Vienna", "Landstraße, 1030 Wien"),
    siteType: text("New urban quarter on a large development site", "Neues Stadtquartier auf einem großen Entwicklungsgebiet"),
    ownership: text("ARE and other developers.", "ARE und weitere Bauträger."),
    units: text("About 2,000 flats plus offices, shops and schools", "Rund 2.000 Wohnungen plus Büros, Geschäfte und Schulen"),
    currentSupply: [text("Geothermal probes with heat pumps", "Erdwärmesonden mit Wärmepumpen"), text("District heating", "Fernwärme")],
    stakeholders: [text("ARE Austrian Real Estate", "ARE Austrian Real Estate"), text("Wien Energie", "Wien Energie"), text("Future residents", "Künftige Bewohner*innen")],
    partners: [text("Wien Energie", "Wien Energie")],
  },
  // 11.5 ha and the floor-area split (about 76 % housing) are published; one building per plot is
  // an estimate (docs page § Quick Check inputs).
  buildings: {
    total: 22,
    areaM2: 115_000,
    shares: { residential: { "2011_today": 76 }, category_a: { "2011_today": 24 } },
  },
  sources: { potentials: { geothermal: "high" }, pv: true },
  businessPlan: {
    opportunity: {
      customerSegments: text("Future residents and businesses of the new quarter.", "Künftige Bewohner*innen und Betriebe des neuen Quartiers."),
      needs: text("Heating and cooling for a big new quarter.", "Heizen und Kühlen für ein großes neues Quartier."),
      heatSources: text("Geothermal probes and solar power.", "Erdwärmesonden und Sonnenstrom."),
      painPoint: text("Vienna wants to move away from gas.", "Wien will weg vom Gas."),
      alternatives: text("Normal heating systems.", "Übliche Heizsysteme."),
      advantage: text("Anergy networks are innovative and climate-friendly.", "Anergienetze sind innovativ und klimafreundlich."),
    },
    canvas: {
      keyPartners: text("ARE and Wien Energie.", "ARE und Wien Energie."),
      keyActivities: text("Build the quarter and the energy system.", "Quartier und Energiesystem bauen."),
      keyResources: text("500 geothermal probes.", "500 Erdwärmesonden."),
      valueProposition: text("Green heating and cooling for the quarter.", "Grünes Heizen und Kühlen für das Quartier."),
      customerRelationships: text(""),
      channels: text("Marketing of the flats.", "Vermarktung der Wohnungen."),
      customerSegments: text("Residents.", "Bewohner*innen."),
      costStructure: text("Drilling and heat pumps; costs not known.", "Bohrungen und Wärmepumpen; Kosten nicht bekannt."),
      revenueStreams: text("Heat sales.", "Wärmeverkauf."),
      operatorResponsibilities: text("Not yet clear who owns and operates which part.", "Noch unklar, wem welcher Teil gehört und wer ihn betreibt."),
    },
    allocation: [
      {
        id: "are",
        stakeholder: text("ARE", "ARE"),
        investment: text("The buildings.", "Die Gebäude."),
        risk: text("Delays.", "Verzögerungen."),
        benefit: text("An attractive quarter.", "Ein attraktives Quartier."),
      },
      {
        id: "residents",
        stakeholder: text("Residents", "Bewohner*innen"),
        investment: text("Rent or purchase price.", "Miete oder Kaufpreis."),
        risk: text("Not assessed.", "Nicht bewertet."),
        benefit: text("Cooling in summer.", "Kühlung im Sommer."),
      },
    ],
    assumptions: {
      connectionRate: text("All buildings.", "Alle Gebäude."),
      tariffs: text("Market prices.", "Marktpreise."),
      capex: text("High.", "Hoch."),
      financing: text(""),
      subsidies: text("Maybe available.", "Eventuell verfügbar."),
    },
    criticalAssumptions: [
      {
        id: "ground",
        statement: text("There is enough heat in the ground.", "Im Erdreich ist genug Wärme."),
        validation: text("Later.", "Später."),
      },
    ],
    risks: [
      {
        id: "delays",
        title: text("Construction delays", "Bauverzögerungen"),
        description: text("A large project could be delayed.", "Ein großes Projekt könnte sich verzögern."),
        dealBreaker: true,
        validation: text("Project management.", "Projektmanagement."),
      },
      {
        id: "costs",
        title: text("Costs", "Kosten"),
        description: text("Costs could be higher than expected.", "Die Kosten könnten höher ausfallen als erwartet."),
        dealBreaker: false,
        validation: text("Monitor.", "Beobachten."),
      },
    ],
    refinements: {
      feedback: text(""),
      changes: text(""),
    },
    scalability: {
      geographical: text("Other new quarters.", "Andere neue Quartiere."),
      economic: text(""),
      organisational: text("Same partners.", "Dieselben Partner."),
    },
    nextSteps: {
      data: text("Collect more data.", "Mehr Daten sammeln."),
      stakeholders: text("Talk to the partners.", "Mit den Partnern sprechen."),
      partnerships: text("Continue with Wien Energie.", "Mit Wien Energie weitermachen."),
      pilots: text(""),
      decisions: text("To be decided.", "Wird noch entschieden."),
    },
  },
}
