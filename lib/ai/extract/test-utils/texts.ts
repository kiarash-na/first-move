import businessPlan from "@/dictionaries/en/business-plan.json"
import quickCheck from "@/dictionaries/en/quick-check.json"
import shell from "@/dictionaries/en/shell.json"
import type { Texts } from "../field-label"

/** The English dictionaries the extraction needs, as a layout would hand them over. */
export const EN_TEXTS: Texts = { "quick-check": quickCheck, "business-plan": businessPlan, shell }

/** The same texts with German option labels for the potentials, to test label matching. */
export const DE_TEXTS: Texts = {
  ...EN_TEXTS,
  "quick-check": {
    ...quickCheck,
    potentials: { low: { label: "Niedrig" }, medium: { label: "Mittel" }, high: { label: "Hoch" }, unknown: { label: "Unbekannt" } },
  },
}
