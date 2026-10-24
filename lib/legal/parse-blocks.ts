/**
 * The block grammar of a legal section body. One array entry is one line:
 *   `- text`       bullet (consecutive entries form one list)
 *   `1. text`      numbered item (consecutive entries form one list)
 *   `> text`       highlighted note
 *   `| a | b |`    table row; the first row is the header, a `|---|---|` row is ignored
 *   anything else  paragraph
 * Keeping the body as plain lines keeps the dictionaries flat, so DE can be checked against EN.
 */
export type Block =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "note"; text: string }
  | { type: "table"; head: string[]; rows: string[][] }

const BULLET = /^-\s+(.*)$/
const NUMBERED = /^\d+\.\s+(.*)$/
const NOTE = /^>\s+(.*)$/
const ROW = /^\|(.*)\|\s*$/
const SEPARATOR = /^[\s|:-]+$/

function cells(row: string): string[] {
  const inner = ROW.exec(row)?.[1] ?? ""
  return inner.split("|").map((cell) => cell.trim())
}

export function parseBlocks(lines: readonly string[]): Block[] {
  const blocks: Block[] = []

  for (const raw of lines) {
    const line = raw.trim()
    if (line === "") continue
    const last = blocks.at(-1)

    const bullet = BULLET.exec(line)
    if (bullet) {
      if (last?.type === "ul") last.items.push(bullet[1])
      else blocks.push({ type: "ul", items: [bullet[1]] })
      continue
    }

    const numbered = NUMBERED.exec(line)
    if (numbered) {
      if (last?.type === "ol") last.items.push(numbered[1])
      else blocks.push({ type: "ol", items: [numbered[1]] })
      continue
    }

    const note = NOTE.exec(line)
    if (note) {
      blocks.push({ type: "note", text: note[1] })
      continue
    }

    if (ROW.test(line)) {
      if (SEPARATOR.test(line)) continue
      if (last?.type === "table") last.rows.push(cells(line))
      else blocks.push({ type: "table", head: cells(line), rows: [] })
      continue
    }

    blocks.push({ type: "p", text: line })
  }

  return blocks
}

/** The shape of a body, for checking that DE has the same structure as EN. */
export function blockShape(lines: readonly string[]): string[] {
  return parseBlocks(lines).map((block) => {
    switch (block.type) {
      case "ul":
      case "ol":
        return `${block.type}:${block.items.length}`
      case "table":
        return `table:${block.head.length}x${block.rows.length}`
      default:
        return block.type
    }
  })
}
