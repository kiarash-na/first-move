import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"

/**
 * The brand tokens as sRGB hex: globals.css keeps them in oklch, which the image renderer cannot
 * parse. --ink-950, --paper-100/300/500, --cyan-500, --orange-500 (docs/02_design).
 */
const INK = "#04090d"
const PAPER = "#e6f1f2"
const SECONDARY = "#a6bcc1"
const MUTED = "#7f939a"
const CYAN = "#00f6ff"
const ORANGE = "#ff7300"

export const alt = "First Move — 5GDHC screening and business models"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const FONT_DIR = join(process.cwd(), "node_modules/@fontsource/ibm-plex-mono/files")

/** A network of districts, as the mark on the landing draws it: linked nodes, cyan and one orange. */
function NetworkMark() {
  const node = (left: number, top: number, color: string) => (
    <div style={{ position: "absolute", left, top, width: 18, height: 18, borderRadius: 9, backgroundColor: color }} />
  )
  const link = (left: number, top: number, width: number) => (
    <div style={{ position: "absolute", left, top, width, height: 3, backgroundColor: SECONDARY, opacity: 0.6 }} />
  )
  return (
    <div style={{ position: "absolute", top: 84, right: 80, width: 200, height: 20, display: "flex" }}>
      {link(18, 8, 64)}
      {link(100, 8, 64)}
      {node(0, 0, CYAN)}
      {node(82, 0, ORANGE)}
      {node(164, 0, CYAN)}
    </div>
  )
}

/** The social card of every page, per locale: wordmark, slogan and the three tools. */
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const lang = requireLocale((await params).lang)
  const [common, regular, bold] = await Promise.all([
    getDictionary(lang, "common"),
    readFile(join(FONT_DIR, "ibm-plex-mono-latin-400-normal.woff")),
    readFile(join(FONT_DIR, "ibm-plex-mono-latin-700-normal.woff")),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: INK,
          color: PAPER,
          fontFamily: "IBM Plex Mono",
          padding: "84px 80px 72px",
        }}
      >
        <NetworkMark />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 22, letterSpacing: 10, color: CYAN, fontWeight: 700 }}>5GDHC</div>
          <div style={{ fontSize: 118, fontWeight: 700, letterSpacing: -2, marginTop: 28 }}>First Move</div>
          <div style={{ fontSize: 30, color: SECONDARY, marginTop: 26 }}>{common.app.slogan}</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 34, fontSize: 20, letterSpacing: 4 }}>
            <span style={{ color: CYAN }}>QUICK CHECK</span>
            <span style={{ color: ORANGE }}>BUSINESS PLAN</span>
            <span style={{ color: MUTED }}>AI PLAN SCORE</span>
          </div>
          <div style={{ fontSize: 20, color: MUTED }}>firstmove.energy</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "IBM Plex Mono", data: regular, weight: 400, style: "normal" },
        { name: "IBM Plex Mono", data: bold, weight: 700, style: "normal" },
      ],
    },
  )
}
