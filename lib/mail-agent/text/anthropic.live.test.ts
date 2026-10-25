// @vitest-environment node
import { describe, expect, it } from "vitest"
import { z } from "zod"
import { DEFAULT_TEXT_MODEL } from "../env"
import { anthropicTextModel } from "./anthropic"
import { textCost } from "./model"

/**
 * One structured call to Claude Haiku through the AI Gateway (D-64), only when switched on:
 * `MAIL_AGENT_LIVE_TEXT=1 pnpm vitest run --silent=false lib/mail-agent/text/anthropic.live.test.ts`
 * with `AI_GATEWAY_API_KEY` set. Prints the usage and the cost in micro-dollars; well under a cent.
 */
const apiKey = process.env.AI_GATEWAY_API_KEY
const live = process.env.MAIL_AGENT_LIVE_TEXT === "1" && Boolean(apiKey)
const model = process.env.EMAIL_AGENT_TEXT_MODEL || DEFAULT_TEXT_MODEL

describe.skipIf(!live)("Claude Haiku through the AI Gateway (live)", () => {
  it("returns schema-valid structured output", async () => {
    const result = await anthropicTextModel({ apiKey: apiKey!, model }).structured({
      system: "You extract numbers from text. Answer only with the requested JSON.",
      user: "Our village has 42 buildings on 3.5 hectares.",
      schema: z.strictObject({ buildings: z.number(), hectares: z.number() }),
      maxTokens: 400,
    })
    console.log(JSON.stringify({ ok: result.ok, reason: result.ok ? null : result.reason, usage: result.usage, microUsd: textCost(result.usage) }))
    expect(result).toMatchObject({ ok: true, value: { buildings: 42, hectares: 3.5 } })
  }, 90_000)
})
