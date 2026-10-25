import { text } from "../types"
import { REFERENCE_CASE_CARDS } from "./catalog"
import type { ReferenceCase } from "./types"

/**
 * R2 · real · middling. Kraftwerk Seebogen on plot H6, Seestadt Aspern (1220 Vienna). Every stated
 * fact is from the city's project page or the area developer's own publication; the gaps
 * (ownership, operator, prices, financing, decision gate) are honest gaps, which is what makes the
 * plan middling. Research log: `docs/90_work/research/seed-dossier.md` § R2.
 */
export const kraftwerkSeebogen: ReferenceCase = {
  ...REFERENCE_CASE_CARDS.kraftwerkSeebogen,
  scenarioId: "custom",
  references: ["RC-WIEN-SEEBOGEN", "RC-ASPERN-SEEBOGEN-2022", "RC-ANERGIEURBAN", "RC-WIEN-ANERGY-GRANT", "RC-KRANZL-2026-PAPER"],
  site: {
    name: text(
      "Kraftwerk Seebogen, quarter Am Seebogen (plot H6), Seestadt Aspern",
      "Kraftwerk Seebogen, Quartier Am Seebogen (Bauplatz H6), Seestadt Aspern",
    ),
    location: text(
      "Plot H6 between the metro line and Sonnenallee, Mela-Köhler-Straße to the north and Eileen-Gray-Gasse to the south, 1220 Vienna (Donaustadt)",
      "Bauplatz H6 zwischen U-Bahn und Sonnenallee, Mela-Köhler-Straße im Norden und Eileen-Gray-Gasse im Süden, 1220 Wien (Donaustadt)",
    ),
    siteType: text(
      "New-build block with housing and businesses in an urban development area",
      "Neubau-Block mit Wohnen und Gewerbe in einem Stadtentwicklungsgebiet",
    ),
    ownership: text(
      "Five developers share plot H6 and most of the energy system; their names and their mix of rental and owned flats are not on the city's project page. The commercial yard of the Vienna Business Agency on the same plot uses district heating instead.",
      "Fünf Bauträger teilen sich den Bauplatz H6 und großteils das Energiesystem; ihre Namen und ihr Mix aus Miet- und Eigentumswohnungen stehen nicht auf der Projektseite der Stadt. Der Gewerbehof der Wirtschaftsagentur Wien am selben Bauplatz nutzt stattdessen Fernwärme.",
    ),
    units: text(
      "About 270 flats and about 250 workplaces; nearly 20,000 m² of new floor area",
      "Rund 270 Wohnungen und rund 250 Arbeitsplätze; knapp 20.000 m² neue Nutzfläche",
    ),
    currentSupply: [
      text("Anergy loop with 2 probe fields, 92 boreholes of 150 m", "Anergienetz mit 2 Sondenfeldern, 92 Bohrungen zu je 150 m"),
      text("Heat pumps in each connected building", "Wärmepumpen in jedem angeschlossenen Gebäude"),
      text("Outdoor air and waste heat from a supermarket branch and other spaces", "Außenluft und Abwärme einer Supermarktfiliale und weiterer Räume"),
      text("4 rooftop PV systems", "4 Dach-Photovoltaikanlagen"),
      text("District heating (only the commercial yard of the Vienna Business Agency)", "Fernwärme (nur der Gewerbehof der Wirtschaftsagentur Wien)"),
    ],
    stakeholders: [
      text("Five developers on plot H6", "Fünf Bauträger am Bauplatz H6"),
      text("Residents of about 270 flats", "Bewohner*innen von rund 270 Wohnungen"),
      text("Businesses with about 250 workplaces in production, crafts and services", "Betriebe mit rund 250 Arbeitsplätzen in Produktion, Handwerk und Dienstleistung"),
      text("Supermarket branch, also a heat source", "Supermarktfiliale, zugleich Wärmequelle"),
      text("Wien 3420 aspern Development AG (area developer)", "Wien 3420 aspern Development AG (Gebietsentwicklerin)"),
    ],
    partners: [
      text("beyond carbon energy (built the plant)", "beyond carbon energy (hat die Anlage gebaut)"),
      text("Owners of the 4 rooftop PV systems", "Eigentümer*innen der 4 Dach-PV-Anlagen"),
    ],
  },
  // Building count and plot area are not public: estimates (docs page § Quick Check inputs).
  buildings: {
    total: 5,
    areaM2: 10_000,
    shares: { residential: { "2011_today": 80 }, category_a: { "2011_today": 20 } },
  },
  // The city's page states about 1,600 MWh/a of space heating; hot water and cooling are not
  // public, so heating is understated and cooling is estimated.
  manualDemand: { heatingKwhPerYear: 1_600_000, coolingKwhPerYear: null },
  sources: { potentials: { geothermal: "high", waste_heat: "medium", ambient_air: "medium" }, pv: true },
  businessPlan: {
    opportunity: {
      customerSegments: text(
        "Residents of about 270 flats and about 250 workplaces in production, crafts and services, all in one block shared by five developers.",
        "Bewohner*innen von rund 270 Wohnungen und rund 250 Arbeitsplätze in Produktion, Handwerk und Dienstleistung, alle in einem Block, den sich fünf Bauträger teilen.",
      ),
      needs: text(
        "Space heating of about 1,600 MWh/a, plus hot water and summer cooling; the latter two are not quantified publicly.",
        "Raumwärme von rund 1.600 MWh/a, dazu Warmwasser und Kühlung im Sommer; die beiden letzten sind öffentlich nicht beziffert.",
      ),
      heatSources: text(
        "Two independent probe fields with 92 boreholes of 150 m used as a seasonal store; outdoor air; waste heat from a supermarket branch and from other commercial and residential spaces.",
        "Zwei unabhängige Sondenfelder mit 92 Bohrungen zu je 150 m als saisonaler Speicher; Außenluft; Abwärme einer Supermarktfiliale sowie weiterer Gewerbe- und Wohnräume.",
      ),
      painPoint: text(
        "Without a shared system, five developers on one plot would plan five separate systems, and the supermarket's waste heat would go to the air (our reasoning, not from a source).",
        "Ohne gemeinsames System würden fünf Bauträger auf einem Bauplatz fünf getrennte Anlagen planen, und die Abwärme des Supermarkts ginge an die Luft (eigene Überlegung, nicht aus einer Quelle).",
      ),
      alternatives: text(
        "District heating, which the commercial yard on the same plot uses, or separate heat pumps per building (not assessed).",
        "Fernwärme, die der Gewerbehof am selben Bauplatz nutzt, oder getrennte Wärmepumpen pro Gebäude (nicht bewertet).",
      ),
      advantage: text(
        "The loop runs at 4 °C in spring to 16 °C in autumn with hardly any losses, can heat and cool at the same time and saves about 440 t of CO2 a year. The area developer reports that it costs residents no more than conventional systems.",
        "Das Netz läuft mit 4 °C im Frühjahr bis 16 °C im Herbst nahezu verlustfrei, kann gleichzeitig heizen und kühlen und spart rund 440 t CO2 pro Jahr. Laut Gebietsentwicklerin kostet es die Bewohner*innen nicht mehr als konventionelle Systeme.",
      ),
    },
    canvas: {
      keyPartners: text(
        "The five developers, beyond carbon energy as the plant builder, the supermarket as heat supplier and the owners of the four rooftop PV systems.",
        "Die fünf Bauträger, beyond carbon energy als Errichterin der Anlage, der Supermarkt als Wärmelieferant und die Eigentümer*innen der vier Dach-PV-Anlagen.",
      ),
      keyActivities: text(
        "Run two probe fields and the loop, balance heating and cooling, operate the building heat pumps and bill the users. Who does which part is not public.",
        "Zwei Sondenfelder und das Netz betreiben, Heizen und Kühlen ausgleichen, die Wärmepumpen der Gebäude betreiben und mit den Nutzer*innen abrechnen. Wer welchen Teil übernimmt, ist nicht öffentlich.",
      ),
      keyResources: text(
        "92 boreholes of 150 m, about 13.8 km of probes, the anergy loop, heat pumps in each building and 4 rooftop PV systems.",
        "92 Bohrungen zu je 150 m, rund 13,8 km Sonden, das Anergienetz, Wärmepumpen in jedem Gebäude und 4 Dach-PV-Anlagen.",
      ),
      valueProposition: text(
        "Fossil-free heating, hot water and cooling for a mixed block, at no higher cost to residents than conventional systems.",
        "Fossilfreie Wärme, Warmwasser und Kühlung für einen gemischten Block, für die Bewohner*innen nicht teurer als konventionelle Systeme.",
      ),
      customerRelationships: text(
        "Long-term supply to the developers and their residents; the contract form is not public.",
        "Langfristige Versorgung der Bauträger und ihrer Bewohner*innen; die Vertragsform ist nicht öffentlich.",
      ),
      channels: text("The developers' sales and letting; aspern Seestadt communication.", "Verkauf und Vermietung der Bauträger; Kommunikation der Seestadt Aspern."),
      customerSegments: text(
        "Housing developers and residents, commercial users, and the supermarket as both customer and source.",
        "Wohnbauträger und Bewohner*innen, gewerbliche Nutzer*innen und der Supermarkt als Kunde und Quelle zugleich.",
      ),
      costStructure: text(
        "Drilling, loop, building heat pumps, electricity and maintenance; the amounts are not public. Rough check: 13,800 m of probes at €50 to €65 per m is about €0.7 to €0.9 m for drilling alone (AnergieUrban prices, 2020).",
        "Bohrungen, Netz, Wärmepumpen in den Gebäuden, Strom und Wartung; die Beträge sind nicht öffentlich. Grobe Prüfung: 13.800 m Sonden zu 50 bis 65 € pro m ergeben rund 0,7 bis 0,9 Mio. € allein für die Bohrungen (Preise AnergieUrban, 2020).",
      ),
      revenueStreams: text("Heat and cooling prices paid by the users; structure and prices are not public.", "Wärme- und Kältepreise der Nutzer*innen; Struktur und Preise sind nicht öffentlich."),
      operatorResponsibilities: text(
        "beyond carbon energy built the plant. Public sources do not say who owns the probes, the loop and the heat pumps or who operates them.",
        "beyond carbon energy hat die Anlage gebaut. Öffentliche Quellen sagen nicht, wem Sonden, Netz und Wärmepumpen gehören und wer sie betreibt.",
      ),
    },
    allocation: [
      {
        id: "developers",
        stakeholder: text("Five developers", "Fünf Bauträger"),
        investment: text("Building heat pumps and a share of the shared plant (split not public).", "Wärmepumpen in den Gebäuden und ein Anteil an der gemeinsamen Anlage (Aufteilung nicht öffentlich)."),
        risk: text("They depend on one shared system and on each other.", "Sie hängen von einem gemeinsamen System und voneinander ab."),
        benefit: text("No separate heating plants and a fossil-free selling point.", "Keine getrennten Heizanlagen und ein fossilfreies Verkaufsargument."),
      },
      {
        id: "operator",
        stakeholder: text("Plant builder and operator", "Errichter und Betreiber der Anlage"),
        investment: text("Probe fields and loop (amount not public).", "Sondenfelder und Netz (Betrag nicht öffentlich)."),
        risk: text("Ground balance and demand over decades.", "Erdreichbilanz und Nachfrage über Jahrzehnte."),
        benefit: text("Long-term supply revenue (assumed).", "Langfristige Erlöse aus der Versorgung (angenommen)."),
      },
      {
        id: "supermarket",
        stakeholder: text("Supermarket", "Supermarkt"),
        investment: text("The heat-recovery connection (assumed).", "Der Anschluss für die Wärmerückgewinnung (angenommen)."),
        risk: text("Low.", "Gering."),
        benefit: text("Its waste heat is used instead of released to the air.", "Seine Abwärme wird genutzt statt an die Luft abgegeben."),
      },
    ],
    assumptions: {
      connectionRate: text(
        "All buildings on H6 except the district-heated commercial yard are connected.",
        "Alle Gebäude am Bauplatz H6 außer dem fernwärmeversorgten Gewerbehof sind angeschlossen.",
      ),
      tariffs: text(
        "Not public; the area developer states there is no extra cost for residents. For screening, the Quick Check defaults could be used (€0.12 per kWh of heat, €0.08 per kWh of cooling).",
        "Nicht öffentlich; laut Gebietsentwicklerin entstehen den Bewohner*innen keine Mehrkosten. Für ein Screening ließen sich die Standardwerte des Quick Check verwenden (0,12 € pro kWh Wärme, 0,08 € pro kWh Kälte).",
      ),
      capex: text(
        "Not public; drilling alone is about €0.7 to €0.9 m (13,800 m at €50 to €65 per m, 2020 prices).",
        "Nicht öffentlich; allein die Bohrungen kosten rund 0,7 bis 0,9 Mio. € (13.800 m zu 50 bis 65 € pro m, Preise 2020).",
      ),
      financing: text("Not public.", "Nicht öffentlich."),
      subsidies: text(
        "Not public. The city's 2024/25 anergy grant would not apply to a network of new buildings only, because it needs at least one existing building.",
        "Nicht öffentlich. Die Anergienetz-Förderung der Stadt 2024/25 käme für ein reines Neubaunetz nicht in Frage, weil sie mindestens ein Bestandsgebäude verlangt.",
      ),
    },
    criticalAssumptions: [
      {
        id: "ground-balance",
        statement: text(
          "The ground store stays balanced with about 1,600 MWh/a of heating, plus cooling and air regeneration.",
          "Der Erdspeicher bleibt bei rund 1.600 MWh/a Heizwärme samt Kühlung und Regeneration über Luft im Gleichgewicht.",
        ),
        validation: text("Ask the operator for probe temperatures since 2022.", "Beim Betreiber die Sondentemperaturen seit 2022 erfragen."),
      },
      {
        id: "supermarket",
        statement: text("The supermarket keeps operating and delivering waste heat.", "Der Supermarkt bleibt in Betrieb und liefert weiter Abwärme."),
        validation: text("Check the supermarket's lease term.", "Die Mietdauer des Supermarkts prüfen."),
      },
    ],
    risks: [
      {
        id: "developers-disagree",
        title: text("Five developers disagree", "Fünf Bauträger sind uneinig"),
        description: text(
          "Changes, cost splits or extensions need all five owners; the governance is not public.",
          "Änderungen, Kostenaufteilung oder Erweiterungen brauchen alle fünf Eigentümer; die Steuerung ist nicht öffentlich.",
        ),
        dealBreaker: true,
        validation: text("Review the shared-system agreement (not yet seen).", "Die Vereinbarung über das gemeinsame System prüfen (noch nicht eingesehen)."),
      },
      {
        id: "supermarket-leaves",
        title: text("Supermarket leaves", "Supermarkt zieht aus"),
        description: text("One waste-heat source would be lost.", "Eine Abwärmequelle ginge verloren."),
        dealBreaker: false,
        validation: text("Outdoor air is already a second source.", "Außenluft ist bereits eine zweite Quelle."),
      },
    ],
    refinements: {
      feedback: text(
        "No expert feedback is recorded yet; an internal review found that the cost split and the prices are missing.",
        "Noch kein Feedback von Expert*innen dokumentiert; eine interne Durchsicht ergab, dass Kostenaufteilung und Preise fehlen.",
      ),
      changes: text(
        "Add a cost key (the source by connected load, the pipes by their users) before proposing the model for other plots.",
        "Einen Kostenschlüssel ergänzen (die Quelle nach Anschlussleistung, die Leitungen nach ihren Nutzer*innen), bevor das Modell für andere Bauplätze vorgeschlagen wird.",
      ),
    },
    scalability: {
      geographical: text(
        "Other development plots shared by several developers, in Seestadt and elsewhere in Vienna.",
        "Andere Bauplätze mit mehreren Bauträgern, in der Seestadt und anderswo in Wien.",
      ),
      economic: text(
        "Depends on drilling costs and on extra sources such as waste heat (TU Wien, 2026).",
        "Hängt von den Bohrkosten und von zusätzlichen Quellen wie Abwärme ab (TU Wien, 2026).",
      ),
      organisational: text(
        "A plot-level shared energy system could become a standard for plots with several developers; details still to be worked out.",
        "Ein gemeinsames Energiesystem pro Bauplatz könnte Standard für Bauplätze mit mehreren Bauträgern werden; Details sind noch auszuarbeiten.",
      ),
    },
    nextSteps: {
      data: text("Operating data since 2022: heat, cooling, electricity and probe temperatures.", "Betriebsdaten seit 2022: Wärme, Kälte, Strom und Sondentemperaturen."),
      stakeholders: text("The five developers, the operator, the supermarket and the area developer.", "Die fünf Bauträger, der Betreiber, der Supermarkt und die Gebietsentwicklerin."),
      partnerships: text("Talk to the developers of the next Seestadt plots.", "Mit den Bauträgern der nächsten Bauplätze in der Seestadt sprechen."),
      pilots: text("Not defined.", "Nicht festgelegt."),
      decisions: text("Whether to replicate the model; no criteria or date yet.", "Ob das Modell übertragen wird; noch ohne Kriterien und Termin."),
    },
  },
}
