"use client"

import { fieldsOf, getGroup, type FieldDef } from "@/lib/project"
import { cn } from "@/lib/utils"
import { useTextRef } from "../../_components/i18n-provider"
import { FieldBlock } from "./fields/field-block"
import { SectionPanel } from "./section-panel"

const byKind = (fields: FieldDef[], ...kinds: FieldDef["kind"][]) => fields.filter((field) => kinds.includes(field.kind))

/**
 * A registry group of Business Plan fields as a panel (D-05). One-line texts sit in two
 * columns, multi-line texts in two or three, lists of entries in three, so the order of the
 * registry is kept within each kind.
 */
export function GroupSection({ groupId, index }: { groupId: string; index?: number }) {
  const textOf = useTextRef()
  const group = getGroup(groupId)
  if (!group) return null
  const fields = fieldsOf({ module: "businessPlan", group: groupId })
  const short = byKind(fields, "text")
  const long = byKind(fields, "longText")
  const lists = byKind(fields, "textList")

  return (
    <SectionPanel id={`group-${groupId}`} index={index} title={textOf(group.text) ?? groupId} help={textOf(group.text, "help")}>
      {short.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {short.map((field) => (
            <FieldBlock key={field.id} field={field} />
          ))}
        </div>
      )}
      {long.length > 0 && (
        <div className={cn("grid items-start gap-6", long.length === 1 ? "" : "md:grid-cols-2", long.length >= 3 && "xl:grid-cols-3")}>
          {long.map((field) => (
            <FieldBlock key={field.id} field={field} />
          ))}
        </div>
      )}
      {lists.length > 0 && (
        <div className="grid items-start gap-6 md:grid-cols-3">
          {lists.map((field) => (
            <FieldBlock key={field.id} field={field} />
          ))}
        </div>
      )}
    </SectionPanel>
  )
}
