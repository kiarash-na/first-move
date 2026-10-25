// @vitest-environment node
import { describe, expect, it } from "vitest"
import aiScore from "@/dictionaries/en/ai-score.json"
import AiScorePage, { generateMetadata } from "./page"

const props = (lang: string) => ({ params: Promise.resolve({ lang }) }) as PageProps<"/[lang]/dashboard/ai-score">

describe("AI Plan Score page (D-71)", () => {
  it("has a localized title and description", async () => {
    expect(await generateMetadata(props("en"))).toEqual({ title: aiScore.meta.title, description: aiScore.meta.description })
  })

  it("hands its copy to the client view behind the Business Plan gate", async () => {
    const tree = await AiScorePage(props("en"))
    expect(tree.props.lang).toBe("en")
    expect(tree.props.dictionaries["ai-score"].title).toBe(aiScore.title)
    expect(tree.props.children.props.module).toBe("businessPlan")
  })
})
