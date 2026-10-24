# 10_quick-check-tool

Challenge: *Develop a 5GDHC Quick Check Tool*. The flow folders follow the brief: Input project data → Run a Quick Check → Receive an assessment → Understand the key factors → Receive an output document ([user flow](00_scope/scope-06_user-flow.md)).

| Folder | Holds |
|---|---|
| [00_scope/](00_scope/) | Scope, deliverables, evaluation criteria, user flow |
| [01_input-project-data/](01_input-project-data/) | Input project data (methodology §2) |
| [02_run-quick-check/](02_run-quick-check/) | Run a Quick Check: one file per equation (methodology §3) |
| [03_receive-assessment/](03_receive-assessment/) | Receive an assessment: classifications + overall rule (methodology §4) |
| [04_understand-key-factors/](04_understand-key-factors/) | Understand the key factors: presentation requirements |
| [05_output-document/](05_output-document/) | Receive an output document (e.g. PDF) |
| [_reference/](_reference/) | Canonical data for code: Tables 1–11 (YAML), building types, symbols |
| [open-questions/](open-questions/) | Issues in the source material (OQ-01 … OQ-24) |

Equation source of truth: `00_originals/AQC-Methodology.docx` (equation markup, verified against the PDF render). Data source of truth for code: `_reference/*.yaml`.
