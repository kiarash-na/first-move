import qrcode from "qrcode-generator"

/**
 * QR codes for the presentation, made on the server at build time (no client code, no network).
 * `qrcode-generator` encodes; this file turns the modules into one SVG path, so the page draws
 * square modules in the brand's own colours (slide 10).
 */

/** The owner's mobile-first link page (slide 10). */
export const OWNER_LINK = "https://kiarash.online/link"

/** Modules of light margin around the code; the QR standard asks for four. */
export const QUIET_ZONE = 4

/** Size of a finder pattern (the three big squares), in modules. */
export const FINDER_SIZE = 7

export interface QrMatrix {
  size: number
  /** `dark[row][col]`. */
  dark: boolean[][]
}

/** Error correction M (15 %): small code, and robust enough for a projected slide. */
export function qrMatrix(text: string): QrMatrix {
  const code = qrcode(0, "M")
  code.addData(text, "Byte")
  code.make()
  const size = code.getModuleCount()
  const dark = Array.from({ length: size }, (_, row) => Array.from({ length: size }, (_, col) => code.isDark(row, col)))
  return { size, dark }
}

export type FinderCorner = "topLeft" | "topRight" | "bottomLeft"

/** Top-left module of each finder pattern. */
export function finderOrigins(size: number): Record<FinderCorner, [row: number, col: number]> {
  return { topLeft: [0, 0], topRight: [0, size - FINDER_SIZE], bottomLeft: [size - FINDER_SIZE, 0] }
}

/** The finder pattern a module belongs to, or null. */
export function finderAt(size: number, row: number, col: number): FinderCorner | null {
  for (const [corner, [top, left]] of Object.entries(finderOrigins(size)) as [FinderCorner, [number, number]][]) {
    if (row >= top && row < top + FINDER_SIZE && col >= left && col < left + FINDER_SIZE) return corner
  }
  return null
}

/**
 * The dark modules as one path in module units: each row's runs become rectangles. `include`
 * picks which modules go into this path (e.g. everything but the finder patterns).
 */
export function modulesPath(matrix: QrMatrix, include: (row: number, col: number) => boolean = () => true): string {
  const parts: string[] = []
  matrix.dark.forEach((cells, row) => {
    let col = 0
    while (col < matrix.size) {
      if (!cells[col] || !include(row, col)) {
        col += 1
        continue
      }
      const start = col
      while (col < matrix.size && cells[col] && include(row, col)) col += 1
      parts.push(`M${start} ${row}h${col - start}v1h${start - col}z`)
    }
  })
  return parts.join("")
}
