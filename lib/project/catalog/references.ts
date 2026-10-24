/**
 * IDs of the methodology's equations (`02_run-quick-check/eq-*.md`) and reference tables
 * (`_reference/table-*.yaml`). The field registry cites them so "How we calculate" can show
 * which equations an input feeds (D-33). A test checks both lists against `docs/`.
 */
export const EQUATION_IDS = [
  "EQ-3.1",
  "EQ-3.2a",
  "EQ-3.2b",
  "EQ-3.2c",
  "EQ-3.2d",
  "EQ-3.3",
  "EQ-3.4a",
  "EQ-3.4b",
  "EQ-3.5",
  "EQ-3.6a",
  "EQ-3.6b",
  "EQ-3.7",
  "EQ-3.8a",
  "EQ-3.8b",
  "EQ-3.9a",
  "EQ-3.9b",
  "EQ-3.9c",
  "EQ-3.10a",
  "EQ-3.10b",
  "EQ-3.10c",
  "EQ-3.10d",
  "EQ-3.10e",
  "EQ-3.10f",
  "EQ-3.11",
  "EQ-3.12",
] as const

export type EquationId = (typeof EQUATION_IDS)[number]

export const TABLE_IDS = [
  "TBL-1",
  "TBL-2",
  "TBL-3",
  "TBL-4",
  "TBL-5",
  "TBL-6",
  "TBL-7",
  "TBL-8",
  "TBL-9",
  "TBL-10",
  "TBL-11",
] as const

export type TableId = (typeof TABLE_IDS)[number]
