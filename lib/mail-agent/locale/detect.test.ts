// @vitest-environment node
import { describe, expect, it } from "vitest"
import { detectLocale } from "./detect"

describe("detectLocale", () => {
  it.each([
    ["Hallo, wir möchten einen Quick Check für unser Dorf machen. Es gibt 40 Gebäude.", "de"],
    ["Guten Tag, was ist ein Anergienetz?", "de"],
    ["Hello, we would like to run a Quick Check for our village. There are 40 buildings.", "en"],
    ["What is a fifth-generation network and how does the Quick Check work?", "en"],
  ])("%s → %s", (text, locale) => {
    expect(detectLocale(text)).toBe(locale)
  })

  it.each(["1, yes", "2", "Quick Check", "", "40 / 3.5 ha"])("leaves %j undecided", (text) => {
    expect(detectLocale(text)).toBeNull()
  })

  it("leaves an even mix undecided", () => {
    expect(detectLocale("the und and der")).toBeNull()
  })
})
