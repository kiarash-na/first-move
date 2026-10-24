/**
 * SVG pattern for the third series of a stacked bar: 45 degree lines in the grey token on the
 * card surface. A second channel besides colour (D-17: labels and patterns), never decoration.
 * Put it inside a Recharts chart and fill a bar with `url(#<id>)`.
 */
export function HatchDefs({ id, color = "var(--chart-5)" }: { id: string; color?: string }) {
  return (
    <defs>
      <pattern id={id} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
        <rect width="6" height="6" fill="var(--card)" />
        <line x1="0" y1="0" x2="0" y2="6" stroke={color} strokeWidth="2.5" />
      </pattern>
    </defs>
  )
}

/** The CSS twin of the hatch, for legend swatches. */
export const HATCH_BACKGROUND =
  "repeating-linear-gradient(135deg, var(--chart-5) 0 2px, var(--card) 2px 5px)"
