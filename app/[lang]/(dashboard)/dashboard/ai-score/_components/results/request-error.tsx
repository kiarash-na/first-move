"use client"

import { CircleAlertIcon } from "lucide-react"

import type { GatewayErrorCode } from "@/lib/assistant/gateway/errors"
import { useDictionary } from "../../../_components/i18n-provider"

/** The error of a failed text request as plain copy: Gateway errors are never shown raw (`errors.ts`). */
export function RequestError({ code }: { code: GatewayErrorCode | null }) {
  const copy = useDictionary("ai-score").results.errors
  if (code === null) return null
  return (
    <p role="alert" data-slot="request-error" data-code={code} className="flex items-start gap-2.5 border border-l-2 border-l-hot px-4 py-3 text-sm leading-snug">
      <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-hot" strokeWidth={1.6} aria-hidden="true" />
      {copy[code]}
    </p>
  )
}
