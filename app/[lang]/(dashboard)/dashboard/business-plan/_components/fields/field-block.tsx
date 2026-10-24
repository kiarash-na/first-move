"use client"

import type { FieldDef } from "@/lib/project"
import { useTextRef } from "../../../_components/i18n-provider"
import { BoundText } from "./bound-text"
import { RowsField } from "./rows-field"
import { TextListField } from "./text-list-field"

/**
 * Renders one registry field of the Business Plan by its kind (D-05: the UI is drawn from the
 * registry). Choice fields (the scenario) have their own picker and are not drawn here.
 */
export function FieldBlock({ field, className }: { field: FieldDef; className?: string }) {
  const textOf = useTextRef()

  switch (field.kind) {
    case "text":
    case "longText":
      return (
        <BoundText
          path={field.id}
          multiline={field.kind === "longText"}
          maxLength={field.maxLength}
          label={textOf(field.text) ?? field.id}
          help={textOf(field.text, "help")}
          domId={`field-${field.id}`}
          className={className}
        />
      )
    case "textList":
      return <TextListField field={field} />
    case "items":
      return <RowsField field={field} />
    default:
      return null
  }
}
