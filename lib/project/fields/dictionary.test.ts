// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest"
import { AREAS, dictionaryLoaders, type Area } from "@/lib/i18n/dictionaries"
import { getAt } from "@/lib/project/path"
import { PATCH_ERROR_CODES } from "@/lib/project/patch-errors"
import { DERIVED_VALUES, FIELD_GROUPS, FIELDS } from "./registry"
import type { TextRef } from "./types"

const en = {} as Record<Area, unknown>

beforeAll(async () => {
  for (const area of AREAS) en[area] = await dictionaryLoaders.en[area]()
})

/** The EN label of a dictionary node (`<key>.label`), or undefined. */
const label = ({ area, key }: TextRef, child?: string) =>
  getAt(en[area], [...key.split("."), ...(child ? [child] : []), "label"])

const expectLabel = (ref: TextRef, child?: string) => {
  const value = label(ref, child)
  expect(typeof value === "string" && value.length > 0, `${ref.area}:${ref.key}${child ? `.${child}` : ""}.label`).toBe(true)
}

describe("registry copy (EN, D-32)", () => {
  it("labels every field, its options and its item properties", () => {
    for (const field of FIELDS) {
      expectLabel(field.text)
      if (field.kind === "choice") for (const option of field.options) expectLabel(field.optionText, option)
      if (field.kind === "items") for (const property of field.properties) expectLabel(property.text)
    }
  })

  it("labels every group and the rows and columns of its grid", () => {
    for (const group of FIELD_GROUPS) {
      expectLabel(group.text)
      for (const axis of [group.rows, group.columns]) for (const key of axis?.keys ?? []) expectLabel(axis!.text, key)
    }
  })

  it("labels every derived value and its options", () => {
    for (const value of DERIVED_VALUES) {
      expectLabel(value.text)
      for (const option of value.options) expectLabel(value.optionText, option)
    }
  })

  it("has a message for every patch error code", () => {
    for (const code of PATCH_ERROR_CODES) {
      const message = getAt(en.shell, ["validation", code])
      expect(typeof message === "string" && message.length > 0, code).toBe(true)
    }
  })
})
