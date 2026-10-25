import { LightbulbIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** The saved suggestions for one plan part or check (D-77), AI output: marked for the page and print. */
export function SuggestionTexts({ texts, className }: { texts: readonly string[]; className?: string }) {
  if (texts.length === 0) return null
  return (
    <ul data-slot="suggestion-texts" data-ai-generated="true" className={cn("flex flex-col gap-2", className)}>
      {texts.map((text) => (
        <li key={text} className="flex items-start gap-2.5 text-sm leading-snug">
          <LightbulbIcon className="mt-0.5 size-4 shrink-0 text-hot" strokeWidth={1.6} aria-hidden="true" />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  )
}
