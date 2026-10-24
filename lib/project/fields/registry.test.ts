// @vitest-environment node
import { describe, expect, it } from "vitest"
import { z } from "zod"
import { EQUATION_IDS, TABLE_IDS } from "@/lib/project/catalog/references"
import { parsePath } from "@/lib/project/path"
import { projectSchema } from "@/lib/project/schema/project"
import { isNullOnly, schemaAt } from "@/lib/project/schema/schema-at"
import { cellField, DERIVED_VALUES, FIELD_GROUPS, FIELDS, fieldsOf, getField, getGroup, groupsOf } from "./registry"
import type { FieldDef } from "./types"

type Json = Record<string, unknown> & { anyOf?: Json[]; properties?: Record<string, Json>; items?: Json }

const schemaOf = (id: string) => schemaAt(projectSchema, parsePath(id) ?? [])

/** The JSON Schema of a field's leaf, without the null branch of a nullable. */
function jsonOf(id: string): { json: Json; nullable: boolean } {
  const json = z.toJSONSchema(schemaOf(id)!) as Json
  const branches = json.anyOf
  if (!branches) return { json, nullable: false }
  return { json: branches.find((branch) => branch.type !== "null")!, nullable: branches.some((b) => b.type === "null") }
}

/** System leaves: set by the app, never patched. */
const SYSTEM = ["meta.id", "meta.createdAt", "meta.updatedAt", "meta.schemaVersion", "meta.methodologyVersion", "meta.exampleId"]

/** Every leaf path of the schema (objects are walked, lists are leaves). */
function leaves(schema: z.ZodType, prefix: string[] = []): string[] {
  const inner = schema instanceof z.ZodNullable ? (schema.unwrap() as z.ZodType) : schema
  if (!(inner instanceof z.ZodObject)) return [prefix.join(".")]
  return Object.entries(inner.shape as Record<string, z.ZodType>).flatMap(([key, child]) => leaves(child, [...prefix, key]))
}

const TYPE: Record<FieldDef["kind"], string> = {
  integer: "integer",
  number: "number",
  percent: "number",
  boolean: "boolean",
  choice: "string",
  text: "string",
  longText: "string",
  textList: "array",
  items: "array",
}

describe("field registry", () => {
  it("has unique field and group ids", () => {
    expect(new Set(FIELDS.map((field) => field.id)).size).toBe(FIELDS.length)
    expect(new Set(FIELD_GROUPS.map((group) => group.id)).size).toBe(FIELD_GROUPS.length)
  })

  it.each(FIELDS.map((field) => [field.id, field] as const))("resolves %s to a schema path", (id, field) => {
    const schema = schemaOf(id)
    expect(schema).toBeDefined()
    expect(isNullOnly(schema!)).toBe(false)
    const { json, nullable } = jsonOf(id)
    expect(json.type).toBe(TYPE[field.kind])
    expect(nullable).toBe(field.nullable)
  })

  it("declares the same bounds, options and lengths as the schema", () => {
    for (const field of FIELDS) {
      const { json } = jsonOf(field.id)
      switch (field.kind) {
        case "integer":
        case "number":
        case "percent":
          expect([json.minimum, json.exclusiveMinimum, json.maximum], field.id).toEqual([field.min, field.exclusiveMin, field.max])
          break
        case "choice":
          expect(json.enum, field.id).toEqual(field.options)
          break
        case "text":
        case "longText":
          expect(json.maxLength, field.id).toBe(field.maxLength)
          break
        case "textList":
          expect([json.maxItems, json.items?.maxLength], field.id).toEqual([field.maxItems, field.maxLength])
          break
        case "items": {
          expect(json.maxItems, field.id).toBe(field.maxItems)
          const properties = json.items?.properties ?? {}
          expect(Object.keys(properties), field.id).toEqual(["id", ...field.properties.map((property) => property.key)])
          for (const property of field.properties) {
            expect(properties[property.key].type, `${field.id}.${property.key}`).toBe(TYPE[property.kind])
            expect(properties[property.key].maxLength, `${field.id}.${property.key}`).toBe(property.maxLength)
          }
          break
        }
      }
    }
  })

  it("says what an empty value means on exactly the nullable fields", () => {
    for (const field of FIELDS) expect(field.emptyMeans !== undefined, field.id).toBe(field.nullable)
    expect(getField("quickCheck.networkLengthM")?.emptyMeans).toBe("estimated")
    expect(getField("quickCheck.overrides.economic.heat_pump")?.emptyMeans).toBe("default")
  })

  it("covers every input of the schema: all leaves but system values and dash cells", () => {
    const inputs = leaves(projectSchema).filter((path) => !SYSTEM.includes(path) && !isNullOnly(schemaOf(path)!))
    expect(FIELDS.map((field) => field.id).sort()).toEqual(inputs.sort())
  })

  it("places every field in an existing group, and grid cells on its axes", () => {
    for (const field of FIELDS.filter((entry) => entry.group)) {
      const group = getGroup(field.group!)
      expect(group, field.id).toBeDefined()
      expect(field.id.startsWith(`${group!.id}.`), field.id).toBe(true)
      expect(field.module, field.id).toBe(group!.module)
      expect(field.step, field.id).toBe(group!.step)
      if (group!.rows) expect(group!.rows.keys, field.id).toContain(field.row)
      if (group!.columns) expect(group!.columns.keys, field.id).toContain(field.column)
    }
  })

  it("resolves every group to an object of the schema with at least one field", () => {
    for (const group of FIELD_GROUPS) {
      expect(schemaOf(group.id), group.id).toBeInstanceOf(z.ZodObject)
      expect(fieldsOf({ group: group.id }).length, group.id).toBeGreaterThan(0)
    }
  })

  it("cites only equations and tables that exist in docs/", () => {
    for (const entry of [...FIELDS, ...FIELD_GROUPS]) {
      for (const id of [...entry.feeds, ...entry.replaces]) expect(EQUATION_IDS, entry.id).toContain(id)
      for (const id of entry.tables) expect(TABLE_IDS, entry.id).toContain(id)
    }
  })

  it("covers every QCT-IN input (QCT-IN-03 as a derived value) and every BM step", () => {
    const cited = new Set([...FIELDS, ...DERIVED_VALUES].flatMap((entry) => entry.requirements))
    for (let n = 1; n <= 9; n++) expect(cited, `QCT-IN-0${n}`).toContain(`QCT-IN-0${n}`)
    for (let n = 1; n <= 4; n++) expect(cited, `BM-STEP-0${n}`).toContain(`BM-STEP-0${n}`)
  })

  it("lists equation feeds for every Quick Check input step (D-33)", () => {
    for (const step of ["area", "buildings", "sources", "options"] as const) {
      expect(fieldsOf({ module: "quickCheck", step }).every((field) => field.feeds.length > 0), step).toBe(true)
    }
  })

  it("is plain data that survives a JSON round trip", () => {
    const registry = { FIELDS, FIELD_GROUPS, DERIVED_VALUES }
    expect(JSON.parse(JSON.stringify(registry))).toEqual(registry)
  })
})

describe("registry lookups", () => {
  it("finds fields and groups by id", () => {
    expect(getField("buildings.total")?.kind).toBe("integer")
    expect(getField("buildings")).toBeUndefined()
    expect(getGroup("buildings.shares")?.layout).toBe("grid")
  })

  it("filters by module, step and group, in registry order", () => {
    expect(fieldsOf({ module: "quickCheck", step: "area" }).map((field) => field.id)).toEqual(["buildings.total", "buildings.areaM2"])
    expect(fieldsOf({ group: "buildings.shares" })).toHaveLength(25)
    expect(groupsOf({ module: "businessPlan", step: "implementation" }).map((group) => group.id)).toEqual([
      "businessPlan.refinements",
      "businessPlan.scalability",
      "businessPlan.nextSteps",
    ])
    expect(fieldsOf()).toHaveLength(FIELDS.length)
  })

  it("finds the field of a grid cell, or none for a dash", () => {
    expect(cellField("buildings.shares", "industry", "2011_today")?.id).toBe("buildings.shares.industry.2011_today")
    expect(cellField("sources.potentials", "ground_water")?.id).toBe("sources.potentials.ground_water")
    expect(cellField("quickCheck.overrides.heating", "solar_thermal", "cop")).toBeUndefined()
  })
})
