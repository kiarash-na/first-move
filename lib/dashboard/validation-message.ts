import type { Dictionary } from "@/lib/i18n/dictionaries"
import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { Locale } from "@/lib/i18n/locales"
import type { PatchError } from "@/lib/project"

/** The UI text of a patch or import error: `shell.validation.<code>` with `{min}`/`{max}` formatted per language. */
export function validationMessage(error: Pick<PatchError, "code" | "params">, shell: Dictionary<"shell">, lang: Locale): string {
  const values: Record<string, string> = {}
  for (const [name, value] of Object.entries(error.params ?? {})) {
    if (typeof value === "number") values[name] = formatNumber(value, lang)
    else if (typeof value === "string") values[name] = value
    else values[name] = value.map((entry) => (typeof entry === "number" ? formatNumber(entry, lang) : entry)).join(", ")
  }
  return interpolate(shell.validation[error.code] ?? shell.validation.invalid, values)
}
