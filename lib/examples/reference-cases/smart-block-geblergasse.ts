import { text } from "../types"
import { REFERENCE_CASE_CARDS } from "./catalog"
import type { ReferenceCase } from "./types"

/**
 * R1 · real · strong. The anergy start cell of Geblergasse 11 and 13 (1170 Vienna). Facts come from
 * the Smart Block II final report (2017 design values), AnergieUrban (2020), the city's housing
 * portal, the anergy grant and UFI; validation, cost key, contracting set-up and decision gate are
 * our proposals, marked "(proposed)". Research log: `docs/90_work/research/seed-dossier.md` § R1.
 */
export const smartBlockGeblergasse: ReferenceCase = {
  ...REFERENCE_CASE_CARDS.smartBlockGeblergasse,
  scenarioId: "custom",
  references: [
    "RC-SMART-BLOCK-II",
    "RC-ANERGIEURBAN",
    "RC-SOCIALHOUSING-GEBLERGASSE",
    "RC-WIEN-ANERGY-GRANT",
    "RC-UFI-MIKRONETZE",
    "RC-WIENEU-STARTZELLEN",
    "RC-WIEN-WAERMEPLAN",
    "RC-KRANZL-2026-PAPER",
  ],
  site: {
    name: text("SMART BLOCK Geblergasse (Anergienetz 1170 Wien)", "SMART BLOCK Geblergasse (Anergienetz 1170 Wien)"),
    location: text(
      "Geblergasse 11 and 13, 1170 Vienna (Hernals); block of Geblergasse, Hernalser Gürtel, Ottakringer Straße and Veronikagasse",
      "Geblergasse 11 und 13, 1170 Wien (Hernals); Block Geblergasse, Hernalser Gürtel, Ottakringer Straße und Veronikagasse",
    ),
    siteType: text(
      "Dense Gründerzeit perimeter block, existing buildings with a shared courtyard",
      "Dichter Gründerzeit-Blockrand, Bestandsgebäude mit gemeinsamem Innenhof",
    ),
    ownership: text(
      "Two private rental houses, refurbished with support of the Wiener Wohnbaufonds; one owner is part of the research team. The block holds 18 properties with separate owners: 12 were unrenovated in 2017, and the study team reached the owners of half of them. Each house decides alone, and tenants' heating costs fall under tenancy law, so the owners set one condition: tenants pay no more than with district heating (Smart Block II final report, 2017).",
      "Zwei private Miethäuser, saniert mit Unterstützung des Wiener Wohnbaufonds; ein Eigentümer gehört zum Forschungsteam. Der Block umfasst 18 Liegenschaften mit eigenen Eigentümer*innen: 12 waren 2017 unsaniert, das Studienteam erreichte die Eigentümer*innen der Hälfte davon. Jedes Haus entscheidet allein, und die Heizkosten der Mieter*innen unterliegen dem Mietrecht. Die Eigentümer setzten deshalb eine Bedingung: Die Mieter*innen zahlen nicht mehr als mit Fernwärme (Endbericht Smart Block II, 2017).",
    ),
    units: text(
      "2 houses, 25 flats (16 + 9), 2,000 m² gross floor area; 18 properties in the block for later phases",
      "2 Häuser, 25 Wohnungen (16 + 9), 2.000 m² Bruttogeschoßfläche; 18 Liegenschaften im Block für spätere Phasen",
    ),
    currentSupply: [
      text(
        "Start cell, built from August 2018: geothermal probes, 2 × 54 m² hybrid solar collectors and one heat pump",
        "Startzelle, gebaut ab August 2018: Erdsonden, 2 × 54 m² Hybridkollektoren und eine Wärmepumpe",
      ),
      text("Gas condensing boiler as backup for the full 105 kW (design)", "Gas-Brennwerttherme als Reserve für die gesamten 105 kW (Planung)"),
      text("Gas storey heaters in about 65 % of the unrenovated block houses (2017)", "Gasetagenheizungen in rund 65 % der unsanierten Blockhäuser (2017)"),
      text("District heating in one block house (Ottakringer Straße 20)", "Fernwärme in einem Blockhaus (Ottakringer Straße 20)"),
    ],
    stakeholders: [
      text("Owners of Geblergasse 11 and 13 (core team)", "Eigentümer von Geblergasse 11 und 13 (Kernteam)"),
      text("Tenants of the 25 flats", "Mieter*innen der 25 Wohnungen"),
      text("Owners of the 16 other block properties", "Eigentümer*innen der 16 weiteren Liegenschaften im Block"),
      text("City of Vienna: MA 25 (grant) and MA 20 (energy planning)", "Stadt Wien: MA 25 (Förderung) und MA 20 (Energieplanung)"),
      text("Area renewal office (Gebietsbetreuung) as a possible moderator", "Gebietsbetreuung als mögliche Moderation"),
    ],
    partners: [
      text(
        "Smart Block II team: Burtscher-Durig ZT, ÖGUT, Komobile w7, M. Gruber, J. Zeininger",
        "Team Smart Block II: Burtscher-Durig ZT, ÖGUT, Komobile w7, M. Gruber, J. Zeininger",
      ),
      text("Technisches Büro Käferhaus (building services concept)", "Technisches Büro Käferhaus (Haustechnikkonzept)"),
      text("Klima- und Energiefonds (Smart Cities Demo funding)", "Klima- und Energiefonds (Förderung Smart Cities Demo)"),
      text("A heat-delivery contractor (proposed)", "Ein Wärmeliefer-Contractor (vorgeschlagen)"),
    ],
  },
  buildings: {
    total: 2,
    areaM2: 1_000,
    shares: { residential: { until_1919: 100 } },
  },
  // Published design values after renovation: space heat 90 + 67 MWh/a plus hot water 30 + 20
  // MWh/a (Smart Block II report). Cooling is not quantified, so the Quick Check estimates it.
  manualDemand: { heatingKwhPerYear: 207_000, coolingKwhPerYear: null },
  // Probes (8 × about 120 m planned, 62.5 kWh per m and year: about 60 MWh/a), PV-T heat and
  // outdoor air; PV-T also makes power. Potentials are estimates (docs page § Quick Check inputs).
  sources: { potentials: { geothermal: "medium", solar_thermal: "medium", ambient_air: "low" }, pv: true },
  businessPlan: {
    opportunity: {
      customerSegments: text(
        "Tenants of 25 flats (16 in No. 11, 9 in No. 13) who use heat, hot water and some cooling, with the two owners as contract partners. Expansion customers are the owners of the 16 other houses in the block, first those already planning works: Ottakringer Straße 18 (refurbishment) and Veronikagasse 36 (new building) (Smart Block II final report).",
        "Mieter*innen von 25 Wohnungen (16 in Nr. 11, 9 in Nr. 13), die Wärme, Warmwasser und etwas Kühlung nutzen; Vertragspartner sind die beiden Eigentümer. Erweiterungskunden sind die Eigentümer*innen der 16 anderen Häuser im Block, zuerst jene, die ohnehin bauen: Ottakringer Straße 18 (Sanierung) und Veronikagasse 36 (Neubau) (Endbericht Smart Block II).",
      ),
      needs: text(
        "Design values after renovation: space heat 90 + 67 MWh/a, hot water 30 + 20 MWh/a, heat load 60 + 45 kW (No. 11 + No. 13). Moderate summer cooling in No. 11 through the floor heating, about 3 weeks a year from 10:00 to 14:00. Unrenovated block houses need about 125 kWh/m²a of heat plus about 25 kWh/m²a of hot water (Smart Block II final report, 2017).",
        "Planwerte nach der Sanierung: Raumwärme 90 + 67 MWh/a, Warmwasser 30 + 20 MWh/a, Heizlast 60 + 45 kW (Nr. 11 + Nr. 13). Moderate Sommerkühlung in Nr. 11 über die Fußbodenheizung, rund 3 Wochen im Jahr von 10 bis 14 Uhr. Unsanierte Blockhäuser brauchen rund 125 kWh/m²a Wärme plus rund 25 kWh/m²a Warmwasser (Endbericht Smart Block II, 2017).",
      ),
      heatSources: text(
        "The ground under the courtyard as a seasonal store, planned with 8 boreholes of about 120 m; the drilled probes reached about 100 to 110 m (AnergieUrban expert survey). Two 54 m² hybrid PV-T roofs, outdoor air through an air-water exchanger down to about −5 °C, and one 110 kW heat pump that also makes summer cold.",
        "Das Erdreich unter dem Hof als saisonaler Speicher, geplant mit 8 Bohrungen zu rund 120 m; die gebohrten Sonden erreichten rund 100 bis 110 m (Expertenbefragung AnergieUrban). Zwei Dächer mit je 54 m² PVT-Hybridkollektoren, Außenluft über einen Luft-Wasser-Wärmetauscher bis rund −5 °C und eine Wärmepumpe mit 110 kW, die im Sommer auch Kälte erzeugt.",
      ),
      painPoint: text(
        "Gründerzeit houses lack central heating and space. Under current rules and costs, owners fit gas storey heaters, which locks in fossil heat for decades. A shared renewable plant costs about three times a gas central heating (Smart Block II final report).",
        "Gründerzeithäusern fehlen Zentralheizung und Platz. Unter den geltenden Regeln und Kosten bauen Eigentümer*innen Gasetagenheizungen ein und binden sich so für Jahrzehnte an fossile Wärme. Eine gemeinsame erneuerbare Anlage kostet rund das Dreifache einer Gaszentralheizung (Endbericht Smart Block II).",
      ),
      alternatives: text(
        "Gas central or storey heating, the cheapest up front. District heating, which Wien Energie put at about €60,000 per Gründerzeit house to connect. One heat pump per house, limited by courtyard space and small drilling rigs (AnergieUrban).",
        "Gaszentral- oder Gasetagenheizung, in der Anschaffung am günstigsten. Fernwärme, deren Anschluss Wien Energie mit rund 60.000 € pro Gründerzeithaus bezifferte. Eine Wärmepumpe pro Haus, begrenzt durch Hofgröße und kleine Bohrgeräte (AnergieUrban).",
      ),
      advantage: text(
        "Linking houses lets a house without drilling space store solar heat in the shared ground and take it back in winter. Over 20 years the full cost of heat, hot water and moderate cooling is about €10 per m² of usable floor area and year, the same as continuing with gas, and lower over a longer period (AnergieUrban, June 2018 prices).",
        "Durch die Verbindung kann ein Haus ohne Bohrfläche Solarwärme im gemeinsamen Erdreich speichern und im Winter zurückholen. Über 20 Jahre kosten Wärme, Warmwasser und moderate Kühlung rund 10 € pro m² Wohnnutzfläche und Jahr, gleich viel wie die Weiterführung der Gasheizung, über längere Zeit weniger (AnergieUrban, Preise Juni 2018).",
      ),
    },
    canvas: {
      keyPartners: text(
        "The two owners; a heat-delivery contractor that finances, builds and runs the plant (proposed, the model AnergieUrban recommends); the City of Vienna (MA 25 grant, MA 20 energy planning); the planners and ÖGUT, which developed the financing and business model in the EU project SEFIPA.",
        "Die beiden Eigentümer; ein Wärmeliefer-Contractor, der die Anlage finanziert, baut und betreibt (vorgeschlagen, das Modell, das AnergieUrban empfiehlt); die Stadt Wien (Förderung MA 25, Energieplanung MA 20); die Planer*innen und die ÖGUT, die im EU-Projekt SEFIPA das Finanzierungs- und Geschäftsmodell entwickelte.",
      ),
      keyActivities: text(
        "A joint tender and renovation of both houses; drilling and courtyard restoration; running the heat pump and the ground store so the yearly ground balance stays even; metering and billing; recruiting neighbours for phase 2 (proposed).",
        "Gemeinsame Ausschreibung und Sanierung beider Häuser; Bohrung und Wiederherstellung des Hofs; Betrieb von Wärmepumpe und Erdspeicher mit ausgeglichener Jahresbilanz; Messung und Abrechnung; Gewinnung von Nachbar*innen für Phase 2 (vorgeschlagen).",
      ),
      keyResources: text(
        "Courtyard land for probes, two roofs with PV-T collectors, the heat centre in No. 11 with a 2,000 l buffer, and pipe stubs already laid for further houses in the block (AnergieUrban).",
        "Hoffläche für die Sonden, zwei Dächer mit PVT-Kollektoren, die Heizzentrale in Nr. 11 mit 2.000-l-Puffer und bereits verlegte Leitungsanschlüsse für weitere Häuser im Block (AnergieUrban).",
      ),
      valueProposition: text(
        "Tenants get fossil-free heat, hot water and moderate cooling at no more than district-heating cost. Owners get a renovated house ready for the gas phase-out without running their own boiler. The block gets a start cell that neighbours can join step by step.",
        "Mieter*innen erhalten fossilfreie Wärme, Warmwasser und moderate Kühlung zu höchstens Fernwärmekosten. Eigentümer*innen erhalten ein saniertes Haus, bereit für den Gasausstieg, ohne eigenen Kessel. Der Block erhält eine Startzelle, der sich Nachbar*innen Schritt für Schritt anschließen können.",
      ),
      customerRelationships: text(
        "A long-term heat-delivery contract between the contractor and the owners, with a fixed price per unit of heat as in district heating (proposed). The 2017 plan foresaw a one-off construction-cost contribution by the owners, sized so that tenant costs stay at district-heating level.",
        "Ein langfristiger Wärmeliefervertrag zwischen Contractor und Eigentümern mit festem Preis pro Wärmeeinheit wie bei der Fernwärme (vorgeschlagen). Der Plan von 2017 sah einen einmaligen Baukostenzuschuss der Eigentümer vor, bemessen so, dass die Kosten der Mieter*innen auf Fernwärmeniveau bleiben.",
      ),
      channels: text(
        "Owner-to-owner contact from the two-owner core team; a steering group of all joining owners, resident representatives, city departments and funders; external moderation, for example by the area renewal office (Smart Block II strategy).",
        "Kontakt von Eigentümer zu Eigentümer über das Kernteam; eine Steuerungsgruppe aus allen beitretenden Eigentümer*innen, Vertreter*innen der Bewohner*innen, Dienststellen der Stadt und Fördergebern; externe Moderation, etwa durch die Gebietsbetreuung (Strategie Smart Block II).",
      ),
      customerSegments: text(
        "End users: tenants of 25 flats. Contract partners: the two owners. Next: owners of neighbouring houses that plan works, first Ottakringer Straße 18 and Veronikagasse 36.",
        "Nutzer*innen: Mieter*innen von 25 Wohnungen. Vertragspartner: die beiden Eigentümer. Als Nächstes: Eigentümer*innen benachbarter Häuser, die ohnehin bauen, zuerst Ottakringer Straße 18 und Veronikagasse 36.",
      ),
      costStructure: text(
        "The shared plant cost about €320,000 at tender for both houses, about €160 per m² of gross floor area and about three times a gas central heating. Running costs: heat-pump electricity, partly from the PV-T roofs, maintenance, metering and billing.",
        "Die gemeinsame Anlage kostete laut Ausschreibung rund 320.000 € für beide Häuser, rund 160 € pro m² Bruttogeschoßfläche und rund das Dreifache einer Gaszentralheizung. Laufende Kosten: Wärmepumpenstrom, teils von den PVT-Dächern, Wartung, Messung und Abrechnung.",
      ),
      revenueStreams: text(
        "Heat and cooling prices per unit, indexed (proposed); the owners' construction-cost contribution; the MA 25 grant of 30 %, about €95,000; connection fees from houses that join later (proposed).",
        "Wärme- und Kältepreise pro Einheit, indexiert (vorgeschlagen); der Baukostenzuschuss der Eigentümer; die Förderung der MA 25 von 30 %, rund 95.000 €; Anschlussbeiträge später beitretender Häuser (vorgeschlagen).",
      ),
      operatorResponsibilities: text(
        "System boundary (proposed): the contractor owns and runs the probes, the heat pump, the buffer, the PV-T collectors and the courtyard loop up to a heat meter at each house. It does maintenance, fault service and billing and guarantees supply, with the gas boiler as backup. The owners own the pipes and floor heating inside their houses.",
        "Systemgrenze (vorgeschlagen): Der Contractor besitzt und betreibt Sonden, Wärmepumpe, Puffer, PVT-Kollektoren und die Hofleitung bis zu einem Wärmezähler je Haus. Er übernimmt Wartung, Störungsdienst und Abrechnung und garantiert die Versorgung, mit der Gastherme als Reserve. Die Eigentümer besitzen Leitungen und Fußbodenheizung in ihren Häusern.",
      ),
    },
    allocation: [
      {
        id: "owners",
        stakeholder: text("Owners of Geblergasse 11 and 13", "Eigentümer von Geblergasse 11 und 13"),
        investment: text(
          "A construction-cost contribution (amount not public) and the heating inside the buildings as part of the refurbishment.",
          "Ein Baukostenzuschuss (Höhe nicht öffentlich) und die Heizung in den Gebäuden im Zuge der Sanierung.",
        ),
        risk: text(
          "Tenants may reject the costs; the contractor may default; the probes stay on their land for decades (proposed risk list).",
          "Mieter*innen könnten die Kosten ablehnen; der Contractor könnte ausfallen; die Sonden bleiben jahrzehntelang auf ihrem Grund (vorgeschlagene Risikoliste).",
        ),
        benefit: text(
          "No boiler of their own, renovated houses ready for the gas phase-out, and an award-winning reference (Goldenes Güteziegel, Pioneering Achievement).",
          "Kein eigener Kessel, sanierte Häuser bereit für den Gasausstieg und eine ausgezeichnete Referenz (Goldenes Güteziegel der Wiener Stadterneuerung).",
        ),
      },
      {
        id: "contractor",
        stakeholder: text("Heat-delivery contractor (proposed)", "Wärmeliefer-Contractor (vorgeschlagen)"),
        investment: text(
          "About €225,000: the €320,000 plant minus the 30 % MA 25 grant (2017 figures).",
          "Rund 225.000 €: die Anlage um 320.000 € abzüglich der Förderung der MA 25 von 30 % (Zahlen von 2017).",
        ),
        risk: text(
          "Heat demand, ground performance, electricity prices and tenant payments over about 20 years.",
          "Wärmebedarf, Ergiebigkeit des Erdreichs, Strompreise und Zahlungen der Mieter*innen über rund 20 Jahre.",
        ),
        benefit: text(
          "Price income over the contract term, with the unit price capped at the district-heating price.",
          "Erlöse über die Vertragslaufzeit, mit dem Preis pro Einheit gedeckelt beim Fernwärmepreis.",
        ),
      },
      {
        id: "tenants",
        stakeholder: text("Tenants of the 25 flats", "Mieter*innen der 25 Wohnungen"),
        investment: text("Nothing up front; a price per unit of heat.", "Nichts im Voraus; ein Preis pro Wärmeeinheit."),
        risk: text(
          "Prices depend on electricity costs and contract terms; tenants have little say in the decision.",
          "Die Preise hängen von Stromkosten und Vertragsbedingungen ab; Mieter*innen haben wenig Mitsprache.",
        ),
        benefit: text(
          "Heat at no more than district-heating cost and summer cooling in No. 11.",
          "Wärme zu höchstens Fernwärmekosten und Sommerkühlung in Nr. 11.",
        ),
      },
    ],
    assumptions: {
      connectionRate: text(
        "Phase 1 connects both houses: 25 of 25 flats, 100 %. In 2020 talks were held with five more houses (AnergieUrban). The plan assumes 4 of the 16 other houses join in phase 2 (25 %), with 0 and 6 houses as sensitivities; every house that stays out leaves the source cost on fewer users (proposed).",
        "Phase 1 schließt beide Häuser an: 25 von 25 Wohnungen, 100 %. 2020 liefen Gespräche mit fünf weiteren Häusern (AnergieUrban). Der Plan nimmt an, dass 4 der 16 anderen Häuser in Phase 2 beitreten (25 %), mit 0 und 6 Häusern als Sensitivität; jedes Haus, das fernbleibt, verteilt die Quellkosten auf weniger Nutzer*innen (vorgeschlagen).",
      ),
      tariffs: text(
        "Rule: tenant cost at or below district heating. Benchmark: about €10 per m² of usable floor area and year for heat, hot water and moderate cooling (20 years, June 2018 prices). With grants, owner plus tenant cost was €7.89 per m² and year in the renovated houses. In 2017 gas had to rise about 70 %, from €0.072 to €0.125 per kWh, before this system beat a gas central heating.",
        "Regel: Kosten der Mieter*innen höchstens auf Fernwärmeniveau. Richtwert: rund 10 € pro m² Wohnnutzfläche und Jahr für Wärme, Warmwasser und moderate Kühlung (20 Jahre, Preise Juni 2018). Mit Förderungen lagen die Kosten von Eigentümer*innen und Mieter*innen zusammen bei 7,89 € pro m² und Jahr in den sanierten Häusern. 2017 hätte Gas um rund 70 % teurer werden müssen, von 0,072 auf 0,125 € pro kWh, damit dieses System eine Gaszentralheizung schlägt.",
      ),
      capex: text(
        "Start cell: €320,000 at tender, about €160 per m² of gross floor area. Phase-2 drilling: €65 per m at 60 m depth in courtyards and €50 per m at 120 m on public land (AnergieUrban, 2020). Extra loop at the Quick Check default of €500 per m of trench.",
        "Startzelle: 320.000 € laut Ausschreibung, rund 160 € pro m² Bruttogeschoßfläche. Bohrungen für Phase 2: 65 € pro m bei 60 m Tiefe in Höfen und 50 € pro m bei 120 m auf öffentlichem Grund (AnergieUrban, 2020). Zusätzliche Leitung zum Standardwert des Quick Check von 500 € pro Meter Künette.",
      ),
      financing: text(
        "Heat-delivery contracting (proposed): the contractor pre-finances the plant and recovers it through unit prices over 20 years. Check with Quick Check defaults (3 % over 20 years, €0.20 per kWh): the annuity of the net €225,000 is about €15,100 a year, heat-pump electricity about €6,900 (207 MWh at an annual efficiency of 6) and maintenance about €6,400 (2 % of €320,000), together about €28,400 or €16 per m² of usable floor area. That is above the €10 benchmark, so the owners' contribution and PV-T power must close the gap before the contract is signed.",
        "Wärmeliefer-Contracting (vorgeschlagen): Der Contractor finanziert die Anlage vor und holt die Kosten über die Preise pro Einheit in 20 Jahren zurück. Prüfung mit Standardwerten des Quick Check (3 % über 20 Jahre, 0,20 € pro kWh): Die Annuität der netto 225.000 € beträgt rund 15.100 € pro Jahr, der Wärmepumpenstrom rund 6.900 € (207 MWh bei einer Jahresarbeitszahl von 6) und die Wartung rund 6.400 € (2 % von 320.000 €), zusammen rund 28.400 € oder 16 € pro m² Wohnnutzfläche. Das liegt über dem Richtwert von 10 €; der Zuschuss der Eigentümer und der PVT-Strom müssen die Lücke schließen, bevor der Vertrag unterschrieben wird.",
      ),
      subsidies: text(
        "MA 25 paid 30 % of the start cell, about €95,000. For phase 2, the city's anergy-network grant paid 30 %, at most €200,000 per case, for at least 2 buildings including 1 residential, once fossil heating including cooking gas is removed (applications from 1 Oct 2024 to 31 Dec 2025; a successor is not verified). UFI pays up to 40 % for micro-networks with 2 to 9 external customers or under 800 MWh/a. Without any grant, phase 2 goes ahead only if the unit price still stays at district-heating level (proposed).",
        "Die MA 25 zahlte 30 % der Startzelle, rund 95.000 €. Für Phase 2 zahlte die Anergienetz-Förderung der Stadt 30 %, höchstens 200.000 € pro Fall, für mindestens 2 Gebäude mit mindestens 1 Wohngebäude, sobald fossile Heizungen samt Kochgas entfernt sind (Anträge vom 1.10.2024 bis 31.12.2025; eine Nachfolgeregelung ist nicht bestätigt). Die UFI fördert Mikronetze mit 2 bis 9 externen Abnehmer*innen oder unter 800 MWh/a mit bis zu 40 %. Ohne Förderung wird Phase 2 nur gebaut, wenn der Preis pro Einheit trotzdem auf Fernwärmeniveau bleibt (vorgeschlagen).",
      ),
    },
    criticalAssumptions: [
      {
        id: "store-balance",
        statement: text(
          "The courtyard store stays in balance: summer solar and cooling heat recharge what winter heating removes, also after new houses join.",
          "Der Hofspeicher bleibt im Gleichgewicht: Solar- und Kühlwärme im Sommer ersetzen, was die Heizung im Winter entzieht, auch nach dem Beitritt neuer Häuser.",
        ),
        validation: text(
          "Meter heat flows and probe temperatures and check them against the city's grant rule of ±20 % per year and ±10 % over 5 years; simulate 30 years of operation before phase 2 (proposed).",
          "Wärmeflüsse und Sondentemperaturen messen und mit der Förderregel der Stadt prüfen: ±20 % pro Jahr und ±10 % über 5 Jahre; vor Phase 2 einen Betrieb von 30 Jahren simulieren (vorgeschlagen).",
        ),
      },
      {
        id: "tenant-cost",
        statement: text(
          "Tenant costs stay at or below district-heating costs over the whole contract term.",
          "Die Kosten der Mieter*innen bleiben über die gesamte Vertragslaufzeit auf oder unter Fernwärmeniveau.",
        ),
        validation: text(
          "Each year, compare the cost per m² with the current district-heating price and the €10 benchmark, and share the result with the tenants (proposed).",
          "Jährlich die Kosten pro m² mit dem aktuellen Fernwärmepreis und dem Richtwert von 10 € vergleichen und das Ergebnis den Mieter*innen zeigen (vorgeschlagen).",
        ),
      },
      {
        id: "phase-2-owners",
        statement: text(
          "At least 4 more owners join phase 2 and pay a connection fee.",
          "Mindestens 4 weitere Eigentümer*innen treten in Phase 2 bei und zahlen einen Anschlussbeitrag.",
        ),
        validation: text(
          "Signed letters of intent covering at least 50 % of the extra heat sales before any order, the threshold the federal UFI programme applies to external networks (proposed).",
          "Unterschriebene Absichtserklärungen für mindestens 50 % des zusätzlichen Wärmeabsatzes vor jeder Bestellung, die Schwelle, die die UFI des Bundes für externe Netze verlangt (vorgeschlagen).",
        ),
      },
    ],
    risks: [
      {
        id: "drilling-space",
        title: text("No drilling space for phase 2", "Kein Bohrplatz für Phase 2"),
        description: text(
          "Courtyards allow only small rigs and probes of about 60 m. In the Gründerzeit test area of AnergieUrban, public land holds 61 % of the storage capacity, but rules for probes on public land were still missing. Without new probe sites, extra houses would overdraw the store.",
          "Höfe erlauben nur kleine Bohrgeräte und Sonden mit rund 60 m. Im Gründerzeit-Testgebiet von AnergieUrban liegen 61 % der Speicherkapazität unter öffentlichem Grund, doch Regeln für Sonden auf öffentlichem Grund fehlten noch. Ohne neue Sondenplätze würden zusätzliche Häuser den Speicher übernutzen.",
        ),
        dealBreaker: true,
        validation: text(
          "Map the probe sites of each house with the AnergieUrban method and obtain the city's written position on probes under pavements or parking lanes before any phase-2 contract, within 6 months (proposed).",
          "Die Sondenplätze jedes Hauses mit der Methode von AnergieUrban erheben und die schriftliche Position der Stadt zu Sonden unter Gehsteigen oder Parkstreifen vor jedem Vertrag für Phase 2 einholen, innerhalb von 6 Monaten (vorgeschlagen).",
        ),
      },
      {
        id: "neighbours",
        title: text("Neighbours do not join", "Nachbar*innen treten nicht bei"),
        description: text(
          "Owners lack money or see no return. In 2017 only half of the unrenovated owners could be reached, and the study recommended district heating for the unrenovated houses.",
          "Eigentümer*innen fehlt Geld oder sie sehen keinen Ertrag. 2017 war nur die Hälfte der unsanierten Eigentümer*innen erreichbar, und die Studie empfahl für die unsanierten Häuser Fernwärme.",
        ),
        dealBreaker: false,
        validation: text(
          "A steering group and owner workshops moderated by the area renewal office, ending in letters of intent; target houses that renovate anyway (proposed).",
          "Eine Steuerungsgruppe und Workshops für Eigentümer*innen, moderiert von der Gebietsbetreuung, mit Absichtserklärungen als Ergebnis; zuerst Häuser ansprechen, die ohnehin sanieren (vorgeschlagen).",
        ),
      },
      {
        id: "electricity",
        title: text("Heat-pump electricity costs rise", "Strom für die Wärmepumpe wird teurer"),
        description: text(
          "Electricity is the main running cost; a price jump pushes the unit price towards the district-heating cap.",
          "Strom ist der größte laufende Kostenblock; ein Preissprung drückt den Preis pro Einheit an die Obergrenze der Fernwärme.",
        ),
        dealBreaker: false,
        validation: text(
          "Track the annual efficiency against the design value of 6, use more PV-T power and index prices transparently (proposed).",
          "Die Jahresarbeitszahl gegen den Planwert von 6 verfolgen, mehr PVT-Strom nutzen und Preise transparent indexieren (vorgeschlagen).",
        ),
      },
    ],
    refinements: {
      feedback: text(
        "Smart Block II found that a core team of two owners works, that others join once they see shared benefits, and that managing the interfaces between actor groups is decisive. AnergieUrban adds that courtyard drilling is limited and that public land is needed for a full supply.",
        "Smart Block II zeigte: Ein Kernteam aus zwei Eigentümern funktioniert, andere schließen sich an, sobald sie gemeinsame Vorteile sehen, und entscheidend ist die Steuerung der Schnittstellen zwischen den Akteursgruppen. AnergieUrban ergänzt, dass Bohrungen in Höfen begrenzt sind und für eine Vollversorgung öffentlicher Grund nötig ist.",
      ),
      changes: text(
        "Phase 2 extends the loop through the prepared pipe stubs and targets houses that renovate anyway. The cost key is fixed before recruiting: the source by connected load, the pipes by the houses they serve. Contracting stays, so owners need no capital (proposed).",
        "Phase 2 erweitert das Netz über die vorbereiteten Anschlüsse und richtet sich an Häuser, die ohnehin sanieren. Der Kostenschlüssel steht vor der Akquise fest: die Quelle nach Anschlussleistung, die Leitungen nach den Häusern, die sie versorgen. Das Contracting bleibt, damit Eigentümer*innen kein Kapital brauchen (vorgeschlagen).",
      ),
    },
    scalability: {
      geographical: text(
        "The Vienna Heating Plan 2040 marks dense areas as Lokale Wärme gemeinsam, meant for shared neighbourhood networks. A TU Wien study for the city finds that local networks could supply 2 to 3 TWh/a of Vienna's 13 to 14 TWh/a of building heat, about 43 % of it through anergy networks.",
        "Der Wiener Wärmeplan 2040 weist dichte Gebiete als „Lokale Wärme gemeinsam“ für nachbarschaftliche Netze aus. Eine Studie der TU Wien für die Stadt ergibt, dass lokale Netze 2 bis 3 TWh/a der 13 bis 14 TWh/a Gebäudewärme Wiens liefern könnten, rund 43 % davon über Anergienetze.",
      ),
      economic: text(
        "Probe-based networks reach cost parity only with optimisation, extra sources and renovation, while groundwater concepts are close to parity (TU Wien, 2026). Higher gas prices help: in 2017 gas had to rise about 70 % to break even.",
        "Sondenbasierte Netze erreichen Kostenparität nur mit Optimierung, zusätzlichen Quellen und Sanierung, Grundwasserkonzepte liegen nahe daran (TU Wien, 2026). Höhere Gaspreise helfen: 2017 hätte Gas um rund 70 % steigen müssen, um gleichzuziehen.",
      ),
      organisational: text(
        "The start-cell model is being repeated: ÖGUT assessed nine housing blocks for anergy start cells, and the city's renewal programme found that owner decisions need neutral moderation over several years (WieNeu+). A block contractor plus a steering group per block can be copied (proposed).",
        "Das Modell der Startzelle wird wiederholt: Die ÖGUT prüfte neun Häuserblöcke auf Anergie-Startzellen, und das Stadterneuerungsprogramm hielt fest, dass Entscheidungen von Eigentümer*innen über Jahre neutrale Moderation brauchen (WieNeu+). Ein Block-Contractor plus eine Steuerungsgruppe pro Block lässt sich übertragen (vorgeschlagen).",
      ),
    },
    nextSteps: {
      data: text(
        "Two years of metered heat, cooling, electricity and probe temperatures from the start cell; heat demand, renovation dates and free drilling area for each of the 16 other houses (proposed).",
        "Zwei Jahre Messdaten der Startzelle zu Wärme, Kälte, Strom und Sondentemperaturen; Wärmebedarf, Sanierungstermine und freie Bohrfläche für jedes der 16 anderen Häuser (vorgeschlagen).",
      ),
      stakeholders: text(
        "Owners already considering the loop (Ottakringer Straße 18, Veronikagasse 36); the tenants; MA 20 on public land and grants.",
        "Eigentümer*innen, die das Netz bereits erwägen (Ottakringer Straße 18, Veronikagasse 36); die Mieter*innen; die MA 20 zu öffentlichem Grund und Förderungen.",
      ),
      partnerships: text(
        "A phase-2 contract with the contractor; ÖGUT or the area renewal office as moderator; grant applications to MA 20 and UFI before any binding order (proposed).",
        "Ein Vertrag für Phase 2 mit dem Contractor; ÖGUT oder die Gebietsbetreuung als Moderation; Förderanträge bei MA 20 und UFI vor jeder verbindlichen Bestellung (vorgeschlagen).",
      ),
      pilots: text(
        "Phase 2: connect 4 houses to the existing loop through the prepared pipe stubs (proposed).",
        "Phase 2: 4 Häuser über die vorbereiteten Anschlüsse an das bestehende Netz anschließen (vorgeschlagen).",
      ),
      decisions: text(
        "Go or no-go for phase 2 within 12 months (proposed): build only if (a) letters of intent cover at least 50 % of the extra heat, (b) probe sites including any public land are secured, (c) a 30-year simulation shows a balanced store, and (d) the unit price stays at or below district heating.",
        "Entscheidung über Phase 2 innerhalb von 12 Monaten (vorgeschlagen): nur bauen, wenn (a) Absichtserklärungen mindestens 50 % der zusätzlichen Wärme abdecken, (b) die Sondenplätze samt öffentlichem Grund gesichert sind, (c) eine Simulation über 30 Jahre einen ausgeglichenen Speicher zeigt und (d) der Preis pro Einheit auf oder unter Fernwärmeniveau bleibt.",
      ),
    },
  },
}
