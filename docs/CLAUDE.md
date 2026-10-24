# docs: 5GDHC hackathon (First Move)

Project documentation for two hackathon challenges, organized for agents (ICM: folders = structure, one job per folder, plain md + YAML).

**Why this exists:** the original challenge material (Word, PDF and PowerPoint exports, copy-pastes) is **not machine readable**: equations flattened, tables broken up, slide text jumbled. Everything was therefore re-organized here in our own way. `00_originals/` is only a just-in-case archive. **Work from the numbered folders, not from the originals.**

## Where things live

| Need | Go to |
|---|---|
| Quick Check Tool requirements (challenge 1) | `10_quick-check-tool/CONTEXT.md` |
| An equation | `10_quick-check-tool/02_run-quick-check/` (one file per equation, `eq-03-04a` = §3.4 first equation) |
| Default values / thresholds as data | `10_quick-check-tool/_reference/*.yaml` (Tables 1–11, building types, symbols) |
| Business-model challenge (challenge 2) | `20_business-models/CONTEXT.md` |
| What a 5GDHC network is, project learnings | `01_shared/` |
| UI design tokens, name "First Move", slogan | `02_design/` |
| Issues in the source (unclear/contradictory) | `*/open-questions/` (`OQ-xx`) |
| Your notes and build plans | `90_work/notes/`, `90_work/plans/` (start from `_templates/`) |
| Where an original went, text fixes made | `00_originals/SOURCES.md` |

## Flows

- Quick Check: `01_input-project-data` → `02_run-quick-check` → `03_receive-assessment` → `04_understand-key-factors` → `05_output-document` (scope in `00_scope`).
- Business Models: `01_define-the-opportunity` → `02_build-the-business-logic` → `03_run-the-reality-check` → `04_improve-and-prepare-implementation` (scope in `00_scope`).

## Rules

- **Source of truth:** equations = `latex:` in each equation file (from `00_originals/AQC-Methodology.docx`, checked against the PDF). Data = `_reference/*.yaml`. Section/table numbers = PDF numbering.
- **Requirement files are verbatim source text.** Do not reword them and do not "fix" a formula in them. If something is wrong or unclear, add or extend an `OQ-xx` file and cite it.
- `00_originals/` is read-only.
- No tech-stack decisions are recorded in the requirement folders. Put those in `90_work/plans/` or `90_work/notes/`.
- Cite by ID: `EQ-3.4a`, `TBL-6`, `QCT-IN-04`, `QCT-KF-01`, `BM-STEP-03`, `BM-SCN-02`, `OQ-17`.
- Every md file has frontmatter: `id`, `title`, `source` (path in `00_originals/` + section/anchor), optional `flags` (open questions). Equation files add `output`, `inputs`, `latex`, `tables`, `user_inputs`.
- `CONTEXT.md` in each folder only routes; content lives in the files it lists.
- Answering an open question: set `status: resolved` + `answer:` in the OQ file, log it in `90_work/notes/`.
