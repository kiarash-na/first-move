"use client"

import Link from "next/link"
import { useId, useState, useSyncExternalStore, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import { resultForStatus, tokenFromHash, type ConfirmResult } from "./confirm-result"

const NOTE = "max-w-[68ch] border-l-2 px-4 py-3 text-base leading-relaxed"

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange)
  return () => window.removeEventListener("hashchange", onChange)
}

/**
 * The consent form (PLAN-AGENT-06 step 8, D-54). The token comes from the link's fragment, read
 * only on the client (null on the server and during hydration). Nothing happens until the person
 * ticks the box and presses the button, so a link scanner that only opens the page confirms
 * nothing. After an error the form stays, so they can try again.
 */
export function ConfirmForm({ copy, termsHref }: { copy: Dictionary<"mail">["confirm"]; termsHref: string }) {
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash, () => null)
  const token = hash === null ? null : tokenFromHash(hash)
  const [accepted, setAccepted] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<ConfirmResult | null>(null)
  const checkboxId = useId()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token || !accepted || sending) return
    setSending(true)
    let next: ConfirmResult = "error"
    try {
      const response = await fetch("/api/mail/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      })
      next = resultForStatus(response.status)
    } catch {
      next = "error"
    }
    setResult(next)
    setSending(false)
  }

  if (hash !== null && !token) {
    return <p role="note" className={`${NOTE} border-hot bg-panel`}>{copy.missing}</p>
  }

  const done = result !== null && result !== "error"
  return (
    <div className="flex flex-col items-start gap-6">
      <p role="status" aria-live="polite" className={result ? `${NOTE} ${result === "confirmed" ? "border-cool" : "border-hot"} bg-panel` : "sr-only"}>
        {result ? copy.result[result] : ""}
      </p>
      {done ? null : (
        <form onSubmit={submit} className="flex max-w-[68ch] flex-col items-start gap-5">
          <div className="flex items-start gap-3">
            <input
              id={checkboxId}
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              className="mt-1 size-5 shrink-0 cursor-pointer accent-cool"
            />
            <label htmlFor={checkboxId} className="cursor-pointer text-base leading-relaxed">
              {copy.accept}
            </label>
          </div>
          <Link href={termsHref} className="inline-flex min-h-11 items-center text-sm underline decoration-1 underline-offset-4 hover:text-cool">
            {copy.terms}
          </Link>
          <Button type="submit" disabled={!token || !accepted || sending}>
            {sending ? copy.sending : copy.button}
          </Button>
        </form>
      )}
    </div>
  )
}
