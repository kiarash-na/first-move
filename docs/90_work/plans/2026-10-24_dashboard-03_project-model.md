---
id: PLAN-DASH-03
date: 2026-10-24
status: done
challenge: [quick-check-tool, business-models]
covers: [QCT-IN-00, QCT-IN-01, QCT-IN-02, QCT-IN-03, QCT-IN-04, QCT-IN-05, QCT-IN-06, QCT-IN-07, QCT-IN-08, QCT-IN-09, QCT-REF-TYPES, BM-STEP-01, BM-STEP-02, BM-STEP-03, BM-STEP-04, OQ-04, OQ-05]
blocked_by: [PLAN-DASH-01]
---

# Phase 03 · Project model

## Goal

One typed, versioned project shape that agents can operate, shared by both modules.

## Requirements covered

All input requirements in `10_quick-check-tool/01_input-project-data/`, plus the field lists of BM-STEP-01..04; D-01, D-05, D-13.

## Steps

1. `lib/project/schema/` — one Zod file per section (`meta`, `site`, `buildings`, `sources`, `quick-check`, `business-plan`), following the PLAN-DASH-00 data model:
   - Building types and periods come from QCT-REF-TYPES / TBL-1.
   - Sources and potentials (Low / Medium / High / Unknown) come from TBL-4 and QCT-IN-07.
   - Business Plan fields are taken from BM-STEP-01..04:
     - opportunity
     - a 9-block canvas
     - stakeholder allocation (investment / risk / benefit)
     - assumptions (connection rate, tariffs, capex, financing, subsidy dependence)
     - a risk register with a deal-breaker flag and validation
     - critical assumptions (statement + how to validate)
     - refinements
     - scalability by context
     - next steps (data, partners, pilots, decisions)

   Dates are ISO strings. Use no transforms or preprocess in the schema (number parsing stays in `lib/i18n/format`), so `z.toJSONSchema()` works.
2. `lib/project/fields/` — the registry (D-05), one file per module. Write validation limits as data, e.g. buildings 1–100 000, area > 0, share sum = 100 (float tolerance only; otherwise incomplete, no result). The density category (OQ-04) is derived, not an input. Manual demand (OQ-05) is two optional totals.
3. `create-project.ts` builds an empty project for a chosen set of modules. `apply-patch.ts` validates and applies a partial patch, returning per-field errors.
4. `versions.ts` holds `SCHEMA_VERSION = 1` and `METHODOLOGY_VERSION`. `migrations/` holds a runner and a v1 baseline.
5. Tests:
   - schema accepts an empty project and rejects bad values
   - every registry id resolves to a schema path
   - `applyPatch` accepts good patches and rejects bad ones
   - the migration runner works

## Open questions this depends on

OQ-04, OQ-05 (resolved).

## Verification

`z.toJSONSchema()` of the project schema is generated in a test without errors.
