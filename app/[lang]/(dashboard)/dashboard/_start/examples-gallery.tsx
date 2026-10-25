"use client"

import { ChevronDownIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { ExampleCard as ExampleCardData } from "@/lib/dashboard/example-cards"
import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { useDictionary, useLocale } from "../_components/i18n-provider"
import { useProjectActions } from "../_components/project-actions/use-project-actions"
import { useStore } from "../_components/store-provider"
import { ExampleCard } from "./example-card"
import { SectionHeading } from "./section-heading"

/**
 * The examples gallery (D-04): picking one adds a copy and opens its overview. It sits below the
 * user's own projects and starts collapsed (owner, 2026-10-24), so the seed data never comes first.
 */
export function ExamplesGallery({ examples }: { examples: readonly ExampleCardData[] }) {
  const lang = useLocale()
  const start = useDictionary("start")
  const store = useStore()
  const { go } = useProjectActions()
  const [busy, setBusy] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  async function openCopy(id: string) {
    if (busy) return
    setBusy(id)
    try {
      // The example projects load on pick, not with the start screen: the cards come from
      // the server (`exampleCards`).
      const { getExample, localizeExample } = await import("@/lib/examples")
      const example = getExample(id)
      if (!example) return
      const project = await store.addCopy(localizeExample(example, lang))
      toast.success(interpolate(start.examples.opened, { name: project.meta.name }))
      go({ page: "overview" })
    } finally {
      setBusy(null)
    }
  }

  return (
    <section aria-labelledby="examples-title" data-slot="examples-gallery">
      <Collapsible open={open} onOpenChange={setOpen} className="group/examples flex flex-col gap-5">
        <SectionHeading
          id="examples-title"
          title={start.examples.title}
          body={start.examples.body}
          aside={
            <CollapsibleTrigger asChild>
              <Button variant="outline">
                {open ? start.examples.hide : interpolate(start.examples.show, { count: formatNumber(examples.length, lang) })}
                <ChevronDownIcon
                  className="transition-transform duration-[220ms] ease-signature group-data-[state=open]/examples:rotate-180"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </Button>
            </CollapsibleTrigger>
          }
        />
        <CollapsibleContent className="overflow-hidden">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {examples.map((example) => (
              <ExampleCard key={example.id} example={example} busy={busy !== null} onOpen={(id) => void openCopy(id)} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}
