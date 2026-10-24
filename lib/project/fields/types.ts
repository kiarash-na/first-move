import type { Area } from "@/lib/i18n/dictionaries"
import type { EquationId, TableId } from "@/lib/project/catalog/references"
import type { FieldStep } from "./steps"

/** The module a field belongs to; `project` holds the name and the module switches. */
export type FieldModule = "project" | "quickCheck" | "businessPlan"

/**
 * A dictionary node: `dictionaries/<lang>/<area>.json` → `key` (a dot path) holds `label` and
 * optionally `help` (visible copy is never hard-coded).
 */
export interface TextRef {
  area: Area
  key: string
}

export interface StepRef {
  module: FieldModule
  step: FieldStep
}

/** Traceability and "How we calculate" metadata (D-33), shared by fields and groups. */
export interface FieldTrace {
  /** Requirement IDs the field implements (`QCT-IN-04`, `BM-STEP-03`). */
  requirements: readonly string[]
  /** Resolved open questions that shape it (`OQ-05`). */
  openQuestions: readonly string[]
  /** Owner decisions and plan defaults (`D-10`, `R-03`). */
  decisions: readonly string[]
  /** Equations that use the value directly (D-33). Downstream equations are not repeated. */
  feeds: readonly EquationId[]
  /** Equations whose result the value replaces when it is set (manual demand, manual length). */
  replaces: readonly EquationId[]
  /** Reference tables the value selects defaults from, or overrides. */
  tables: readonly TableId[]
}

interface FieldBase extends FieldTrace {
  /** Dot path into the project; also the key of a patch (`applyPatch`). */
  id: string
  module: FieldModule
  step: FieldStep
  /** Label (and help) of the field. Grid cells point to their group's text. */
  text: TextRef
  /** null is a valid value; `emptyMeans` says what it stands for. */
  nullable: boolean
  /**
   * What an empty (null) value means, so the UI can say so: not entered yet, source not
   * selected, the estimate is used (manual demand, network length), or the table default is
   * used (overrides). Set exactly on nullable fields.
   */
  emptyMeans?: "not-entered" | "not-selected" | "estimated" | "default"
  /** Needed for the module's result (Quick Check); a group rule may add more. */
  required: boolean
  /** The `FieldGroup` the field is laid out in. */
  group?: string
  /** Grid cells: row and column key within the group. */
  row?: string
  column?: string
  /** Other steps that show the same shared value (D-01), e.g. Business Plan step 1. */
  alsoShownIn: readonly StepRef[]
}

/** A number. `percent` is stored as typed (0–100) and divided by 100 in the engine (OQ-01). */
export interface NumberField extends FieldBase {
  kind: "integer" | "number" | "percent"
  /** Unit symbol as in the methodology (`m²`, `kWh/a`, `€/m²`), shown as is; none for counts and COPs. */
  unit?: string
  min?: number
  exclusiveMin?: number
  max: number
  /** Show the value converted next to the input: the area in hectares (D-31). */
  companion?: "hectares"
}

export interface BooleanField extends FieldBase {
  kind: "boolean"
}

/** One of a fixed set of values; option labels are `optionText.key + "." + value + ".label"`. */
export interface ChoiceField extends FieldBase {
  kind: "choice"
  options: readonly string[]
  optionText: TextRef
}

export interface TextField extends FieldBase {
  kind: "text" | "longText"
  maxLength: number
}

/** A list of one-line entries. */
export interface TextListField extends FieldBase {
  kind: "textList"
  maxLength: number
  maxItems: number
}

/** One editable property of each row of an item list. */
export interface ItemPropertyDef {
  key: string
  kind: "text" | "longText" | "boolean"
  maxLength?: number
  text: TextRef
}

/**
 * A list of rows with a stable `id` each. Patch the whole list (add, remove, reorder) or one
 * property by index: `businessPlan.risks.0.validation`.
 */
export interface ItemsField extends FieldBase {
  kind: "items"
  maxItems: number
  properties: readonly ItemPropertyDef[]
}

export type FieldDef = NumberField | BooleanField | ChoiceField | TextField | TextListField | ItemsField

export type FieldKind = FieldDef["kind"]

/** A rule over all fields of a group; failing it leaves the module incomplete, it is not a patch error. */
export type GroupRule =
  | { kind: "sum"; target: number; tolerance: number }
  | { kind: "min-selected"; min: number }

/** Row or column keys of a grid, with their labels at `text.key + "." + key + ".label"`. */
export interface GroupAxis {
  keys: readonly string[]
  text: TextRef
}

/** Fields laid out together: a grid (share grid, override tables), a list or a section card. */
export interface FieldGroup extends FieldTrace {
  /** Dot path of the object that holds the group's fields. */
  id: string
  module: FieldModule
  step: FieldStep
  layout: "grid" | "list" | "section"
  text: TextRef
  rows?: GroupAxis
  columns?: GroupAxis
  rule?: GroupRule
}

/**
 * A value the UI shows next to the inputs that is computed, not entered (the OQ-04 density
 * category). Listed so every QCT-IN requirement has a home in the registry.
 */
export interface DerivedValue {
  id: string
  module: FieldModule
  step: FieldStep
  text: TextRef
  options: readonly string[]
  optionText: TextRef
  /** Equations and tables that produce it. */
  computedBy: readonly EquationId[]
  tables: readonly TableId[]
  requirements: readonly string[]
  openQuestions: readonly string[]
}
