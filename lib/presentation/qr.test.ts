// @vitest-environment node
import { readFileSync } from "node:fs"
import path from "node:path"
import jsQR from "jsqr"
import { describe, expect, it } from "vitest"
import { finderAt, FINDER_SIZE, modulesPath, OWNER_LINK, qrMatrix, QUIET_ZONE, type FinderCorner } from "./qr"

/** OKLCH → sRGB 0..255 (Björn Ottosson's OKLab matrices), to draw the code in the real token colours. */
function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  const linear = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ]
  const gamma = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055)
  return linear.map((x) => Math.round(Math.min(1, Math.max(0, gamma(x))) * 255)) as [number, number, number]
}

const luminance = ([r, g, b]: [number, number, number]) => {
  const lin = (v: number) => {
    const x = v / 255
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}
const contrast = (a: [number, number, number], b: [number, number, number]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** The colours `qr-code.tsx` uses, read from the tokens in `app/globals.css` (a light panel). */
const css = readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8")
function token(pattern: RegExp): [number, number, number] {
  const match = pattern.exec(css)
  if (!match) throw new Error(`token not found: ${pattern}`)
  return oklchToRgb(Number(match[1]), Number(match[2]), Number(match[3]))
}
const OKLCH = String.raw`oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)`
const COLOURS = {
  paper: token(new RegExp(String.raw`--paper-100: ${OKLCH}`)),
  ink: token(new RegExp(String.raw`--ink-950: ${OKLCH}`)),
  cool: token(new RegExp(String.raw`--accent-on-light: ${OKLCH}`)),
  hot: token(new RegExp(String.raw`\[data-theme="light"\] \{[^}]*--accent-hot: ${OKLCH}`)),
}
const FINDER_COLOUR: Record<FinderCorner, keyof typeof COLOURS> = { topLeft: "ink", topRight: "hot", bottomLeft: "cool" }

/** Draws the code as the page does (quiet zone, finder colours) into RGBA pixels. */
function render(scale = 6) {
  const matrix = qrMatrix(OWNER_LINK)
  const side = (matrix.size + 2 * QUIET_ZONE) * scale
  const pixels = new Uint8ClampedArray(side * side * 4)
  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const row = Math.floor(y / scale) - QUIET_ZONE
      const col = Math.floor(x / scale) - QUIET_ZONE
      const inside = row >= 0 && col >= 0 && row < matrix.size && col < matrix.size
      const finder = inside ? finderAt(matrix.size, row, col) : null
      const colour = inside && matrix.dark[row][col] ? COLOURS[finder ? FINDER_COLOUR[finder] : "ink"] : COLOURS.paper
      pixels.set([...colour, 255], (y * side + x) * 4)
    }
  }
  return { pixels, side }
}

describe("QR code of slide 10", () => {
  it("decodes to exactly the owner's link, drawn in the brand colours", () => {
    const { pixels, side } = render()
    expect(jsQR(pixels, side, side, { inversionAttempts: "dontInvert" })?.data).toBe("https://kiarash.online/link")
  })

  it("keeps every module colour at 4.5:1 or more against the paper", () => {
    for (const key of ["ink", "cool", "hot"] as const) expect(contrast(COLOURS[key], COLOURS.paper)).toBeGreaterThanOrEqual(4.5)
  })

  it("finds the three finder patterns and leaves the rest of the code to the main path", () => {
    const { size } = qrMatrix(OWNER_LINK)
    expect(finderAt(size, 0, 0)).toBe("topLeft")
    expect(finderAt(size, 0, size - 1)).toBe("topRight")
    expect(finderAt(size, size - 1, 0)).toBe("bottomLeft")
    expect(finderAt(size, size - 1, size - 1)).toBeNull()
    expect(finderAt(size, FINDER_SIZE, FINDER_SIZE)).toBeNull()
  })

  it("draws row runs as rectangles in module units", () => {
    const matrix = { size: 3, dark: [[true, true, false], [false, false, false], [true, false, true]] }
    expect(modulesPath(matrix)).toBe("M0 0h2v1h-2zM0 2h1v1h-1zM2 2h1v1h-1z")
    expect(modulesPath(matrix, (row) => row > 0)).toBe("M0 2h1v1h-1zM2 2h1v1h-1z")
  })
})
