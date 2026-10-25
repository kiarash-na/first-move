"use client"

import { EyeIcon } from "lucide-react"
import { useId } from "react"

import { useDictionary } from "../../../_components/i18n-provider"
import { Disclosure } from "../disclosure"
import { setAcknowledged, useAcknowledged } from "./acknowledgement"

const POINTS = ["what", "how", "who", "terms", "when"] as const

/**
 * "What is sent and to whom" (D-72, extends D-48(a)) and the confirmation every run, rewrite and
 * suggestion needs. Open until confirmed; the confirmation lives in this tab's memory only.
 */
export function DataDisclosure() {
  const copy = useDictionary("ai-score").setup.data
  const acknowledged = useAcknowledged()
  const checkboxId = useId()
  const noteId = useId()

  return (
    <div data-slot="data-disclosure" className="flex flex-col gap-3">
      <Disclosure icon={EyeIcon} title={copy.title} defaultOpen={!acknowledged}>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-base marker:text-hot">
          {POINTS.map((point) => (
            <li key={point}>{copy.points[point]}</li>
          ))}
        </ul>
      </Disclosure>
      <div className="flex items-start gap-3">
        <input
          id={checkboxId}
          type="checkbox"
          checked={acknowledged}
          onChange={(event) => setAcknowledged(event.target.checked)}
          aria-describedby={noteId}
          className="mt-1 size-5 shrink-0 cursor-pointer accent-hot"
        />
        <div className="flex flex-col gap-1">
          <label htmlFor={checkboxId} className="cursor-pointer text-base leading-relaxed">
            {copy.ack}
          </label>
          <p id={noteId} className="text-sm text-muted-foreground">
            {copy.ackNote}
          </p>
        </div>
      </div>
    </div>
  )
}
