import { describe, expect, it } from "vitest"
import { useMDXComponents } from "./mdx-components"

describe("useMDXComponents", () => {
  it("returns the global MDX component map", () => {
    expect(useMDXComponents()).toEqual({})
  })
})
