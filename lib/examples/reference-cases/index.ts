/**
 * Reference cases from Vienna (D-76, D-78): three real anergy networks and three fictional plans
 * around real Vienna buildings, one strong, one middling and one weak plan per group. They load
 * like the examples (`localizeExample`) and carry `meta.exampleId`, so the Example badge marks
 * them; `getExample` finds them too. The start screen lists `REFERENCE_CASE_CATALOG` (no plans)
 * and imports this module only when someone opens a case.
 */
import { grossmarktWien } from "./grossmarkt-wien-waste-heat"
import { klinikDonaustadt } from "./klinik-donaustadt-groundwater-loop"
import { kraftwerkSeebogen } from "./kraftwerk-seebogen-aspern"
import { ottakringerBad } from "./ottakringer-bad-summer-loop"
import { smartBlockGeblergasse } from "./smart-block-geblergasse"
import type { ReferenceCase } from "./types"
import { villageImDritten } from "./village-im-dritten"

/** In the order of `REFERENCE_CASE_CATALOG`: real first, then fictional, each strong to weak. */
export const REFERENCE_CASES: readonly ReferenceCase[] = [
  smartBlockGeblergasse,
  kraftwerkSeebogen,
  villageImDritten,
  klinikDonaustadt,
  ottakringerBad,
  grossmarktWien,
]

export function getReferenceCase(id: string): ReferenceCase | undefined {
  return REFERENCE_CASES.find((entry) => entry.id === id)
}

export { REFERENCE_CASE_CARDS, REFERENCE_CASE_CATALOG } from "./catalog"
export { REFERENCE_CASE_SOURCES, referenceCaseSourceOf } from "./sources"
export {
  FICTIONAL_DISCLAIMER,
  REFERENCE_KINDS,
  REFERENCE_TIERS,
  withFictionalDisclaimer,
  type ReferenceCase,
  type ReferenceCaseCard,
  type ReferenceKind,
  type ReferenceTier,
} from "./types"
