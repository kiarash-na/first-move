---
id: RESEARCH-SEED-SOURCES
title: 'Reference cases: verified bibliography'
source: [web research by a Claude sub-agent, 2026-10-24; revised 2026-10-25 for the re-anchored reference cases; every link opened and every DOI resolved on those days]
---

# Seed sources: bibliography and link verification

Accessed and verified on **2026-10-24**. Every URL below was fetched with `curl -sSL` through the session proxy, and the final HTTP status and the page or PDF title were recorded. Content was read from the fetched page or PDF (text extracted with `pdftotext`), except where a row says otherwise. DOIs were resolved at `https://doi.org/<doi>` (first hop recorded), and title, authors, journal, year, volume and pages were confirmed through the Crossref API. Abstracts were read on IDEAS/RePEc or OpenAlex because the publisher sites (ScienceDirect, MDPI) return 403 to automated clients.

Reliability labels:

- **official**: public authority, federal programme or funding agency.
- **research**: university, research institute or scientific symposium, not peer-reviewed.
- **peer-reviewed**: journal article with a DOI.
- **company**: an organisation writing about its own project.
- **news**: newspaper, broadcaster or trade press.
- **internal**: a file in this repository.

The numbers match the [n] markers in `seed-dossier.md`.

## Revision of 2026-10-25: what the app cites

The owner set two rules on 2026-10-25: the links must be sound ("make sure the links are science proven"), and the three fictional cases must be re-anchored on real, named Vienna buildings. Since then:

- **The app cites only `lib/examples/reference-cases/sources.ts`** (`REFERENCE_CASE_SOURCES`, ids `RC-…`), next to the method references of `lib/docs/references.ts`. All 32 entries were opened again on **2026-10-25** (HTTP 200, content read; DOIs resolved at doi.org); `node scripts/check-references.mjs` fetches them on demand.
- **Allowed kinds:** official pages and documents, research reports, peer-reviewed papers through doi.org, and a developer's or operator's own page about its own project. **No news and no blogs**: [33] to [38] below stay in this log as research history, but no fact in the app or on the public docs page rests on them. Where a news item was the only source of a number (Geblergasse 2021: 18 probes and €350,000 [36]; Klinik Floridsdorf heat demand and investment [37]; Hallenbad Floridsdorf cost and groundwater heat pump [38]; Village im Dritten partners and construction state [34][35]), the number was dropped.
- **Mapping to this list:** RC-WIEN-SEEBOGEN [1], RC-WIEN-KLINIK-FLORIDSDORF [3], RC-WIEN-HALLENBAD-FLORIDSDORF [4], RC-WIEN-WAERMEPLAN [5], RC-WIEN-ANERGY-GRANT [6], RC-ANERGIEURBAN [7], RC-WIENEU-STARTZELLEN [8], RC-SOCIALHOUSING-GEBLERGASSE [9], RC-SMART-BLOCK-II [11], RC-UFI-MIKRONETZE [13], RC-KRANZL-2026-PAPER [17], RC-KRANZL-2026-SLIDES [18], RC-LENA-HOSPITALS [20], RC-BISP-POOLS [22], RC-KAMPEL-2014 [26], RC-ARE-VILLAGE-FOLDER and RC-ARE-VILLAGE-PROJECT [30], RC-WIEN-ENERGIE-ZEC-2023 [31], RC-ASPERN-SEEBOGEN-2022 [32]; new on 2026-10-25: [42] to [54].
- **Not cited in the app any more:** [2], [10], [12], [14] to [16], [19], [21], [23] to [25], [27] to [29], [33] to [41]. They served the candidate screening, the first fictional cases or background, and stay listed for the record.

## Official: City of Vienna

**[1] Stadt Wien, Energieplanung (MA 20): "Energie-Vorzeigeprojekt – Kraftwerk Seebogen".** Page updated 24.10.2026 (CC BY 4.0).
URL: https://www.wien.gv.at/umwelt/energie-projekt-kraftwerk-seebogen
Verified: 200 · "Energie-Vorzeigeprojekt - Kraftwerk Seebogen - Stadt Wien"
Supports: plot H6 and its streets; in operation since 2022; five developers share the plot and most of the energy system; ~270 flats and ~250 workplaces; the business park of the Wirtschaftsagentur uses district heating; two independent probe fields with 92 boreholes × 150 m; anergy loop at 4 °C (spring) to 16 °C (autumn); heat pumps in every connected building; total space-heating demand ~1,600 MWh/a plus hot water and cooling; air heat and supermarket waste heat; four rooftop PV systems; ~440 t CO2/a saved.
Reliability: official.

**[2] Stadt Wien, MA 20: "Energie-Vorzeigeprojekt – Viertel Zwei Plus".**
URL: https://www.wien.gv.at/umwelt/energie-projekt-viertel-zwei-plus
Verified: 200 · "Energie-Vorzeigeprojekt - Viertel Zwei Plus - Stadt Wien"
Supports: Viertel Zwei, 2nd district; car-free area of 16 ha; first part finished 2010, extension until 2023; 15,000 people living and working there; geothermal, solar and waste-heat sources; "the largest so-called Anergie-Netz in Austria"; ÖGNI platinum; Wien Energie energy-community tests. Used only in the candidate screening.
Reliability: official.

**[3] Stadt Wien, MA 20: "Energie-Vorzeigeprojekt – Klinik Floridsdorf".**
URL: https://www.wien.gv.at/umwelt/energie-projekt-klinik-floridsdorf
Verified: 200 · "Energie-Vorzeigeprojekt - Klinik Floridsdorf - Stadt Wien"
Supports: ~800 beds; since autumn 2023 Wien Energie uses waste heat from ~120,000 servers of the neighbouring Digital Realty data centre; 150 m pipe; three heat pumps of 6.5 t each, 3 MW in total; server cooling water at 26 °C raised to 82 °C and returned at 16 °C; covers 50-70% of the hospital's heat; up to 4,000 t CO2/a saved; rooftop PV (~2,000 panels).
Reliability: official.

**[4] Stadt Wien, MA 20: "Energie-Vorzeigeprojekt – Hallenbad Floridsdorf".**
URL: https://www.wien.gv.at/umwelt/energie-projekt-hallenbad-floridsdorf
Verified: 200 · "Energie-Vorzeigeprojekt - Hallenbad Floridsdorf - Stadt Wien"
Supports: a municipal indoor pool (built 1967); heat pumps, PV and thermal refurbishment cut district-heat use by 95%, electricity by 25% and water by 55%.
Reliability: official.

**[5] Stadt Wien: "Der Wiener Wärmeplan 2040"** (PDF, 2 pages, created 28.05.2024).
URL: https://www.wien.gv.at/pdf/ma20/waermeplan.pdf
Verified: 200 · PDF title "Der Wiener Wärmeplan 2040"
Supports: the area categories (Fernwärme Heute / Zukunft, Lokale Wärme gemeinsam, Lokale Wärme individuell). "Lokale Wärme gemeinsam" areas are dense, with high heat demand, and suited to shared local networks using local sources.
Reliability: official.

**[6] Stadt Wien, Energieplanung (MA 20): "Förderrichtlinie für Wärmenetze (Anergienetze) in Verbindung mit Wärmepumpen im Rahmen einer Heizungsumstellung ab zwei Objekten 2024/2025"** (PDF, 14 pages, dated 01.10.2024).
URL: https://www.wien.gv.at/pdf/foerderrichtlinie-waermenetze.pdf
Verified: 200 · PDF title as quoted
Supports:
- Budget €1.2 m per year.
- Eligible: ≥2 buildings incl. ≥1 residential; fossil systems incl. cooking gas fully replaced; a new-build part is eligible only if ≥1 existing building is supplied; staged extension allowed if documented, with eligible parts finished within 3 years.
- Applicants: registered owners or holders of building rights.
- Grant: 30% of eligible cost, max €200,000 per case; de minimis rule (€300,000 in 3 years).
- Valid for applications from 01.10.2024 to 31.12.2025.
- Annex: balanced annual ground balance (±20% per year, ±10% over 5 years), injection ≤30 °C long-term, 30-year simulation.

Note: no 2026 successor was found, so the examples say "successor not verified".
Reliability: official.

**[7] Stadt Wien, MA 20 (commissioned with BMK and Österreichischer Städtebund): "Projektbericht AnergieUrban – Stufe 1. Die Stadt als Energiespeicher"** (PDF, 80 pages, 2020), via Wienbibliothek digital.
URL: https://digital.wienbibliothek.at/download/pdf/3645878.pdf
Verified: 200 · PDF title "Projektbericht AnergieUrban - Stufe 1" (author field "Stadt Wien")
Supports:
- §2.3: the Geblergasse pilot; first stage started August 2018; two buildings with probes and hybrid solar collectors; network with pipe stubs for further connections; talks with five more buildings; the SEFIPA financing and business model.
- §3.2 and conclusions: courtyards allow only small rigs and shallow probes; public space allows double depth; in the Gründerzeit test area 5, public land supplies 61% of storage capacity; guidelines for probes on public land are needed; full-cost parity with gas at ~€10/m² net floor area per year over 20 years (1,000 m² house, June 2018 prices); free cooling.
- Table 7: probe drilling €65/m (60 m depth) and €50/m (120 m); specific annual energy 62.5 kWh per probe metre.
- Annual efficiency (JAZ) of 6 assumed for Geblergasse.

Reliability: official.

**[8] Stadt Wien: "WieNeu+ im Grätzl 20+2"** (PDF excerpt, 2 pages), via Wienbibliothek digital.
URL: https://digital.wienbibliothek.at/download/pdf/5751154.pdf
Verified: 200 · PDF title "WieNeu+ im Grätzl 20+2"
Supports: the section "Anergienetz Startzellen – ÖGUT": ÖGUT assessed nine housing blocks for anergy networks; definition of anergy networks.
Reliability: official.

**[9] socialhousing.wien (City of Vienna housing website): "SMART BLOCK_Geblergasse".**
URL: https://socialhousing.wien/best-practice/rehabilitation-modernisation-and-safety/smart-block-geblergasse
Verified: 200 · "SMART BLOCK_Geblergasse - Socialhousing"
Supports: Geblergasse 11 and 13, 17th district; 25 dwellings on ~1,770 m² useful floor area; geothermal and solar plant linked across plots, "the first anergy network in a Gründerzeit block"; monitored in the research project Smart Block II; winner at the 35th Vienna Urban Renewal Awards, Goldenes Güteziegel "Pioneering Achievement".
Reliability: official.

**[10] Stadt Wien, MA 20: "Energie-Vorzeigeprojekt – Holzbau Wildgarten".**
URL: https://www.wien.gv.at/umwelt/energie-projekt-holzbau-wildgarten
Verified: 200 · "Energie-Vorzeigeprojekt - Holzbau Wildgarten - Stadt Wien"
Supports: Wildgarten, 11 ha, 22 plots, ~2,300 residents; "like all buildings in the quarter, connected to district heating". This is the reason Wildgarten was dropped as a 5GDHC case.
Reliability: official.

## Official: federal programmes

**[11] Klima- und Energiefonds: Blue Globe Report Smart Cities #6/2018, "SMART BLOCK II Energy – Energie, Mobilität, Finanzierung, Kommunikation", publishable final report** (Burtscher-Durig ZT GmbH with ÖGUT, Komobile w7, M. Gruber, J. Zeininger; created 30.10.2017; PDF, 51 pages).
URL: https://www.klimafonds.gv.at/wp-content/uploads/2025/06/Endbericht-Smart-Block-II-Geblergasse.pdf
Verified: 200 · PDF (no embedded title); first page "Blue Globe Report Smart Cities #6/2018 SMART BLOCK II Energy"
Supports:
- Project data: programme Smart Cities Demo, 6th call; cost €271,456 and funding €198,300 (for the study).
- §B5.2.1: Geblergasse 11 (1,100 m² GFA, 16 flats, 60 kW, 90 MWh heat, 30 MWh hot water) and 13 (900 m², 9 flats, 45 kW, 67 MWh, 20 MWh); 2,000 l buffer; ground store via 8 boreholes of ~120 m; 2 × 54 m² hybrid collectors; 110 kW heat pump; air heat down to −5 °C; summer cooling about 3 weeks, 10-14 h; gas condensing backup for 105 kW.
- Costs and conditions: plant ~€320,000 at tender, MA 25 grant 30% (~€95,000), net ~€225,000, about 3× a gas central heating; owners pay or a contractor finances; tenant costs must not exceed district heating; owners' construction-cost contribution still to be negotiated.
- §B5.3: 18 properties, 12 unrenovated, half of their owners reached; heating mix (gas storey heaters 65%, others ~10% each); heat ~125 kWh/m²a plus hot water ~25 kWh/m²a; district heating ~€60,000 per house (Wien Energie estimate); gas had to rise ~70% (€0.07233 → €0.125/kWh) to break even; €7.89/m²a cost with grants.
- Best-practice section: Kraftwerk Krieau / Viertel Zwei.

Reliability: official (published by the federal fund; content by the grantee).

**[12] Klima- und Energiefonds: "Mit Wind und Beton gegen den Klimawandel – Bauteilaktivierte Mehrfamilienhäuser MGG22"** (project sheet by KBF Kompetenzzentrum Bauforschung; PDF, 2 pages, created 2021).
URL: https://klimafonds.gv.at/wp-content/uploads/2024/10/MGG22.pdf
Verified: 200 · PDF title "Microsoft Word - MGG22"
Supports: candidate screening only. Three plots with four building sites, two developers, seven houses, 160 flats; nine heat pumps with 300 kW in total; 30 probes of ~150 m; thermal mass activation; seasonal ground regeneration.
Reliability: official.

**[13] Kommunalkredit Public Consulting for BMLUK: "Informationsblatt Erneuerbare Mikronetze für Betriebe und Gemeinden"** (Umweltförderung im Inland, module 3, version 05/2026; PDF, 9 pages).
URL: https://www.umweltfoerderung.at/fileadmin/user_upload/umweltfoerderung/betriebe/WKV/UFI_Standardfall_Infoblatt_WKV_MIKRONETZ.pdf
Verified: 200 · PDF title "Informationsblatt Erneuerbare Mikronetze"
Supports: grants up to 40% of eligible cost; municipalities receive 60% of the business rate; an external micro-network has 2-9 external customers or <800 MWh/a of heat sales; ≥50% of planned heat sales proven by contracts or letters of intent; contracts must state connected load, an indexed heat price and the ownership boundary; apply before any binding order; heat pumps need JAZ ≥3.8.
Reliability: official.

**[14] IBA_Wien: project sheet "255 MGG22 – Mehr als Wohnen!"** (PDF, 2 pages, February 2020).
URL: https://www.iba-wien.at/fileadmin/user_upload/documents/003_IBA_Projekte_u_Gebiete/01_Einzelprojekte/255_MGG22/255_MGG22_web.pdf
Verified: 200 · PDF (no embedded title)
Supports: candidate screening only. 160 units on three sites (108 privately financed, 20 subsidised SMART, 32 subsidised rental); 30 probes × 150 m; heat demand 24-28 kWh/m²a; completed August/September 2019.
Reliability: official (International Building Exhibition of the City of Vienna).

## Research

**[15] SEFIPA project slide: "Heat Supply Contracting – a solution for split incentive of tenant and landlord"** (PDF, 3 pages, created 16.10.2018, H2020 grant 696008; hosted by AEE INTEC; no author named on the slide).
URL: https://www.aee-intec.at/wp-content/uploads/2025/05/dateien1300.pdf
Verified: 200 · PDF title "Kein Folientitel"
Supports: a contracting pilot in a block of 18 tenement houses. Phase I: 2 buildings, 20 apartments, construction start spring 2018. Phase II: 4 more buildings planned for 2019 and 2020. "85% energy savings (20 vs. 157 MWh/a)"; SPF >6; full cost below district heating.
Caveat: the site is not named. That it is Geblergasse is inferred from the 18-property block and the 157 MWh/a (= 90 + 67 MWh in [11]); the flat count (20 vs 25) differs.
Reliability: research (an EU project slide).

**[16] ÖGUT: "Sustainable Energy Financing Platform in Austria (SEFIPA)".**
URL: https://www.oegut.at/en/projects/energy/sefipa.php
Verified: 200 · "Sustainable Energy Financing Platform in Austria (SEFIPA) | ÖGUT"
Supports: SEFIPA (Horizon 2020, completed) developed private financing solutions for sustainable energy. [7] names it as the source of the Geblergasse financing and business model.
Reliability: research (non-profit institute).

**[17] Kranzl, L.; Frank-Stocker, A.; Hummel, M.; Müller, A.; Patel, N.; Wiechers, E.; Worm, J.; Ziegler, M. (2026): "Anergienetze: Gamechanger oder Nischenlösung für die urbane Wärme- und Kälteversorgung?"** Extended abstract, 19. Symposium Energieinnovation, TU Graz, 11.-13.02.2026 (TU Wien EEG, e-think, PlanEnergi, Sima consulting; based on a study for MA 20).
URL: https://www.tugraz.at/fileadmin/user_upload/Events/Eninnov/EnInnov2026/files/kf/645_KF_Kranzl.pdf
Verified: 200 · PDF (2 pages; title field is the template text "Titel, Bezeichnung des Vortrags")
Supports: about 1,000 areas outside district-heating zones are suitable for local networks, most of them under 5 GWh/a. 2-3 TWh/a of Vienna's 13-14 TWh/a could use local networks, ~43% of it via anergy networks. "Lokale Wärme gemeinsam" areas have 1.7 TWh/a not covered by district heating; 84% of it is coverable, 47 percentage points via probe-based anergy networks. Groundwater concepts are near economic parity; probe concepts reach it only with optimisation, extra sources and renovation.
Reliability: research (conference paper, not peer-reviewed).

**[18] Kranzl, L.; Patel, N.; Fallahnejad, M.; Frank-Stocker, A.; Hummel, M.; Müller, A.; Wiechers, E.; Worm, J.; Ziegler, M. (2026): presentation slides of [17]** (22 pages).
URL: https://www.tugraz.at/fileadmin/user_upload/Events/Eninnov/EnInnov2026/files/pr/644_PR_Kranzl.pdf
Verified: 200 · PDF (22 pages; title field is the template text "Musterpräsentation")
Supports: slide 7 criteria: groundwater only where there is enough of it (e.g. Floridsdorf, Donaustadt); well pairs ≥50 m apart; ≥25 m² per drilling point; JAZ 4; probes 120 m deep (60 m in perimeter blocks); 26 W/m without regeneration. Slides 21-23: groundwater is cheaper than probes but limited in Vienna; economics depend strongly on line costs and connection rate.
Reliability: research.

**[19] Verein Geothermie Österreich: "Geothermie in Anergienetzen".**
URL: https://www.geothermie-oesterreich.at/was-ist-geothermie/geothermie-in-anergienetzen/
Verified: 200 · "Geothermie in Anergienetzen - Geothermie für Österreich"
Supports: definition (network at ~5-20 °C, decentralised heat pumps, free cooling, balanced heating and cooling, probe fields as storage); typical sources and consumers. Background only; it is also the link given in the challenge brief (BM-SCOPE-10).
Reliability: research (professional association; Geothermie Österreich is an ALG project partner).

**[20] Landesenergieagentur Sachsen-Anhalt (LENA): "Energieeffizienz für Krankenhäuser in Sachsen-Anhalt"** (guide, PDF, 16 pages, 2020; funded by the state ministry).
URL: https://lena.sachsen-anhalt.de/fileadmin/Bibliothek/Sonstige_Webprojekte/Lena/Dokumente/FB_Wirtschaft/Leitfaden_Krankenhaus/LENA_Energieeffizienz-f-Krankenhaeuser-in-S-T_web.pdf
Verified: 200 · PDF (16 pages, no embedded title)
Supports: German national average per hospital bed of ~6,000 kWh electricity and ~29,000 kWh heat per year. Klinikum Magdeburg: 779 beds; old compression chillers used ~560,000 kWh electricity/a; new 233 kW absorption chiller plus 159 kW peak compression chiller; the largest cooling demand falls in summer.
Reliability: official (state energy agency).

**[21] Landesinitiative Zukunftsenergien NRW and NRW ministries: "Rationelle Energienutzung im Krankenhaus"** (brochure, 12/2003; PDF, 12 pages; hosted on the Land Steiermark site win.steiermark.at).
URL: https://www.win.steiermark.at/cms/dokumente/11263992_52486039/84a87ff2/Rationelle%20Energienutzung%20im%20Krankenhaus_.pdf
Verified: 200 · PDF title "BEK Krankenhaus2003_20.FH11"
Supports: benchmark that ≥40,000 kWh of heat per bed and year in a 500-bed house signals action. Practice example 3: 660 beds, 15 buildings, 100,000 m² GFA, heat 22.0 GWh/a, electricity 7.0 GWh/a (before renovation).
Reliability: official (old).

**[22] Schlesiger, G. (2002): "Energie- und wassersparende Maßnahmen in Bädern"**, in BISp-Jahrbuch 2001, Bundesinstitut für Sportwissenschaft, pp. 55-62. PDF via the legal-deposit server of ULB Bonn.
URL: https://epflicht.ulb.uni-bonn.de/download/pdf/122883
Verified: 200 · PDF title "004Schlesi.PDF" (8 pages)
Supports: guide values. Indoor pools 3-7 MWh of heat per m² of water area per year, or 10-20 kWh per visitor. Outdoor pools 0.3-0.7 MWh/m² of water area per year. The absorber-to-water-area ratio of 0.5-0.7 is background only.
Reliability: official (German federal sports institute; dated).

**[23] Harrington, C.; Garcia, J.; Pistochini, T. (2018): "ET16SDG1011: Waste-heat recovery from an air conditioner for swimming pool heating"**, UC Davis Western Cooling Efficiency Center for San Diego Gas & Electric, January 2018 (PDF, 27 pages).
URL: https://wcec.ucdavis.edu/wp-content/uploads/2018/07/SDGE_Pool_Heat_Rejection_052118_Final.pdf
Verified: 200 · PDF title field "SCE Design and Engineering Services"; the cover title is as quoted
Supports: in a field test, a 5-ton rooftop air conditioner rejecting heat to a commercial pool cut pool heating (natural gas) by 29%, with average electricity savings of ~5%.
Reliability: research (university centre; utility programme report).

## Peer-reviewed

**[24] Buffa, S.; Cozzini, M.; D'Antoni, M.; Baratieri, M.; Fedrizzi, R. (2019): "5th generation district heating and cooling systems: A review of existing cases in Europe."** Renewable and Sustainable Energy Reviews 104, 504-522.
DOI: 10.1016/j.rser.2018.12.059
Verified: doi.org 302 → linkinghub.elsevier.com (200); metadata confirmed via Crossref; abstract read via OpenAlex.
Supports: review of 40 5GDHC networks in Europe with distributed heat pumps; about 3 new systems per year in the last decade; the linear heat demand density of some networks is below classic DH thresholds; pumping energy is an order of magnitude higher than in classic DH. Background only.
Reliability: peer-reviewed.

**[25] Lund, H.; Østergaard, P. A.; Nielsen, T. B.; Werner, S.; Thorsen, J. E.; Gudmundsson, O.; Arabkoohsar, A.; Mathiesen, B. V. (2021): "Perspectives on fourth and fifth generation district heating."** Energy 227, 120520.
DOI: 10.1016/j.energy.2021.120520
Verified: doi.org 302 → linkinghub.elsevier.com; Crossref metadata; abstract read via OpenAlex.
Supports: the main driver of 5GDHC is combined heating and cooling with a near-ambient collective network as source or sink for building heat pumps. Background only.
Reliability: peer-reviewed.

**[26] Kampel, W.; Aas, B.; Bruland, A. (2014): "Characteristics of energy-efficient swimming facilities – A case study."** Energy 75, 508-512.
DOI: 10.1016/j.energy.2014.08.007
Verified: doi.org 302 → linkinghub.elsevier.com; Crossref metadata; abstract read on IDEAS (https://ideas.repec.org/a/eee/energy/v75y2014icp508-512.html, 200).
Supports: swimming facilities are a building category with particularly high energy consumption; the most efficient Norwegian facilities use heat exchangers and heat pumps to recover heat from outgoing water and air.
Reliability: peer-reviewed.

**[27] Bawaneh, K.; Ghazi Nezami, F.; Rasheduzzaman, M.; Deken, B. (2019): "Energy Consumption Analysis and Characterization of Healthcare Facilities in the United States."** Energies 12(19), 3775.
DOI: 10.3390/en12193775
Verified: doi.org 302 → mdpi.com (the MDPI full text returns 403 to automated clients); Crossref metadata; abstract read on IDEAS (https://ideas.repec.org/a/gam/jeners/v12y2019i19p3775-d273452.html, 200).
Supports: US hospitals average 738.5 kWh/m² (640.7-781.1 by climate zone), ~2.6× other commercial buildings. Background only.
Reliability: peer-reviewed (open access).

**[28] Huang, P.; Copertaro, B.; Zhang, X.; Shen, J.; Löfgren, I.; Rönnelid, M.; Fahlen, J.; Andersson, D.; Svanfeldt, M. (2020): "A review of data centers as prosumers in district energy systems: Renewable energy integration and waste heat reuse for district heating."** Applied Energy 258, 114109.
DOI: 10.1016/j.apenergy.2019.114109
Verified: doi.org 302 → linkinghub.elsevier.com; Crossref metadata; abstract read on IDEAS (https://ideas.repec.org/a/eee/appene/v258y2020ics0306261919317969.html, 200).
Supports: data centres produce large amounts of waste heat; global controls linking IT operation, waste-heat generation and downstream use are still lacking.
Reliability: peer-reviewed.

**[29] Wahlroos, M.; Pärssinen, M.; Rinne, S.; Syri, S.; Manner, J. (2018): "Future views on waste heat utilization – Case of data centers in Northern Europe."** Renewable and Sustainable Energy Reviews 82, 1749-1764.
DOI: 10.1016/j.rser.2017.10.058
Verified: doi.org 302 → linkinghub.elsevier.com; Crossref metadata; abstract read on IDEAS (https://ideas.repec.org/a/eee/rensus/v82y2018ip2p1749-1764.html, 200).
Supports: the main barriers are low-quality waste heat (low or unstable temperature) and high investment; business models between DH and data-centre operators are often not transparent; payback falls within the heat-pump lifetime when the heat is used in DH.
Reliability: peer-reviewed.

## Company (own project)

**[30] ARE Austrian Real Estate: "VILLAGE IM DRITTEN" project folder** (PDF, 7 pages, created 24.02.2021; timeline as planned at the start of 2020).
URL: https://villageimdritten.at/wp-content/uploads/2021/06/Village_im_Dritten_Projektfolder.pdf
Verified: 200 · PDF (no embedded title)
Supports: project area ~11.5 ha; park ~2.0 ha; 22 plots; ~250,000 m² GFA (~190,000 m² housing with 1,900 flats, rental and owned, private and subsidised; ~60,000 m² non-residential incl. ~20,000 m² schools); ~4,000 people; expected completion 2025 (2020 plan).
Reliability: company (developer, own project).

**[31] Wien Energie: "Volle Energie fürs Klima! Mit innovativen Konzepten in eine klimaneutrale Zukunft"** (presentation, Zero Emission City, 19.01.2023; speaker per file name: Markus Köfinger; hosted by WKO Wien; PDF, 12 pages).
URL: https://www.wko.at/wien/energie/markus-koefinger-wien-energie-innovative-konzepte-zec2023.pdf
Verified: 200 · PDF title "PowerPoint-Präsentation"
Supports: Wien Energie pursues cold local networks ("Anergienetze") that balance heat and cold across plots. Village im Dritten: residential and commercial, 22 plots, 250,000 m², 2,000 units, 8.6 MW heat demand and 1 MW cooling demand. Heat pumps on probes cover most space heat, district heating covers the rest incl. hot water; free cooling through the probes; an energy community across plots. About 100 projects in planning.
Reliability: company (utility, own project).

**[32] aspern Seestadt (Wien 3420 aspern Development AG) blog: "Bubbling with New Energy"** (Ellen Berg, 01.02.2022; first published in "Workflow" 02/2022).
URL: https://www.aspern-seestadt.at/en/blog/post/bubbling-with-new-energy
Verified: 200 · "2202-bubbling-with-new-energy | aspern Seestadt"
Supports: Kraftwerk Seebogen recently went into operation on plot H6, supplying nearly 20,000 m²; probes plus a low-temperature network give a CO2-free supply "which does not cost residents more than conventional systems"; David Bauernfeind, project manager at beyond carbon energy, "the company that built the power plant".
Reliability: company (area developer's own blog).

**[33] Erste Sparkasse, "Unternehmen wir Zukunft": "Eine CO₂-freie Wärme- und Kälteversorgung ist möglich"** (interview with Herbert Hetzel, managing director of Beyond Carbon Energy, 02.09.2022).
URL: https://www.sparkasse.at/sgruppe/unternehmen/unternehmen-wir-zukunft/artikel/BCE
Verified: 200 · "„Eine CO₂-freie Wärme- und Kälteversorgung ist möglich“ | Erste Sparkasse"
Supports: BCE plans, builds and runs systems; probes 150 m deep; a Seestadt project of ~23,000 m² usable area being commissioned (not explicitly named H6); ongoing extension at Viertel Zwei; prices "largely market-standard".
Reliability: company (a bank's customer story quoting the company).

## News and trade press (not used in the app since 2026-10-25)

**[34] futurezone (Barbara Wimmer): "Weg vom Gas: Mit 500 Erdsonden werden 2.000 Wohnungen geheizt"**, 01.03.2023.
URL: https://futurezone.at/digital-life/erdsonden-erdwaerme-waermepumpen-wien-energie-are-photovoltaik-klimaschutz-village/402347568
Verified: 200 · page title as quoted
Supports: Village im Dritten; ARE with Wien Energie; 500 probes × 150 m, described as Austria's largest probe field; 2,000 flats; completion 2027; probe water at 5-19 °C, heat pump up to 37 °C, floor heating and cooling; PV powers the heat pumps; Ampeers Energy software.
Reliability: news.

**[35] wien.ORF.at: "Neues Quartier mit 2.000 Wohnungen"**, 07.05.2024.
URL: https://wien.orf.at/stories/3256158/
Verified: 200 · "Neues Quartier mit 2.000 Wohnungen - wien.ORF.at"
Supports: location at Landstraßer Gürtel / Landstraßer Hauptstraße; ~2,000 flats; 500 probes × 150 m; PV ~1 MW in total; 11 ha developed by ARE with the City of Vienna, wohnfonds_wien and UBM; 10 of 22 plots under construction; ~2 ha park.
Reliability: news (public broadcaster).

**[36] futurezone (Andreas Puschautz): "Wie man Gasheizungen aus dem Altbau bekommt"**, 08.10.2021.
URL: https://futurezone.at/digital-life/gasheizung-altbau-smartblock-geblergasse-anergienetze/401762391
Verified: 200 · page title as quoted
Supports: the Geblergasse pilot: 18 deep probes of 110 m; the start-cell technology cost €350,000; a contracting model in which an external provider paid the construction and collects monthly fees from tenants; the higher cost amortises within 20 years; running costs well below gas.
Reliability: news.

**[37] ZFK (Zeitung für kommunale Wirtschaft): "Abwärme: Österreichs größtes Rechenzentrum heizt Klinik"**, 31.01.2024.
URL: https://www.zfk.de/energie/waerme/abwaerme-oesterreichs-groesstes-rechenzentrum-heizt-klinik
Verified: 200 · "Abwärme: Österreichs größtes Rechenzentrum heizt Klinik | ZFK"
Supports: Klinik Floridsdorf needs ~21,000 MWh of heat per year; 3 heat pumps of 1 MW; investment ~€3.5 m; 50-70% coverage; up to 4,000 t CO2/a.
Reliability: news (trade press).

**[38] wien.ORF.at: "„Klimafittes" Hallenbad Floridsdorf eröffnet"**, 07.10.2025.
URL: https://wien.orf.at/stories/3324886/
Verified: 200 · "„Klimafittes“ Hallenbad Floridsdorf eröffnet - wien.ORF.at"
Supports: 15-month conversion costing ~€15 m; a new water-to-water heat pump using groundwater; 260 kWp PV on 1,221 m²; −95% district heat, −25% electricity, −55% water.
Reliability: news (public broadcaster).

## Internal (this repository)

**[39] First Move: Quick Check reference data** (generated from the AQC methodology): `docs/10_quick-check-tool/_reference/`.
Files: `building-types.yaml`, `table-01_annual-heating-demand.yaml`, `table-02_annual-cooling-demand.yaml`, `table-03_average-floor-area.yaml`, `table-04_heating-capacity-per-source.yaml`, `table-06_economic-parameters.yaml`; equations EQ-3.8a, 3.10b, 3.10e, 3.12 in `docs/10_quick-check-tool/02_run-quick-check/`.
Supports: default demands (e.g. residential 1961-1990: 109.3 kWh/m²a heat and 11.0 kWh/m²a cooling); category mapping (pools and hospitals in C, schools and supermarkets in A); source capacities and COPs; tariffs (€6/m² + €0.12/kWh heat, €3/m² + €0.08/kWh cooling, €1,000 connection fee); costs (€500/m network, €1.00 per kWh/a groundwater, €15,000 heat pump per building, €0.20/kWh electricity); 3% interest over 20 years; O&M 2% of capex.

**[40] First Move: notes on the e7 talk "Anergie Leicht Gemacht"**: `docs/01_shared/alg-project/` (ALG-09 use-case learnings, ALG-10 tips).
Supports: heat line density of ~1 MWh per metre of trench as the economic threshold; groundwater as the cheapest source; "every building that stays out raises costs for the rest"; the cost key (source by connected load, pipes by users); start small with anchor customers.

## Added for the candidate screening

**[41] Stadt der Zukunft (nachhaltigwirtschaften.at, BMK programme platform): "SmartCity Baumgarten – Demonstration of an anergy network and implementation of climate-friendly solutions in existing districts".**
URL: https://nachhaltigwirtschaften.at/en/sdz/projects/smart-city-baumgarten.php
Verified: 200 · "SmartCity Baumgarten - Demonstration of an anergy network and implementation of climate-friendly solutions in existing districts - City of Tomorrow (Archive)"
Supports: a cross-property anergy network for heat, cold and power in an existing 14th-district quarter that is mostly gas-heated and outside district heating; a new building on a vacant lot enables the probes; status "ongoing".
Reliability: official.

## Added on 2026-10-25 (re-anchored cases)

All opened on 2026-10-25 through the session proxy; PDFs read with `pdftotext`.

**[42] Stadt Wien, MA 20 Energieplanung: "Energie-Info Ottakring, 16. Bezirk"** (district energy sheet, PDF, 2024).
URL: https://www.wien.gv.at/pdf/ma20/energie-info-bezirk-16.pdf
Verified: 200 · PDF
Supports: Ottakring had about 6,897 buildings (2021); about 180 buildings (about 1.5 million m²) on district heating and about 3,380 (about 4.5 million m²) on gas.
Reliability: official.

**[43] Stadt Wien, MA 20 Energieplanung: "Energie-Info Donaustadt, 22. Bezirk"** (PDF, 2024).
URL: https://www.wien.gv.at/pdf/ma20/energie-info-bezirk-22.pdf
Verified: 200 · PDF
Supports: Donaustadt had about 33,002 buildings (2021); about 1,500 on district heating and about 12,010 on gas.
Reliability: official.

**[44] Stadt Wien, MA 20 Energieplanung: "Energie-Info Liesing, 23. Bezirk"** (PDF, 2024).
URL: https://www.wien.gv.at/pdf/ma20/energie-info-bezirk-23.pdf
Verified: 200 · PDF
Supports: Liesing had about 16,713 buildings (2021); about 680 (about 3.0 million m²) on district heating and about 7,570 (about 4.8 million m²) on gas.
Reliability: official.

**[45] Stadt Wien, Wiener Bäder: "Ottakringer Bad – Kombibad der Stadt Wien".**
URL: https://www.wien.gv.at/freizeit/ottakringer-bad
Verified: 200 · "Ottakringer Bad - Kombibad - Stadt Wien"
Supports: 16., Johann-Staud-Straße 11; indoor pool (multi-purpose pool, diving pool for schools and clubs, saunas, cold plunge) and outdoor pool (multi-purpose pool, adventure pool with slide, paddling pool); outdoor season 2 May to mid-September. Nothing on the heat supply.
Reliability: official.

**[46] Wien Geschichte Wiki (Wiener Stadt- und Landesarchiv, Wienbibliothek im Rathaus): "Ottakringer Bad"** (last edited 03.11.2023).
URL: https://www.geschichtewiki.wien.gv.at/Ottakringer_Bad
Verified: 200 · "Ottakringer Bad – Wien Geschichte Wiki"
Supports: built by the City of Vienna in 1926 as the first Vienna outdoor pool able to raise its water temperature with an electric pre-heater; reopened on 20 May 1945; rebuilt 1966 to 1972 (Friedrich Florian Grünberger), with an indoor pool added from 1971.
Reliability: official (the city's history wiki, run by the city archive and library).

**[47] Wien Geschichte Wiki: "Großmarkt Inzersdorf".**
URL: https://www.geschichtewiki.wien.gv.at/Gro%C3%9Fmarkt_Inzersdorf
Verified: 200 · "Großmarkt Inzersdorf – Wien Geschichte Wiki"
Supports: 23., Laxenburger Straße 367; flower hall of about 3,500 m² opened 26 November 1969; the whole market opened 30 October 1972; flower market enlarged to about 10,000 m² in 1987.
Reliability: official.

**[48] Wiener Gesundheitsverbund, Klinik Donaustadt: "Anstaltsordnung der Klinik Donaustadt"** (hospital statute, PDF, 2022).
URL: https://klinik-donaustadt.gesundheitsverbund.at/wp-content/uploads/sites/9/2023/09/KDO-Anstaltsordnung-2022.pdf
Verified: 200 · PDF
Supports: Klinik Donaustadt is a municipal hospital with 963 systemised beds.
Reliability: official (statute of a public hospital).

**[49] Wiener Gesundheitsverbund, Klinik Donaustadt: "Das Haus".**
URL: https://klinik-donaustadt.gesundheitsverbund.at/das-haus/
Verified: 200 · page
Supports: Langobardenstraße 122, 1220 Vienna; foundation stone 1985, third part finished 1996 with 933 beds at the time; "auf insgesamt 170.000 m²" a low building of at most 5 storeys. Nothing on the energy supply.
Reliability: official.

**[50] ARE Austrian Real Estate: "Village im Dritten – Energiesystem".**
URL: https://villageimdritten.at/energiesystem/
Verified: 200 · page
Supports: "the largest geothermal probe field in Austria" with 500 probes, 150 m deep; anergy network to heat pumps in the energy centre of each building, up to about 37 °C into floor heating; district heating for peaks and hot water; moderate cooling of the flats (free of charge) and cooling for the commercial spaces in summer, with the heat stored in the ground; PV of about 1 MW in total. The project page (https://villageimdritten.at/, 200) gives about 11 ha, 22 plots and about 2,000 flats.
Reliability: company (developer, own project).

**[51] GMW Großmarkt Wien Betrieb GmbH: "Daten und Fakten".**
URL: https://www.grossmarkt-wien.at/grossmarkt-daten-und-fakten
Verified: 200 · "Daten und Fakten – Großmarkt Wien"
Supports: Laxenburger Straße 365-367, 1230 Vienna; "Österreichs bedeutendste Handelsdrehscheibe für Obst, Gemüse, Lebensmittel und Blumen"; about 30 ha with halls, buildings and open space; about 220 tenants and about 1,400 employees.
Reliability: company (operator, own site).

**[52] GMW Großmarkt Wien Betrieb GmbH: "GMW Großmarkt Wien Betrieb GmbH".**
URL: https://www.grossmarkt-wien.at/grossmarkt-betrieb-gmbh
Verified: 200 · page
Supports: the economic management moved from MA 59 (Marktamt) to the Wien Holding in January 2019; GMW is part of WSE Wiener Standortentwicklung, a Wien Holding company.
Reliability: company (operator, own site).

**[53] GMW Großmarkt Wien Betrieb GmbH: "50 Jahre Großmarkt Wien – Festbroschüre"** (PDF, 2022).
URL: https://www.grossmarkt-wien.at/wp-content/uploads/2025/12/50-Jahre-GMW_Festbroschure_2022.pdf
Verified: 200 · PDF
Supports: built 1969 to 1972, opened 30 October 1972; modernisations in 1987 and 2001 with more cold and storage rooms; 2022 area split: about 300,000 m² in total, about 76,000 m² buildings and halls, about 17,000 m² open space, flower hall about 10,000 m², meat market about 7,000 m², offices about 1,500 m². No figure on cooling capacity or waste heat.
Reliability: company (operator, own publication).

**[54] Giunta, F.; Sawalha, S. (2021): "Techno-economic analysis of heat recovery from supermarket's CO2 refrigeration systems to district heating networks."** Applied Thermal Engineering 193, 117000.
DOI: 10.1016/j.applthermaleng.2021.117000
Verified: Crossref metadata (title, authors, journal, volume, article number); doi.org resolves. The abstract could not be read (publisher 403), so only what the title says is used: such a techno-economic analysis exists.
Reliability: peer-reviewed.

## Dropped or unverified (not used for any fact)

| Source | Reason |
|---|---|
| klimaaktiv, "04_Viertel-2_2021-05-31.pdf" (evaluation of Kraftwerk Krieau / Viertel Zwei), https://www.klimaaktiv.at/dam/jcr:f43dedcf-0fb2-4244-8b19-57fddc45d73a/04_Viertel-2_2021-05-31.pdf | **404**. A Wayback snapshot exists, but web.archive.org is blocked from this environment (403 "Blocked by egress policy" / connection reset). Search snippets (82,000 m² GFA, 3 × 1.2 MW heat pumps, 3.2 MW gas boiler, energy mix ~45% ambient / 37% gas, "original decentralised anergy network changed") are **not** used. |
| klimaaktiv, "03_Muehlgrundgasse_2021-06-01.pdf", https://www.klimaaktiv.at/dam/jcr:c6b53ff0-d707-4e05-a09c-950ea38b7ac1/03_Muehlgrundgasse_2021-06-01.pdf | **404**; archive blocked. MGG22 facts come from [12] and [14] instead. |
| Energie Krieau PDF cited in [11], http://www.energiekrieau.com/images/Energie-Krieau.pdf | Redirects to energie-krieau.at → **404**. |
| BCE company presentation hosted by Stadt Salzburg, https://www.stadt-salzburg.at/fileadmin/user_upload/04013/bce_mark_praes_sir_9999_01b_n_dt_20230629_te_total_company.cleaned.pdf | Connection reset by the egress proxy (3 attempts); content not seen. |
| BMLUK "UFI-Projekt Februar 2026" (Therme Wien waste heat), https://www.bmluk.gv.at/themen/klima-und-umwelt/klima/klima-initiativen-und-foerderungen/ufi/ufi-projekt-des-monats/ufi-projekt-februar-2026.html | **404** (an alternative path reset the connection). Not used. |
| EUR-Lex, Energy Efficiency Directive (EU) 2023/1791, https://eur-lex.europa.eu/eli/dir/2023/1791/oj | **202** bot challenge; no text retrieved. The data-centre waste-heat obligation is therefore **not** cited. |
| MDPI full text of [27], https://www.mdpi.com/1996-1073/12/19/3775 | **403** to automated clients; only the abstract (IDEAS) is used. |
| Trianti-Stourna et al. (1998), Energy and Buildings 27, 123-135, DOI 10.1016/S0378-7788(97)00041-8; Kampel et al. (2013), Energy and Buildings 59, 181-186, DOI 10.1016/j.enbuild.2012.11.011; Woolley et al. (2011), Building and Environment 46, 187-195, DOI 10.1016/j.buildenv.2010.07.014; Harrington & Modera (2013), Energy and Buildings 59, 252-264, DOI 10.1016/j.enbuild.2012.12.038; Gjoka et al. (2023), RSER 171, 112997, DOI 10.1016/j.rser.2022.112997 | DOIs exist (Crossref), but no abstract or full text could be read (ScienceDirect 403, API rate limits). Not cited for any number. |
| Trending Topics, 01.03.2023, "Zukunftsquartier Village im Dritten: Erdwärme-Bohrungen für Bauprojekt begonnen" | 200, but not needed; facts come from [34] and [35]. |
| HSLU lecture note that Seestadt as a whole rejected an anergy network in favour of district heating | Seen only in a search snippet; not opened; not used. |
| News and trade press [34] to [38] | Owner's rule of 2026-10-25: no news and no blogs. Kept above as research history; every number that rested only on them was dropped from the app. |
| Data centres as anchors for the fictional cases (Equinix Vienna pages; Vienna Scientific Cluster VSC-5 in the Arsenal) | Equinix pages answered **404**, the VSC site **502**. The only Vienna data-centre heat project with an official page is the real Klinik Floridsdorf project [3], so a fictional data-centre plan would have blurred into it. Dropped; the waste-heat anchor became Großmarkt Wien [51] to [53]. |
| City of Vienna open-data WFS layers for Ottakring (Energieampel probes and groundwater heat pumps, geothermal potential) | The queries for the pool's surroundings returned no features; no site-level potential is claimed for the Ottakringer Bad. |
| Wayback Machine snapshots | Still blocked from this environment (egress policy); nothing from archived pages is used. |
| Neu Leopoldau, Gräf & Stift, Nordbahnhof / Nordbahnviertel | No source found describing an anergy network. For the Nordbahnviertel, a ORF report found by search describes Wien Energie district cooling with heat recovery (not 5GDHC; not opened, not used). |
