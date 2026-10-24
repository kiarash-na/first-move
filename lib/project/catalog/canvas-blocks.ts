/**
 * Blocks of the tailored Business Model Canvas (BM-STEP-02): the nine classic blocks, plus
 * operator responsibilities, which BM-STEP-02 names explicitly and the classic canvas lacks.
 */
export const CANVAS_BLOCKS = [
  "keyPartners",
  "keyActivities",
  "keyResources",
  "valueProposition",
  "customerRelationships",
  "channels",
  "customerSegments",
  "costStructure",
  "revenueStreams",
  "operatorResponsibilities",
] as const

export type CanvasBlock = (typeof CANVAS_BLOCKS)[number]

/** The blocks BM-STEP-02 asks for "particular attention" to. */
export const FOCUS_CANVAS_BLOCKS = [
  "valueProposition",
  "customerRelationships",
  "keyPartners",
  "operatorResponsibilities",
  "costStructure",
  "revenueStreams",
] as const satisfies readonly CanvasBlock[]
