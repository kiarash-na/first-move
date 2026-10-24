import { describe, expect, it } from "vitest"
import { headingId } from "./heading-id"

describe("headingId", () => {
  it.each([
    ["Quick Check", "quick-check"],
    ["Step 1: Opportunity", "step-1-opportunity"],
    ["What is 5GDHC?", "what-is-5gdhc"],
    ["Pitch readiness (unofficial)", "pitch-readiness-unofficial"],
    ["Inputs & results", "inputs-results"],
    ["Wärme und Kälte", "warme-und-kalte"],
    ["Größe der Fläche", "große-der-flache"],
    ["Économie : déjà vu", "economie-deja-vu"],
    ["  The first email: confirm once  ", "the-first-email-confirm-once"],
    ["Co-ordinated, well-known sources", "co-ordinated-well-known-sources"],
    ["EQ-3.4a and TBL-6", "eq-34a-and-tbl-6"],
    ["Up to 20 versions, 5 files", "up-to-20-versions-5-files"],
  ])("%s → %s", (heading, id) => {
    expect(headingId(heading)).toBe(id)
  })

  it("keeps the id stable for an id", () => {
    expect(headingId(headingId("Where your projects live"))).toBe("where-your-projects-live")
  })
})
