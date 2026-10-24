"use client"

import { Badge } from "@/components/ui/badge"
import { CANVAS_BLOCKS, FOCUS_CANVAS_BLOCKS, getField, getGroup, type CanvasBlock } from "@/lib/project"
import { cn } from "@/lib/utils"
import { useDictionary, useTextRef } from "../../../_components/i18n-provider"
import { BoundText } from "../fields/bound-text"
import { SectionPanel } from "../section-panel"

/**
 * Where each block sits in the classic Business Model Canvas, once the panel is wide enough
 * (container query): partners, activities and resources, value proposition, relationships and
 * channels, segments on top; costs and revenues below; operator responsibilities, which
 * BM-STEP-02 names and the classic canvas lacks, as a band underneath.
 */
const PLACEMENT: Record<CanvasBlock, string> = {
  keyPartners: "@4xl:col-span-2 @4xl:col-start-1 @4xl:row-span-2 @4xl:row-start-1",
  keyActivities: "@4xl:col-span-2 @4xl:col-start-3 @4xl:row-start-1",
  keyResources: "@4xl:col-span-2 @4xl:col-start-3 @4xl:row-start-2",
  valueProposition: "@4xl:col-span-2 @4xl:col-start-5 @4xl:row-span-2 @4xl:row-start-1",
  customerRelationships: "@4xl:col-span-2 @4xl:col-start-7 @4xl:row-start-1",
  channels: "@4xl:col-span-2 @4xl:col-start-7 @4xl:row-start-2",
  customerSegments: "@4xl:col-span-2 @4xl:col-start-9 @4xl:row-span-2 @4xl:row-start-1",
  costStructure: "@4xl:col-span-5 @4xl:col-start-1 @4xl:row-start-3",
  revenueStreams: "@xl:col-span-2 @4xl:col-span-5 @4xl:col-start-6 @4xl:row-start-3",
  operatorResponsibilities: "@4xl:col-span-10 @4xl:row-start-4",
}

/** BM-STEP-02.1 · the tailored Business Model Canvas, one registry field per block. */
export function CanvasSection({ index }: { index?: number }) {
  const bp = useDictionary("business-plan")
  const textOf = useTextRef()
  const group = getGroup("businessPlan.canvas")
  if (!group) return null

  return (
    <SectionPanel id="canvas" index={index} title={textOf(group.text) ?? group.id} help={textOf(group.text, "help")}>
      <div className="@container">
        <div className="grid gap-px border bg-border @xl:grid-cols-2 @4xl:grid-cols-10">
          {CANVAS_BLOCKS.map((block) => {
            const field = getField(`businessPlan.canvas.${block}`)
            if (field?.kind !== "longText") return null
            const focus = (FOCUS_CANVAS_BLOCKS as readonly string[]).includes(block)
            return (
              <div key={block} className={cn("flex bg-card p-4", PLACEMENT[block], block === "operatorResponsibilities" && "@xl:col-span-2")}>
                <BoundText
                  path={field.id}
                  multiline
                  maxLength={field.maxLength}
                  label={textOf(field.text) ?? block}
                  help={block === "operatorResponsibilities" ? textOf(field.text, "help") : null}
                  domId={`field-${field.id}`}
                  tag={focus ? <Badge variant="hot">{bp.ui.focus}</Badge> : null}
                  className="h-full w-full"
                  inputClassName="flex-1"
                />
              </div>
            )
          })}
        </div>
      </div>
    </SectionPanel>
  )
}
