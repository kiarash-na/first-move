import { ImageResponse } from "next/og"

/**
 * Apple's touch icon (180×180): the First Move mark of app/icon.svg, drawn with plain boxes —
 * the SVG itself has a blur filter the image renderer cannot read. Colours are the icon's own
 * hex values (cyan stroke, orange fill, ink background); positions are the SVG geometry scaled
 * from 32 to 180 px (×5.625, inner group offset 7.26/2.56 at 0.84).
 */
const CYAN = "#00e5ff"
const ORANGE = "#ff6a00"
const INK = "#070b0e"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", backgroundColor: INK }}>
        {/* the cyan corner: up from the small square, then right */}
        <div style={{ position: "absolute", left: 69, top: 43, width: 14, height: 73, backgroundColor: CYAN }} />
        <div style={{ position: "absolute", left: 69, top: 43, width: 31, height: 14, backgroundColor: CYAN }} />
        {/* the cyan outlined square, bottom left of the corner */}
        <div style={{ position: "absolute", left: 53, top: 121, width: 33, height: 33, border: `12px solid ${CYAN}` }} />
        {/* the orange square, top right */}
        <div style={{ position: "absolute", left: 98, top: 24, width: 38, height: 38, backgroundColor: ORANGE }} />
      </div>
    ),
    { ...size },
  )
}
