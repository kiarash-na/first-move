# SOURCES

Where every original went. The raw files were copy-pastes and Word/PDF/PowerPoint exports, which are **not machine readable**: equations were flattened, tables broke into one cell per line, slide text was jumbled. They were turned into the clean md files in this folder on 2026-10-24. Only the methodology (equations) is kept as the raw file.

## Raw file → clean file

| Raw file (former `project/`) | Status | Here |
|---|---|---|
| `Challenge_ALG_Quick-Check-Tool/AQC-Methodology.docx` | **kept raw**: equation source (Word equation markup → LaTeX) | [AQC-Methodology.docx](AQC-Methodology.docx) |
| `AQC-Methodology.pdf` and `Challenge_ALG_Quick-Check-Tool/AQC-Methodology.pdf` | identical files; PDF export of the docx. Used to verify numbering and equations, then removed | n/a |
| `doc3.md` | copy-paste of the docx; equations flattened (e.g. `lspec=171.221+8.817⋅e-0.549 ⋅Nha` for $l_{spec} = \frac{171.22}{1 + 8.817 \cdot e^{-0.549 \cdot N_{ha}}}$). Removed as duplicate | n/a |
| `Challenge_ALG_Quick-Check-Tool/ALG_Hackathon_Challenge_5GDHC-QC.docx` (= `ALG_Hackathon_Challenge_5GDHC-QC.pdf` = `doc2.md`) | duplicates merged | [qc-challenge-brief.md](qc-challenge-brief.md) |
| `HackathonChallenge_5GDHC-Assessment-Tool (1) (1).pdf` | same brief + section "Testing & Validation" (only difference besides "an simple" → "a simple") | section added to [qc-challenge-brief.md](qc-challenge-brief.md) |
| `Challenge_ALG_Quick-Check-Tool/AQC_Hackathon-Challenge.pptx` | QC kickoff slides; images were logos/photo/contact only | [qc-challenge-slides.md](qc-challenge-slides.md) |
| `Challenge_ALG_Hackathon_BusinessModelCanvas_en_V02 (1).docx` (= `doc1.md`) | BM brief V02, **canonical** | [bm-challenge-brief_v02.md](bm-challenge-brief_v02.md) |
| `Challenge_ALG_Business-Canvas_Model/Challenge_ALG_Hackathon_BusinessModelCanvas_en.pdf` | BM brief V01 (older wording; has the scenario table, jury criteria, dates, tips) | [bm-challenge-brief_v01.md](bm-challenge-brief_v01.md) |
| `Challenge_ALG_Business-Canvas_Model/2026_Informations_Hackathon.pdf` | event deck; archive only, not used in the working docs | [hackathon-info-slides.md](hackathon-info-slides.md) |
| `Challenge_ALG_Business-Canvas_Model/ALG 5GDHC 261020 e7gh.pdf` | e7 talk on project "Anergie Leicht Gemacht" | [alg-project-talk.md](alg-project-talk.md) + [assets/](assets/) (slides 4 and 7) |
| `landing/design.md` | UI design tokens, renamed "5GDHC OS" → "First Move" | moved to [../02_design/](../02_design/CONTEXT.md) |

## Methodology numbering

Section numbers (1 … 4.5) and table numbers (1 … 11) follow the PDF render. The docx stores stale caption numbers:

| docx caption | PDF / used here |
|---|---|
| Table 1–5 | Table 1–5 |
| Table 4: Economic Parameters | **Table 6** |
| Table 6: Classification of Heating and Cooling Supply Coverage | **Table 7** |
| Table 7: Classification of Building Density | **Table 8** |
| Table 8: Classification of Heat Density | **Table 9** |
| Table 9: Classification of C/H-Ratio | **Table 10** |
| Table 10: Overall Result Classification | **Table 11** |

Equations: converted from the docx equation markup and checked by eye against the rendered PDF pages (2026-10-24). docx and PDF text are otherwise identical.

## Text changes (the only ones made)

| Original | Clean | Where |
|---|---|---|
| `depriciation` | `depreciation` | AQC-Methodology.docx (Table 6, glossary of EQ-3.10e) |
| `Depriciation` | `Depreciation` | AQC-Methodology.docx (Table 6) |
| `withing` | `within` | QC brief (result example) |
| `type i an construction` | `type i and construction` | AQC-Methodology.docx (glossary of EQ-3.1) |
| `through an simple` | `through a simple` | QC brief (already fixed in the Assessment-Tool PDF) |
| `average. floor area` | `average floor area` | AQC-Methodology.docx (§1.1) |
| `anfirst` | `a first` | QC slides (slide 2) |
| `replication and scability` | `replication and scalability` | BM brief V01 (Goals) |
| `INFORMATIOS` | `INFORMATIONS` | BM brief V01 (section 7 heading) |
| `own use ase` | `own use case` | hackathon info slides (slide 4) |
| `Identyfy` | `Identify` | hackathon info slides (slide 4) |
| ` à ` (symbol font) | ` → ` | QC brief flow line (PDF shows →) |

Meaning-level problems (symbols, units, missing definitions) are **not** corrected. They are open questions: `10_quick-check-tool/open-questions/`, `20_business-models/open-questions/`.

## Kept in originals only (organisation, not used in the working docs)

Hackathon schedule (Day 1–3 / Fri–Sun dates), interim pitch, jury evaluation and awards logistics, the QC tech-options list (Web application / Python-based application / Dashboard / No-code), the event deck.

## Dropped entirely (layout noise)

Page headers/footers, slide numbers, logos, slogans, background photos, contact/QR/partner-logo slides, the speaker's e-mail.
