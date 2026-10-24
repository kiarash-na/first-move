import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { render, screen } from "@testing-library/react"
import { parse } from "yaml"
import { describe, expect, it } from "vitest"
import assumptions from "@/dictionaries/en/assumptions.json"
import { I18nProvider } from "../../_components/i18n-provider"
import { testDictionaries } from "../../_components/test-utils/dictionaries"
import { AnswersList } from "./answers-list"

const DIR = path.join(process.cwd(), "docs/10_quick-check-tool/open-questions")

/** The frontmatter of every OQ file of the Quick Check, by id. */
function openQuestions(): Record<string, { title: string; status: string; answer: string }> {
  return Object.fromEntries(
    readdirSync(DIR)
      .filter((file) => file.startsWith("OQ-"))
      .map((file) => {
        const front = parse(readFileSync(path.join(DIR, file), "utf8").split("---")[1])
        return [front.id, front]
      }),
  )
}

describe("AnswersList", () => {
  it("lists the resolved answers in use exactly as the OQ files give them", () => {
    const docs = openQuestions()
    const items = assumptions.answers.items as Record<string, { title: string; answer: string }>
    for (const [id, item] of Object.entries(items)) {
      expect(docs[id]?.status, id).toBe("resolved")
      expect(item.title, id).toBe(docs[id].title)
      expect(docs[id].answer.startsWith(item.answer), id).toBe(true)
    }
    expect(Object.keys(items)).toEqual([...Array.from({ length: 22 }, (_, i) => `OQ-${String(i + 1).padStart(2, "0")}`), "OQ-26"])
  })

  it("renders each answer with its id", () => {
    render(
      <I18nProvider lang="en" dictionaries={testDictionaries("en")}>
        <AnswersList />
      </I18nProvider>,
    )
    expect(screen.getByText("OQ-17")).toBeInTheDocument()
    expect(screen.getByText(assumptions.answers.items["OQ-17"].answer)).toBeInTheDocument()
  })
})
