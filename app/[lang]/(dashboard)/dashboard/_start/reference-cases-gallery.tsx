"use client"

import { ChevronDownIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { REFERENCE_CASE_CATALOG } from "@/lib/examples/reference-cases/catalog"
import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { useDictionary, useLocale } from "../_components/i18n-provider"
import { useProjectActions } from "../_components/project-actions/use-project-actions"
import { useStore } from "../_components/store-provider"
import { ReferenceCaseCard } from "./reference-case-card"
import { SectionHeading } from "./section-heading"

/**
 * The reference cases from Vienna (D-76): the very last section of the start screen, collapsed
 * until asked for (owner, 2026-10-25), like the examples above it. The cards come from the small
 * catalog; a case's plan loads only when someone opens it, as a copy, at the overview.
 */
export function ReferenceCasesGallery() {
  const lang = useLocale()
  const copy = useDictionary("start").referenceCases
  const store = useStore()
  const { go } = useProjectActions()
  const [busy, setBusy] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  async function openCopy(id: string) {
    if (busy) return
    setBusy(id)
    try {
      const [{ getReferenceCase }, { localizeExample }] = await Promise.all([
        import("@/lib/examples/reference-cases"),
        import("@/lib/examples/localize"),
      ])
      const entry = getReferenceCase(id)
      if (!entry) return
      const project = await store.addCopy(localizeExample(entry, lang))
      toast.success(interpolate(copy.opened, { name: project.meta.name }))
      go({ page: "overview" })
    } finally {
      setBusy(null)
    }
  }

  return (
    <section aria-labelledby="reference-cases-title" data-slot="reference-cases-gallery">
      <Collapsible open={open} onOpenChange={setOpen} className="group/reference-cases flex flex-col gap-5">
        <SectionHeading
          id="reference-cases-title"
          title={copy.title}
          body={copy.body}
          aside={
            <CollapsibleTrigger asChild>
              <Button variant="outline">
                {open ? copy.hide : interpolate(copy.show, { count: formatNumber(REFERENCE_CASE_CATALOG.length, lang) })}
                <ChevronDownIcon
                  className="transition-transform duration-[220ms] ease-signature group-data-[state=open]/reference-cases:rotate-180"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </Button>
            </CollapsibleTrigger>
          }
        />
        <CollapsibleContent className="overflow-hidden">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {REFERENCE_CASE_CATALOG.map((card) => (
              <ReferenceCaseCard key={card.id} card={card} busy={busy !== null} onOpen={(id) => void openCopy(id)} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}
