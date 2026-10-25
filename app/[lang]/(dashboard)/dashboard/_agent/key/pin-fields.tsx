"use client"

import { useId } from "react"

import { Input } from "@/components/ui/input"
import type { PinProblem } from "@/lib/assistant/vault/pin"
import { PIN_LENGTH } from "@/lib/assistant/vault/pin"

export interface PinCopy {
  label: string
  repeat: string
  format: string
  common: string
  mismatch: string
}

/** Digits only, at most six: what the PIN fields keep of what was typed. */
export const pinDigits = (value: string) => value.replace(/\D/g, "").slice(0, PIN_LENGTH)

const PIN_INPUT = {
  type: "password",
  inputMode: "numeric",
  pattern: "[0-9]*",
  maxLength: PIN_LENGTH,
  autoComplete: "off",
  "data-1p-ignore": true,
  "data-lpignore": "true",
  "data-bwignore": true,
  "data-form-type": "other",
  className: "max-w-40 font-mono tracking-[0.3em]",
} as const

/** A new six-digit PIN, typed twice (D-50). `problem` is shown once the user tried to use it. */
export function PinFields({
  copy,
  pin,
  repeat,
  onPin,
  onRepeat,
  problem,
}: {
  copy: PinCopy
  pin: string
  repeat: string
  onPin: (value: string) => void
  onRepeat: (value: string) => void
  problem: PinProblem | null
}) {
  const pinId = useId()
  const repeatId = useId()
  const problemId = useId()

  return (
    <div data-slot="pin-fields" className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={pinId} className="text-sm">
            {copy.label}
          </label>
          <Input id={pinId} {...PIN_INPUT} value={pin} onChange={(event) => onPin(pinDigits(event.target.value))} aria-invalid={problem === "format" || problem === "common" || undefined} aria-describedby={problem ? problemId : undefined} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={repeatId} className="text-sm">
            {copy.repeat}
          </label>
          <Input id={repeatId} {...PIN_INPUT} value={repeat} onChange={(event) => onRepeat(pinDigits(event.target.value))} aria-invalid={problem === "mismatch" || undefined} aria-describedby={problem ? problemId : undefined} />
        </div>
      </div>
      {problem && (
        <p id={problemId} role="alert" className="text-sm text-hot">
          {copy[problem]}
        </p>
      )}
    </div>
  )
}
