"use client"

import { PlusIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { createListItem, getAt, parsePath, type FieldDef } from "@/lib/project"
import { useDictionary, useTextRef } from "../../../_components/i18n-provider"
import { useStoreState } from "../../../_components/store-provider"
import { FieldError } from "./field-error"
import { RemoveRowDialog } from "./remove-row-dialog"
import { RowCard } from "./row-card"
import { useFieldPatch } from "./use-field-patch"

type ItemsDef = Extract<FieldDef, { kind: "items" }>
type Row = Record<string, unknown>

const NONE: readonly Row[] = []

/** The row holds something the team wrote (the generated `id` does not count). */
const hasText = (row: Row) =>
  Object.entries(row).some(([key, value]) => key !== "id" && typeof value === "string" && value.trim() !== "")

/**
 * A list of rows with a stable id each (allocation, critical assumptions, risks). Adding,
 * removing and flagging patch the whole list; a row that holds text is removed only after a
 * confirmation. A flag property (the deal-breaker) is single-choice: setting it clears the
 * other rows.
 */
export function RowsField({ field, headless = false }: { field: ItemsDef; headless?: boolean }) {
  const bp = useDictionary("business-plan")
  const textOf = useTextRef()
  const rows = useStoreState((state) => {
    const stored = state.active ? getAt(state.active, parsePath(field.id) ?? []) : NONE
    return Array.isArray(stored) ? (stored as readonly Row[]) : NONE
  })
  const { patch, error } = useFieldPatch()
  const [removing, setRemoving] = useState<number | null>(null)
  const label = textOf(field.text) ?? field.id
  const help = textOf(field.text, "help")
  const addLabel = bp.ui.add[field.id as keyof typeof bp.ui.add] ?? bp.ui.addEntry

  function remove(index: number) {
    patch({ [field.id]: rows.filter((_, at) => at !== index) })
    setRemoving(null)
  }

  function toggleFlag(index: number, key: string, value: boolean) {
    patch({ [field.id]: rows.map((row, at) => ({ ...row, [key]: at === index ? value : false })) })
  }

  const Wrapper = headless ? "div" : "section"

  return (
    <Wrapper aria-label={headless ? undefined : label} id={`field-${field.id}`} className="flex flex-col gap-5">
      {!headless && (
        <div className="flex flex-col gap-1">
          <h3 className="text-xl leading-tight font-[520] tracking-[-0.025em]">{label}</h3>
          {help && <p className="max-w-[62ch] text-sm leading-snug text-muted-foreground">{help}</p>}
        </div>
      )}
      {rows.length === 0 ? (
        <p className="border border-dashed px-5 py-6 text-sm text-muted-foreground">{bp.ui.emptyRows}</p>
      ) : (
        <ol className="flex flex-col gap-4">
          {rows.map((row, index) => (
            <RowCard
              key={String(row.id)}
              field={field}
              index={index}
              row={row}
              headingLevel={headless ? 3 : 4}
              onToggleFlag={(key, value) => toggleFlag(index, key, value)}
              onRemove={() => (hasText(row) ? setRemoving(index) : remove(index))}
            />
          ))}
        </ol>
      )}
      <div>
        <Button
          type="button"
          variant="hot"
          disabled={rows.length >= field.maxItems}
          onClick={() => patch({ [field.id]: [...rows, createListItem(field.id)] })}
        >
          <PlusIcon strokeWidth={1.6} aria-hidden="true" />
          {addLabel}
        </Button>
      </div>
      <FieldError>{error}</FieldError>
      <RemoveRowDialog open={removing !== null} onCancel={() => setRemoving(null)} onConfirm={() => removing !== null && remove(removing)} />
    </Wrapper>
  )
}
