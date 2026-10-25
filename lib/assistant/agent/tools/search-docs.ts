import { tool } from "ai"
import { z } from "zod"
import { truncateText } from "@/lib/ai/text/truncate"
import type { AgentContext } from "../context"

const SNIPPET = 900

/** `search_docs`: the public docs and the allow-listed app copy (D-57), the only knowledge the assistant cites. */
export function searchDocsTool(context: AgentContext) {
  return tool({
    description:
      "Search First Move's public documentation (methodology, inputs, results, Business Plan, AI features). Returns the best passages with their page path. Cite the path when you use a passage.",
    inputSchema: z.object({ query: z.string().min(2).max(200).describe("Search words, in the user's language or English") }),
    execute: async ({ query }) => {
      const hits = await context.search(context.lang, query, 5)
      if (hits.length === 0) return { results: [], note: "Nothing found in the public docs." }
      return { results: hits.map(({ chunk }) => ({ title: chunk.title, path: chunk.url, text: truncateText(chunk.text, SNIPPET).text })) }
    },
  })
}
