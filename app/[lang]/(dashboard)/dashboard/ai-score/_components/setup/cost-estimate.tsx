"use client"

import { CalculatorIcon, CoinsIcon } from "lucide-react"
import { useMemo } from "react"

import type { AssistantModel } from "@/lib/assistant/providers/models"
import type { Provider } from "@/lib/assistant/providers/types"
import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { Project } from "@/lib/project"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { Disclosure } from "../disclosure"
import { estimateCost, JEV_INPUT_PRICE, roughAmount } from "./cost"
import { formatUsd } from "./usd"

/**
 * The rough cost of one run as an order of magnitude, with "How we estimate" (D-33): the decision
 * model's four turns, the report at the chosen model's prices. On the Gateway the decisions price
 * is Jev's listed input price; on OpenRouter the Jev Router prices them as the model it picks,
 * which is not known here.
 */
export function CostEstimate({ project, provider, model, modelId }: { project: Project; provider: Provider; model: AssistantModel | null; modelId: string }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score").usage
  const estimate = useMemo(() => estimateCost(project, model, provider === "gateway" ? JEV_INPUT_PRICE : null), [project, model, provider])
  const usd = (value: number) => formatUsd(value, lang, { max: 4 })
  const tokens = (value: number) => formatNumber(value, lang)

  const rough = (value: number) => {
    const { below, value: amount } = roughAmount(value)
    return interpolate(below ? copy.below : copy.value, { amount: usd(amount) })
  }
  const headline =
    estimate.totalUsd !== null
      ? rough(estimate.totalUsd)
      : estimate.decisionUsd !== null
        ? interpolate(copy.decisionOnly, { amount: rough(estimate.decisionUsd) })
        : estimate.textUsd !== null
          ? interpolate(copy.textOnly, { amount: rough(estimate.textUsd) })
          : copy.unknown

  return (
    <div data-slot="cost-estimate" className="flex flex-col gap-2">
      <p className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">{copy.title}</p>
      <p className="flex items-center gap-2.5 text-[17px] font-[480]">
        <CoinsIcon className="size-5 shrink-0 text-hot" strokeWidth={1.6} aria-hidden="true" />
        <span data-cost={estimate.totalUsd ?? ""}>{headline}</span>
      </p>
      <p className="text-sm text-text-secondary">{copy.note[provider]}</p>
      <Disclosure icon={CalculatorIcon} title={copy.how.title}>
        <p>
          {estimate.decisionUsd === null
            ? interpolate(copy.how.decisionRouter, { tokens: tokens(estimate.decisionTokens) })
            : interpolate(copy.how.decision, {
                tokens: tokens(estimate.decisionTokens),
                price: usd(JEV_INPUT_PRICE),
                amount: usd(estimate.decisionUsd),
              })}
        </p>
        <p>
          {estimate.textUsd === null
            ? interpolate(copy.how.textUnknown, { input: tokens(estimate.textInputTokens), output: tokens(estimate.textOutputTokens) })
            : interpolate(copy.how.text, {
                input: tokens(estimate.textInputTokens),
                output: tokens(estimate.textOutputTokens),
                model: model?.name ?? modelId,
                amount: usd(estimate.textUsd),
              })}
        </p>
        <p>{copy.how.tokens}</p>
      </Disclosure>
    </div>
  )
}
