import { describe, expect, it } from "vitest"
import { SHARE_COLUMNS } from "./share-columns"

describe("SHARE_COLUMNS", () => {
  it("lays out type, five periods and total from a 36rem container", () => {
    expect(SHARE_COLUMNS).toMatch(/^@xl:grid-cols-\[minmax\(8rem,1\.25fr\)_repeat\(5,minmax\(4rem,1fr\)\)_4\.25rem\]$/)
  })
})
