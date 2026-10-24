// @vitest-environment node
import { describe, expect, it } from "vitest"
import { z } from "zod"
import { createProject } from "@/lib/project/create-project"
import { migrateProject } from "./run-migrations"
import type { Migration } from "./types"
import { v1Baseline } from "./v1-baseline"

const project = () => createProject({ modules: { quickCheck: true }, now: new Date("2026-10-24T08:00:00.000Z") })

describe("migrateProject with the real chain", () => {
  it("accepts a current project unchanged", () => {
    const input = project()
    const result = migrateProject(input)
    expect(result).toEqual({ ok: true, project: input, fromVersion: 1, migrated: false })
  })

  it.each([
    ["a non-object", "project", { code: "not-object" }],
    ["an array", [], { code: "not-object" }],
    ["data that is not plain JSON", { meta: { schemaVersion: 1 }, run: () => 1 }, { code: "not-object" }],
    ["data without meta", { site: {} }, { code: "missing-version" }],
    ["a fractional version", { meta: { schemaVersion: 1.5 } }, { code: "missing-version" }],
    ["a file from a newer app", { meta: { schemaVersion: 2 } }, { code: "newer-version", version: 2 }],
    ["a version before the baseline", { meta: { schemaVersion: 0 } }, { code: "unsupported-version", version: 0 }],
  ])("rejects %s", (_, input, error) => {
    expect(migrateProject(input)).toEqual({ ok: false, error })
  })

  it("lists the bad fields of an invalid project", () => {
    const input = { ...project(), buildings: { ...project().buildings, total: 0 } }
    const result = migrateProject(input)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toMatchObject({ code: "invalid", version: 1 })
    expect(result.error.code === "invalid" && result.error.errors[0]).toMatchObject({ path: "buildings.total", code: "min" })
  })
})

describe("migrateProject with a test chain", () => {
  // A pretend v2 that renames `name` to `title` and adds `tags`.
  const v2Schema = z.strictObject({
    meta: z.strictObject({ schemaVersion: z.literal(2) }),
    title: z.string(),
    tags: z.array(z.string()),
  })
  const v2: Migration = {
    version: 2,
    description: "Rename name to title, add tags.",
    up: ({ name, ...rest }) => ({ ...rest, title: name, tags: [] }),
  }
  const chain = [v1Baseline, v2]
  const old = { meta: { schemaVersion: 1 }, name: "Valley" }

  it("runs every step after the stored version and stamps the new version", () => {
    const result = migrateProject(old, { migrations: chain, schema: v2Schema, target: 2 })
    expect(result).toEqual({
      ok: true,
      project: { meta: { schemaVersion: 2 }, title: "Valley", tags: [] },
      fromVersion: 1,
      migrated: true,
    })
  })

  it("never mutates the input", () => {
    const input = structuredClone(old)
    migrateProject(input, { migrations: chain, schema: v2Schema, target: 2 })
    expect(input).toEqual(old)
  })

  it("fails when a step of the chain is missing", () => {
    expect(migrateProject(old, { migrations: [v1Baseline], schema: v2Schema, target: 2 })).toEqual({
      ok: false,
      error: { code: "unsupported-version", version: 1 },
    })
    expect(migrateProject(old, { migrations: [], schema: v2Schema, target: 2 })).toMatchObject({ ok: false })
  })
})
