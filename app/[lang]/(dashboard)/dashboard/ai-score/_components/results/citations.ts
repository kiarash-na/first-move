import { BRANCHES } from "@/lib/ai/plan-score/branches"
import { DIMENSION_IDS, type DimensionId } from "@/lib/ai/plan-score/dimensions"
import { GATES } from "@/lib/ai/plan-score/gates"
import { HINTS } from "@/lib/ai/plan-score/hints"
import { JUDGEMENTS } from "@/lib/ai/plan-score/judgements"
import { PROVIDER_SOURCE } from "@/lib/docs/references"

/**
 * Which part of the scoring cites a source (PLAN-AI-SCORE-01 § Sources): the judgements, checks,
 * branches and suggestion hints of the engine carry source ids, each within a dimension.
 */
const CITING: readonly { dimension: DimensionId; sources: readonly string[] }[] = [
  ...JUDGEMENTS,
  ...GATES,
  ...BRANCHES.flatMap((branch) => [
    { dimension: branch.followUpDimension, sources: branch.sources },
    ...branch.options.flatMap((option) => (option.followUp ? [{ dimension: branch.followUpDimension, sources: option.followUp.sources }] : [])),
  ]),
  ...DIMENSION_IDS.flatMap((dimension) => HINTS[dimension].map((hint) => ({ dimension, sources: hint.sources }))),
]

/** The dimensions whose parts, checks, branches or hints cite a source, in dimension order. */
export function citedDimensions(sourceId: string): DimensionId[] {
  const cited = new Set(CITING.filter((entry) => entry.sources.includes(sourceId)).map((entry) => entry.dimension))
  return DIMENSION_IDS.filter((dimension) => cited.has(dimension))
}

/**
 * Sources the method itself rests on, beyond single parts: the evidence scale (`scale.ts`: rubric
 * design, verbosity bias, evidence ladder) and the expected level (`aggregate.ts`).
 */
export const METHOD_ROLES: Readonly<Record<string, "scale" | "aggregation">> = {
  "SRC-BROOKHART-2018": "scale",
  "SRC-ZHENG-2023": "scale",
  "SRC-GEVAL-2023": "aggregation",
}

/** Every provider source (challenge brief `BM-…`, research project talk `ALG-…`) the engine cites, sorted. */
export const PROVIDER_IDS: readonly string[] = [...new Set(CITING.flatMap((entry) => entry.sources).filter((id) => PROVIDER_SOURCE.test(id)))].sort((a, b) =>
  a.localeCompare(b, "en", { numeric: true }),
)
