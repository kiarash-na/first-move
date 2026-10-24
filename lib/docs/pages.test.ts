import { existsSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { AI_FEATURES_LIVE } from "@/lib/legal/ai"
import {
  AI_DOC_SLUGS,
  DOC_SLUGS,
  docFromParam,
  docHref,
  docNeighbours,
  docSegments,
  isDocSlug,
  visibleDocs,
} from "./pages"

describe("docs pages (PLAN-AGENT-04)", () => {
  it("lists the seven pages in reading order, each with an English and a German MDX file", () => {
    expect(DOC_SLUGS).toEqual(["index", "what-is-5gdhc", "quick-check", "business-plan", "assistant", "email-agent", "data-and-privacy"])
    for (const lang of ["en", "de"]) {
      for (const slug of DOC_SLUGS) {
        expect(existsSync(path.resolve(__dirname, `../../content/docs/${lang}/${slug}.mdx`)), `${lang}/${slug}`).toBe(true)
      }
    }
  })

  it("marks the assistant and the email agent as the AI pages", () => {
    expect(AI_DOC_SLUGS).toEqual(["assistant", "email-agent"])
  })

  it("shows the AI pages only while the AI features are live", () => {
    expect(visibleDocs(false)).toEqual(["index", "what-is-5gdhc", "quick-check", "business-plan", "data-and-privacy"])
    expect(visibleDocs(true)).toEqual(DOC_SLUGS)
    expect(visibleDocs()).toEqual(visibleDocs(AI_FEATURES_LIVE))
  })

  it("recognises page slugs", () => {
    expect(isDocSlug("quick-check")).toBe(true)
    expect(isDocSlug("Quick-Check")).toBe(false)
    expect(isDocSlug(undefined)).toBe(false)
  })

  it("maps the catch-all param to a page, or null for a 404", () => {
    expect(docFromParam(undefined, false)).toBe("index")
    expect(docFromParam([], false)).toBe("index")
    expect(docFromParam(["quick-check"], false)).toBe("quick-check")
    expect(docFromParam(["index"], false)).toBeNull()
    expect(docFromParam(["quick-check", "extra"], false)).toBeNull()
    expect(docFromParam(["missing"], true)).toBeNull()
    expect(docFromParam(["assistant"], false)).toBeNull()
    expect(docFromParam(["assistant"], true)).toBe("assistant")
    expect(docFromParam(["email-agent"], true)).toBe("email-agent")
  })

  it("builds the segments for generateStaticParams and the links", () => {
    expect(docSegments("index")).toEqual([])
    expect(docSegments("business-plan")).toEqual(["business-plan"])
    expect(docHref("en", "index")).toBe("/en/docs")
    expect(docHref("de", "data-and-privacy")).toBe("/de/docs/data-and-privacy")
  })

  it("finds the previous and next visible page", () => {
    expect(docNeighbours("index", false)).toEqual({ previous: null, next: "what-is-5gdhc" })
    expect(docNeighbours("business-plan", false)).toEqual({ previous: "quick-check", next: "data-and-privacy" })
    expect(docNeighbours("business-plan", true)).toEqual({ previous: "quick-check", next: "assistant" })
    expect(docNeighbours("data-and-privacy", true)).toEqual({ previous: "email-agent", next: null })
    expect(docNeighbours("assistant", false)).toEqual({ previous: null, next: null })
  })
})
