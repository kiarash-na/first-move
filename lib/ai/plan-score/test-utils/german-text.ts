/** Formal German sentences of the kind the text model writes for a plan (tests only). */
const SENTENCES = [
  "Der Plan benennt die Wohnungsgenossenschaft, die Volksschule und das Hotel als erste Kundinnen und Kunden.",
  "Prüfen Sie die Anschlussbereitschaft der Eigentümergemeinschaften, bevor Sie die Trassenlänge festlegen.",
  "Die Grundwasserbewilligung nach dem Wasserrechtsgesetz ist noch offen und sollte früh angefragt werden.",
  "Vergleichen Sie die jährlichen Wärmepumpenstromkosten mit den Erlösen über zwanzig bis dreißig Jahre.",
  "Die Kostenaufteilung zwischen Quelle, Leitungen und Hausanschlüssen ist als Regel noch nicht beschrieben.",
  "Holen Sie eine Absichtserklärung des Ankerkunden ein und halten Sie die Mindestanschlussquote fest.",
  "Der Betreiber, seine Wartungspflichten und die Versorgungssicherheit werden im Plan nachvollziehbar erläutert.",
  "Legen Sie eine Entscheidungsschwelle mit überprüfbaren Kriterien, einer verantwortlichen Stelle und einem Datum fest.",
] as const

/** About `length` characters of German, at least `length`, starting at sentence `seed`. */
export function germanText(length: number, seed = 0): string {
  const parts: string[] = []
  for (let index = seed; parts.join(" ").length < length; index++) parts.push(SENTENCES[index % SENTENCES.length])
  return parts.join(" ")
}
