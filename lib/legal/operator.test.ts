// @vitest-environment node
import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

import { AUTHORITY, COPYRIGHT_YEAR, LICENSE, OPERATOR, PROCESSORS, REPOSITORY, SITE } from "./operator"

const root = process.cwd()
const read = (file: string) => readFileSync(path.join(root, file), "utf8")
const pkg = JSON.parse(read("package.json")) as {
  version: string
  license: string
  author: string
  homepage: string
  repository: { url: string }
}

describe("operator facts", () => {
  it("has a German VAT ID in the official format", () => {
    expect(OPERATOR.vatId).toMatch(/^DE\d{9}$/)
  })

  it("uses mailboxes on the site's own domain", () => {
    expect(OPERATOR.emailHuman.endsWith(`@mail.${SITE.domain}`)).toBe(true)
    expect(OPERATOR.emailAgent.endsWith(`@mail.${SITE.domain}`)).toBe(true)
    expect(OPERATOR.emailHuman).not.toBe(OPERATOR.emailAgent)
  })

  it("names a P.O. box, a five-digit postcode, a city and a country", () => {
    expect(OPERATOR.postBox).toMatch(/^Postfach /)
    expect(OPERATOR.postcode).toMatch(/^\d{5}$/)
    expect(OPERATOR.city).not.toBe("")
    expect(OPERATOR.country).toBe("Germany")
  })

  it("links the licence file and the repository over https", () => {
    expect(REPOSITORY.licenseUrl.startsWith(`${REPOSITORY.url}/blob/`)).toBe(true)
    for (const url of [SITE.url, REPOSITORY.url, LICENSE.url, AUTHORITY.url, PROCESSORS.hosting.url, PROCESSORS.mail.url]) {
      expect(url.startsWith("https://"), url).toBe(true)
    }
  })
})

describe("repository metadata follows the operator facts", () => {
  it("package.json carries the licence, author, homepage and repository", () => {
    expect(pkg.license).toBe(LICENSE.spdx)
    expect(pkg.author).toBe(OPERATOR.name)
    expect(pkg.homepage).toBe(SITE.url)
    expect(pkg.repository.url).toContain(REPOSITORY.url.replace("https://", ""))
  })

  it("is version 0.2.0 or later (v0.2 added the legal pages)", () => {
    const [major, minor] = pkg.version.split(".").map(Number)
    expect(major > 0 || minor >= 2).toBe(true)
  })

  it("LICENSE is the unmodified Apache-2.0 text, so GitHub detects it", () => {
    const text = read("LICENSE")
    expect(text).toContain("Apache License\n                           Version 2.0, January 2004")
    expect(text).toContain("END OF TERMS AND CONDITIONS")
    expect(text.length).toBe(11358)
  })

  it("NOTICE holds the copyright line, and the trade-name and methodology notes", () => {
    const text = read("NOTICE")
    expect(text).toContain(`Copyright ${COPYRIGHT_YEAR} ${OPERATOR.name}`)
    expect(text).toContain("not a registered trademark")
    expect(text).toContain("AQC methodology")
  })
})
