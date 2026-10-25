"use client"

import { Trash2Icon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { KEYS } from "@/lib/assistant/keys/registry"
import type { Provider } from "@/lib/assistant/providers/types"
import { forgetKey, type VaultEntry } from "@/lib/assistant/vault/vault"
import { formatDate, formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { Locale } from "@/lib/i18n/locales"
import { useDictionary, useLocale } from "../../_components/i18n-provider"
import type { ConnectOutcome } from "./key-setup"

const usd = (value: number | null, lang: Locale) => formatNumber(value, lang, { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol", maximumFractionDigits: 2 })

/** Lines about the key the provider reported: balance, credit limit and expiry, with warnings. */
function checkLines(outcome: ConnectOutcome | null, copy: ReturnType<typeof useDictionary<"assistant">>, lang: Locale): { text: string; warn: boolean }[] {
  const text = copy.setup
  if (!outcome) return []
  if (outcome.failure) return [{ text: interpolate(text.failed, { reason: copy.errors[outcome.failure] }), warn: true }]
  const lines: { text: string; warn: boolean }[] = []
  const check = outcome.check
  if (check?.provider === "gateway" && check.balance !== null) lines.push({ text: interpolate(text.balance, { amount: usd(check.balance, lang) }), warn: false })
  if (check?.provider === "openrouter") {
    const { limit, limitRemaining, limitReset, expiresAt } = check.info
    if (limit === null) lines.push({ text: text.noLimit, warn: true })
    else {
      const reset = limitReset && limitReset in text.resets ? ` ${interpolate(text.limitReset, { reset: text.resets[limitReset as keyof typeof text.resets] })}` : ""
      lines.push({ text: interpolate(text.limit, { amount: usd(limit, lang), remaining: usd(limitRemaining, lang) }) + reset, warn: false })
    }
    lines.push(expiresAt ? { text: interpolate(text.expires, { date: formatDate(expiresAt, lang) }), warn: false } : { text: text.noExpiry, warn: true })
  }
  if (outcome.remembered === false) lines.push({ text: text.unavailable, warn: true })
  return lines
}

/** The key in use (masked), what the provider said about it, and the ways to drop it (D-50). */
export function KeyStatus({
  provider,
  masked,
  outcome,
  entry,
  onVaultChange,
}: {
  provider: Provider
  masked: string
  outcome: ConnectOutcome | null
  entry: VaultEntry | undefined
  onVaultChange: () => void
}) {
  const copy = useDictionary("assistant")
  const lang = useLocale()
  const text = copy.setup

  return (
    <div data-slot="key-status" className="flex flex-col gap-3">
      <p className="font-mono text-xs tracking-[0.06em] uppercase" data-key-state="set">
        {interpolate(text.active, { masked, provider: copy.providers[provider] })}
      </p>
      {checkLines(outcome, copy, lang).map((line) => (
        <p key={line.text} className="flex items-start gap-2 text-sm leading-relaxed text-text-secondary" data-warn={line.warn || undefined}>
          {line.warn && <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-hot" strokeWidth={1.6} aria-hidden="true" />}
          {line.text}
        </p>
      ))}
      {entry && <p className="text-sm text-text-secondary">{text.remembered}</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => KEYS[provider].clear()}>
          <Trash2Icon strokeWidth={1.6} aria-hidden="true" />
          {text.forget}
        </Button>
        {entry && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              void forgetKey(provider).finally(onVaultChange)
            }}
          >
            <Trash2Icon strokeWidth={1.6} aria-hidden="true" />
            {text.remove}
          </Button>
        )}
      </div>
    </div>
  )
}
