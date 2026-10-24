---
id: PLAN-DASH-11
date: 2026-10-24
status: todo
challenge: [quick-check-tool, business-models]
covers: [QCT-SCOPE-11, QCT-SCOPE-12, DESIGN-TOKENS]
blocked_by: [PLAN-DASH-09, PLAN-DASH-10]
---

# Phase 11 · QA, e2e and polish

## Goal

Prove that the whole product works, keeps data safe, is accessible and is fast.

## Requirements covered

QCT-SCOPE-11 (evaluation criteria), QCT-SCOPE-12 (testing and validation), DESIGN-TOKENS §7; D-23.

## Steps

1. Playwright `e2e/`, running EN and DE:
   1. start
   2. open an example
   3. overview
   4. edit a QC and a BP field
   5. export
   6. reload (data still there)
   7. delete the project
   8. import the export (same data)

   Plus one run in light theme.
2. Check responsive layout at 375/768/1024/1440. Check a11y: keyboard, focus, labels, 4.5:1 contrast in both themes, reduced motion. Fix what fails.
3. Performance: record first-load JS per route from `pnpm build` in the note. Confirm charts are lazy, no layout shift, no hydration warnings.
4. Write `notes/YYYY-MM-DD_de-copy-review.md`, listing the DE dictionary files for native review.
5. Final build log note: what is done and what is left (PDF export D-09, public docs content D-22, ingestion agent D-05).

## Open questions this depends on

None.

## Verification

All unit and e2e tests pass, and `pnpm build` passes.
