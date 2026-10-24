import { z } from "zod"
import { parsePath } from "@/lib/project/path"
import { projectSchema } from "@/lib/project/schema/project"
import { isNullOnly, schemaAt } from "@/lib/project/schema/schema-at"
import { matchItemPath } from "./patch-key"
import { getField } from "./registry"
import type { FieldDef, ItemsField } from "./types"

/** What a patch key addresses: a registry field, or a row (or one property of a row) of an item list. */
export type PatchTarget =
  | { kind: "field"; field: FieldDef; segments: string[] }
  | { kind: "item"; field: ItemsField; index: number; property: string | null; segments: string[] }

/** Why a patch key cannot be applied: no such input, or a system-managed value. */
export type PatchTargetFailure = { kind: "unknown-field" } | { kind: "read-only" }

const isContainer = (schema: z.ZodType) => {
  const inner = schema instanceof z.ZodNullable ? schema.unwrap() : schema
  return inner instanceof z.ZodObject || inner instanceof z.ZodArray
}

/**
 * Maps a patch key (a dot path) to its registry entry. Leaves that exist in the schema but are
 * not inputs (`meta.id`, timestamps, versions, row ids) and the `provenance` section are
 * read-only; containers such as `buildings.shares` are not fields (patch their fields one by
 * one), and neither are override cells without a default (OQ-13).
 */
export function resolvePatchPath(path: string): PatchTarget | PatchTargetFailure {
  const segments = parsePath(path)
  if (!segments) return { kind: "unknown-field" }

  const field = getField(path)
  if (field) return { kind: "field", field, segments }

  const item = matchItemPath(path, segments)
  if (item) return item.kind === "item" ? { ...item, segments } : item
  if (segments[0] === "provenance") return { kind: "read-only" }

  const schema = schemaAt(projectSchema, segments)
  return { kind: schema && !isContainer(schema) && !isNullOnly(schema) ? "read-only" : "unknown-field" }
}
