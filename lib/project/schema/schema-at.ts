import { z } from "zod"
import { isIndexSegment } from "@/lib/project/path"

/** Looks through wrappers that do not change the shape (`nullable`, `optional`, …). */
function unwrap(schema: z.ZodType): z.ZodType {
  let node = schema
  while (node instanceof z.ZodNullable || node instanceof z.ZodOptional || node instanceof z.ZodReadonly) {
    node = node.unwrap() as z.ZodType
  }
  return node
}

/**
 * The sub-schema at a path (segments as from `parsePath`), wrappers kept, or undefined when
 * the schema has no such path. Object keys must be own keys of the shape; a list takes a
 * numeric segment for its element.
 */
export function schemaAt(root: z.ZodType, segments: readonly string[]): z.ZodType | undefined {
  let node: z.ZodType = root
  for (const segment of segments) {
    const inner = unwrap(node)
    if (inner instanceof z.ZodObject) {
      if (!Object.hasOwn(inner.shape, segment)) return undefined
      node = inner.shape[segment] as z.ZodType
    } else if (inner instanceof z.ZodArray) {
      if (!isIndexSegment(segment)) return undefined
      node = inner.element as z.ZodType
    } else {
      return undefined
    }
  }
  return node
}

/** True for a leaf that accepts nothing but null (an override cell without a default). */
export function isNullOnly(schema: z.ZodType): boolean {
  return schema instanceof z.ZodNull
}
