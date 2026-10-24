import type { Dictionary } from "@/lib/i18n/dictionaries"
import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { Locale } from "@/lib/i18n/locales"
import type { TextRef } from "@/lib/project"
import type { ImportFailure, ImportSuccess } from "@/lib/storage"
import { validationMessage } from "./validation-message"

export interface ImportFailureText {
  message: string
  /** One line per bad field (`Label: message`), then "and N more". */
  fields: string[]
}

/**
 * The texts of a rejected import (D-14): `shell.storage.import.error.<code>` and the bad fields
 * with their registry labels (`label` resolves a `TextRef`; the path is shown when it has none).
 */
export function importFailureText(
  failure: ImportFailure,
  shell: Dictionary<"shell">,
  lang: Locale,
  label: (ref: TextRef) => string | null,
): ImportFailureText {
  const copy = shell.storage.import
  const message = interpolate(copy.error[failure.code], {
    max: formatNumber(failure.params.maxMegabytes ?? 0, lang),
    version: failure.params.version ?? "",
  })
  const fields = failure.errors.map((error) =>
    interpolate(shell.importFlow.field, {
      field: (error.text && label(error.text)) || error.path,
      message: validationMessage(error, shell, lang),
    }),
  )
  if (failure.moreErrors > 0) fields.push(interpolate(copy.moreErrors, { count: formatNumber(failure.moreErrors, lang) }))
  return { message, fields }
}

/** Notes after a successful import: the file was migrated, or saved with another methodology version. */
export function importSuccessNotes(result: ImportSuccess, shell: Dictionary<"shell">): string[] {
  const copy = shell.storage.import
  const notes: string[] = []
  if (result.migrated) notes.push(copy.migrated)
  if (result.methodology.changed) {
    notes.push(interpolate(copy.methodologyChanged, { current: result.methodology.current, file: result.methodology.file }))
  }
  return notes
}
