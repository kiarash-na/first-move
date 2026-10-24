"use client"

import { useState } from "react"
import { toast } from "sonner"

import type { ExampleCard as ExampleCardData } from "@/lib/dashboard/example-cards"
import { getExample, localizeExample } from "@/lib/examples"
import { interpolate } from "@/lib/i18n/interpolate"
import { useDictionary, useLocale } from "../_components/i18n-provider"
import { useProjectActions } from "../_components/project-actions/use-project-actions"
import { useStore } from "../_components/store-provider"
import { ExampleCard } from "./example-card"
import { SectionHeading } from "./section-heading"

/** The examples gallery (D-04): six cards; picking one adds a copy and opens its overview. */
export function ExamplesGallery({ examples }: { examples: readonly ExampleCardData[] }) {
  const lang = useLocale()
  const start = useDictionary("start")
  const store = useStore()
  const { go } = useProjectActions()
  const [busy, setBusy] = useState<string | null>(null)

  async function openCopy(id: string) {
    const example = getExample(id)
    if (!example || busy) return
    setBusy(id)
    try {
      const project = await store.addCopy(localizeExample(example, lang))
      toast.success(interpolate(start.examples.opened, { name: project.meta.name }))
      go({ page: "overview" })
    } finally {
      setBusy(null)
    }
  }

  return (
    <section aria-labelledby="examples-title" className="flex flex-col gap-5">
      <SectionHeading id="examples-title" title={start.examples.title} body={start.examples.body} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {examples.map((example) => (
          <ExampleCard key={example.id} example={example} busy={busy !== null} onOpen={(id) => void openCopy(id)} />
        ))}
      </div>
    </section>
  )
}
