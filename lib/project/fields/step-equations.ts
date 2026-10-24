import { EQUATION_IDS, type EquationId } from "@/lib/project/catalog/references"
import { fieldsOf } from "./registry"
import type { FieldStep } from "./steps"
import type { FieldModule } from "./types"

/**
 * The equations a step's inputs feed or replace, in methodology order: what the step's
 * collapsed "How we calculate" lists (D-33).
 */
export function stepEquations(module: FieldModule, step: FieldStep): EquationId[] {
  const used = new Set(fieldsOf({ module, step }).flatMap((field) => [...field.feeds, ...field.replaces]))
  return EQUATION_IDS.filter((id) => used.has(id))
}
