---
id: NOTE-2026-10-24-phase-06-examples
date: 2026-10-24
author: Claude (phase 06 sub-agent)
relates_to: [PLAN-DASH-06, PLAN-DASH-00, QCT-SCOPE-05, QCT-SCOPE-12, QCT-REF-TYPES, BM-SCN-01, BM-SCN-02, BM-SCN-03, BM-SCN-04, BM-STEP-01, BM-STEP-02, BM-STEP-03, BM-STEP-04, OQ-23, OQ-25, OQ-26, D-04, D-05, D-32, D-34]
---

# Phase 06 · Demo examples

Executed [PLAN-DASH-06](../plans/2026-10-24_dashboard-06_examples.md). `pnpm lint && pnpm typecheck && pnpm test && pnpm build` pass (218 test files, 1086 tests; new: 5 files in `lib/examples/`, 91 tests). No new dependency, no UI, no network, no Next.js API.

## Built

Everything is in `lib/examples/` (pure TypeScript, no JSX). One import for later phases: `@/lib/examples`.

| Path | What |
|---|---|
| `types.ts` | `Localized` (`{ en, de? }`), `text(en, de?)`, `ExampleDefinition` (id, scenarioId, name, summary, site, buildings, sources, optional `networkLengthM`, `businessPlan`) |
| `resolve-texts.ts` | `resolveTexts(tree, lang)` replaces every `Localized` by its text; a missing or empty `de` falls back to `en` (D-32) |
| `localize.ts` | `localizeExample(example, lang)` → valid `Project`. Built with `createProject` plus an atomic `applyPatch` (D-05), so it cannot drift from the schema or the registry. Fixed date (`EXAMPLE_DATE`) and placeholder id, so the result is deterministic |
| one file per example | `rural-village-hotel.ts`, `school-kindergarten-flats.ts`, `housing-cooperatives.ts`, `thermal-spa-hotels.ts`, `new-build-quarter.ts`, `office-retail-block.ts` |
| `index.ts` | `EXAMPLES` (demo order), `EXAMPLE_IDS`, `getExample(id)`, `ILLUSTRATIVE_LABEL`, re-exports |

Both modules are on in every example (`meta.modules` both true, `meta.exampleId` = the example id, `businessPlan.scenarioId` = `BM-SCN-0x` or `custom`). Every Business Plan field of BM-STEP-01..04 is filled (opportunity, 10 canvas blocks, 3 allocation rows, 5 assumptions, 2 critical assumptions, 2 risks with exactly one deal-breaker, refinements, scalability, next steps).

## Results through the real engine (`run()`)

| Example | Buildings / area | Target and result | Heating cover | Building density (b/ha) | Heat density (MWh/m) | E |
|---|---|---|---|---|---|---|
| rural-village-hotel (BM-SCN-01) | 45 / 150 ha, network 7 km known | Not promising (`low_coverage_and_densities`) | 1 % | 0.3 | 0.39 | 1.55 |
| school-kindergarten-flats (BM-SCN-02) | 8 / 7 200 m² | Promising | 126 % | 11.1 | 4.02 | 1.15 |
| housing-cooperatives (BM-SCN-03) | 8 / 10 ha | Further analysis (`building_density_low` only: low building density, high heat density) | 101 % | 0.8 | 1.59 | 1.45 |
| thermal-spa-hotels (BM-SCN-04) | 8 / 7 500 m² | Further analysis, forced (`unknown_source` only) | 97 % | 10.7 | 5.03 | 1.83 |
| new-build-quarter | 10 / 9 000 m² | Promising | 105 % | 11.1 | 1.99 | 1.28 |
| office-retail-block | 8 / 6 800 m² | Promising | 118 % | 11.8 | 5.48 | 1.45 |

All three result levels appear. Each example has a test per language that asserts the level, the forced flag and the exact list of reason codes. Per-example tests also check the schema, a JSON round trip through `migrateProject`, `inputStatus` for both modules, no empty text, one deal-breaker, and that invented details are marked "illustrative".

Mapping by QCT-REF-TYPES: school → Category A, kindergarten, hotels → B, spa → C. In BM-SCN-04 the spa's thermal water is `geothermal: unknown` (the scenario does not say whether it can serve as a source), which is what forces the verdict; the other indicators would otherwise pass (97 % coverage, E 1.83).

## Deviations and documented defaults

1. **EN copy only (D-32).** The plan says text is stored as `{ en, de }`; newest decision D-32 wins: `de` is optional and falls back to English. `localizeExample(x, "de")` therefore returns the English text for now. The tests run for both languages and will keep passing once `de` strings are added.
2. **Promising examples are compact.** The density rule (TBL-8: medium from 10 buildings/ha) means 2-15 buildings need a project area of roughly 700-1 000 m² per building (the OQ-26 pattern from phase 05). The Promising examples therefore use areas of 0.7-0.9 ha and the site text calls them illustrative. Oversizing a source hurts E, so source potentials were tuned to cover about 100-125 %.
3. **Housing cooperatives = "mixed densities"** is read as: building density low, heat density not low (so TBL-11 gives Further analysis without the Not-promising rule, because coverage is not below 70 %).
4. **Rural village** sets the optional network length (7 000 m, QCT-IN-08) so the heat density is low; the other examples use the estimate (EQ-3.4a/b).
5. **Units vs. buildings.** `site.units` keeps the scenario's wording ("20-70 units"); `buildings.total` is the Quick Check count (e.g. 45).
6. **Scenario facts only.** Site fields hold exactly what BM-SCN-01..04 state (the rural village's current supply is "not specified", so the list is empty). Everything else in the Business Plan texts is invented and marked "(illustrative)". The two extra examples have generic place names (no real places or organisations).
7. **No verdict in the Business Plan text.** The texts do not quote Quick Check numbers, so editing the inputs cannot make them stale.
8. **Label.** `ILLUSTRATIVE_LABEL` ("Illustrative inputs only") lives in `lib/examples`, EN only; phase 07 shows it on each example card. If it should come from a dictionary, move it to `start.json` then.

## Follow-ups

- **Phase 07 (start screen):** list `EXAMPLES`; card title `example.name`, text `example.summary`, badge `ILLUSTRATIVE_LABEL`; pick = `getProjectStore().addCopy(localizeExample(example, lang))` (resolve text with `resolveTexts` or pass through `localizeExample`; the `Localized` fields are not rendered directly). The copy keeps `meta.exampleId`.
- **Phase 08/09/10:** the examples are ready-made demo and test fixtures; use `localizeExample(getExample("…")!, "en")`. The six verdicts are fixed by `lib/examples/examples.test.ts`; if the engine rules change, the tests tell which example to retune.
- **Translation pass (D-32):** add `de` to the `text(...)` calls (about 160 strings per example).

## What later phases must know

- `lib/examples/` has no React or storage code; importing it costs nothing at runtime beyond the six objects.
- Names and summaries are `Localized` in the definition; only a `Project` (from `localizeExample`) carries plain strings. Do not pass an `ExampleDefinition` to a component.
- The placeholder id `00000000-0000-4000-8000-000000000000` is never stored: `addCopy` assigns a new id and timestamps.

## Next.js

No Next.js API was used in this phase (pure `lib/` code).
