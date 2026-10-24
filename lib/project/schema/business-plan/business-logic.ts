import { z } from "zod"
import { CANVAS_BLOCKS } from "@/lib/project/catalog/canvas-blocks"
import { itemId, itemList, keyedObject, longText, shortText } from "../common"

/** BM-STEP-02.1: the tailored Business Model Canvas, one free-text block each. */
export const canvasSchema = keyedObject(CANVAS_BLOCKS, () => longText()).meta({
  description: "Tailored Business Model Canvas (BM-STEP-02.1): nine classic blocks plus operator responsibilities.",
})

/** BM-STEP-02.2: one stakeholder's share of investment, risk and benefit. */
export const allocationRowSchema = z.strictObject({
  id: itemId(),
  stakeholder: shortText(),
  investment: longText(),
  risk: longText(),
  benefit: longText(),
})

export const allocationSchema = itemList(
  allocationRowSchema,
  "Allocation of investment, risk and benefit per stakeholder (BM-STEP-02.2).",
)

export type Canvas = z.infer<typeof canvasSchema>
export type AllocationRow = z.infer<typeof allocationRowSchema>
