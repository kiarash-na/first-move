import type { Reference, ReferenceKind } from "@/lib/docs/references"

/**
 * External sources of the reference cases (D-76, D-78), in the format of `lib/docs/references.ts`:
 * every link opened and its content checked on the access date; `pnpm check:references` fetches
 * them again. Public docs may link outside the site only to these URLs and the method references.
 * Owner's rule (2026-10-25): no blogs and no news articles; official pages and documents, peer-
 * reviewed papers through doi.org, and the developers' or operators' own pages about their own
 * project ("company"). The research log is `docs/90_work/research/seed-sources.md`.
 */
const CHECKED = "2026-10-25"
const ref = (id: string, kind: ReferenceKind, authors: string, year: number, title: string, source: string, url: string): Reference => ({
  id,
  kind,
  authors,
  year,
  title,
  source,
  url,
  checked: CHECKED,
})
const doi = (value: string) => `https://doi.org/${value}`

const MA20 = "Stadt Wien, MA 20 Energieplanung"
const WIEN = "City of Vienna"
const WIKI = "Wien Geschichte Wiki (Wiener Stadt- und Landesarchiv, Wienbibliothek im Rathaus)"

export const REFERENCE_CASE_SOURCES: readonly Reference[] = [
  // City of Vienna: projects, plans, grants and district data
  ref("RC-WIEN-SEEBOGEN", "official", MA20, 2026, "Energie-Vorzeigeprojekt: Kraftwerk Seebogen", WIEN, "https://www.wien.gv.at/umwelt/energie-projekt-kraftwerk-seebogen"),
  ref("RC-WIEN-KLINIK-FLORIDSDORF", "official", MA20, 2026, "Energie-Vorzeigeprojekt: Klinik Floridsdorf", WIEN, "https://www.wien.gv.at/umwelt/energie-projekt-klinik-floridsdorf"),
  ref("RC-WIEN-HALLENBAD-FLORIDSDORF", "official", MA20, 2026, "Energie-Vorzeigeprojekt: Hallenbad Floridsdorf", WIEN, "https://www.wien.gv.at/umwelt/energie-projekt-hallenbad-floridsdorf"),
  ref("RC-WIEN-ANERGY-GRANT", "official", MA20, 2024, "Förderrichtlinie für Wärmenetze (Anergienetze) in Verbindung mit Wärmepumpen im Rahmen einer Heizungsumstellung ab zwei Objekten 2024/2025", WIEN, "https://www.wien.gv.at/pdf/foerderrichtlinie-waermenetze.pdf"),
  ref("RC-WIEN-WAERMEPLAN", "official", MA20, 2026, "Der Wiener Wärmeplan 2040 (map and area categories)", WIEN, "https://www.wien.gv.at/pdf/ma20/waermeplan.pdf"),
  ref("RC-WIEN-ENERGIE-INFO-16", "official", MA20, 2024, "Energie-Info Ottakring, 16. Bezirk", WIEN, "https://www.wien.gv.at/pdf/ma20/energie-info-bezirk-16.pdf"),
  ref("RC-WIEN-ENERGIE-INFO-22", "official", MA20, 2024, "Energie-Info Donaustadt, 22. Bezirk", WIEN, "https://www.wien.gv.at/pdf/ma20/energie-info-bezirk-22.pdf"),
  ref("RC-WIEN-ENERGIE-INFO-23", "official", MA20, 2024, "Energie-Info Liesing, 23. Bezirk", WIEN, "https://www.wien.gv.at/pdf/ma20/energie-info-bezirk-23.pdf"),
  ref("RC-ANERGIEURBAN", "official", `${MA20}, with the Federal Ministry BMK and the Österreichischer Städtebund`, 2020, "Projektbericht AnergieUrban, Stufe 1: Die Stadt als Energiespeicher", "City of Vienna, via Wienbibliothek digital", "https://digital.wienbibliothek.at/download/pdf/3645878.pdf"),
  ref("RC-WIENEU-STARTZELLEN", "official", "Stadt Wien", 2025, "WieNeu+ im Grätzl 20+2: Anergienetz Startzellen (ÖGUT)", "City of Vienna, via Wienbibliothek digital", "https://digital.wienbibliothek.at/download/pdf/5751154.pdf"),
  ref("RC-SOCIALHOUSING-GEBLERGASSE", "official", "Stadt Wien, Wiener Wohnen Kundenservice GmbH", 2026, "SMART BLOCK Geblergasse", "socialhousing.wien, the City of Vienna's housing portal","https://socialhousing.wien/best-practice/rehabilitation-modernisation-and-safety/smart-block-geblergasse"),
  ref("RC-WIEN-OTTAKRINGER-BAD", "official", "Stadt Wien, Wiener Bäder", 2026, "Ottakringer Bad: Kombibad der Stadt Wien", WIEN, "https://www.wien.gv.at/freizeit/ottakringer-bad"),
  ref("RC-WGW-OTTAKRINGER-BAD", "official", WIKI, 2023, "Ottakringer Bad", WIEN, "https://www.geschichtewiki.wien.gv.at/Ottakringer_Bad"),
  ref("RC-WGW-GROSSMARKT", "official", WIKI, 2024, "Großmarkt Inzersdorf", WIEN, "https://www.geschichtewiki.wien.gv.at/Gro%C3%9Fmarkt_Inzersdorf"),
  ref("RC-KDO-STATUTE", "official", "Wiener Gesundheitsverbund, Klinik Donaustadt", 2022, "Anstaltsordnung der Klinik Donaustadt", "Wiener Gesundheitsverbund", "https://klinik-donaustadt.gesundheitsverbund.at/wp-content/uploads/sites/9/2023/09/KDO-Anstaltsordnung-2022.pdf"),
  ref("RC-KDO-HOUSE", "official", "Wiener Gesundheitsverbund, Klinik Donaustadt", 2026, "Das Haus", "Wiener Gesundheitsverbund", "https://klinik-donaustadt.gesundheitsverbund.at/das-haus/"),
  // Federal and research
  ref("RC-SMART-BLOCK-II", "official", "Burtscher-Durig ZT GmbH, ÖGUT, Komobile w7, Gruber, M., Zeininger, J.", 2018, "SMART BLOCK II Energy: Energie, Mobilität, Finanzierung, Kommunikation. Publizierbarer Endbericht", "Klima- und Energiefonds, Blue Globe Report Smart Cities 6/2018", "https://www.klimafonds.gv.at/wp-content/uploads/2025/06/Endbericht-Smart-Block-II-Geblergasse.pdf"),
  ref("RC-UFI-MIKRONETZE", "official", "Kommunalkredit Public Consulting", 2026, "Informationsblatt Erneuerbare Mikronetze für Betriebe und Gemeinden (Version 05/2026)", "Umweltförderung im Inland", "https://www.umweltfoerderung.at/fileadmin/user_upload/umweltfoerderung/betriebe/WKV/UFI_Standardfall_Infoblatt_WKV_MIKRONETZ.pdf"),
  ref("RC-KRANZL-2026-PAPER", "official", "Kranzl, L., Frank-Stocker, A., Hummel, M., Müller, A., Patel, N., Wiechers, E., Worm, J., Ziegler, M.", 2026, "Anergienetze: Gamechanger oder Nischenlösung für die urbane Wärme- und Kälteversorgung?", "19. Symposium Energieinnovation, TU Graz; based on a study for the City of Vienna, MA 20", "https://www.tugraz.at/fileadmin/user_upload/Events/Eninnov/EnInnov2026/files/kf/645_KF_Kranzl.pdf"),
  ref("RC-KRANZL-2026-SLIDES", "official", "Kranzl, L., Patel, N., Fallahnejad, M., Frank-Stocker, A., Hummel, M., Müller, A., Wiechers, E., Worm, J., Ziegler, M.", 2026, "Anergienetze: Gamechanger oder Nischenlösung? (presentation)", "19. Symposium Energieinnovation, TU Graz", "https://www.tugraz.at/fileadmin/user_upload/Events/Eninnov/EnInnov2026/files/pr/644_PR_Kranzl.pdf"),
  ref("RC-LENA-HOSPITALS", "official", "Landesenergieagentur Sachsen-Anhalt (LENA)", 2020, "Energieeffizienz für Krankenhäuser in Sachsen-Anhalt", "LENA, Magdeburg", "https://lena.sachsen-anhalt.de/fileadmin/Bibliothek/Sonstige_Webprojekte/Lena/Dokumente/FB_Wirtschaft/Leitfaden_Krankenhaus/LENA_Energieeffizienz-f-Krankenhaeuser-in-S-T_web.pdf"),
  ref("RC-BISP-POOLS", "official", "Schlesiger, G.", 2002, "Energie- und wassersparende Maßnahmen in Bädern", "BISp-Jahrbuch 2001, Bundesinstitut für Sportwissenschaft, 55–62", "https://epflicht.ulb.uni-bonn.de/download/pdf/122883"),
  // Peer-reviewed
  ref("RC-KAMPEL-2014", "peer-reviewed", "Kampel, W., Aas, B., Bruland, A.", 2014, "Characteristics of energy-efficient swimming facilities – A case study", "Energy 75, 508–512", doi("10.1016/j.energy.2014.08.007")),
  ref("RC-GIUNTA-SAWALHA-2021", "peer-reviewed", "Giunta, F., Sawalha, S.", 2021, "Techno-economic analysis of heat recovery from supermarket's CO2 refrigeration systems to district heating networks", "Applied Thermal Engineering 193, 117000", doi("10.1016/j.applthermaleng.2021.117000")),
  // Developers and operators about their own project
  ref("RC-ARE-VILLAGE-FOLDER", "company", "ARE Austrian Real Estate", 2021, "Village im Dritten: Projektfolder", "ARE Austrian Real Estate", "https://villageimdritten.at/wp-content/uploads/2021/06/Village_im_Dritten_Projektfolder.pdf"),
  ref("RC-ARE-VILLAGE-PROJECT", "company", "ARE Austrian Real Estate", 2026, "Village im Dritten: Projekt", "ARE Austrian Real Estate", "https://villageimdritten.at/"),
  ref("RC-ARE-VILLAGE-ENERGY", "company", "ARE Austrian Real Estate", 2026, "Village im Dritten: Energiesystem", "ARE Austrian Real Estate", "https://villageimdritten.at/energiesystem/"),
  ref("RC-WIEN-ENERGIE-ZEC-2023", "company", "Köfinger, M. (Wien Energie)", 2023, "Volle Energie fürs Klima! Mit innovativen Konzepten in eine klimaneutrale Zukunft", "Zero Emission City 2023, Wirtschaftskammer Wien", "https://www.wko.at/wien/energie/markus-koefinger-wien-energie-innovative-konzepte-zec2023.pdf"),
  ref("RC-GMW-FACTS", "company", "GMW Großmarkt Wien Betrieb GmbH", 2026, "Daten und Fakten", "Großmarkt Wien", "https://www.grossmarkt-wien.at/grossmarkt-daten-und-fakten"),
  ref("RC-GMW-OPERATOR", "company", "GMW Großmarkt Wien Betrieb GmbH", 2026, "GMW Großmarkt Wien Betrieb GmbH", "Großmarkt Wien", "https://www.grossmarkt-wien.at/grossmarkt-betrieb-gmbh"),
  ref("RC-GMW-50-YEARS", "company", "GMW Großmarkt Wien Betrieb GmbH", 2022, "Jubiläumsbroschüre 50 Jahre Großmarkt Wien: Garantierte Versorgung für Wien", "Großmarkt Wien", "https://www.grossmarkt-wien.at/wp-content/uploads/2025/12/50-Jahre-GMW_Festbroschure_2022.pdf"),
]

export function referenceCaseSourceOf(id: string): Reference | undefined {
  return REFERENCE_CASE_SOURCES.find((source) => source.id === id)
}
