"use client"

import { KeyRoundIcon, LoaderCircleIcon, Trash2Icon } from "lucide-react"
import { useId, useRef, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { GatewayClient } from "@/lib/assistant/gateway/client"
import { gatewayErrorCode, type GatewayErrorCode } from "@/lib/assistant/gateway/errors"
import { clearGatewayKey, isPlausibleGatewayKey, setGatewayKey } from "@/lib/assistant/gateway/key"
import { interpolate } from "@/lib/i18n/interpolate"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { formatUsd } from "./usd"
import { useMaskedGatewayKey } from "./use-gateway-key"

type Check = { state: "idle" } | { state: "invalid" } | { state: "checking" } | { state: "ok"; balance: number } | { state: "failed" | "rejected"; code: GatewayErrorCode }

/**
 * The bring-your-own-key field (D-71): the key goes into module memory (`setGatewayKey`) and the
 * field is emptied at once; the input has no name, so even a native submit could not put it in a
 * URL. "Use key" checks it against the Gateway's credits endpoint and shows the balance; a key the
 * Gateway rejects is forgotten again. The page only ever shows the masked key.
 */
export function KeyForm({ createClient }: { createClient: (key: string) => GatewayClient }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const text = copy.setup.key
  const masked = useMaskedGatewayKey()
  const input = useRef<HTMLInputElement>(null)
  const [check, setCheck] = useState<Check>({ state: "idle" })
  const inputId = useId()
  const statusId = useId()

  async function use(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const field = input.current
    if (!field) return
    const value = field.value
    if (!isPlausibleGatewayKey(value)) {
      setCheck({ state: "invalid" })
      return
    }
    setGatewayKey(value)
    field.value = ""
    setCheck({ state: "checking" })
    try {
      const credits = await createClient(value.trim()).credits()
      setCheck({ state: "ok", balance: Number(credits.balance) })
    } catch (error) {
      const code = gatewayErrorCode(error)
      if (code === "key") clearGatewayKey()
      setCheck({ state: code === "key" ? "rejected" : "failed", code })
    }
  }

  function forget() {
    clearGatewayKey()
    setCheck({ state: "idle" })
  }

  const status =
    check.state === "invalid"
      ? text.invalid
      : check.state === "checking"
        ? copy.setup.credits.checking
        : check.state === "ok"
          ? interpolate(copy.setup.credits.balance, { amount: Number.isFinite(check.balance) ? formatUsd(check.balance, lang, { min: 2, max: 2 }) : "–" })
          : check.state === "failed" || check.state === "rejected"
            ? interpolate(copy.setup.credits[check.state], { reason: copy.errors[check.code] })
            : null

  return (
    <div data-slot="key-form" className="flex flex-col gap-4">
      <form onSubmit={use} className="flex flex-col gap-2" autoComplete="off">
        <label htmlFor={inputId} className="text-[17px] leading-snug font-[480]">
          {text.label}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            ref={input}
            id={inputId}
            type="password"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder={text.placeholder}
            aria-invalid={check.state === "invalid" || undefined}
            aria-describedby={statusId}
            onChange={() => check.state === "invalid" && setCheck({ state: "idle" })}
            className="font-mono sm:max-w-md"
          />
          <Button type="submit" variant="hot" disabled={check.state === "checking"}>
            <KeyRoundIcon strokeWidth={1.6} aria-hidden="true" />
            {text.use}
          </Button>
        </div>
        <p id={statusId} role="status" className="min-h-6 text-sm leading-relaxed text-text-secondary" data-check={check.state}>
          {check.state === "checking" && <LoaderCircleIcon className="mr-2 inline size-4 motion-safe:animate-spin" strokeWidth={1.6} aria-hidden="true" />}
          {status}
        </p>
      </form>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="font-mono text-xs tracking-[0.06em] uppercase" data-key-state={masked ? "set" : "none"}>
          {masked ? interpolate(text.active, { masked }) : text.none}
        </p>
        {masked && (
          <Button type="button" variant="secondary" size="sm" onClick={forget}>
            <Trash2Icon strokeWidth={1.6} aria-hidden="true" />
            {text.forget}
          </Button>
        )}
      </div>
      <p className="max-w-[72ch] text-sm leading-relaxed text-text-secondary">{text.memory}</p>
      <p className="max-w-[72ch] text-sm leading-relaxed text-text-secondary">{text.where}</p>
    </div>
  )
}
