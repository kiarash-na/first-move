import { LightbulbIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * The saved suggestions for one plan part or check (D-77), AI output: marked for the page and print,
 * in the language they were written in. Keyed by position, as the model may repeat a text.
 */
export function SuggestionTexts({ texts, lang, className }: { texts: readonly string[]; lang?: string; className?: string }) {
  if (texts.length === 0) return null
  return (
    <ul lang={lang} data-slot="suggestion-texts" data-ai-generated="true" className={cn("flex flex-col gap-2", className)}>
      {texts.map((text, index) => (
        <li key={`${index}-${text}`} className="flex items-start gap-2.5 text-sm leading-snug">
          <LightbulbIcon className="mt-0.5 size-4 shrink-0 text-hot" strokeWidth={1.6} aria-hidden="true" />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  )
}
