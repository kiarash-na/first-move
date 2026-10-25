import { text } from "../types"
import { REFERENCE_CASE_CARDS } from "./catalog"
import { withFictionalDisclaimer, type ReferenceCase } from "./types"

/**
 * F1 · fictional · strong. A fictional groundwater anergy loop anchored by Klinik Donaustadt
 * (Langobardenstraße 122, 1220 Vienna). Only the hospital facts are real (statute 2022, the
 * hospital's own page, MA 20 district data); the hospital has no published anergy project, and
 * nothing here says its owner or operator planned anything. Neighbours, partners, prices and
 * every figure that is not a published fact are "(illustrative)". The derivations are in the
 * research log: `docs/90_work/research/seed-dossier.md` § F1.
 */
export const klinikDonaustadt: ReferenceCase = {
  ...REFERENCE_CASE_CARDS.klinikDonaustadt,
  scenarioId: "custom",
  references: [
    "RC-KDO-STATUTE",
    "RC-KDO-HOUSE",
    "RC-WIEN-ENERGIE-INFO-22",
    "RC-KRANZL-2026-SLIDES",
    "RC-KRANZL-2026-PAPER",
    "RC-LENA-HOSPITALS",
    "RC-WIEN-KLINIK-FLORIDSDORF",
    "RC-UFI-MIKRONETZE",
    "RC-WIEN-ANERGY-GRANT",
    "RC-WIEN-WAERMEPLAN",
  ],
  site: {
    name: text("Klinik Donaustadt groundwater loop (fictional plan)", "Grundwassernetz Klinik Donaustadt (fiktiver Plan)"),
    location: text(
      "Langobardenstraße 122, 1220 Vienna (Donaustadt): the hospital and neighbouring blocks (the neighbours are illustrative)",
      "Langobardenstraße 122, 1220 Wien (Donaustadt): das Spital und benachbarte Blöcke (die Nachbarn sind illustrativ)",
    ),
    siteType: text(
      "Outer district: a large low-rise hospital of up to 5 floors next to housing and a school (the neighbours are illustrative)",
      "Äußerer Bezirk: ein großes, flaches Spital mit höchstens 5 Geschoßen neben Wohnbauten und einer Schule (die Nachbarn sind illustrativ)",
    ),
    ownership: withFictionalDisclaimer(
      "Klinik Donaustadt is a public general hospital of the City of Vienna, run by the Wiener Gesundheitsverbund (hospital statute, 2022). The neighbours of this plan are illustrative: 5 rental blocks of a limited-profit housing association (WGG), 1 condominium block (WEG) and a municipal school. Each owner decides separately, and the WEG block needs an owners' vote.",
      "Die Klinik Donaustadt ist eine öffentliche Schwerpunktkrankenanstalt der Stadt Wien, geführt vom Wiener Gesundheitsverbund (Anstaltsordnung, 2022). Die Nachbarn in diesem Plan sind illustrativ: 5 Mietblöcke einer gemeinnützigen Bauvereinigung (WGG), 1 Block im Wohnungseigentum (WEG) und eine städtische Schule. Jede Eigentümerin entscheidet für sich, der WEG-Block braucht einen Beschluss der Eigentümer*innen.",
    ),
    units: text(
      "8 buildings: the hospital (963 beds), 6 housing blocks with 600 flats and 1 school (neighbours illustrative)",
      "8 Gebäude: das Spital (963 Betten), 6 Wohnblöcke mit 600 Wohnungen und 1 Schule (Nachbarn illustrativ)",
    ),
    currentSupply: [
      text(
        "Hospital: supply not published; this plan keeps the existing supply as backup",
        "Spital: Versorgung nicht veröffentlicht; dieser Plan behält die bestehende Versorgung als Reserve",
      ),
      text("Housing and school: gas boilers (illustrative)", "Wohnbauten und Schule: Gaskessel (illustrativ)"),
      text(
        "Donaustadt: about 12,010 buildings on gas and about 1,500 on district heating (MA 20, 2024)",
        "Donaustadt: rund 12.010 Gebäude mit Gas und rund 1.500 mit Fernwärme (MA 20, 2024)",
      ),
    ],
    stakeholders: [
      text("Wiener Gesundheitsverbund: hospital management and technical department", "Wiener Gesundheitsverbund: Spitalsleitung und Technik"),
      text("Limited-profit housing association (illustrative)", "Gemeinnützige Bauvereinigung (illustrativ)"),
      text("Condominium owners, WEG (illustrative)", "Wohnungseigentümer*innen, WEG (illustrativ)"),
      text("City of Vienna as school owner and landowner (illustrative)", "Stadt Wien als Schulerhalterin und Grundeigentümerin (illustrativ)"),
      text("Water authority (groundwater permit)", "Wasserrechtsbehörde (Grundwasserbewilligung)"),
    ],
    partners: [
      text("Energy-services company (ESCO) with a project company (illustrative)", "Energiedienstleister (ESCO) mit einer Projektgesellschaft (illustrativ)"),
      text("Hydrogeology office (illustrative)", "Hydrogeologisches Büro (illustrativ)"),
      text("The hospital's existing heat supplier as backup (illustrative)", "Der bestehende Wärmelieferant des Spitals als Reserve (illustrativ)"),
    ],
  },
  // The hospital is one building (its own page); neighbours, project area and trench length are
  // illustrative (docs page § Quick Check inputs).
  buildings: {
    total: 8,
    areaM2: 250_000,
    shares: { category_c: { "1991_2010": 12.5 }, residential: { "1961_1990": 75 }, category_a: { "1961_1990": 12.5 } },
  },
  sources: { potentials: { ground_water: "high", waste_heat: "medium" }, pv: true },
  networkLengthM: 2_500,
  // The plan's own estimate (illustrative): 7.0 + 4.6 + 0.6 GWh/a of heat and 1.5 + 0.46 GWh/a
  // of cooling. Without it the Quick Check would count 8 buildings at default floor areas.
  manualDemand: { heatingKwhPerYear: 12_200_000, coolingKwhPerYear: 2_000_000 },
  businessPlan: {
    opportunity: {
      customerSegments: text(
        "The anchor is Klinik Donaustadt with 963 systemised beds and year-round heat, hot water and cooling (hospital statute, 2022). Next door, in this plan: 600 rental and condominium flats in 6 blocks and a school with 6,000 m² (illustrative). The hospital takes about 57 % of the loop heat.",
        "Ankerkundin ist die Klinik Donaustadt mit 963 systemisierten Betten und ganzjährigem Bedarf an Wärme, Warmwasser und Kälte (Anstaltsordnung, 2022). Nebenan, in diesem Plan: 600 Miet- und Eigentumswohnungen in 6 Blöcken und eine Schule mit 6.000 m² (illustrativ). Das Spital bezieht rund 57 % der Netzwärme.",
      ),
      needs: text(
        "Hospital heat about 27.9 GWh/a, estimated as 963 beds × 29 MWh per bed and year, the German average (LENA hospital guide, 2020), to be replaced by metered data. The loop takes 25 % of it, about 7.0 GWh/a, for low-temperature circuits and hot-water preheating, plus the hospital's cooling, assumed at 1.5 GWh/a (illustrative). Housing 42,000 m² × 109.3 kWh/m²a = 4.6 GWh/a and school 6,000 m² × 104.3 kWh/m²a = 0.6 GWh/a (Quick Check Table 1, 1961 to 1990).",
        "Wärmebedarf des Spitals rund 27,9 GWh/a, geschätzt als 963 Betten × 29 MWh pro Bett und Jahr, dem deutschen Durchschnitt (LENA-Leitfaden für Krankenhäuser, 2020), später durch Messdaten zu ersetzen. Das Netz deckt 25 % davon, rund 7,0 GWh/a, für Niedertemperaturkreise und Warmwasser-Vorwärmung, dazu die Kälte des Spitals, angenommen mit 1,5 GWh/a (illustrativ). Wohnbauten 42.000 m² × 109,3 kWh/m²a = 4,6 GWh/a und Schule 6.000 m² × 104,3 kWh/m²a = 0,6 GWh/a (Quick Check, Tabelle 1, 1961 bis 1990).",
      ),
      heatSources: text(
        "Groundwater from two well pairs at least 50 m apart; a TU Wien study for the city sees groundwater use as realistic where there is enough of it, for example in Donaustadt (2026). Heat rejected by the hospital's cooling goes into the loop instead of the air. Rooftop PV for pump power (illustrative).",
        "Grundwasser aus zwei Brunnenpaaren mit mindestens 50 m Abstand; eine Studie der TU Wien für die Stadt hält Grundwassernutzung dort für realistisch, wo genug davon vorhanden ist, etwa in der Donaustadt (2026). Die Abwärme der Spitalskühlung geht ins Netz statt an die Luft. Dach-PV für den Pumpenstrom (illustrativ).",
      ),
      painPoint: text(
        "A hospital needs heat all year and rejects heat from its cooling at the same time; without a shared loop the two never meet (illustrative). The neighbouring blocks burn gas, as about 12,010 buildings in Donaustadt do, and no single owner can justify a groundwater source alone.",
        "Ein Spital braucht das ganze Jahr Wärme und gibt zugleich Abwärme aus der Kühlung ab; ohne gemeinsames Netz kommen beide nie zusammen (illustrativ). Die Nachbarblöcke heizen mit Gas, wie rund 12.010 Gebäude in der Donaustadt, und keine einzelne Eigentümerin kann eine Grundwasserquelle allein rechtfertigen.",
      ),
      alternatives: text(
        "The hospital keeps its existing supply and chillers; the housing installs air or ground heat pumps per block or connects to district heating where offered. Klinik Floridsdorf shows that heat pumps can lift waste heat from 26 °C to 82 °C and cover 50 to 70 % of a hospital's heat (City of Vienna).",
        "Das Spital behält Versorgung und Kältemaschinen; die Wohnbauten bauen Luft- oder Erdwärmepumpen pro Block ein oder schließen an die Fernwärme an, wo sie angeboten wird. Die Klinik Floridsdorf zeigt, dass Wärmepumpen Abwärme von 26 °C auf 82 °C heben und 50 bis 70 % des Wärmebedarfs eines Spitals decken können (Stadt Wien).",
      ),
      advantage: text(
        "The hospital's steady demand and cooling waste heat give the loop a year-round base load. With about 12.2 GWh/a on a 2.5 km trench, the line density is about 4.9 MWh per metre, far above the 1.5 MWh per metre from which the Quick Check rates the heat density as high (Table 9). A TU Wien study for the city finds groundwater concepts close to cost-competitive with building-by-building heating and cooling in Vienna (2026).",
        "Der stetige Bedarf des Spitals und seine Kühlabwärme geben dem Netz eine ganzjährige Grundlast. Mit rund 12,2 GWh/a auf 2,5 km Künette liegt die Liniendichte bei rund 4,9 MWh pro Meter, weit über den 1,5 MWh pro Meter, ab denen der Quick Check die Wärmedichte als hoch einstuft (Tabelle 9). Eine Studie der TU Wien für die Stadt sieht Grundwasserkonzepte in Wien nahe an der Wirtschaftlichkeit im Vergleich mit dezentraler Wärme- und Kälteversorgung (2026).",
      ),
    },
    canvas: {
      keyPartners: text(
        "The hospital operator as anchor, the housing association and the WEG, the city as school owner and landowner for the wells, an ESCO as operator, the water authority, and the hospital's existing heat supplier as backup (illustrative).",
        "Der Spitalsbetreiber als Anker, die Bauvereinigung und die WEG, die Stadt als Schulerhalterin und Grundeigentümerin für die Brunnen, ein ESCO als Betreiber, die Wasserrechtsbehörde und der bestehende Wärmelieferant des Spitals als Reserve (illustrativ).",
      ),
      keyActivities: text(
        "Permit and drill the wells, build a 2.5 km ambient loop, install a heat-pump plant of about 2 MW at the hospital and heat pumps in each block, then operate, meter and bill, and manage the groundwater balance (illustrative).",
        "Brunnen bewilligen lassen und bohren, ein Anergienetz von 2,5 km bauen, eine Wärmepumpenanlage mit rund 2 MW im Spital und Wärmepumpen in jedem Block installieren, dann betreiben, messen, abrechnen und die Grundwasserbilanz steuern (illustrativ).",
      ),
      keyResources: text(
        "Groundwater rights, a plant room at the hospital, a trench corridor on hospital and public land, a long-term anchor contract and the ESCO's balance sheet (illustrative).",
        "Wasserrechte, ein Technikraum im Spital, eine Leitungstrasse auf Spitals- und öffentlichem Grund, ein langfristiger Ankervertrag und die Bilanz des ESCO (illustrativ).",
      ),
      valueProposition: text(
        "The hospital gets cheaper cooling, a quarter of its heat from renewable sources and a hedge against heat prices, with its existing supply kept as backup. Residents get a way out of gas plus summer cooling at an indexed price (illustrative).",
        "Das Spital erhält günstigere Kühlung, ein Viertel seiner Wärme aus erneuerbaren Quellen und eine Absicherung gegen Wärmepreise, mit der bestehenden Versorgung als Reserve. Die Bewohner*innen erhalten einen Weg aus dem Gas und Sommerkühlung zu einem indexierten Preis (illustrativ).",
      ),
      customerRelationships: text(
        "A 20-year take-or-pay contract for heat and cooling with the hospital and 15-year supply contracts with the housing owners, with prices indexed to electricity and consumer prices, as the federal UFI programme requires indexed heat prices for micro-networks (illustrative terms).",
        "Ein Take-or-pay-Vertrag über 20 Jahre für Wärme und Kälte mit dem Spital und Lieferverträge über 15 Jahre mit den Wohnbau-Eigentümer*innen, Preise indexiert an Strom- und Verbraucherpreise, wie die UFI des Bundes für Mikronetze indexierte Wärmepreise verlangt (illustrative Bedingungen).",
      ),
      channels: text(
        "The hospital's management and technical department, the housing association's board, the WEG owners' assembly, the district council and information evenings for tenants (illustrative).",
        "Spitalsleitung und Technik, Vorstand der Bauvereinigung, Eigentümerversammlung der WEG, Bezirksvertretung und Informationsabende für Mieter*innen (illustrativ).",
      ),
      customerSegments: text(
        "A public hospital (anchor, about 57 % of loop heat), limited-profit rental housing, a condominium block and a municipal school (neighbours illustrative).",
        "Ein öffentliches Spital (Anker, rund 57 % der Netzwärme), gemeinnütziger Mietwohnbau, ein Block im Wohnungseigentum und eine städtische Schule (Nachbarn illustrativ).",
      ),
      costStructure: text(
        "Loop 2.5 km × €500 per m = €1.25 m, and groundwater wells at the Quick Check default of €1.00 per kWh/a for about 8 GWh/a = €8.0 m, an upper bound (Quick Check Table 6). Hospital heat-pump plant about €2.0 m and block heat pumps about €1.6 m, both to be replaced by quotes (illustrative). Electricity about €0.49 m a year (2.44 GWh at €0.20 per kWh) and maintenance 2 % of capex, about €0.26 m a year.",
        "Netz 2,5 km × 500 € pro m = 1,25 Mio. € und Grundwasserbrunnen zum Standardwert des Quick Check von 1,00 € pro kWh/a für rund 8 GWh/a = 8,0 Mio. €, eine Obergrenze (Quick Check, Tabelle 6). Wärmepumpenanlage im Spital rund 2,0 Mio. € und Wärmepumpen in den Blöcken rund 1,6 Mio. €, beide durch Angebote zu ersetzen (illustrativ). Strom rund 0,49 Mio. € pro Jahr (2,44 GWh zu 0,20 € pro kWh) und Wartung 2 % der Investition, rund 0,26 Mio. € pro Jahr.",
      ),
      revenueStreams: text(
        "Heat 12.2 GWh/a × €0.12 per kWh = €1.46 m; base price €6 per m² on 48,000 m² of housing and school = €0.29 m; a capacity price for the hospital instead of the m² price, €0.15 m (illustrative); cooling 2.0 GWh/a × €0.08 per kWh = €0.16 m; connection fees of €1,000 per building (Quick Check defaults). Total about €2.06 m a year.",
        "Wärme 12,2 GWh/a × 0,12 € pro kWh = 1,46 Mio. €; Grundpreis 6 € pro m² auf 48.000 m² Wohnbau und Schule = 0,29 Mio. €; ein Leistungspreis für das Spital statt des m²-Preises, 0,15 Mio. € (illustrativ); Kälte 2,0 GWh/a × 0,08 € pro kWh = 0,16 Mio. €; Anschlussgebühren von 1.000 € pro Gebäude (Standardwerte des Quick Check). Zusammen rund 2,06 Mio. € pro Jahr.",
      ),
      operatorResponsibilities: text(
        "System boundary: the ESCO's project company owns the wells, the loop, the hospital heat-pump plant and the block heat pumps up to each building's heat meter, and does maintenance, fault service, metering and billing. The owners keep their internal heating. The hospital keeps its existing supply for high temperatures and peaks, so the ESCO is never the only supplier for critical care (illustrative).",
        "Systemgrenze: Die Projektgesellschaft des ESCO besitzt Brunnen, Netz, die Wärmepumpenanlage im Spital und die Wärmepumpen der Blöcke bis zum Wärmezähler jedes Gebäudes und übernimmt Wartung, Störungsdienst, Messung und Abrechnung. Die Eigentümer*innen behalten ihre Hausanlagen. Das Spital behält seine bestehende Versorgung für hohe Temperaturen und Spitzen, damit der ESCO nie der einzige Versorger der Intensivmedizin ist (illustrativ).",
      ),
    },
    allocation: [
      {
        id: "hospital",
        stakeholder: text("Hospital operator (anchor, illustrative)", "Spitalsbetreiber (Anker, illustrativ)"),
        investment: text(
          "Plant-room space, hydraulic changes and a 20-year take-or-pay contract for about 7 GWh/a of heat and all its cooling (illustrative).",
          "Platz im Technikraum, hydraulische Anpassungen und ein Take-or-pay-Vertrag über 20 Jahre für rund 7 GWh/a Wärme und die gesamte Kälte (illustrativ).",
        ),
        risk: text(
          "Supply security for critical care, reduced by keeping the existing supply as backup (illustrative).",
          "Versorgungssicherheit der Intensivmedizin, gemindert durch die bestehende Versorgung als Reserve (illustrativ).",
        ),
        benefit: text(
          "Lower cooling cost, price stability and CO2 savings; Klinik Floridsdorf saves up to 4,000 t of CO2 a year with waste heat at a larger share (City of Vienna).",
          "Geringere Kältekosten, Preisstabilität und CO2-Einsparung; die Klinik Floridsdorf spart mit Abwärme bei größerem Anteil bis zu 4.000 t CO2 pro Jahr (Stadt Wien).",
        ),
      },
      {
        id: "esco",
        stakeholder: text("ESCO project company (illustrative)", "Projektgesellschaft des ESCO (illustrativ)"),
        investment: text(
          "About €12.9 m before grants for wells, loop and heat pumps, financed with 30 % equity and 70 % loans at 3 % (illustrative; interest rate from the Quick Check).",
          "Rund 12,9 Mio. € vor Förderung für Brunnen, Netz und Wärmepumpen, finanziert mit 30 % Eigenkapital und 70 % Darlehen zu 3 % (illustrativ; Zinssatz aus dem Quick Check).",
        ),
        risk: text(
          "Groundwater yield, connection rate, electricity price and anchor default. Cost key: the source by connected load, the pipes by the users of each branch.",
          "Grundwasserergiebigkeit, Anschlussquote, Strompreis und Ausfall des Ankers. Kostenschlüssel: die Quelle nach Anschlussleistung, die Leitungen nach den Nutzer*innen jedes Strangs.",
        ),
        benefit: text(
          "About €2.06 m a year of revenue over 20 years and a first position for further public anchors (illustrative).",
          "Rund 2,06 Mio. € Erlöse pro Jahr über 20 Jahre und eine Startposition für weitere öffentliche Anker (illustrativ).",
        ),
      },
      {
        id: "housing",
        stakeholder: text("Housing owners: association and WEG (illustrative)", "Wohnbau-Eigentümer*innen: Bauvereinigung und WEG (illustrativ)"),
        investment: text(
          "A €1,000 connection fee per building plus radiator checks and hydraulic balancing (illustrative).",
          "Eine Anschlussgebühr von 1.000 € pro Gebäude plus Prüfung der Heizkörper und hydraulischer Abgleich (illustrativ).",
        ),
        risk: text(
          "The WEG vote may fail or come late; tenancy rules limit what can be passed on (illustrative).",
          "Der WEG-Beschluss kann scheitern oder sich verzögern; das Mietrecht begrenzt, was weiterverrechnet werden kann (illustrativ).",
        ),
        benefit: text(
          "A way out of gas without their own heat source, summer cooling and an indexed price (illustrative).",
          "Ein Weg aus dem Gas ohne eigene Wärmequelle, Sommerkühlung und ein indexierter Preis (illustrativ).",
        ),
      },
    ],
    assumptions: {
      connectionRate: text(
        "The hospital connects with 25 % of its heat under the anchor contract, the association with 5 of 5 blocks and the WEG block in year 3: 100 % of the planned loop heat by year 3 (illustrative). Sensitivity: without the housing, the plan loses about €0.2 m a year; it breaks even with the hospital and about a third of the housing floor area. Every building that stays out raises costs for the rest.",
        "Das Spital schließt mit 25 % seiner Wärme über den Ankervertrag an, die Bauvereinigung mit 5 von 5 Blöcken und der WEG-Block im Jahr 3: 100 % der geplanten Netzwärme ab Jahr 3 (illustrativ). Sensitivität: Ohne die Wohnbauten verliert der Plan rund 0,2 Mio. € pro Jahr; mit dem Spital und rund einem Drittel der Wohnfläche erreicht er die Gewinnschwelle. Jedes Gebäude, das fernbleibt, verteuert es für die anderen.",
      ),
      tariffs: text(
        "Quick Check defaults: heat €6 per m² and year plus €0.12 per kWh, cooling €3 per m² plus €0.08 per kWh; the hospital pays a capacity price instead of the m² price (illustrative). For a 70 m² flat using 7,650 kWh this is about €1,340 a year, to be compared with the block's last 3 years of gas bills plus the avoided boiler renewal. The hospital's price must stay at or below its current heat and chiller cost per MWh, which the technical department provides.",
        "Standardwerte des Quick Check: Wärme 6 € pro m² und Jahr plus 0,12 € pro kWh, Kälte 3 € pro m² plus 0,08 € pro kWh; das Spital zahlt statt des m²-Preises einen Leistungspreis (illustrativ). Für eine Wohnung mit 70 m² und 7.650 kWh sind das rund 1.340 € pro Jahr, zu vergleichen mit den Gasrechnungen des Blocks der letzten 3 Jahre plus der ersparten Kesselerneuerung. Der Preis für das Spital muss auf oder unter seinen heutigen Wärme- und Kältekosten pro MWh liegen, die die Technik liefert.",
      ),
      capex: text(
        "€12.9 m upper bound: loop €1.25 m; groundwater €8.0 m at the tool default, to be replaced by a quote for two well pairs; hospital heat pumps €2.0 m and block heat pumps €1.6 m (illustrative).",
        "12,9 Mio. € als Obergrenze: Netz 1,25 Mio. €; Grundwasser 8,0 Mio. € zum Standardwert des Tools, zu ersetzen durch ein Angebot für zwei Brunnenpaare; Wärmepumpen im Spital 2,0 Mio. € und in den Blöcken 1,6 Mio. € (illustrativ).",
      ),
      financing: text(
        "A project company with 30 % ESCO equity and 70 % long-term loans at 3 % over 20 years (illustrative). Lifetime check: annuity factor 0.0672, so €0.86 m a year; maintenance €0.26 m; electricity €0.49 m; together about €1.61 m against revenues of about €2.06 m, a margin of about €0.45 m a year. If the well quote comes in at €4 m instead of €8 m, the margin rises by about €0.35 m.",
        "Eine Projektgesellschaft mit 30 % Eigenkapital des ESCO und 70 % langfristigen Darlehen zu 3 % über 20 Jahre (illustrativ). Prüfung über die Laufzeit: Annuitätenfaktor 0,0672, also 0,86 Mio. € pro Jahr; Wartung 0,26 Mio. €; Strom 0,49 Mio. €; zusammen rund 1,61 Mio. € gegenüber Erlösen von rund 2,06 Mio. €, ein Überschuss von rund 0,45 Mio. € pro Jahr. Kostet die Brunnenanlage laut Angebot 4 statt 8 Mio. €, steigt der Überschuss um rund 0,35 Mio. €.",
      ),
      subsidies: text(
        "The base case assumes no grant and still covers its costs; any grant lowers prices. The city's anergy grant paid 30 %, at most €200,000 per case (2024/25 rules, successor not verified). UFI micro-networks (up to 40 %) only cover 2 to 9 external customers or under 800 MWh/a, so this network needs another programme, to be confirmed with the funding agency (illustrative).",
        "Der Basisfall rechnet ohne Förderung und deckt trotzdem seine Kosten; jede Förderung senkt die Preise. Die Anergienetz-Förderung der Stadt zahlte 30 %, höchstens 200.000 € pro Fall (Regeln 2024/25, Nachfolge nicht bestätigt). UFI-Mikronetze (bis zu 40 %) gelten nur für 2 bis 9 externe Abnehmer*innen oder unter 800 MWh/a; dieses Netz braucht daher ein anderes Programm, abzuklären mit der Förderstelle (illustrativ).",
      ),
    },
    criticalAssumptions: [
      {
        id: "anchor-contract",
        statement: text(
          "The hospital signs a 20-year contract for about 7 GWh/a of heat, 25 % of its estimated demand, and all its cooling (illustrative).",
          "Das Spital unterschreibt einen Vertrag über 20 Jahre für rund 7 GWh/a Wärme, 25 % seines geschätzten Bedarfs, und die gesamte Kälte (illustrativ).",
        ),
        validation: text(
          "Heads of terms approved by the hospital management before the feasibility study; together with housing letters of intent they must cover at least 50 % of the planned heat sales, the rule the federal UFI programme sets for micro-networks (illustrative).",
          "Eckpunkte, von der Spitalsleitung vor der Machbarkeitsstudie freigegeben; zusammen mit Absichtserklärungen der Wohnbauten müssen sie mindestens 50 % des geplanten Wärmeabsatzes abdecken, die Regel der UFI des Bundes für Mikronetze (illustrativ).",
        ),
      },
      {
        id: "groundwater",
        statement: text(
          "Groundwater can deliver about 8 GWh/a of source heat with well pairs at least 50 m apart (illustrative).",
          "Das Grundwasser liefert mit Brunnenpaaren im Abstand von mindestens 50 m rund 8 GWh/a Quellwärme (illustrativ).",
        ),
        validation: text(
          "A desk study with the city's groundwater data, then one test well pair with a pumping test and a pre-consultation with the water authority, within 6 months (illustrative).",
          "Eine Vorstudie mit den Grundwasserdaten der Stadt, dann ein Probebrunnenpaar mit Pumpversuch und ein Vorgespräch mit der Wasserrechtsbehörde, innerhalb von 6 Monaten (illustrativ).",
        ),
      },
      {
        id: "hospital-demand",
        statement: text(
          "The hospital's metered heat demand is close to the benchmark of 29 MWh per bed and year, so 7 GWh/a is a safe share (illustrative).",
          "Der gemessene Wärmebedarf des Spitals liegt nahe am Richtwert von 29 MWh pro Bett und Jahr, sodass 7 GWh/a ein sicherer Anteil sind (illustrativ).",
        ),
        validation: text(
          "12 months of 15-minute heat and cooling loads and circuit temperatures from the technical department; the share is resized if the metered demand differs by more than 20 % (illustrative).",
          "12 Monate Wärme- und Kältelast im 15-Minuten-Takt und Kreistemperaturen von der Technik; der Anteil wird neu bemessen, wenn der gemessene Bedarf um mehr als 20 % abweicht (illustrativ).",
        ),
      },
    ],
    risks: [
      {
        id: "groundwater-permit",
        title: text("Groundwater yield or permit fails", "Grundwasserergiebigkeit oder Bewilligung scheitert"),
        description: text(
          "Without a water-rights permit and enough yield, the loop loses its main source. Probes on this site cannot replace about 8 GWh/a, and outdoor air would lower efficiency (illustrative).",
          "Ohne wasserrechtliche Bewilligung und ausreichende Ergiebigkeit verliert das Netz seine Hauptquelle. Sonden können auf diesem Standort rund 8 GWh/a nicht ersetzen, und Außenluft würde die Effizienz senken (illustrativ).",
        ),
        dealBreaker: true,
        validation: text(
          "A test well pair and a pre-consultation with the water authority before gate 1 in month 6; no design money is spent until both are positive (illustrative).",
          "Ein Probebrunnenpaar und ein Vorgespräch mit der Wasserrechtsbehörde vor Entscheidungspunkt 1 im Monat 6; kein Geld für die Planung, bevor beide positiv sind (illustrativ).",
        ),
      },
      {
        id: "housing-late",
        title: text("Housing connects late or not at all", "Wohnbauten schließen spät oder gar nicht an"),
        description: text(
          "WEG votes and tenancy rules slow connections, and every building that stays out raises costs for the rest.",
          "WEG-Beschlüsse und Mietrecht verzögern Anschlüsse, und jedes Gebäude, das fernbleibt, verteuert es für die anderen.",
        ),
        dealBreaker: false,
        validation: text(
          "Phase 1 covers only the hospital and 3 association blocks; the plan breaks even with about a third of the housing; the WEG gets a price fixed for 5 years (illustrative).",
          "Phase 1 umfasst nur das Spital und 3 Blöcke der Bauvereinigung; der Plan erreicht die Gewinnschwelle mit rund einem Drittel der Wohnfläche; die WEG erhält einen für 5 Jahre fixen Preis (illustrativ).",
        ),
      },
      {
        id: "electricity",
        title: text("Electricity price rises", "Strompreis steigt"),
        description: text(
          "A 50 % higher electricity price adds about €0.24 m a year, about half of the margin (illustrative).",
          "Ein um 50 % höherer Strompreis kostet rund 0,24 Mio. € pro Jahr mehr, etwa die Hälfte des Überschusses (illustrativ).",
        ),
        dealBreaker: false,
        validation: text(
          "Indexed prices, as UFI requires for micro-networks, a guaranteed annual efficiency in the heat-pump tender and PV on the hospital's roofs (illustrative).",
          "Indexierte Preise, wie die UFI sie für Mikronetze verlangt, eine garantierte Jahresarbeitszahl in der Ausschreibung der Wärmepumpen und PV auf den Dächern des Spitals (illustrativ).",
        ),
      },
    ],
    refinements: {
      feedback: text(
        "Illustrative expert feedback: do not size the loop on the hospital's full heat, keep the existing supply for high temperatures and peaks, and start where the anchor and the nearest housing sit.",
        "Illustratives Feedback von Expert*innen: das Netz nicht auf den gesamten Wärmebedarf des Spitals auslegen, die bestehende Versorgung für hohe Temperaturen und Spitzen behalten und dort beginnen, wo Anker und nächste Wohnbauten liegen.",
      ),
      changes: text(
        "The scope was cut to 25 % of the hospital's heat at low temperature. Phase 1 is the hospital plus 3 association blocks on 1.2 km; phase 2 adds the other blocks and the school (illustrative).",
        "Der Umfang wurde auf 25 % der Spitalswärme bei niedriger Temperatur reduziert. Phase 1 umfasst das Spital und 3 Blöcke der Bauvereinigung auf 1,2 km; Phase 2 ergänzt die übrigen Blöcke und die Schule (illustrativ).",
      ),
    },
    scalability: {
      geographical: text(
        "Hospitals, care homes and campuses next to housing, in Vienna's groundwater areas such as Floridsdorf and Donaustadt (TU Wien, 2026) and in the Lokale Wärme gemeinsam areas of the Vienna Heating Plan 2040.",
        "Spitäler, Pflegeheime und Campusse neben Wohnbauten, in Wiens Grundwassergebieten wie Floridsdorf und Donaustadt (TU Wien, 2026) und in den Gebieten „Lokale Wärme gemeinsam“ des Wiener Wärmeplans 2040.",
      ),
      economic: text(
        "The model works where the line density is well above 1.5 MWh per metre and a year-round cooling user exists. Concepts on geothermal probes alone pay off only with thorough optimisation, further heat sources, well-suited areas or renovated buildings (TU Wien, 2026).",
        "Das Modell trägt, wo die Liniendichte deutlich über 1,5 MWh pro Meter liegt und ein ganzjähriger Kältebedarf besteht. Konzepte allein auf Erdwärmesonden rechnen sich nur mit umfassender Optimierung, weiteren Wärmequellen, gut geeigneten Gebieten oder sanierten Gebäuden (TU Wien, 2026).",
      ),
      organisational: text(
        "An ESCO project company with one public anchor contract and standard connection offers for neighbours can be repeated for other public anchors (illustrative).",
        "Eine ESCO-Projektgesellschaft mit einem öffentlichen Ankervertrag und Standard-Anschlussangeboten für Nachbarn lässt sich für andere öffentliche Anker wiederholen (illustrativ).",
      ),
    },
    nextSteps: {
      data: text(
        "Hospital: 15-minute heat and cooling loads and circuit temperatures for 12 months. Housing: 3 years of gas bills per block. Groundwater: city data plus a test well pair (illustrative).",
        "Spital: Wärme- und Kältelast im 15-Minuten-Takt und Kreistemperaturen über 12 Monate. Wohnbauten: Gasrechnungen von 3 Jahren pro Block. Grundwasser: Daten der Stadt plus ein Probebrunnenpaar (illustrativ).",
      ),
      stakeholders: text(
        "The hospital management and technical department, the housing association's board, the WEG assembly, the school owner, the water authority and the district council (illustrative).",
        "Spitalsleitung und Technik, Vorstand der Bauvereinigung, WEG-Versammlung, Schulerhalterin, Wasserrechtsbehörde und Bezirksvertretung (illustrativ).",
      ),
      partnerships: text(
        "Tender the ESCO role and pre-check grants with the federal funding agency and the city's energy planning department (illustrative).",
        "Die Rolle des ESCO ausschreiben und Förderungen mit der Förderstelle des Bundes und der Energieplanung der Stadt vorab klären (illustrativ).",
      ),
      pilots: text(
        "Phase 1: the hospital plus 3 association blocks, a 1.2 km loop, one well pair and about 9.3 GWh/a of heat (illustrative).",
        "Phase 1: das Spital und 3 Blöcke der Bauvereinigung, ein Netz von 1,2 km, ein Brunnenpaar und rund 9,3 GWh/a Wärme (illustrativ).",
      ),
      decisions: text(
        "Gate 1 in month 6: test well and permit outlook positive, hospital heads of terms signed and letters of intent for at least 50 % of phase-1 heat, then fund the detailed design. Gate 2 in month 12: grant decision known and the Quick Check and lifetime check positive at 80 % connection, then the investment decision (illustrative).",
        "Entscheidungspunkt 1 im Monat 6: Probebrunnen und Aussicht auf Bewilligung positiv, Eckpunkte mit dem Spital unterschrieben und Absichtserklärungen für mindestens 50 % der Wärme in Phase 1, dann Detailplanung finanzieren. Entscheidungspunkt 2 im Monat 12: Förderentscheidung bekannt, Quick Check und Laufzeitprüfung bei 80 % Anschlussquote positiv, dann Investitionsentscheidung (illustrativ).",
      ),
    },
  },
}
