/** File extension of exports (D-13). */
export const EXPORT_EXTENSION = ".firstmove.json"

/** Used when the project name has no usable characters (the brand, not translated). */
const FALLBACK = "first-move"

const TRANSLITERATION: Record<string, string> = { ä: "ae", ö: "oe", ü: "ue", ß: "ss", æ: "ae", ø: "oe", å: "aa" }

/** A safe file-name part: lowercase ASCII letters, digits and single dashes, at most 60 characters. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äöüßæøå]/g, (letter) => TRANSLITERATION[letter])
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "")
}

const pad = (value: number) => String(value).padStart(2, "0")

/** `<name>-<YYYY-MM-DD>.firstmove.json`, with the local date of `now`. */
export function exportFileName(projectName: string, now: Date): string {
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  return `${slugify(projectName) || FALLBACK}-${date}${EXPORT_EXTENSION}`
}
