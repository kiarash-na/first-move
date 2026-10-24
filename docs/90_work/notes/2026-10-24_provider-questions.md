---
id: NOTE-2026-10-24-provider-questions
date: 2026-10-24
author: Claude (compiled from OQ files, SOURCES.md and frontmatter flags)
relates_to: [OQ-01, OQ-26, NOTE-2026-10-24-owner-decisions]
---

# Questions for the provider

Every flagged mistake or unclear point in the original material, for discussion with the organisers. Each item has 3 possible readings; **Now** is what the app does. Write answers next to the number.

Page basis: AQC-Methodology.docx converted to PDF with LibreOffice (A4, 9 pages; the repo's original PDF was removed, so pages are a re-render and may differ slightly from the provider's own PDF; equations are not extractable as text, so equation pages follow their section/glossary text). Slide decks and the e7 talk: slide number. Briefs (.md exports): section name, no page in original export.
1. **OQ-01 · Percent values in equations** (*AQC-Methodology p. 4, p. 2–3* · §3.1 EQ-3.1 glossary (s_i,p in %); §1.3 PV 30 % (p. 2); Table 6 % rows (p. 3) → EQ-3.1, EQ-3.10e, QCT-IN-09)
   Shares, interest and PV reduction are given in %, but equations use factors. Whole buildings or not is unstated.
   a) Divide % by 100; N_i,p stays fractional · b) Divide % by 100; round N_i,p to whole buildings · c) Shares mean % of floor area, not building count → **Now a**: % ÷ 100; N_i,p fractional, rounded only for display
2. **OQ-02 · Industry has no defaults** (*AQC-Methodology p. 1–2* · §1.2 Tables 1–3 'Industry*' row (Tables 1–2 p. 1, Table 3 + paragraph below it p. 2) → QCT-IN-04, QCT-RULE-INDUSTRY)
   Industry has no default values; the asterisk has no footnote. Only the forced 'Further analysis' result is stated.
   a) Industry adds zero demand; only forces 'Further analysis' · b) User must enter own industry demand and floor area · c) Industry excluded from the building total entirely → **Now a**: adds no demand; share > 0 forces Further analysis
3. **OQ-03 · 1919 period overlap** (*AQC-Methodology p. 1–2* · §1.2 Tables 1–3 period headers '-1919' / '1919-1960' (Tables 1–2 p. 1, Table 3 p. 2) → QCT-IN-04)
   Both period labels include the year 1919.
   a) Typo: second period should start 1920 · b) Typo: first period should end 1918 · c) Intended overlap; boundary year is irrelevant → **Now c**: labels shown verbatim; no calculation uses the year
4. **OQ-04 · Rural/sub-urban/urban input** (*AQC-Methodology p. 3* · §2.1 Project Area, 'Building density (rural, sub-urban, urban)' vs 'calculated automatically' → QCT-IN-03, TBL-8)
   Density category is listed as input, yet exact density is calculated. No mapping or use is given.
   a) Derive category from computed density (Table 8) · b) User picks category, used only for display · c) User picks category; it overrides computed density → **Now a**: derived from Table 8 class (Low=rural…), read-only
5. **OQ-05 · Manual demand input form** (*AQC-Methodology p. 3* · §2.2 Building Type and Construction Period, last sentence ('manual input … optional alternative') → QCT-IN-05, EQ-3.2c/d)
   Granularity (total vs per type/period) and unit of the manual demand input are not given.
   a) Two totals (heating, cooling) in kWh/a · b) Per building type and period in kWh/a · c) Specific demand per m² (kWh/m²a) → **Now a**: two optional kWh/a totals replace EQ-3.2c/d
6. **OQ-06 · PV input and 30 % reduction** (*AQC-Methodology p. 2, p. 3, p. 7* · §1.3 PV paragraph (p. 2); Table 6 'PV cost reduction 30 %' (p. 3); §3.11 note (p. 7); absent from §2 → QCT-IN-09, EQ-3.11)
   PV is not a listed input, and no formula says how the 30 % applies to electricity costs.
   a) Yes/no input; C_el × (1 − 0.30) · b) PV share input (%) scales the 30 % reduction · c) Reduce only the PV-covered part of electricity cost → **Now a**: yes/no input; C_el × (1 − 0.30)
7. **OQ-07 · Q_cool,total called heating** (*AQC-Methodology p. 5, p. 6* · §3.2 EQ-3.2d glossary 'heating demand' (p. 5) vs §3.6 EQ-3.6b glossary 'cooling demand' (p. 6) → EQ-3.2d)
   Same symbol Q_cool,total is glossed as heating demand in §3.2 and cooling demand in §3.6.
   a) Slip in §3.2; it is cooling demand · b) Slip in §3.6; it is heating demand · c) Two different quantities sharing one symbol → **Now a**: total annual cooling demand
8. **OQ-08 · Overloaded symbols and indices** (*AQC-Methodology p. 4–5, p. 7* · §3.2 EQ-3.2a–d (p. 4–5); §3.10 EQ-3.10c, 3.10e and §3.11 EQ-3.11 (p. 7) → EQ-3.2a–d, 3.10b/c/e, 3.11)
   i, p, n, A mean different things; Q_heat lacks i,p index; C_i,total sums over j, summand C_i.
   a) Read by context; per (i,p) cell; sum over sources · b) Literal: unindexed sums multiply, e.g. n · C_i · c) C_i indexes building type, not energy source → **Now a**: indices by context; C_i,total = sum over selected sources
9. **OQ-09 · N_ha vs ρ_building** (*AQC-Methodology p. 5* · §3.4 EQ-3.4a glossary (N_ha) vs §3.3 EQ-3.3 glossary (ρ_building), same page → EQ-3.3, EQ-3.4a)
   Two symbols with the same unit; the link between them is never stated.
   a) N_ha equals ρ_building · b) N_ha is a separate user-entered number · c) N_ha counts buildings per hectare of built-up area only → **Now a**: N_ha = ρ_building
10. **OQ-10 · Heat density unit vs thresholds** (*AQC-Methodology p. 5, p. 8–9 · alg-project-talk slide 9* · §3.5 EQ-3.5 glossary kWh/m (p. 5); §4.3 Table 9, no unit (starts p. 8, ends p. 9); talk slide 9 'MWh per metre' → EQ-3.5, TBL-9)
   ρ_heat is in kWh/m, Table 9 thresholds have no unit; the e7 talk speaks of MWh per metre.
   a) Thresholds in MWh/m (ρ_heat ÷ 1000) · b) Thresholds in kWh/m (no conversion) · c) MWh per metre of trench; l_total measured differently → **Now a**: ρ_heat ÷ 1000 vs thresholds; UI shows MWh/m
11. **OQ-11 · Per-source vs total supply** (*AQC-Methodology p. 5–6, p. 6, p. 7* · §3.6 EQ-3.6a glossary 'per source' (p. 5–6); §3.8 EQ-3.8a glossary (p. 6); §3.11 EQ-3.11 (p. 7) → EQ-3.6a/b, 3.8a/b)
   Coverage divides a per-source supply by total demand. How several selected sources combine is unstated.
   a) Coverage uses the sum of all source supplies · b) Each source assessed separately; best one shown · c) Only one source selectable → **Now a**: several sources; coverage, C_i and C_el summed over sources
12. **OQ-12 · No cooling/heating ratio formula** (*AQC-Methodology p. 6, p. 9* · §3.7 text only, no equation (p. 6); §4.4 Table 10 (p. 9) → EQ-3.7, TBL-10)
   Ratio is described in words only. Table 10 has no class above 1.0.
   a) min(cool,heat) / max(cool,heat), always 0–1 · b) Q_cool / Q_heat, values above 1 allowed · c) Q_cool / Q_heat, capped at 1 → **Now a**: min/max, 0–1; both zero = not applicable
13. **OQ-13 · Sources without COP or capacity** (*AQC-Methodology p. 2, p. 6, p. 7* · §1.3 Table 4 solar thermal COP '-', Table 5 '-' rows (p. 2); §3.8 (p. 6); §3.11 (p. 7) → EQ-3.8a/b, 3.11)
   Solar thermal has no COP; waste heat and solar have no cooling capacity, yet equations divide by COP.
   a) No COP: supply = capacity, no HP power; cooling 0 · b) '-' means value missing; provider supplies COP/capacity · c) Solar thermal unusable without COP; '-' sources excluded → **Now a**: supply = capacity, no HP electricity; cooling 0
14. **OQ-14 · COP definition and naming** (*AQC-Methodology p. 6, p. 2, p. 7* · §3.8 COP glossary 'coefficient of power' (p. 6) vs §1.3 'performance' (p. 2); §3.11 EQ-3.11 COP_H/COP_C (p. 7) → EQ-3.8a/b, 3.11)
   Glossary says 'coefficient of power', §1.3 'performance'. COP_H and COP_C are used but never defined.
   a) Performance; COP_H/COP_C = Table 4/5 COP · b) COP_H/COP_C are new parameters with own defaults · c) One COP per source for heating and cooling → **Now a**: COP_H = Table 4 COP, COP_C = Table 5 COP
15. **OQ-15 · Cooling energy price symbol** (*AQC-Methodology p. 6* · §3.9 EQ-3.9b: equation p_C,energy vs glossary p_HC,energy → EQ-3.9b)
   Equation and glossary use different symbols. Unclear if a cooling price or a shared price is meant.
   a) Typo: cooling energy price 0.08 €/kWh (Table 6) · b) One shared heating+cooling price, value not given · c) Cooling billed at heating energy price 0.12 €/kWh → **Now a**: p_C,energy = Table 6 cooling energy price
16. **OQ-16 · Base price time unit** (*AQC-Methodology p. 3, p. 6* · §1.4 Table 6 base prices €/m² (p. 3) vs §3.9 EQ-3.9a/b glossaries R in €/a (p. 6) → EQ-3.9a/b)
   Base prices are €/m² with no period, but revenues are per year.
   a) € per m² floor area per year · b) € per m² as one-time payment · c) € per m² per month → **Now a**: € per m² floor area per year
17. **OQ-17 · C_overall double count** (*AQC-Methodology p. 7* · §3.10 EQ-3.10c (C_i,total = ΣC_i) and EQ-3.10d (adds C_i + C_i,total) → EQ-3.10d)
   C_overall adds C_i and C_i,total, but C_i,total is already the sum of C_i.
   a) Drop C_i: C_HP·N + C_net + C_i,total · b) C_i is another cost item whose value is missing · c) Literal: supply investment counted twice → **Now a**: C_HP·N_total + C_net + C_i,total
18. **OQ-18 · Ambient air installation cost** (*AQC-Methodology p. 3* · §1.4 Table 6 row 'Ambient air installation costs | - | €/kWh' → EQ-3.10b)
   Value is '-' and unit €/kWh, while other sources use €/(kWh/a). Zero, not applicable, or missing?
   a) 0 €/(kWh/a); heat pump cost already in C_HP · b) Not applicable: source excluded from investment · c) Value missing; provider must supply one → **Now a**: 0 €/(kWh/a), shown as assumption in UI
19. **OQ-19 · C_el unit** (*AQC-Methodology p. 7* · §3.11 EQ-3.11 glossary (C_el 'costs … in kWh/a'; c_el in €/kWh) → EQ-3.11)
   C_el is called 'costs' but given in kWh/a, although c_el is €/kWh.
   a) Typo: C_el in €/a · b) C_el is electricity in kWh/a; cost = C_el · c_el · c) C_el in € total, not per year → **Now a**: C_el in €/a
20. **OQ-20 · Classification range boundaries** (*AQC-Methodology p. 8–9* · §4.1–4.4 Tables 7–10 range labels (Tables 7–8 p. 8; Table 9 p. 8–9; Table 10 p. 9); §4.5 Table 11 (p. 9) → CLS-04-01..04)
   Ranges leave gaps (99.95 %), share edges (0.8), unclear inclusivity; Table 11 words them differently.
   a) Lower bound inclusive, no gaps · b) Upper bound inclusive, no gaps · c) Literal ranges; values in gaps count as unclear → **Now a**: ≥100/≥90/≥70 %, ≥0.8/≥0.3; 'Above 30/1.5' strict
21. **OQ-21 · Economic assessment undefined** (*AQC-Methodology p. 9* · §4.5 Table 11 PROMISING / NOT PROMISING rows ('economic assessment favorable / clearly unfavorable') → RULE-04-05)
   'Favorable' and 'clearly unfavorable' economics have no formula or threshold.
   a) E = revenue ÷ costs; ≥1.0 favorable, <0.7 unfavorable · b) Profit > 0 favorable, < 0 unfavorable; no middle band · c) Other metric (e.g. payback years); provider sets thresholds → **Now a**: E = R_overall/(C_annual+C_el+C_O&M), ≥1.0 / <0.7
22. **OQ-22 · Overall rule gaps** (*AQC-Methodology p. 9, p. 2, p. 4* · §4.5 Table 11 all rows (p. 9); forced results §1.2 (p. 2) and §2.3 (p. 4) → RULE-04-05, RULE-FORCED-INDUSTRY, RULE-FORCED-UNKNOWN-SOURCE)
   No precedence between rows (e.g. industry + unfavorable); some combinations uncovered; 'relevant' demand undefined.
   a) Order: industry/unknown, Not promising, Promising, else Further · b) Order: Not promising first, then industry, Promising, Further · c) Any uncovered combination gives Further analysis → **Now a**: industry/unknown first; relevant = demand > 0
23. **OQ-23 · Scenarios and datasets missing** (*qc-challenge-brief, no page in original export* · Overview and Scope; The Challenge items 5 and 7; Testing & Validation; Final Prototype → QCT-SCOPE-01/05/10/12)
   The brief refers to predefined scenarios and mockup datasets, but none were provided.
   a) Provider sends them later; wait · b) Team builds its own examples · c) Use only the Business Model V01 scenarios → **Now b**: 6 own illustrative examples (4 from BM-SCN, 2 promising)
24. **OQ-24 · Web app vs technology secondary** (*qc-challenge-slides slide 3 · qc-challenge-brief, no page in original export* · Slide 3 ('for a web application') vs brief Final Prototype ('technology … is secondary') → QCT-SCOPE-09)
   Slides require a web application; the brief says the technology is free.
   a) Web application required; brief list is examples · b) Any technology allowed (Python, dashboard, no-code) · c) Web preferred; others accepted if usable → **Now a**: Next.js web app, runs fully in the browser
25. **OQ-26 · Capacity scale vs demand** (*AQC-Methodology p. 2, p. 1–2* · §1.3 Tables 4/5 (max 150,000 kWh/a, p. 2) vs §1.2 Tables 1 and 3 defaults (Table 1 p. 1, Table 3 p. 2) → TBL-4/5, EQ-3.6a)
   Capacities are tiny vs one building's demand (~30,000–68,000 kWh/a). Per project, building or area unstated.
   a) Absolute per source for the whole project · b) Per building (multiplied by N buildings) · c) Per m² or per hectare of project area → **Now a**: absolute per source; flagged in Assumptions; overridable
26. **OQ-25 · Which predefined scenarios** (*bm-challenge-brief_v02 + _v01, no page in original export* · v02 The Challenge (3 mentions) vs v01 §8 Use-Cases/Scenarios table → BM-SCN-01..04)
   V02 says scenarios are provided but lists none; only V01 has a 4-scenario table.
   a) The 4 V01 scenarios are the predefined ones · b) Separate V02 scenarios exist and are missing · c) Scenarios are only inspiration; teams define own → **Now a**: 4 V01 scenarios as presets, plus custom use case
27. **FIX-1 · Typos in briefs and slides** (*qc-challenge-brief, qc-challenge-slides slide 2, bm-challenge-brief_v01, hackathon-info-slides slide 4; no page in original export* · QC brief Overview/The Challenge ('withing', 'an simple'); QC slides slide 2 ('anfirst'); BM V01 §2 Goals ('scability') and §7 heading ('INFORMATIOS'); info slides slide 4 ('own use ase', 'Identyfy'); SOURCES.md text changes)
   Seven slips (withing, an simple, anfirst, scability, INFORMATIOS, own use ase, Identyfy) were fixed silently.
   a) Plain typos, corrected as now · b) 'INFORMATIOS' → 'Information' (no plural) · c) 'anfirst' → 'an initial', not 'a first' → **Now a**: corrected in md files; raw exports not kept
28. **FIX-2 · Typos in methodology** (*AQC-Methodology p. 1, p. 3, p. 4, p. 7* · §1.1 'average. floor area' (p. 1); Table 6 'depriciation' (p. 3); EQ-3.1 glossary 'type i an' (p. 4); EQ-3.10e glossary 'depriciation' (p. 7); SOURCES.md)
   Four slips fixed in our docs. 'average.' has a stray full stop that may hide a word.
   a) Plain typos, corrected as now · b) 'average.' hides a word, e.g. 'average building floor area' · c) 'type i an construction' → 'type i in construction period' → **Now a**: fixed in our docs; raw docx left unchanged
29. **FIX-3 · Garbled arrow in user flow** (*qc-challenge-brief, no page in original export (raw docx/PDF removed)* · The Challenge flow line 'Input project data à Run …'; SOURCES.md → QCT-SCOPE-06)
   A symbol-font arrow exported as the letter 'à'; the PDF shows an arrow.
   a) Arrow '→' between five sequential steps · b) Typo for 'a' or 'to' · c) Parallel steps, not strictly sequential → **Now a**: shown as '→' in a fixed 5-step flow
30. **FIX-4 · Stale table numbers in docx** (*AQC-Methodology p. 3, p. 8–9* · §1.4 caption 'Table 4: Economic Parameters' (second Table 4, rendered Table 6, p. 3); §4 captions docx 'Table 6–10' = PDF Tables 7–11 (p. 8–9); SOURCES.md → TBL-6…TBL-11)
   Docx captions repeat 'Table 4' and stop at 10; the PDF numbers them 1–11.
   a) PDF numbering 1–11; economics is Table 6 · b) Docx numbering; two Table 4s, classification 6–10 · c) Provider confirms final numbering for references → **Now a**: PDF numbering; economics Table 6, classification 7–11
31. **FIX-5 · Two QC brief versions differ** (*qc-challenge-brief, no page in original export* · 'Testing & Validation' section, present only in HackathonChallenge_5GDHC-Assessment-Tool PDF (raw removed); SOURCES.md → QCT-SCOPE-12)
   Only one brief version has 'Testing & Validation'. We merged both without asking which is current.
   a) Section is part of the current brief · b) Older draft; dropped on purpose · c) Applies to organisers' testing only, not to teams → **Now a**: section merged, kept as QCT-SCOPE-12
32. **FLAG-1 · Cooling supply has no investment** (*AQC-Methodology p. 7, p. 2, p. 3* · §3.10 EQ-3.10b (C_i = c_i·Q_heat,supply, 'per heat supply', p. 7); §1.3 Table 5 (p. 2); Table 6 (p. 3) → EQ-3.10b)
   Source installation cost uses heating supply only. Cooling capacities get no investment cost, with no stated reason.
   a) Only heating supply is costed; cooling is free · b) Cooling supply costed too, with the same c_i · c) Cost on the larger of heating and cooling supply → **Now a**: C_i = c_i · Q_heat,supply only
33. **FLAG-2 · Network temperature 5–25 vs 10–25** (*qc-challenge-brief + bm-challenge-brief_v02, no page in original export · alg-project-talk slide 6* · Context ('around 5-25°C') vs talk slide 6 ('10–25 °C'))
   The briefs and the e7 talk give different temperature ranges for the same network type.
   a) 5–25 °C is correct · b) 10–25 °C is correct · c) 5–25 °C allowed range; 10–25 °C typical operation → **Now a**: app text says 5–25 °C; no calculation uses it
34. **FLAG-3 · Unfinished sentence in V02** (*bm-challenge-brief_v02, no page in original export* · Overview and Scope, 3rd paragraph ('…existing neighbourhoods, rural areas and locations') → BM-SCOPE-01)
   The list ends in 'and locations'; a settlement type seems missing.
   a) '…and city outskirts' (as V02 use-case list) · b) '…and other locations'; word slip · c) A word missing, e.g. 'industrial locations' → **Now None**: quoted verbatim, unresolved; no logic depends on it
35. **FLAG-4 · V01 'Top 3' vs V02 'top'** (*bm-challenge-brief_v01 §6 step 3 + v02 Working method step 3, no page in original export* · v01 'Top 3 risks … Top 3 critical assumptions' vs v02 'top risks' → BM-STEP-03)
   The newer brief drops the number 3 without saying whether the count still applies.
   a) No fixed count (V02 wording) · b) Exactly 3 risks and 3 assumptions (V01) · c) About 3 each, plus one deal-breaker → **Now a**: no fixed count; Overview tile shows top 3 risks
36. **FLAG-5 · Jury criteria inside pitch list** (*bm-challenge-brief_v01 §6 Final pitch, no page in original export* · Final pitch list, five bullets after 'Proposed jury evaluation criteria'; V02 has none → BM-SCOPE-08)
   The list was flattened in export; unclear which bullets are pitch content and which are jury criteria.
   a) Last five bullets are the jury criteria · b) Teams must propose own jury criteria in pitch · c) V01-only criteria; obsolete in V02 → **Now a**: five V01 criteria used, labelled unofficial
