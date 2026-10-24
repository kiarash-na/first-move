# 90_work

Living area for coding agents and the team. Everything above `90_work/` describes the requirements; this folder records progress.

| Folder | What goes in | File name |
|---|---|---|
| [notes/](notes/) | Findings, decisions taken, answers received, session logs | `YYYY-MM-DD_topic.md` from [../_templates/note.md](../_templates/note.md) |
| [plans/](plans/) | Build plans for a feature, module or challenge; [plans/CONTEXT.md](plans/CONTEXT.md) lists phases and status | `YYYY-MM-DD_plan-name.md` from [../_templates/plan.md](../_templates/plan.md) |

The notes are the build log: every build phase adds `notes/YYYY-MM-DD_phase-NN_<name>.md`.

Rules:

- Cite requirements by ID (`EQ-3.4a`, `QCT-IN-04`, `TBL-6`, `OQ-17`, `BM-STEP-03`) and link the file.
- Never edit `00_originals/`. Never change requirement files to match code; if the source is wrong, open or update an open question.
- An answered open question: set `status: resolved` and `answer:` in the OQ file, and add a note here that records who answered and when.
