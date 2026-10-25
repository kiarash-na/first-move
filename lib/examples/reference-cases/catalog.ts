import { text } from "../types"
import type { ReferenceCaseCard } from "./types"

const card = (entry: ReferenceCaseCard): ReferenceCaseCard => entry

/**
 * The six reference cases as the start screen lists them (D-76, D-78): three real anergy networks
 * in Vienna and three fictional plans around real Vienna buildings, each group strong, middling,
 * weak. Each case file spreads its entry, so name and summary live here once and the start screen
 * loads this small list, not the plans.
 */
export const REFERENCE_CASE_CARDS = {
  smartBlockGeblergasse: card({
    id: "smart-block-geblergasse",
    kind: "real",
    tier: "strong",
    name: text("Smart Block Geblergasse", "Smart Block Geblergasse"),
    summary: text(
      "Two houses in a Gründerzeit block in Hernals share courtyard geothermal probes, hybrid solar collectors and one heat pump: the first anergy network in a Vienna Gründerzeit block, built to grow.",
      "Zwei Häuser in einem Gründerzeitblock in Hernals teilen Erdsonden im Hof, Hybridkollektoren und eine Wärmepumpe: das erste Anergienetz in einem Wiener Gründerzeitblock, ausgelegt zum Wachsen.",
    ),
  }),
  kraftwerkSeebogen: card({
    id: "kraftwerk-seebogen-aspern",
    kind: "real",
    tier: "middling",
    name: text("Kraftwerk Seebogen, Seestadt Aspern", "Kraftwerk Seebogen, Seestadt Aspern"),
    summary: text(
      "Five developers on plot H6 in Seestadt Aspern largely share one energy system: two geothermal probe fields with 92 boreholes, an anergy loop, supermarket waste heat and rooftop PV.",
      "Fünf Bauträger teilen am Bauplatz H6 der Seestadt Aspern großteils ein Energiesystem: zwei Erdsondenfelder mit 92 Bohrungen, ein Anergienetz, Supermarkt-Abwärme und Dach-PV.",
    ),
  }),
  villageImDritten: card({
    id: "village-im-dritten",
    kind: "real",
    tier: "weak",
    name: text("Village im Dritten", "Village im Dritten"),
    summary: text(
      "A new 11.5 ha quarter in Landstraße with about 2,000 flats, where 500 geothermal probes feed an anergy network across 22 building plots.",
      "Ein neues Quartier mit 11,5 ha in der Landstraße mit rund 2.000 Wohnungen, in dem 500 Erdwärmesonden ein Anergienetz über 22 Bauplätze speisen.",
    ),
  }),
  klinikDonaustadt: card({
    id: "klinik-donaustadt-groundwater-loop",
    kind: "fictional",
    tier: "strong",
    name: text("Klinik Donaustadt: fictional groundwater loop", "Klinik Donaustadt: fiktives Grundwassernetz"),
    summary: text(
      "Klinik Donaustadt, a public hospital with 963 beds, anchors a fictional groundwater anergy loop for neighbouring housing and a school.",
      "Die Klinik Donaustadt, ein öffentliches Spital mit 963 Betten, ist Ankerkundin eines fiktiven Grundwasser-Anergienetzes für benachbarte Wohnbauten und eine Schule.",
    ),
  }),
  ottakringerBad: card({
    id: "ottakringer-bad-summer-loop",
    kind: "fictional",
    tier: "middling",
    name: text("Ottakringer Bad: fictional summer heat loop", "Ottakringer Bad: fiktives Sommerwärmenetz"),
    summary: text(
      "The Ottakringer Bad, a municipal indoor and outdoor pool, anchors a fictional loop that sends summer waste heat from a supermarket into the outdoor pool.",
      "Das Ottakringer Bad, ein städtisches Hallen- und Freibad, ist Ankerkunde eines fiktiven Netzes, das sommerliche Supermarkt-Abwärme ins Freibecken leitet.",
    ),
  }),
  grossmarktWien: card({
    id: "grossmarkt-wien-waste-heat",
    kind: "fictional",
    tier: "weak",
    name: text("Großmarkt Wien: fictional waste-heat plan", "Großmarkt Wien: fiktiver Abwärmeplan"),
    summary: text(
      "A fictional plan to sell waste heat from the cold stores of Großmarkt Wien, a 30 ha wholesale market, to its neighbours; nobody has committed yet.",
      "Ein fiktiver Plan, Abwärme aus den Kühlräumen des Großmarkts Wien, eines Großhandelsmarkts mit 30 ha, an die Nachbarschaft zu verkaufen; zugesagt hat noch niemand.",
    ),
  }),
} as const

/** In start-screen order: real first, then fictional, each from the strong plan to the weak one. */
export const REFERENCE_CASE_CATALOG: readonly ReferenceCaseCard[] = [
  REFERENCE_CASE_CARDS.smartBlockGeblergasse,
  REFERENCE_CASE_CARDS.kraftwerkSeebogen,
  REFERENCE_CASE_CARDS.villageImDritten,
  REFERENCE_CASE_CARDS.klinikDonaustadt,
  REFERENCE_CASE_CARDS.ottakringerBad,
  REFERENCE_CASE_CARDS.grossmarktWien,
]
