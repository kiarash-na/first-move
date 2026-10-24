// @vitest-environment node
import { describe, expect, it } from "vitest"
import { z } from "zod"
import { PATCH_ERROR_CODES, toPatchErrors } from "./patch-errors"

const errorsOf = (schema: z.ZodType, value: unknown, base = ["field"]) => {
  const result = schema.safeParse(value)
  if (result.success) throw new Error("expected a failure")
  return toPatchErrors(base, value, result.error.issues).map(({ path, code, params }) => ({ path, code, params }))
}

describe("toPatchErrors", () => {
  it("maps missing and mistyped values", () => {
    expect(errorsOf(z.number(), null)).toEqual([{ path: "field", code: "required", params: undefined }])
    expect(errorsOf(z.number(), "1")).toEqual([{ path: "field", code: "type", params: { expected: "number" } }])
    expect(errorsOf(z.number().int(), 1.5)).toEqual([{ path: "field", code: "integer", params: { expected: "int" } }])
  })

  it("maps number bounds, inclusive and exclusive", () => {
    expect(errorsOf(z.number().min(1), 0)[0]).toMatchObject({ code: "min", params: { min: 1 } })
    expect(errorsOf(z.number().gt(0), 0)[0]).toMatchObject({ code: "above", params: { min: 0 } })
    expect(errorsOf(z.number().max(5), 6)[0]).toMatchObject({ code: "max", params: { max: 5 } })
    expect(errorsOf(z.number().lt(5), 5)[0]).toMatchObject({ code: "below", params: { max: 5 } })
    expect(errorsOf(z.number().int(), 2 ** 60)[0]).toMatchObject({ code: "max" })
  })

  it("maps lengths, sizes, choices and formats", () => {
    expect(errorsOf(z.string().max(3), "abcd")[0]).toMatchObject({ code: "too-long", params: { max: 3 } })
    expect(errorsOf(z.array(z.string()).max(1), ["a", "b"])[0]).toMatchObject({ code: "too-many", params: { max: 1 } })
    expect(errorsOf(z.enum(["a", "b"]), "c")[0]).toMatchObject({ code: "choice", params: { options: ["a", "b"] } })
    expect(errorsOf(z.uuid(), "x")[0]).toMatchObject({ code: "format", params: { format: "uuid" } })
    expect(errorsOf(z.string().min(2), "a")[0]).toMatchObject({ code: "invalid" })
  })

  it("reports each unknown key at its own path, and nested issues at theirs", () => {
    const schema = z.strictObject({ rows: z.array(z.strictObject({ ok: z.boolean() })) })
    expect(errorsOf(schema, { rows: [{ ok: true }, { ok: "no", more: 1 }] })).toEqual(
      expect.arrayContaining([
        { path: "field.rows.1.ok", code: "type", params: { expected: "boolean" } },
        { path: "field.rows.1.more", code: "unknown-field", params: undefined },
      ]),
    )
  })

  it("keeps known custom codes and folds the rest into invalid", () => {
    const known = z.string().refine(() => false, { params: { code: "duplicate-id" } })
    const unknown = z.string().refine(() => false, { params: { code: "something-else" } })
    expect(errorsOf(known, "a")[0].code).toBe("duplicate-id")
    expect(errorsOf(unknown, "a")[0].code).toBe("invalid")
  })

  it("only produces listed codes", () => {
    expect(new Set(PATCH_ERROR_CODES).size).toBe(PATCH_ERROR_CODES.length)
  })
})
