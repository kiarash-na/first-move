// @vitest-environment node
import { describe, expect, it } from "vitest"
import { z } from "zod"
import { itemId, itemList, keyedObject, limitedNumber, longText, shortText, textList } from "./common"

describe("limitedNumber", () => {
  it("applies inclusive, exclusive and integer bounds", () => {
    const count = limitedNumber({ min: 1, max: 10, integer: true })
    expect([1, 10].every((value) => count.safeParse(value).success)).toBe(true)
    expect([0, 11, 1.5].some((value) => count.safeParse(value).success)).toBe(false)
    const positive = limitedNumber({ exclusiveMin: 0, max: 5 })
    expect(positive.safeParse(0).success).toBe(false)
    expect(positive.safeParse(0.1).success).toBe(true)
  })
})

describe("text helpers", () => {
  it("bound text length and list size", () => {
    expect(shortText().safeParse("x".repeat(200)).success).toBe(true)
    expect(shortText().safeParse("x".repeat(201)).success).toBe(false)
    expect(longText().safeParse("x".repeat(5000)).success).toBe(true)
    expect(textList().safeParse(Array(31).fill("a")).success).toBe(false)
  })

  it("accepts row ids made of letters, digits, - and _", () => {
    expect(itemId().safeParse(crypto.randomUUID()).success).toBe(true)
    expect(itemId().safeParse("risk_1").success).toBe(true)
    expect(itemId().safeParse("").success).toBe(false)
    expect(itemId().safeParse("a.b").success).toBe(false)
  })
})

describe("itemList", () => {
  const list = itemList(z.strictObject({ id: itemId(), text: shortText() }), "Rows.")

  it("rejects duplicate row ids", () => {
    expect(list.safeParse([{ id: "a", text: "" }, { id: "b", text: "" }]).success).toBe(true)
    const result = list.safeParse([{ id: "a", text: "" }, { id: "a", text: "" }])
    expect(result.error?.issues[0]).toMatchObject({ params: { code: "duplicate-id" } })
  })

  it("states the rule in its JSON Schema description", () => {
    expect(z.toJSONSchema(list).description).toBe("Rows. Row ids are unique.")
  })
})

describe("keyedObject", () => {
  it("builds a strict object with one entry per key", () => {
    const schema = keyedObject(["a", "b"] as const, (key) => (key === "a" ? z.number() : z.string()))
    expect(schema.safeParse({ a: 1, b: "x" }).success).toBe(true)
    expect(schema.safeParse({ a: 1, b: "x", c: 2 }).success).toBe(false)
    expect(schema.safeParse({ a: 1 }).success).toBe(false)
  })
})
