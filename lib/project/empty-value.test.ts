// @vitest-environment node
import { describe, expect, it } from "vitest"
import { z } from "zod"
import { emptyValue } from "./empty-value"

describe("emptyValue", () => {
  it("fills objects key by key with the not-entered value of each leaf", () => {
    const schema = z.strictObject({
      count: z.number().nullable(),
      level: z.enum(["low", "high"]).nullable(),
      text: z.string().max(10),
      on: z.boolean(),
      list: z.array(z.string()),
      fixed: z.literal(1),
      dash: z.null(),
      nested: z.strictObject({ value: z.number().nullable() }),
    })
    const value = emptyValue(schema)
    expect(value).toEqual({
      count: null,
      level: null,
      text: "",
      on: false,
      list: [],
      fixed: 1,
      dash: null,
      nested: { value: null },
    })
    expect(schema.safeParse(value).success).toBe(true)
  })

  it("throws for a leaf without an empty value", () => {
    expect(() => emptyValue(z.number())).toThrow(/number/)
  })
})
