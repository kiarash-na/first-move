import { text } from "../types"
import { REFERENCE_CASE_CARDS } from "./catalog"
import { withFictionalDisclaimer, type ReferenceCase } from "./types"

/**
 * F2 · fictional · middling. A fictional summer heat loop anchored by the Ottakringer Bad
 * (Johann-Staud-Straße 11, 1160 Vienna). Only the pool facts are real (the city's pool page, the
 * Wien Geschichte Wiki, MA 20 district data); the supermarket, the housing and every figure that
 * is not a published fact are "(illustrative)". The plan is specific and partly quantified but
 * leaves the lifetime check, one validation and the decision date open, which is what makes it
 * middling. Research log: `docs/90_work/research/seed-dossier.md` § F2.
 */
export const ottakringerBad: ReferenceCase = {
  ...REFERENCE_CASE_CARDS.ottakringerBad,
  scenarioId: "custom",
  references: [
    "RC-WIEN-OTTAKRINGER-BAD",
    "RC-WGW-OTTAKRINGER-BAD",
    "RC-WIEN-ENERGIE-INFO-16",
    "RC-BISP-POOLS",
    "RC-KAMPEL-2014",
    "RC-WIEN-HALLENBAD-FLORIDSDORF",
    "RC-WIEN-SEEBOGEN",
    "RC-GIUNTA-SAWALHA-2021",
    "RC-UFI-MIKRONETZE",
  ],
  site: {
    name: text("Ottakringer Bad summer heat loop (fictional plan)", "Sommerwärmenetz Ottakringer Bad (fiktiver Plan)"),
    location: text(
      "Johann-Staud-Straße 11, 1160 Vienna (Ottakring): the pool and its neighbours (the neighbours are illustrative)",
      "Johann-Staud-Straße 11, 1160 Wien (Ottakring): das Bad und seine Nachbarn (die Nachbarn sind illustrativ)",
    ),
    siteType: text(
      "Residential district: a municipal indoor and outdoor pool next to housing and a supermarket (the neighbours are illustrative)",
      "Wohngebiet: ein städtisches Hallen- und Freibad neben Wohnbauten und einem Supermarkt (die Nachbarn sind illustrativ)",
    ),
    ownership: withFictionalDisclaimer(
      "The Ottakringer Bad is a combined indoor and outdoor pool of the City of Vienna (Wiener Bäder). The supermarket and the 3 rental housing blocks of this plan are illustrative; their owners are not named.",
      "Das Ottakringer Bad ist ein Kombibad der Stadt Wien (Wiener Bäder) mit Hallen- und Freibad. Der Supermarkt und die 3 Miethäuser in diesem Plan sind illustrativ; ihre Eigentümer*innen werden nicht genannt.",
    ),
    units: text(
      "5 buildings: the pool, 1 supermarket and 3 housing blocks with about 240 flats (neighbours illustrative)",
      "5 Gebäude: das Bad, 1 Supermarkt und 3 Wohnblöcke mit rund 240 Wohnungen (Nachbarn illustrativ)",
    ),
    currentSupply: [
      text("Pool: supply not stated in the sources checked", "Bad: Versorgung in den geprüften Quellen nicht genannt"),
      text("Housing: gas boilers (illustrative)", "Wohnbauten: Gaskessel (illustrativ)"),
      text(
        "Ottakring: about 3,380 buildings on gas and about 180 on district heating (MA 20, 2024)",
        "Ottakring: rund 3.380 Gebäude mit Gas und rund 180 mit Fernwärme (MA 20, 2024)",
      ),
    ],
    stakeholders: [
      text("City of Vienna, Wiener Bäder: owner and operator of the pool", "Stadt Wien, Wiener Bäder: Eigentümerin und Betreiberin des Bades"),
      text("Supermarket operator (illustrative)", "Supermarktbetreiber (illustrativ)"),
      text("Housing owner (illustrative)", "Wohnhauseigentümer*in (illustrativ)"),
      text("Tenants of about 240 flats (illustrative)", "Mieter*innen von rund 240 Wohnungen (illustrativ)"),
    ],
    partners: [
      text("An energy-services company, not yet chosen (illustrative)", "Ein Energiedienstleister, noch nicht ausgewählt (illustrativ)"),
      text("A planning office (illustrative)", "Ein Planungsbüro (illustrativ)"),
    ],
  },
  // The pool is one building (the city's page); neighbours, project area and loop length are
  // illustrative (docs page § Quick Check inputs).
  buildings: {
    total: 5,
    areaM2: 40_000,
    shares: { category_c: { "1961_1990": 20 }, category_a: { "1991_2010": 20 }, residential: { "1919_1960": 60 } },
  },
  sources: { potentials: { waste_heat: "medium", geothermal: "medium" }, pv: false },
  networkLengthM: 700,
  businessPlan: {
    opportunity: {
      customerSegments: text(
        "The anchor is the Ottakringer Bad, a combined pool of the City of Vienna whose outdoor pool is open from 2 May to mid-September. Built in 1926 as Vienna's first outdoor pool that could warm its water, it gained an indoor pool from 1971 (Wien Geschichte Wiki). Neighbours in this plan: 3 rental housing blocks with about 240 flats and a supermarket (illustrative).",
        "Ankerkunde ist das Ottakringer Bad, ein Kombibad der Stadt Wien, dessen Freibad vom 2. Mai bis Mitte September offen hat. 1926 als erstes Wiener Freibad errichtet, das sein Wasser vorwärmen konnte, erhielt es ab 1971 ein Hallenbad (Wien Geschichte Wiki). Nachbarn in diesem Plan: 3 Miethäuser mit rund 240 Wohnungen und ein Supermarkt (illustrativ).",
      ),
      needs: text(
        "Outdoor pool: about 1.0 GWh/a in the season, from 0.3 to 0.7 MWh per m² of water area and year (BISp, 2002) and an assumed 2,000 m² of water (illustrative; the area is not published). Housing: 15,000 m² × 131.5 kWh/m²a = about 2.0 GWh/a (Quick Check Table 1, 1919 to 1960). The indoor pool needs 3 to 7 MWh per m² of water area and year (BISp, 2002) but is not yet part of the plan.",
        "Freibad: rund 1,0 GWh/a in der Saison, aus 0,3 bis 0,7 MWh pro m² Wasserfläche und Jahr (BISp, 2002) und angenommenen 2.000 m² Wasserfläche (illustrativ; die Fläche ist nicht veröffentlicht). Wohnbauten: 15.000 m² × 131,5 kWh/m²a = rund 2,0 GWh/a (Quick Check, Tabelle 1, 1919 bis 1960). Das Hallenbad braucht 3 bis 7 MWh pro m² Wasserfläche und Jahr (BISp, 2002), ist aber noch nicht Teil des Plans.",
      ),
      heatSources: text(
        "Waste heat from the supermarket's refrigeration, about 0.3 GWh/a (illustrative, not measured), used directly in the outdoor pool in summer; heat recovery from supermarket CO2 refrigeration for heat networks is studied by Giunta and Sawalha (2021), and Kraftwerk Seebogen in Vienna already uses supermarket waste heat. Geothermal probes for the housing in winter; number and space not yet checked.",
        "Abwärme der Supermarkt-Kühlung, rund 0,3 GWh/a (illustrativ, nicht gemessen), im Sommer direkt im Freibad genutzt; die Wärmerückgewinnung aus CO2-Kälteanlagen von Supermärkten für Wärmenetze untersuchen Giunta und Sawalha (2021), und das Kraftwerk Seebogen in Wien nutzt bereits Supermarkt-Abwärme. Erdwärmesonden für die Wohnbauten im Winter; Anzahl und Platz noch nicht geprüft.",
      ),
      painPoint: text(
        "In summer the supermarket releases its refrigeration heat to the air while the outdoor pool needs heat; in winter the housing burns gas, like about 3,380 buildings in Ottakring (illustrative for this site).",
        "Im Sommer gibt der Supermarkt die Wärme seiner Kühlung an die Luft ab, während das Freibad Wärme braucht; im Winter heizen die Wohnbauten mit Gas, wie rund 3.380 Gebäude in Ottakring (für diesen Standort illustrativ).",
      ),
      alternatives: text(
        "Solar absorbers for the outdoor pool, heat recovery in the pool itself (the most efficient pools recover heat from outgoing water and air with heat exchangers and heat pumps, Kampel et al., 2014), or separate heat pumps per housing block.",
        "Solarabsorber für das Freibad, Wärmerückgewinnung im Bad selbst (die effizientesten Bäder gewinnen mit Wärmetauschern und Wärmepumpen Wärme aus Abwasser und Abluft zurück, Kampel et al., 2014) oder getrennte Wärmepumpen pro Wohnblock.",
      ),
      advantage: text(
        "The supermarket's waste heat peaks in summer, when the outdoor pool needs heat, so it can be used without seasonal storage (illustrative). The loop is short, about 700 m.",
        "Die Abwärme des Supermarkts ist im Sommer am höchsten, wenn das Freibad Wärme braucht, und lässt sich ohne saisonalen Speicher nutzen (illustrativ). Das Netz ist kurz, rund 700 m.",
      ),
    },
    canvas: {
      keyPartners: text(
        "Wiener Bäder as the pool operator, the supermarket operator, the housing owner and an energy-services company (all illustrative except the pool).",
        "Wiener Bäder als Betreiberin des Bades, der Supermarktbetreiber, die Wohnhauseigentümer*in und ein Energiedienstleister (alle außer dem Bad illustrativ).",
      ),
      keyActivities: text(
        "Build a 700 m loop, connect the supermarket's condensers, install a heat exchanger in the outdoor-pool circuit and heat pumps in the housing blocks, then operate and bill.",
        "Ein Netz von 700 m bauen, die Verflüssiger des Supermarkts anbinden, einen Wärmetauscher im Freibadkreislauf und Wärmepumpen in den Wohnblöcken einbauen, dann betreiben und abrechnen.",
      ),
      keyResources: text(
        "The supermarket's refrigeration heat, space for probes and a plant room at the pool (illustrative; none of them checked).",
        "Die Wärme der Supermarkt-Kühlung, Platz für Sonden und ein Technikraum im Bad (illustrativ; nichts davon geprüft).",
      ),
      valueProposition: text(
        "Cheaper heat for the outdoor pool in summer, a way out of gas for the housing and lower cooling costs for the supermarket (illustrative).",
        "Günstigere Wärme für das Freibad im Sommer, ein Weg aus dem Gas für die Wohnbauten und geringere Kühlkosten für den Supermarkt (illustrativ).",
      ),
      customerRelationships: text(
        "Long-term supply contracts with the pool and the housing owner; length and price formula are not yet set.",
        "Langfristige Lieferverträge mit dem Bad und der Wohnhauseigentümer*in; Laufzeit und Preisformel sind noch offen.",
      ),
      channels: text(
        "Direct talks with Wiener Bäder, the supermarket and the housing owner; an information letter for tenants (illustrative).",
        "Direkte Gespräche mit Wiener Bäder, dem Supermarkt und der Wohnhauseigentümer*in; ein Informationsschreiben für die Mieter*innen (illustrativ).",
      ),
      customerSegments: text(
        "A municipal pool, rental housing and a supermarket as both heat source and customer (neighbours illustrative).",
        "Ein städtisches Bad, Mietwohnungen und ein Supermarkt als Wärmequelle und Kunde zugleich (Nachbarn illustrativ).",
      ),
      costStructure: text(
        "Loop 700 m × €500 per m = €0.35 m; probes about €2.3 m at the Quick Check default of €1.50 per kWh/a for about 1.5 GWh/a; heat pumps and the pool heat exchanger are not yet costed. No quotes yet.",
        "Netz 700 m × 500 € pro m = 0,35 Mio. €; Sonden rund 2,3 Mio. € zum Standardwert des Quick Check von 1,50 € pro kWh/a für rund 1,5 GWh/a; Wärmepumpen und Wärmetauscher im Bad sind noch nicht bepreist. Noch keine Angebote.",
      ),
      revenueStreams: text(
        "Heat sales at the Quick Check defaults, €6 per m² and year plus €0.12 per kWh, and connection fees of €1,000 per building; the price for the pool is still open.",
        "Wärmeverkauf zu den Standardwerten des Quick Check, 6 € pro m² und Jahr plus 0,12 € pro kWh, und Anschlussgebühren von 1.000 € pro Gebäude; der Preis für das Bad ist noch offen.",
      ),
      operatorResponsibilities: text(
        "An energy-services company would own and run the loop, the probes and the heat pumps up to each building's heat meter. Who owns the connection at the supermarket's condensers is still open.",
        "Ein Energiedienstleister besäße und betriebe Netz, Sonden und Wärmepumpen bis zum Wärmezähler jedes Gebäudes. Wem der Anschluss an den Verflüssigern des Supermarkts gehört, ist noch offen.",
      ),
    },
    allocation: [
      {
        id: "pool",
        stakeholder: text("City of Vienna, Wiener Bäder (pool, anchor)", "Stadt Wien, Wiener Bäder (Bad, Anker)"),
        investment: text(
          "A heat exchanger in the outdoor-pool circuit (illustrative; cost not yet known).",
          "Ein Wärmetauscher im Freibadkreislauf (illustrativ; Kosten noch unbekannt).",
        ),
        risk: text("Weather and the length of the season change the heat demand.", "Wetter und Saisonlänge verändern den Wärmebedarf."),
        benefit: text("Lower heating costs for the outdoor pool (not yet calculated).", "Geringere Heizkosten für das Freibad (noch nicht berechnet)."),
      },
      {
        id: "supermarket",
        stakeholder: text("Supermarket (illustrative)", "Supermarkt (illustrativ)"),
        investment: text("Heat recovery on its refrigeration (cost not yet known).", "Wärmerückgewinnung an der Kühlung (Kosten noch unbekannt)."),
        risk: text("A refit or closure of the store.", "Ein Umbau oder die Schließung der Filiale."),
        benefit: text("Lower cooling costs and a small heat revenue (illustrative).", "Geringere Kühlkosten und kleine Wärmeerlöse (illustrativ)."),
      },
      {
        id: "housing",
        stakeholder: text("Housing owner (illustrative)", "Wohnhauseigentümer*in (illustrativ)"),
        investment: text(
          "A €1,000 connection fee per building (Quick Check default) and checks of the radiators.",
          "Eine Anschlussgebühr von 1.000 € pro Gebäude (Standardwert des Quick Check) und eine Prüfung der Heizkörper.",
        ),
        risk: text("Tenants' heating costs must not rise.", "Die Heizkosten der Mieter*innen dürfen nicht steigen."),
        benefit: text("A way out of gas without its own heat source.", "Ein Weg aus dem Gas ohne eigene Wärmequelle."),
      },
    ],
    assumptions: {
      connectionRate: text(
        "The pool, the supermarket and all 3 housing blocks join, 100 % of the planned heat; no sensitivity yet.",
        "Das Bad, der Supermarkt und alle 3 Wohnblöcke machen mit, 100 % der geplanten Wärme; noch keine Sensitivität.",
      ),
      tariffs: text(
        "Quick Check defaults for heat, €6 per m² and year plus €0.12 per kWh; not yet compared with the housing's current gas costs or the pool's current heat costs.",
        "Standardwerte des Quick Check für Wärme, 6 € pro m² und Jahr plus 0,12 € pro kWh; noch nicht mit den heutigen Gaskosten der Wohnbauten oder den Wärmekosten des Bades verglichen.",
      ),
      capex: text(
        "About €2.7 m for the loop and the probes (Quick Check defaults); heat pumps and the pool heat exchanger come on top.",
        "Rund 2,7 Mio. € für Netz und Sonden (Standardwerte des Quick Check); Wärmepumpen und der Wärmetauscher im Bad kommen dazu.",
      ),
      financing: text(
        "The city's budget for the pool's part and a bank loan for the loop (illustrative); not yet calculated over the lifetime.",
        "Das Budget der Stadt für den Teil des Bades und ein Bankkredit für das Netz (illustrativ); über die Laufzeit noch nicht berechnet.",
      ),
      subsidies: text(
        "The federal UFI programme pays up to 40 % for micro-networks with 2 to 9 external customers or under 800 MWh of heat sold a year, at most €6 m per project. For waste heat UFI counts only heat sold under 800 MWh/a, not the number of customers, and this plan would sell about 3 GWh/a (pool about 1.0, housing about 2.0), so it would not fit as planned; other grants are not yet checked.",
        "Die UFI des Bundes zahlt bis zu 40 % für Mikronetze mit 2 bis 9 externen Abnehmer*innen oder unter 800 MWh verkaufter Wärme pro Jahr, höchstens 6 Mio. € pro Projekt. Bei Abwärme zählt die UFI nur verkaufte Wärme unter 800 MWh/a, nicht die Zahl der Abnehmer*innen, und dieser Plan würde rund 3 GWh/a verkaufen (Bad rund 1,0, Wohnbauten rund 2,0); so geplant passt er daher nicht. Andere Förderungen sind noch nicht geprüft.",
      ),
    },
    criticalAssumptions: [
      {
        id: "supermarket-heat",
        statement: text(
          "The supermarket can deliver about 0.3 GWh/a of waste heat, most of it in summer (illustrative).",
          "Der Supermarkt kann rund 0,3 GWh/a Abwärme liefern, den Großteil im Sommer (illustrativ).",
        ),
        validation: text(
          "Ask the supermarket operator for the refrigeration capacity and one year of condenser data.",
          "Beim Supermarktbetreiber die Kälteleistung und ein Jahr Verflüssigerdaten anfragen.",
        ),
      },
      {
        id: "pool-demand",
        statement: text("The outdoor pool needs about 1.0 GWh/a in the season.", "Das Freibad braucht in der Saison rund 1,0 GWh/a."),
        validation: text(
          "Ask Wiener Bäder for the heat bills of the outdoor season and the water area.",
          "Bei Wiener Bäder die Wärmerechnungen der Freibadsaison und die Wasserfläche anfragen.",
        ),
      },
      {
        id: "probe-space",
        statement: text(
          "There is space for geothermal probes for the housing's winter heat.",
          "Es gibt Platz für Erdwärmesonden für die Winterwärme der Wohnbauten.",
        ),
        validation: text("Not yet defined.", "Noch nicht festgelegt."),
      },
    ],
    risks: [
      {
        id: "council",
        title: text("Council does not approve the pool investment", "Gemeinderat genehmigt die Investition im Bad nicht"),
        description: text(
          "Without the pool as anchor the loop has no summer customer for the supermarket's heat.",
          "Ohne das Bad als Anker hat das Netz keinen Sommerkunden für die Wärme des Supermarkts.",
        ),
        dealBreaker: true,
        validation: text(
          "Present the plan to the responsible city department; date not set.",
          "Den Plan der zuständigen Dienststelle der Stadt vorstellen; Termin offen.",
        ),
      },
      {
        id: "supermarket-leaves",
        title: text("Supermarket closes or refits", "Supermarkt schließt oder baut um"),
        description: text("The summer heat source would be lost.", "Die sommerliche Wärmequelle ginge verloren."),
        dealBreaker: false,
        validation: text(
          "Ask for a lease of at least 10 years, or plan a backup heat pump on the probes (illustrative).",
          "Einen Mietvertrag über mindestens 10 Jahre anstreben oder eine Reserve-Wärmepumpe an den Sonden einplanen (illustrativ).",
        ),
      },
      {
        id: "tenant-costs",
        title: text("Heating costs for tenants rise", "Heizkosten der Mieter*innen steigen"),
        description: text(
          "Prices for tenants are not yet compared with their gas costs.",
          "Die Preise für die Mieter*innen sind noch nicht mit ihren Gaskosten verglichen.",
        ),
        dealBreaker: false,
        validation: text(
          "Compare with 3 years of gas bills before any contract (illustrative).",
          "Vor jedem Vertrag mit den Gasrechnungen von 3 Jahren vergleichen (illustrativ).",
        ),
      },
    ],
    refinements: {
      feedback: text(
        "Illustrative feedback from a planner: the indoor pool is the bigger heat customer and belongs in the concept.",
        "Illustratives Feedback eines Planungsbüros: Das Hallenbad ist der größere Wärmekunde und gehört ins Konzept.",
      ),
      changes: text(
        "The indoor pool is noted as an option for phase 2; the plan is not yet recalculated.",
        "Das Hallenbad ist als Option für Phase 2 vermerkt; der Plan ist noch nicht neu gerechnet.",
      ),
    },
    scalability: {
      geographical: text(
        "Other combined pools of the City of Vienna next to housing and shops.",
        "Andere Kombibäder der Stadt Wien neben Wohnbauten und Geschäften.",
      ),
      economic: text(
        "Depends on the amount of waste heat and the length of the outdoor season. The renovated Hallenbad Floridsdorf cut its district-heat use by 95 % with heat pumps, PV and thermal renovation (City of Vienna).",
        "Hängt von der Abwärmemenge und der Länge der Freibadsaison ab. Das sanierte Hallenbad Floridsdorf senkte seinen Fernwärmeverbrauch mit Wärmepumpen, PV und thermischer Sanierung um 95 % (Stadt Wien).",
      ),
      organisational: text(
        "A standard contract between a pool, a supermarket and housing could be reused; not yet drafted.",
        "Ein Standardvertrag zwischen Bad, Supermarkt und Wohnbau ließe sich wiederverwenden; noch nicht entworfen.",
      ),
    },
    nextSteps: {
      data: text(
        "The pool's heat bills and water areas, the supermarket's refrigeration data and the housing's gas bills.",
        "Wärmerechnungen und Wasserflächen des Bades, Kältedaten des Supermarkts und Gasrechnungen der Wohnbauten.",
      ),
      stakeholders: text(
        "Wiener Bäder, the supermarket operator, the housing owner and the district council (illustrative).",
        "Wiener Bäder, der Supermarktbetreiber, die Wohnhauseigentümer*in und die Bezirksvertretung (illustrativ).",
      ),
      partnerships: text("Find an energy-services company; no tender yet.", "Einen Energiedienstleister finden; noch keine Ausschreibung."),
      pilots: text(
        "A summer pilot: supermarket heat into the outdoor pool for one season (illustrative); cost not yet estimated.",
        "Ein Sommerpilot: Supermarktwärme eine Saison lang ins Freibad (illustrativ); Kosten noch nicht geschätzt.",
      ),
      decisions: text(
        "A council decision on the anchor investment (timing open).",
        "Ein Gemeinderatsbeschluss über die Investition beim Anker (Zeitpunkt offen).",
      ),
    },
  },
}
