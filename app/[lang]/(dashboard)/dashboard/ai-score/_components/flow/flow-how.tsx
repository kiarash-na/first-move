"use client"

import { CalculatorIcon } from "lucide-react"

import { useDictionary } from "../../../_components/i18n-provider"
import { Disclosure } from "../disclosure"

const STEPS = ["read", "turns", "gates", "branches", "aggregate", "report"] as const

/** "How the flow decides" (D-33): the method behind every number of the flow, collapsed by default. */
export function FlowHow() {
  const copy = useDictionary("ai-score").flow.how
  return (
    <Disclosure icon={CalculatorIcon} title={copy.title}>
      {STEPS.map((step) => (
        <p key={step}>{copy[step]}</p>
      ))}
    </Disclosure>
  )
}
