/**
 * External references of the AI Plan Score and the reference cases (PLAN-AI-SCORE-01 § Sources,
 * D-76). Every entry was opened on its access date: each DOI resolved at doi.org and each URL
 * fetched (research notes of 2026-10-24); `pnpm check:references` fetches them again. Public docs
 * may link outside the site only to these URLs. The challenge material and the talk of the
 * research project Anergie Leicht Gemacht are cited as provider sources, without a link.
 */
export const REFERENCE_KINDS = ["peer-reviewed", "official", "standard", "book", "company"] as const
export type ReferenceKind = (typeof REFERENCE_KINDS)[number]

export interface Reference {
  id: string
  kind: ReferenceKind
  /** As cited: "Lygnerud, K., Wheatcroft, E., Wynn, H." */
  authors: string
  year: number
  title: string
  /** Journal with volume and pages, publisher or agency. */
  source: string
  /** https only: a doi.org link for papers, the official page or PDF otherwise. */
  url: string
  /** The day the link was opened and its content checked. */
  checked: string
}

const CHECKED = "2026-10-24"
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

export const REFERENCES: readonly Reference[] = [
  // 5GDHC, district heating economics and business models
  ref("SRC-BUFFA-2019", "peer-reviewed", "Buffa, S., Cozzini, M., D'Antoni, M., Baratieri, M., Fedrizzi, R.", 2019, "5th generation district heating and cooling systems: A review of existing cases in Europe", "Renewable and Sustainable Energy Reviews 104, 504–522", doi("10.1016/j.rser.2018.12.059")),
  ref("SRC-GJOKA-2023", "peer-reviewed", "Gjoka, K., Rismanchi, B., Crawford, R.H.", 2023, "Fifth-generation district heating and cooling systems: A review of recent advancements and implementation barriers", "Renewable and Sustainable Energy Reviews 171, 112997", doi("10.1016/j.rser.2022.112997")),
  ref("SRC-LYGNERUD-2019", "peer-reviewed", "Lygnerud, K., Wheatcroft, E., Wynn, H.", 2019, "Contracts, business models and barriers to investing in low temperature district heating projects", "Applied Sciences 9(15), 3142", doi("10.3390/app9153142")),
  ref("SRC-LYGNERUD-2023", "peer-reviewed", "Lygnerud, K., Popovic, T., Schultze, S., Støchkel, H.K.", 2023, "District heating in the future – thoughts on the business model", "Energy 278, 127714", doi("10.1016/j.energy.2023.127714")),
  ref("SRC-LYGNERUD-WERNER-2018", "peer-reviewed", "Lygnerud, K., Werner, S.", 2018, "Risk assessment of industrial excess heat recovery in district heating systems", "Energy 151, 430–441", doi("10.1016/j.energy.2018.03.047")),
  ref("SRC-BOESTEN-2019", "peer-reviewed", "Boesten, S., Ivens, W., Dekker, S.C., Eijdems, H.", 2019, "5th generation district heating and cooling systems as a solution for renewable urban thermal energy supply", "Advances in Geosciences 49, 129–136", doi("10.5194/adgeo-49-129-2019")),
  ref("SRC-PERSSON-WERNER-2011", "peer-reviewed", "Persson, U., Werner, S.", 2011, "Heat distribution and the future competitiveness of district heating", "Applied Energy 88(3), 568–576", doi("10.1016/j.apenergy.2010.09.020")),
  ref("SRC-NUSSBAUMER-2016", "peer-reviewed", "Nussbaumer, T., Thalmann, S.", 2016, "Influence of system design on heat distribution costs in district heating", "Energy 101, 496–505", doi("10.1016/j.energy.2016.02.062")),
  ref("SRC-REIDHAV-WERNER-2008", "peer-reviewed", "Reidhav, C., Werner, S.", 2008, "Profitability of sparse district heating", "Applied Energy 85(9), 867–877", doi("10.1016/j.apenergy.2008.01.006")),
  ref("SRC-WIRTZ-2020-EB", "peer-reviewed", "Wirtz, M., Kivilip, L., Remmen, P., Müller, D.", 2020, "Quantifying demand balancing in bidirectional low temperature networks", "Energy and Buildings 224, 110245", doi("10.1016/j.enbuild.2020.110245")),
  // Governance, participation and finance
  ref("SRC-HAWKEY-2013", "peer-reviewed", "Hawkey, D., Webb, J., Winskel, M.", 2013, "Organisation and governance of urban energy systems: district heating and cooling in the UK", "Journal of Cleaner Production 50, 22–31", doi("10.1016/j.jclepro.2012.11.018")),
  ref("SRC-BUSH-2016", "peer-reviewed", "Bush, R.E., Bale, C.S.E., Taylor, P.G.", 2016, "Realising local government visions for developing district heating: Experiences from a learning country", "Energy Policy 98, 84–96", doi("10.1016/j.enpol.2016.08.013")),
  ref("SRC-WUSTENHAGEN-2007", "peer-reviewed", "Wüstenhagen, R., Wolsink, M., Bürer, M.J.", 2007, "Social acceptance of renewable energy innovation: An introduction to the concept", "Energy Policy 35(5), 2683–2691", doi("10.1016/j.enpol.2006.12.001")),
  ref("SRC-STEFFEN-2018", "peer-reviewed", "Steffen, B.", 2018, "The importance of project finance for renewable energy projects", "Energy Economics 69, 280–294", doi("10.1016/j.eneco.2017.11.006")),
  // What makes a plan credible; how an AI judge is read
  ref("SRC-KIRSCH-2009", "peer-reviewed", "Kirsch, D., Goldfarb, B., Gera, A.", 2009, "Form or substance: the role of business plans in venture capital decision making", "Strategic Management Journal 30(5), 487–515", doi("10.1002/smj.751")),
  ref("SRC-BRINCKMANN-2010", "peer-reviewed", "Brinckmann, J., Grichnik, D., Kapsa, D.", 2010, "Should entrepreneurs plan or just storm the castle? A meta-analysis on contextual factors impacting the business planning–performance relationship in small firms", "Journal of Business Venturing 25(1), 24–40", doi("10.1016/j.jbusvent.2008.10.007")),
  ref("SRC-BROOKHART-2018", "peer-reviewed", "Brookhart, S.M.", 2018, "Appropriate criteria: Key to effective rubrics", "Frontiers in Education 3, 22", doi("10.3389/feduc.2018.00022")),
  ref("SRC-GEVAL-2023", "peer-reviewed", "Liu, Y., Iter, D., Xu, Y., Wang, S., Xu, R., Zhu, C.", 2023, "G-Eval: NLG evaluation using GPT-4 with better human alignment", "Proceedings of EMNLP 2023, 2511–2522", doi("10.18653/v1/2023.emnlp-main.153")),
  ref("SRC-ZHENG-2023", "peer-reviewed", "Zheng, L., Chiang, W.-L., Sheng, Y., et al.", 2023, "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena", "NeurIPS 2023 Datasets and Benchmarks Track (arXiv:2306.05685)", "https://arxiv.org/abs/2306.05685"),
  // Frameworks for plan quality and evidence
  ref("SRC-OSTERWALDER-2010", "book", "Osterwalder, A., Pigneur, Y.", 2010, "Business Model Generation: A Handbook for Visionaries, Game Changers, and Challengers", "Wiley, ISBN 978-0-470-87641-1", "https://www.wiley.com/en-us/Business+Model+Generation%3A+A+Handbook+for+Visionaries%2C+Game+Changers%2C+and+Challengers-p-9780470876411"),
  ref("SRC-BLAND-2020", "company", "Bland, D.J.", 2020, "How assumptions mapping can focus your teams on running experiments that matter", "Strategyzer", "https://strategyzer.com/library/how-assumptions-mapping-can-focus-your-teams-on-running-experiments-that-matter"),
  ref("SRC-BROWN-2008", "company", "Brown, T.", 2008, "Design thinking", "Harvard Business Review 86(6)", "https://hbr.org/2008/06/design-thinking"),
  ref("SRC-ARENA-CRI-2014", "standard", "Australian Renewable Energy Agency", 2014, "Commercial Readiness Index for Renewable Energy Sectors", "ARENA, Canberra", "https://arena.gov.au/assets/2014/02/Commercial-Readiness-Index.pdf"),
  ref("SRC-EC-CBA-2014", "official", "European Commission, DG Regional and Urban Policy", 2014, "Guide to Cost-Benefit Analysis of Investment Projects: Economic appraisal tool for Cohesion Policy 2014–2020", "European Commission", "https://jaspers.eib.org/LibraryNP/EC%20Reports/DG%20REGIO%20CBA%20Guide%20for%202014-2020.pdf"),
  ref("SRC-HMT-BC-2026", "official", "HM Treasury", 2026, "Guidance on developing business cases for projects and programmes", "HM Treasury, London", "https://assets.publishing.service.gov.uk/media/6a4390675b6406df58c14006/Guidance_on_Developing_Business_Cases.pdf"),
  ref("SRC-GHNF-2026", "official", "Department for Energy Security and Net Zero", 2026, "Green Heat Network Fund: Guidance for Applicants, version 12.0", "UK Government", "https://assets.publishing.service.gov.uk/media/698c8f63547c54ae7c023662/GHNF-guidance-for-applicants-R11.pdf"),
  ref("SRC-D2GRIDS-2020", "official", "Ivens, W., Boesten, S.", 2020, "D2Grids WP LT Deliverable DEL.1.1: Roll-out strategy, preliminary version", "Interreg North-West Europe", "https://vb.nweurope.eu/media/11178/wplt-d11-roll-out-strategy-preliminary-version-final.pdf"),
  // Austria and Vienna
  ref("SRC-WIEN-WWP-2040", "official", "Stadt Wien, MA 20 Energieplanung", 2024, "Wiener Wärmeplan 2040 (Vienna Heating Plan 2040)", "City of Vienna", "https://www.wien.gv.at/umwelt/waermeplan-2040"),
  ref("SRC-WIEN-WWP-METHOD", "official", "Stadt Wien, MA 20 Energieplanung", 2025, "Beschreibung der Methodik und der Vorgehensweise zur Entwicklung des Konzeptes „Raus aus Gas – Wiener Wärme und Kälte 2040“ und „Wiener Wärmeplan 2040“", "City of Vienna", "https://www.wien.gv.at/pdf/ma20/methoden-beschreibung-waermeplan.pdf"),
  ref("SRC-WRG-1959", "official", "Republik Österreich", 1959, "Wasserrechtsgesetz 1959 (WRG 1959), § 10", "Rechtsinformationssystem des Bundes (RIS)", "https://ogd.ris.bka.gv.at/Dokumente/Bundesnormen/NOR12141151/NOR12141151.html"),
  ref("SRC-OOE-GWWP", "official", "Land Oberösterreich, Bezirkshauptmannschaft Steyr-Land", 2026, "Grundwasserwärmepumpen", "Land Oberösterreich", "https://www.land-oberoesterreich.gv.at/29454.htm"),
  ref("SRC-EWG-2024", "official", "Republik Österreich", 2024, "Erneuerbare-Wärme-Gesetz (EWG), BGBl. I Nr. 8/2024", "Rechtsinformationssystem des Bundes (RIS)", "https://ogd.ris.bka.gv.at/Dokumente/Bundesnormen/NOR40260603/NOR40260603.html"),
  ref("SRC-UFI-WKV", "official", "Kommunalkredit Public Consulting (Umweltförderung im Inland)", 2024, "Gewerbliche Wärme- und Kälteversorgung", "umweltfoerderung.at", "https://www.umweltfoerderung.at/betriebe/wkv/unterkategorie-waermekaelte"),
  ref("SRC-SANOFF-2026", "official", "Bundesministerien, Kommunalkredit Public Consulting", 2026, "Sanierungsoffensive", "sanierungsoffensive.gv.at", "https://www.sanierungsoffensive.gv.at/"),
]

export function referenceOf(id: string): Reference | undefined {
  return REFERENCES.find((reference) => reference.id === id)
}

/** Provider sources: the challenge brief and the talk of the research project (no public link). */
export const PROVIDER_SOURCE = /^(?:BM|ALG)-[A-Z0-9-]+$/

export function isKnownSource(id: string): boolean {
  return PROVIDER_SOURCE.test(id) || referenceOf(id) !== undefined
}
