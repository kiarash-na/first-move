/**
 * Reads a string from a dictionary by dot path (`fields.buildings.total.label`). Returns null
 * when the path does not end at a non-empty string, so callers can fall back.
 */
export function lookup(dictionary: unknown, path: string): string | null {
  let node: unknown = dictionary
  for (const segment of path.split(".")) {
    if (typeof node !== "object" || node === null || !Object.hasOwn(node, segment)) return null
    node = (node as Record<string, unknown>)[segment]
  }
  return typeof node === "string" && node !== "" ? node : null
}
