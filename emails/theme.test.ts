// @vitest-environment node
import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { COLORS } from "./theme"

const CSS = readFileSync(path.resolve(__dirname, "../app/globals.css"), "utf8")

type Rgb = [number, number, number]

/** OKLCH → sRGB (CSS Color 4), clipped to the gamut. */
function oklchToRgb(l: number, c: number, h: number): Rgb {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const lms = [l + 0.3963377774 * a + 0.2158037573 * b, l - 0.1055613458 * a - 0.0638541728 * b, l - 0.0894841775 * a - 1.291485548 * b].map((v) => v ** 3)
  const linear = [
    4.0767416621 * lms[0] - 3.3077115913 * lms[1] + 0.2309699292 * lms[2],
    -1.2684380046 * lms[0] + 2.6097574011 * lms[1] - 0.3413193965 * lms[2],
    -0.0041960863 * lms[0] - 0.7034186147 * lms[1] + 1.707614701 * lms[2],
  ]
  return linear.map((v) => {
    const x = Math.min(1, Math.max(0, v))
    return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055
  }) as Rgb
}

const hex = (rgb: Rgb) => `#${rgb.map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("")}`

/** The first `oklch(l c h)` assigned to a custom property in globals.css. */
function token(name: string): Rgb {
  const match = new RegExp(`--${name}:\\s*oklch\\(([\\d.]+) ([\\d.]+) ([\\d.]+)\\)`).exec(CSS)
  if (!match) throw new Error(`No oklch value for --${name}`)
  return oklchToRgb(Number(match[1]), Number(match[2]), Number(match[3]))
}

/** The light-theme value of a semantic token, `[data-theme="light"]` block. */
function lightToken(name: string): Rgb {
  const block = CSS.slice(CSS.indexOf('[data-theme="light"] {'))
  const match = new RegExp(`--${name}:\\s*oklch\\(([\\d.]+) ([\\d.]+) ([\\d.]+)\\)`).exec(block)
  if (!match) throw new Error(`No light value for --${name}`)
  return oklchToRgb(Number(match[1]), Number(match[2]), Number(match[3]))
}

const mix = (top: Rgb, bottom: Rgb, alpha: number) => top.map((v, i) => v * alpha + bottom[i] * (1 - alpha)) as Rgb

describe("email palette (D-15, D-16)", () => {
  it("is the light report tokens of globals.css, as hex", () => {
    expect(COLORS.ink).toBe(hex(token("ink-950")))
    expect(COLORS.paper).toBe(hex(token("paper-100")))
    expect(COLORS.sunken).toBe(hex(token("report-surface")))
    expect(COLORS.secondary).toBe(hex(token("text-secondary-on-light")))
    expect(COLORS.cool).toBe(hex(token("accent-on-light")))
    expect(COLORS.cyanNode).toBe(hex(token("cyan-500")))
    expect(COLORS.orangeNode).toBe(hex(token("orange-500")))
    expect(COLORS.bandText).toBe(hex(token("paper-300")))
    expect(COLORS.raised).toBe(hex(lightToken("surface-raised")))
    expect(COLORS.muted).toBe(hex(lightToken("text-muted")))
    expect(COLORS.hot).toBe(hex(lightToken("accent-hot")))
  })

  it("draws lines as ink over paper at the light theme's alphas", () => {
    expect(COLORS.line).toBe(hex(mix(token("ink-950"), token("paper-100"), 0.14)))
    expect(COLORS.lineStrong).toBe(hex(mix(token("ink-950"), token("paper-100"), 0.28)))
  })
})
