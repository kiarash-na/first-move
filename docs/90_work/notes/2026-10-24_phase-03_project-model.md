---
id: NOTE-2026-10-24-phase-03-project-model
date: 2026-10-24
author: Claude (phase 03 sub-agent)
relates_to: [PLAN-DASH-03, PLAN-DASH-00, QCT-IN-00, QCT-IN-01, QCT-IN-02, QCT-IN-03, QCT-IN-04, QCT-IN-05, QCT-IN-06, QCT-IN-07, QCT-IN-08, QCT-IN-09, QCT-REF-TYPES, BM-STEP-01, BM-STEP-02, BM-STEP-03, BM-STEP-04, OQ-04, OQ-05, D-01, D-05, D-10, D-13, D-31, D-33, R-03]
---

# Phase 03 · Project model

Executed [PLAN-DASH-03](../plans/2026-10-24_dashboard-03_project-model.md). `pnpm lint && pnpm typecheck && pnpm test && pnpm build` pass (101 test files, 525 tests; 48 files / 373 tests in `lib/project/`). No new dependency. No UI, no storage, no network.

## Built

Everything lives in `lib/project/` (pure TypeScript, no JSX). One import for later phases: `@/lib/project` (barrel `index.ts`).

| Path | What |
|---|---|
| `versions.ts` | `SCHEMA_VERSION = 1`, `METHODOLOGY_VERSION = "1.0.0"` |
| `catalog/` | Keys and structural facts shared by schema and registry, each cross-checked against `docs/` by a test: `BUILDING_TYPES` (QCT-REF-TYPES order, TBL-1..3 rows), `CONSTRUCTION_PERIODS` + `PERIOD_COLUMNS` (printed headers), `SOURCES` + `SOURCE_CELLS` / `hasCell()` (which TBL-4/5 cells have a default; dashes per OQ-13), `POTENTIALS`, `CAPACITY_LEVELS`, `CAPACITY_CELLS`, `ECONOMIC_PARAMETERS` + `ECONOMIC_PARAMETER_INFO` (TBL-6 unit, symbol, feeds, flags), `EQUATION_IDS` / `TABLE_IDS` (read from the eq/table files), `SCENARIO_IDS` (BM-SCN-01..04 + `custom`), `CANVAS_BLOCKS` |
| `schema/` | Zod 4, one file per section: `meta`, `site`, `buildings`, `sources`, `quick-check` (+ `overrides`), `business-plan/` (one file per BM step), combined in `project.ts` (`projectSchema`, type `Project`). `common.ts` has the helpers; `schema-at.ts` walks a dot path to its sub-schema |
| `fields/` | The registry (D-05): `project.ts`, `quick-check.ts` (+ `quick-check-overrides.ts`), `business-plan.ts`; `registry.ts` (`FIELDS`, `FIELD_GROUPS`, `DERIVED_VALUES`, `getField`, `getGroup`, `fieldsOf`, `groupsOf`, `cellField`), `limits.ts` (all validation limits as data), `steps.ts`, `resolve.ts` (patch key → field), `step-equations.ts`, `types.ts` |
| `create-project.ts` | `createProject({ modules, name?, exampleId?, id?, now? })` |
| `apply-patch.ts` | `applyPatch(project, patch, { atomic?, now? })` → `{ ok, project, applied, errors }` |
| `patch-errors.ts` | `PATCH_ERROR_CODES`, `PatchError`, Zod issue → error mapping |
| `migrations/` | `run-migrations.ts` (`migrateProject`), `chain.ts` (`MIGRATIONS`), `v1-baseline.ts`, `v1-baseline.fixture.json` (frozen filled v1 file) |
| `json-schema.ts` | `projectJsonSchema()` = `z.toJSONSchema(projectSchema, { target: "draft-2020-12" })`, the ingestion-agent contract |
| `completeness/` | `groupRuleStatus(project, group)` (share sum, min selected), `inputStatus(project, module)` → `{ complete, missing, incompleteSteps }` |
| `create-list-item.ts`, `clear-patch.ts`, `empty-value.ts`, `path.ts` | new item-list row with fresh id; reset patch for a set of fields; "not entered" value of any schema; dot-path parse/get/set (immutable, prototype-safe) |

**Shape** (PLAN-DASH-00 data model; every key always present, "not entered" = `null`, text = `""`, lists = `[]`):

```
meta        id (uuid) · name · createdAt/updatedAt (ISO) · schemaVersion (literal 1) · methodologyVersion · modules {quickCheck, businessPlan} (≥ 1 on) · exampleId
site        name · location · siteType · ownership · units · currentSupply[] · stakeholders[] · partners[]
buildings   total · areaM2 · shares.<type>.<period> (% as typed, 0–100)
sources     potentials.<source> (low|medium|high|unknown|null = not selected) · pv (boolean)
quickCheck  manualDemand.{heating,cooling}KwhPerYear · networkLengthM · overrides.{heating,cooling}.<source>.<low|medium|high|cop> · overrides.economic.<TBL-6 key>
businessPlan scenarioId · opportunity{6} · canvas{10} · allocation[] · assumptions{5} · criticalAssumptions[] · risks[] · refinements{2} · scalability{3} · nextSteps{5}
```

Keys: building types, sources and TBL-6 rows use the YAML keys (`category_a`, `ground_water`, `heating_base_price`); periods are `until_1919`, `1919_1960`, `1961_1990`, `1991_2010`, `2011_today` (labels verbatim from the dictionary, OQ-03). Strict objects everywhere (unknown keys rejected, D-14); no transforms or preprocess, so `z.toJSONSchema()` works (tested). Text is stored as typed (no trim).

**Registry entry** (`FieldDef`, discriminated by `kind`: `integer` · `number` · `percent` · `boolean` · `choice` · `text` · `longText` · `textList` · `items`): `id` (dot path = patch key), `module`, `step`, `text` (dictionary node with `label`/`help`), `nullable` + `emptyMeans` (`not-entered` · `not-selected` · `estimated` · `default`), `required`, `unit` (symbol, shown as is), `min`/`exclusiveMin`/`max`, `maxLength`/`maxItems`, `options` + `optionText`, `properties` (item lists), `group` + `row`/`column` (grids), `companion: "hectares"` (area, D-31), `alsoShownIn` (shared with BP step 1, D-01), and trace: `requirements`, `openQuestions`, `decisions`, **`feeds`** (equations that use the value directly, D-33), **`replaces`** (EQ-3.2c/d, EQ-3.4a/b for the manual values), `tables`. Groups (`FieldGroup`) carry `layout` (`grid` · `list` · `section`), `rows`/`columns` axes with label nodes, and `rule` (`sum` 100 ± 1e-6 for the share grid, `min-selected` 1 for sources). `DERIVED_VALUES` holds the OQ-04 density category (QCT-IN-03: `computedBy` EQ-3.3 + TBL-8, not an input). 139 fields: project 3, QC area 2 / buildings 25 / sources 6 / options 4 / assumptions 56, BP 43.

Tests guarantee: every registry id resolves to a schema path; type, nullability, bounds, enums, lengths and item properties equal the schema's JSON Schema; every input leaf of the schema has exactly one field (only system meta values and dash cells are excluded); every label, option, axis and item property has EN copy; every cited EQ/TBL id exists in `docs/`; every QCT-IN-01..09 and BM-STEP-01..04 is cited; the registry survives a JSON round trip.

**Copy (EN only, D-32):** `dictionaries/en/quick-check.json` (`fields.*`, `buildingTypes`, `periods`, `sources`, `potentials`, `capacityCells`, `parameters`, `derived`), `business-plan.json` (`fields.*`, `scenarios`), `shell.json` (`fields.meta.*`, `validation.<code>` with `{min}`/`{max}` placeholders). DE files stay `{}` and fall back to EN.

## Deviations and documented defaults

1. **Sources are a keyed object, not `[{ id, potential }]`** (PLAN-DASH-00). `sources.potentials.<source>` gives every source a stable dot path for the registry and patches, and makes duplicates impossible. `null` = not selected; choosing a potential selects the source.
2. **Site has three more fields than PLAN-DASH-00** (`ownership`, `units`, `partners`) so every fact a BM-SCN scenario states has a home and presets can prefill exactly those (OQ-25). `siteType` is meant for the scenario "Location" ("Rural village"); `location` is the place.
3. **Canvas has 10 blocks**: the nine classic ones plus `operatorResponsibilities`, which BM-STEP-02 names explicitly (`FOCUS_CANVAS_BLOCKS` lists its six focus blocks).
4. **BP field breakdown** (plan named only the entities): opportunity = customerSegments, needs, heatSources, painPoint, alternatives, advantage; assumptions = connectionRate, tariffs, capex, financing, subsidies (free text, D-27); risk row = title, description, dealBreaker, validation; critical assumption = statement, validation; allocation row = stakeholder, investment, risk, benefit; refinements = feedback, changes; scalability = geographical, economic, organisational; nextSteps = data, stakeholders, partnerships, pilots, decisions (V01 decision gate). The deal-breaker flag is only on risks (per plan) and not limited to one row; phase 10 may present it as single-choice.
5. **At least one selected source** is needed for a complete Quick Check (`MIN_SELECTED_SOURCES = 1`). The methodology does not say what happens with none; an empty list is treated as "not filled in yet". Owner may revisit.
6. **Limits beyond the plan** (D-31, team-set; they only stop impossible input): area ≤ 1 000 km², network length ≤ 1 000 km, manual demand 0–10 TWh/a (0 allowed, e.g. no cooling), capacities 0–1 TWh/a, heating COP > 1 (EQ-3.8a divides by COP − 1), cooling COP > 0 (EQ-3.11), TBL-6 caps per row, depreciation period whole years 1–100, % values 0–100. Text: name 120, one-line 200, multi-line 5 000, 30 entries/rows.
7. **Overrides**: dash cells of TBL-4/5 are `null`-only in the schema and have no registry field (OQ-13: solar thermal no COP, no cooling from waste heat or solar thermal). Ambient-air installation cost (TBL-6 "-", OQ-18) can be overridden. There is no stored "playground on" flag: any non-null override means custom parameters (D-10).
8. **PV is a boolean, default `false`** (OQ-06), not nullable.
9. **Patch semantics**: flat keys (registry ids), partial by default (valid keys apply, others are reported), `{ atomic: true }` applies all or nothing. Item lists: patch the whole list, a row (`businessPlan.risks.2`) or a row property (`businessPlan.risks.2.title`); row ids are read-only. Containers (`buildings.shares`) are not patchable; use `clearPatch(fieldsOf(...))` for resets. A cross-field rule (at least one module) rejects the key that broke it. `updatedAt` is stamped only when something changed; otherwise the same object is returned.
10. `applyPatch` never touches `meta.methodologyVersion`; phase 04 should set it to `METHODOLOGY_VERSION` on save/export.

## Follow-ups

- Phase 05 (engine): read inputs from `Project`; shares are percent (divide by 100 in `params.ts`, OQ-01); `null` cells/sources = 0 / not selected; overrides `null` = default; use `inputStatus(project, "quickCheck")` for the incomplete flag; `catalog` keys match the YAML. `explain/map.ts` can take each step's equations from `stepEquations(module, step)` or the fields' `feeds`/`replaces`, so the lists are not duplicated. Phase 05 may move `EQUATION_IDS` to its generated file; keep the docs cross-check test.
- Phase 04 (storage): validate imports with `migrateProject(json)` (errors carry field paths; map them to labels with `resolvePatchPath`); write `METHODOLOGY_VERSION` on export. `createProject` uses `crypto.randomUUID()` (secure context).
- Phase 06 (examples): build with `createProject` + `applyPatch(…, { atomic: true })`; `exampleId` must match `^[a-z0-9-]{1,64}$`; item rows need ids matching `^[A-Za-z0-9_-]{1,64}$`.
- Phase 08/10 (UI): render from `fieldsOf({ module, step })` and `groupsOf(...)`; labels via `text.key` (+ `.label`, `.help`), options via `optionText.key.<value>.label`, grid axes via `rows.text`/`columns.text`, cell lookup `cellField(group, row, column)` (undefined = dash). Show errors as `shell.validation.<code>` with `params`; `message` is for agents only. Share-grid live sum: `groupRuleStatus`. Add list rows with `createListItem(listId)`. Percent fields store 0–100: divide by 100 before `formatPercent`.
- DE copy for the new keys is left for the translation pass (D-32); `missingKeys()` lists them.

## Next.js

No Next.js API was used in this phase (pure `lib/` code).
