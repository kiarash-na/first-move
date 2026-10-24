"use client"

import { getField } from "@/lib/project"
import { useTextRef } from "../../_components/i18n-provider"
import { RowsField } from "./fields/rows-field"
import { SectionPanel } from "./section-panel"

/** An item list of the registry (allocation, critical assumptions, risks) as a panel of its own. */
export function ItemsSection({ fieldId, index }: { fieldId: string; index?: number }) {
  const textOf = useTextRef()
  const field = getField(fieldId)
  if (field?.kind !== "items") return null

  return (
    <SectionPanel id={`items-${fieldId}`} index={index} title={textOf(field.text) ?? fieldId} help={textOf(field.text, "help")}>
      <RowsField field={field} headless />
    </SectionPanel>
  )
}
