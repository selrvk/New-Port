// components/laptop/lib/stickerDesign.ts
//
// What each certification sticker looks like — once, for both versions of the site.
//
// The design is described here as data: a die-cut shape and a display list of
// paths, circles, lines, text and barcode bars in the shape's own viewBox units.
// Two renderers draw it: components/keys/Sticker.tsx as SVG for the text version,
// and stickerTexture.ts onto a canvas texture for the 3D lid. So a certificate is
// the same sticker in both, down to where its year sits.
//
// What makes it read as a sticker, and is drawn by both renderers in this order:
//   1. a white vinyl edge following the cut exactly (the shape stroked wide),
//   2. the coloured face, with a matte grain,
//   3. the content below,
//   4. holographic film on featured certificates,
//   5. a glossy diagonal sheen,
//   6. on the label, a peeled-back corner.
//
// Import-free apart from data, the shared colourways and the barcode encoder, so
// the text version can use it without pulling in three.js.

import { issuedYear, issuerCode, type Certification, type StickerShape } from "@/data/certifications"

import { code128Bars, type Bar } from "./code128"
import type { StickerStyle } from "./stickerStyles"

/** The vinyl's off-white edge. */
export const VINYL = "#F4F1EA"
/** Half the white edge's width, in viewBox units. Every shape keeps this clear. */
export const RIM = 8

// ── Fitting text ─────────────────────────────────────────────────────────────

/**
 * Advance widths of Syne ExtraBold, in thousandths of an em, measured from the
 * loaded font in the browser (canvas measureText). Summing them matches the
 * browser's own measurement of whole names to within 1%, which lets a name be
 * sized to fit its sticker without a layout pass — on the server for the SVG, and
 * identically on the canvas.
 */
const SYNE_800 =
  "01066|1529|21003|31055|41094|51015|61133|71153|81081|91158|A1160|B1140|C1316|D1302|E1140|F1128|G1340|H1280|I420|J1004|K1215|L943|M1580|N1300|O1330|P1177|Q1330|R1232|S1056|T1100|U1289|V1160|W1882|X1140|Y1070|Z1200|a1063|b1098|c994|d1098|e994|f674|g969|h1008|i364|j364|k942|l360|m1654|n998|o1016|p1063|q1098|r563|s842|t628|u998|v918|w1462|x980|y930|z896| 310|·354|+780|&1220|.354|-590|/622"
const ADVANCE = new Map(
  SYNE_800.split("|").map((pair) => [pair[0], Number(pair.slice(1)) / 1000] as const)
)

function syneEm(text: string): number {
  let em = 0
  for (const ch of text) em += ADVANCE.get(ch) ?? 1.1
  return em
}

/** The largest size, up to `max`, at which `text` in Syne 800 fits `width`. */
export function fitSyne(text: string, width: number, max: number): number {
  return Math.min(max, width / Math.max(syneEm(text), 0.5))
}

// ── Shapes ───────────────────────────────────────────────────────────────────

export type Geometry = { w: number; h: number; path: string }

function starPath(cx: number, cy: number, points: number, outer: number, inner: number): string {
  const pts: string[] = []
  for (let i = 0; i < points * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / points
    const r = i % 2 === 0 ? outer : inner
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`)
  }
  return `M ${pts.join(" L ")} Z`
}

/** A rosette: a circle with scalloped edges, the outline of an official seal. */
function scallopPath(cx: number, cy: number, bumps: number, radius: number, control: number): string {
  const at = (r: number, a: number) =>
    `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`
  const step = (Math.PI * 2) / bumps
  let d = `M ${at(radius, 0)}`
  for (let i = 0; i < bumps; i++) {
    d += ` Q ${at(control, (i + 0.5) * step)} ${at(radius, (i + 1) * step)}`
  }
  return `${d} Z`
}

export const GEOMETRY: Record<StickerShape, Geometry> = {
  burst: { w: 220, h: 220, path: starPath(110, 110, 14, 100, 86) },
  shield: {
    w: 190,
    h: 220,
    path: "M 22 34 Q 95 10 168 34 L 168 112 Q 168 172 95 206 Q 22 172 22 112 Z",
  },
  scallop: { w: 220, h: 220, path: scallopPath(110, 110, 22, 92, 110) },
  hex: { w: 240, h: 210, path: "M 66 14 L 174 14 L 226 105 L 174 196 L 66 196 L 14 105 Z" },
  // Two arcs: a single full-circle arc is degenerate and draws nothing.
  circle: { w: 210, h: 210, path: "M 9 105 A 96 96 0 1 1 201 105 A 96 96 0 1 1 9 105 Z" },
  pill: {
    w: 300,
    h: 120,
    path: "M 60 10 H 240 A 50 50 0 0 1 240 110 H 60 A 50 50 0 0 1 60 10 Z",
  },
  // Rounded corners and a semicircular notch either side, as on a ticket.
  ticket: {
    w: 300,
    h: 150,
    path: "M 20 10 H 280 A 10 10 0 0 1 290 20 V 62 A 13 13 0 0 0 290 88 V 130 A 10 10 0 0 1 280 140 H 20 A 10 10 0 0 1 10 130 V 88 A 13 13 0 0 0 10 62 V 20 A 10 10 0 0 1 20 10 Z",
  },
  // The top-right corner is cut along the fold: it has peeled back (see FLAP).
  label: {
    w: 280,
    h: 180,
    path: "M 24 10 H 238 L 270 42 V 156 A 14 14 0 0 1 256 170 H 24 A 14 14 0 0 1 10 156 V 24 A 14 14 0 0 1 24 10 Z",
  },
  grid: {
    w: 250,
    h: 180,
    path: "M 22 10 H 228 A 12 12 0 0 1 240 22 V 158 A 12 12 0 0 1 228 170 H 22 A 12 12 0 0 1 10 158 V 22 A 12 12 0 0 1 22 10 Z",
  },
  rect: {
    w: 256,
    h: 170,
    path: "M 32 10 H 224 A 22 22 0 0 1 246 32 V 138 A 22 22 0 0 1 224 160 H 32 A 22 22 0 0 1 10 138 V 32 A 22 22 0 0 1 32 10 Z",
  },
}

/** When a certificate names no shape, give it one by position. */
const FALLBACK: StickerShape[] = ["rect", "circle", "hex", "pill", "shield", "ticket"]

export function shapeFor(cert: Certification, index: number): StickerShape {
  return cert.shape ?? FALLBACK[index % FALLBACK.length]
}

// ── Finishes ─────────────────────────────────────────────────────────────────
// Gradient ends are fractions of the sticker's viewBox, from (x1, y1) — the
// top-left corner unless given — to (x2, y2). Both renderers place them in the
// same coordinates, so a sheen falls across a sticker identically in each.

export type Stop = [offset: number, color: string, opacity: number]
export type Gradient = { x1?: number; y1?: number; x2: number; y2: number; stops: Stop[] }

export const SHEEN: Gradient = {
  x2: 1,
  y2: 1,
  stops: [
    [0, "#FFFFFF", 0.16],
    [0.38, "#FFFFFF", 0],
    [0.5, "#FFFFFF", 0.2],
    [0.6, "#FFFFFF", 0],
    [1, "#000000", 0.08],
  ],
}

export const HOLO: Gradient = {
  x2: 1,
  y2: 0.6,
  stops: [
    [0, "#FF6AD5", 1],
    [0.2, "#C774E8", 1],
    [0.38, "#8795E8", 1],
    [0.55, "#94D0FF", 1],
    [0.72, "#A7FFCF", 1],
    [1, "#FFEF9F", 1],
  ],
}
/** The film's strength, blended soft-light over the face. */
export const HOLO_OPACITY = 0.7
/** The matte grain's strength over the face. */
export const GRAIN_OPACITY = 0.14

/** The label's peeled corner: the flap folded back over the face. */
export const FLAP = {
  path: "M 238 10 L 270 42 L 238 42 Z",
  /** Its shadow, offset onto the face. */
  shadow: { dx: 2, dy: 3, opacity: 0.28 },
  /** The flap shows the white backing, lit from the fold. */
  // From the fold's outer corner (270, 10) to its inner corner (238, 42) on the
  // label's 280 × 180 viewBox.
  gradient: {
    x1: 270 / 280,
    y1: 10 / 180,
    x2: 238 / 280,
    y2: 42 / 180,
    stops: [[0, "#FFFFFF", 1], [1, "#CFCAC0", 1]],
  } as Gradient,
}

// ── The display list ─────────────────────────────────────────────────────────

export type Paint = {
  fill?: string
  fillOpacity?: number
  stroke?: string
  strokeOpacity?: number
  strokeWidth?: number
  dash?: [number, number]
}

export type TextEl = {
  kind: "text"
  x: number
  y: number
  text: string
  font: "display" | "mono"
  size: number
  weight: number
  fill: string
  anchor: "start" | "middle" | "end"
  /** Extra space after each character, in viewBox units. */
  spacing: number
  opacity: number
  /** Degrees about (x, y). */
  rotate: number
}

export type StickerEl =
  | ({ kind: "path"; d: string } & Paint)
  | ({ kind: "circle"; cx: number; cy: number; r: number } & Paint)
  | ({ kind: "rect"; x: number; y: number; w: number; h: number; rx?: number } & Paint)
  | ({ kind: "line"; x1: number; y1: number; x2: number; y2: number } & Paint)
  | TextEl
  /** Mono text set around a full circle, clockwise from the left, spaced to fit. */
  | { kind: "ring"; cx: number; cy: number; r: number; text: string; size: number; fill: string }
  /** Code 128 bars, `modules` wide in total, stretched across `w`. */
  | { kind: "bars"; x: number; y: number; w: number; h: number; bars: Bar[]; modules: number; fill: string }

/** Text, vertically centred on y, with the defaults most stickers use. */
function text(
  t: string,
  x: number,
  y: number,
  o: Partial<Omit<TextEl, "kind" | "text" | "x" | "y">> & { size: number; fill: string }
): TextEl {
  return {
    kind: "text",
    x,
    y,
    text: t,
    font: o.font ?? "mono",
    size: o.size,
    weight: o.weight ?? 700,
    fill: o.fill,
    anchor: o.anchor ?? "middle",
    spacing: o.spacing ?? 0,
    opacity: o.opacity ?? 1,
    rotate: o.rotate ?? 0,
  }
}

/** The certificate's short name, as large as fits `width`. */
function name(
  t: string,
  x: number,
  y: number,
  width: number,
  max: number,
  fill: string,
  anchor: TextEl["anchor"] = "middle"
): TextEl {
  return text(t, x, y, { font: "display", weight: 800, size: fitSyne(t, width, max), fill, anchor })
}

export function stickerElements(cert: Certification, style: StickerStyle, shape: StickerShape): StickerEl[] {
  const { fill, text: ink, accent } = style
  const issuer = issuerCode(cert.issuer)
  const year = issuedYear(cert.issued)
  const star = cert.featured ? "★" : null

  switch (shape) {
    case "burst":
      return [
        { kind: "circle", cx: 110, cy: 110, r: 72, stroke: accent, strokeOpacity: 0.35, strokeWidth: 1.5 },
        text(issuer, 110, 78, { size: 10, spacing: 2.5, fill: accent }),
        name(cert.short, 110, 110, 124, 40, ink),
        text(year, 110, 144, { size: 13, fill: ink, opacity: 0.8 }),
      ]

    case "shield":
      return [
        {
          kind: "path",
          d: "M 34 43 Q 95 22 156 43 L 156 112 Q 156 164 95 193 Q 34 164 34 112 Z",
          stroke: style.rule ?? accent,
          strokeOpacity: 0.7,
          strokeWidth: 1.5,
        },
        text(issuer, 95, 70, { size: 11, spacing: 3, fill: accent }),
        name(cert.short, 95, 114, 104, 40, ink),
        text(year, 95, 152, { size: 13, fill: ink, opacity: 0.8 }),
        ...(star ? [text(star, 95, 176, { size: 13, fill: accent })] : []),
      ]

    case "scallop":
      return [
        { kind: "circle", cx: 110, cy: 110, r: 80, stroke: accent, strokeOpacity: 0.55, strokeWidth: 1.5 },
        { kind: "circle", cx: 110, cy: 110, r: 74, stroke: accent, strokeOpacity: 0.45, strokeWidth: 1, dash: [2, 4] },
        text(issuer, 110, 80, { size: 10, spacing: 3, fill: accent }),
        name(cert.short, 110, 112, 118, 36, ink),
        text(star ? `${star} ${year} ${star}` : year, 110, 144, { size: 12, fill: ink, opacity: 0.85 }),
      ]

    case "hex":
      return [
        {
          kind: "path",
          d: "M 73 27 L 167 27 L 211 105 L 167 183 L 73 183 L 29 105 Z",
          stroke: accent,
          strokeOpacity: 0.4,
          strokeWidth: 1.5,
        },
        text(issuer, 120, 64, { size: 11, spacing: 3, fill: accent }),
        name(cert.short, 120, 106, 162, 44, ink),
        text(star ? `${year} ${star}` : year, 120, 148, { size: 13, fill: ink, opacity: 0.8 }),
      ]

    case "circle":
      return [
        { kind: "ring", cx: 105, cy: 105, r: 79, text: `${issuer} · ${year} · `.repeat(2), size: 11.5, fill: accent },
        { kind: "circle", cx: 105, cy: 105, r: 64, stroke: accent, strokeOpacity: 0.4, strokeWidth: 1.5 },
        name(cert.short, 105, 105, 104, 38, ink),
      ]

    case "pill":
      return [
        { kind: "circle", cx: 60, cy: 60, r: 34, fill: accent },
        text(year, 60, 60, { size: 14, fill }),
        text(issuer, 106, 42, { size: 10, spacing: 2.5, fill: accent, anchor: "start" }),
        name(cert.short, 106, 74, 168, 34, ink, "start"),
      ]

    case "ticket":
      return [
        { kind: "line", x1: 222, y1: 22, x2: 222, y2: 128, stroke: accent, strokeOpacity: 0.6, strokeWidth: 1.5, dash: [4, 5] },
        text(issuer, 32, 40, { size: 10, spacing: 2.5, fill: accent, anchor: "start" }),
        name(cert.short, 32, 78, 174, 34, ink, "start"),
        ...(cert.credentialId
          ? [text(`Nº ${cert.credentialId}`, 32, 114, { size: 9.5, spacing: 1, fill: ink, anchor: "start", opacity: 0.7, weight: 500 })]
          : []),
        text(year, 256, 75, { size: 17, spacing: 2, fill: ink, rotate: -90 }),
      ]

    case "label": {
      const els: StickerEl[] = [
        // Inverted band across the top, cut along the same fold as the label.
        { kind: "path", d: "M 24 10 H 238 L 270 42 V 46 H 10 V 24 A 14 14 0 0 1 24 10 Z", fill: ink },
        text(issuer, 28, 28, { size: 11, spacing: 2.5, fill, anchor: "start" }),
        text(year, 226, 28, { size: 11, fill, anchor: "end", opacity: 0.85 }),
        name(cert.short, 140, 78, 220, 30, ink),
      ]
      if (cert.credentialId) {
        // Dark bars on a light plate with quiet zones, whatever the sticker's
        // colours: an inverted barcode is one most scanners will not read.
        const { bars, width } = code128Bars(cert.credentialId)
        const w = 212
        els.push(
          { kind: "rect", x: 140 - w / 2, y: 96, w, h: 46, rx: 3, fill: VINYL },
          { kind: "bars", x: 140 - w / 2, y: 100, w, h: 38, bars, modules: width, fill: "#0A0A0A" },
          text(cert.credentialId, 140, 152, { size: 10, spacing: 3, fill: ink, weight: 500 })
        )
      } else {
        els.push(text(cert.issued, 140, 124, { size: 11, fill: ink }))
      }
      return els
    }

    case "grid": {
      // A spreadsheet: column letters, row numbers, cell lines, one selected cell.
      const els: StickerEl[] = [
        { kind: "path", d: "M 22 10 H 228 A 12 12 0 0 1 240 22 V 30 H 10 V 22 A 12 12 0 0 1 22 10 Z", fill: accent, fillOpacity: 0.14 },
      ]
      ;["A", "B", "C", "D", "E", "F"].forEach((c, i) =>
        els.push(text(c, 46 + i * 37, 20, { size: 8.5, fill: ink, opacity: 0.6, weight: 500 }))
      )
      ;[1, 2, 3, 4, 5, 6].forEach((r, i) =>
        els.push(text(String(r), 19, 41 + i * 22, { size: 8.5, fill: ink, opacity: 0.6, weight: 500 }))
      )
      for (const x of [28, 65, 102, 139, 176, 213]) {
        els.push({ kind: "line", x1: x, y1: 10, x2: x, y2: 170, stroke: accent, strokeOpacity: 0.22, strokeWidth: 1 })
      }
      for (const y of [30, 52, 74, 96, 118, 140]) {
        els.push({ kind: "line", x1: 10, y1: y, x2: 240, y2: y, stroke: accent, strokeOpacity: 0.22, strokeWidth: 1 })
      }
      els.push(
        { kind: "rect", x: 46, y: 64, w: 176, h: 56, fill, stroke: accent, strokeWidth: 2.5 },
        // The fill handle on the selection's corner.
        { kind: "rect", x: 218, y: 116, w: 8, h: 8, fill: accent, stroke: fill, strokeWidth: 1.5 },
        name(cert.short, 134, 92, 156, 30, ink),
        text(issuer, 28, 150, { size: 9.5, spacing: 2, fill: accent, anchor: "start" }),
        text(year, 224, 150, { size: 10.5, fill: ink, anchor: "end", opacity: 0.85 })
      )
      return els
    }

    case "rect":
    default:
      return [
        ...(style.rule
          ? [{ kind: "rect", x: 19, y: 19, w: 218, h: 132, rx: 15, stroke: style.rule, strokeWidth: 1.5 } as StickerEl]
          : []),
        text(issuer, 34, 44, { size: 10, spacing: 3, fill: accent, anchor: "start" }),
        name(cert.short, 34, 88, 188, 40, ink, "start"),
        { kind: "line", x1: 34, y1: 116, x2: 222, y2: 116, stroke: accent, strokeOpacity: 0.35, strokeWidth: 1.5 },
        text(year, 34, 138, { size: 12, fill: ink, anchor: "start", opacity: 0.8 }),
        ...(star ? [text(star, 222, 138, { size: 13, fill: accent, anchor: "end" })] : []),
      ]
  }
}
