import type { Dictionary } from "@/lib/i18n/dictionaries"
import { AI_PROVIDERS } from "@/lib/legal/ai"

/** The AI providers a user can connect, or a line saying there are none yet (`how-it-runs` section of the AI page). */
export function AiProviders({ copy }: { copy: Dictionary<"legal">["aiProviders"] }) {
  if (AI_PROVIDERS.length === 0) {
    return <p className="max-w-[68ch] text-base leading-relaxed text-text-secondary">{copy.none}</p>
  }

  return (
    <ul aria-label={copy.label} className="flex max-w-[68ch] list-disc flex-col gap-2 pl-6 text-base text-text-secondary">
      {AI_PROVIDERS.map((provider) => (
        <li key={provider.name}>
          <a href={provider.url} rel="noopener noreferrer" className="text-foreground underline decoration-1 underline-offset-4 hover:text-cool">
            {provider.name}
          </a>
          {`, ${copy.region}: ${provider.region}`}
        </li>
      ))}
    </ul>
  )
}
