// components/keys/Sticker.tsx
//
// One certificate as a real-looking vinyl sticker, drawn as SVG.
//
// What makes a sticker read as a sticker, and what each layer here is for:
//   · A die-cut shape, different per sticker — a collection gathered over time is
//     never a matching set. Shapes come from data/certifications.ts (`shape`).
//   · The white vinyl edge, following the shape exactly: the same path stroked
//     wide in off-white underneath the face.
//   · A matte grain on the face, a glossy diagonal sheen over everything, and a
//     holographic film on the featured ones.
//   · A cast shadow (CSS drop-shadow, which follows the cut shape, not a box).
//
// SVG rather than HTML because the text then scales with the sticker exactly — no
// container units to resolve against the wrong box — and the shapes, rings of text
// and the barcode are all native to it. Colourways are the 3D lid's
// (stickerStyles.ts), so a certificate is the same colour in both versions.
//
// Everything is decorative: the section renders the full, readable record of each
// certificate beside the lid, and the lid is aria-hidden.

import type { ReactNode } from "react"

import type { StickerStyle } from "@/components/laptop/lib/stickerStyles"
import { issuedYear, issuerCode, type Certification, type StickerShape } from "@/data/certifications"

import { code128Bars } from "./code128"

/** The vinyl's off-white, as on the 3D stickers. */
const VINYL = "#F4F1EA"
/** Half the white edge's width, in viewBox units. Shapes keep this clear of the edge. */
const RIM = 8

// ── Fitting text ─────────────────────────────────────────────────────────────

/**
 * Advance widths of Syne ExtraBold, in thousandths of an em, measured from the
 * loaded font in the browser (canvas measureText). Summing them matches the
 * browser's own measurement of whole names to within 1%, which is what lets a
 * name be sized to fit its sticker on the server, with no layout pass.
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
function fitSyne(text: string, width: number, max: number): number {
  return Math.min(max, width / Math.max(syneEm(text), 0.5))
}

// ── Shapes ───────────────────────────────────────────────────────────────────

type Geometry = { w: number; h: number; path: string }

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

const GEOMETRY: Record<StickerShape, Geometry> = {
  burst: { w: 220, h: 220, path: starPath(110, 110, 14, 100, 86) },
  shield: {
    w: 190,
    h: 220,
    path: "M 22 34 Q 95 10 168 34 L 168 112 Q 168 172 95 206 Q 22 172 22 112 Z",
  },
  scallop: { w: 220, h: 220, path: scallopPath(110, 110, 22, 92, 110) },
  hex: { w: 240, h: 210, path: "M 66 14 L 174 14 L 226 105 L 174 196 L 66 196 L 14 105 Z" },
  circle: {
    w: 210,
    h: 210,
    path: "M 105 9 A 96 96 0 1 1 104.99 9 Z",
  },
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
  // The top-right corner is cut along the fold: it has peeled back (see Label).
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

export function stickerSize(shape: StickerShape): { w: number; h: number } {
  const { w, h } = GEOMETRY[shape]
  return { w, h }
}

// ── Layouts ──────────────────────────────────────────────────────────────────

type Parts = {
  cert: Certification
  style: StickerStyle
  issuer: string
  year: string
}

const Mono = ({
  x,
  y,
  size,
  fill,
  spacing = 0,
  anchor = "middle",
  opacity,
  weight = 700,
  children,
}: {
  x: number
  y: number
  size: number
  fill: string
  spacing?: number
  anchor?: "start" | "middle" | "end"
  opacity?: number
  weight?: number
  children: ReactNode
}) => (
  <text
    className="stk-mono"
    x={x}
    y={y}
    fontSize={size}
    fontWeight={weight}
    letterSpacing={spacing}
    textAnchor={anchor}
    dominantBaseline="central"
    fill={fill}
    opacity={opacity}
  >
    {children}
  </text>
)

const Name = ({
  x,
  y,
  width,
  max,
  fill,
  anchor = "middle",
  text,
}: {
  x: number
  y: number
  width: number
  max: number
  fill: string
  anchor?: "start" | "middle"
  text: string
}) => (
  <text
    className="stk-name"
    x={x}
    y={y}
    fontSize={fitSyne(text, width, max).toFixed(2)}
    textAnchor={anchor}
    dominantBaseline="central"
    fill={fill}
  >
    {text}
  </text>
)

function Content({ shape, cert, style, issuer, year }: Parts & { shape: StickerShape }): ReactNode {
  const { fill, text, accent } = style
  const star = cert.featured ? "★" : null

  switch (shape) {
    case "burst":
      return (
        <>
          <circle cx={110} cy={110} r={72} fill="none" stroke={accent} strokeOpacity={0.35} strokeWidth={1.5} />
          <Mono x={110} y={78} size={10} spacing={2.5} fill={accent}>
            {issuer}
          </Mono>
          <Name x={110} y={110} width={124} max={40} fill={text} text={cert.short} />
          <Mono x={110} y={144} size={13} fill={text} opacity={0.8}>
            {year}
          </Mono>
        </>
      )

    case "shield":
      return (
        <>
          <path
            d="M 34 43 Q 95 22 156 43 L 156 112 Q 156 164 95 193 Q 34 164 34 112 Z"
            fill="none"
            stroke={style.rule ?? accent}
            strokeOpacity={0.7}
            strokeWidth={1.5}
          />
          <Mono x={95} y={70} size={11} spacing={3} fill={accent}>
            {issuer}
          </Mono>
          <Name x={95} y={114} width={104} max={40} fill={text} text={cert.short} />
          <Mono x={95} y={152} size={13} fill={text} opacity={0.8}>
            {year}
          </Mono>
          {star ? (
            <Mono x={95} y={176} size={13} fill={accent}>
              {star}
            </Mono>
          ) : null}
        </>
      )

    case "scallop":
      return (
        <>
          <circle cx={110} cy={110} r={80} fill="none" stroke={accent} strokeOpacity={0.55} strokeWidth={1.5} />
          <circle
            cx={110}
            cy={110}
            r={74}
            fill="none"
            stroke={accent}
            strokeOpacity={0.45}
            strokeWidth={1}
            strokeDasharray="2 4"
          />
          <Mono x={110} y={80} size={10} spacing={3} fill={accent}>
            {issuer}
          </Mono>
          <Name x={110} y={112} width={118} max={36} fill={text} text={cert.short} />
          <Mono x={110} y={144} size={12} fill={text} opacity={0.85}>
            {star ? `${star} ${year} ${star}` : year}
          </Mono>
        </>
      )

    case "hex":
      return (
        <>
          <path
            d="M 73 27 L 167 27 L 211 105 L 167 183 L 73 183 L 29 105 Z"
            fill="none"
            stroke={accent}
            strokeOpacity={0.4}
            strokeWidth={1.5}
          />
          <Mono x={120} y={64} size={11} spacing={3} fill={accent}>
            {issuer}
          </Mono>
          <Name x={120} y={106} width={162} max={44} fill={text} text={cert.short} />
          <Mono x={120} y={148} size={13} fill={text} opacity={0.8}>
            {star ? `${year} ${star}` : year}
          </Mono>
        </>
      )

    case "circle": {
      const ring = `${issuer} · ${year} · `.repeat(2)
      const id = `stk-ring-${cert.id}`
      return (
        <>
          <defs>
            <path id={id} d="M 105 105 m -79 0 a 79 79 0 1 1 158 0 a 79 79 0 1 1 -158 0" />
          </defs>
          <text className="stk-mono" fontSize={11.5} fontWeight={700} fill={accent} dominantBaseline="central">
            <textPath href={`#${id}`} textLength={2 * Math.PI * 79 - 6} lengthAdjust="spacing">
              {ring}
            </textPath>
          </text>
          <circle cx={105} cy={105} r={64} fill="none" stroke={accent} strokeOpacity={0.4} strokeWidth={1.5} />
          <Name x={105} y={105} width={104} max={38} fill={text} text={cert.short} />
        </>
      )
    }

    case "pill":
      return (
        <>
          <circle cx={60} cy={60} r={34} fill={accent} />
          <Mono x={60} y={60} size={14} fill={fill}>
            {year}
          </Mono>
          <Mono x={106} y={42} size={10} spacing={2.5} fill={accent} anchor="start">
            {issuer}
          </Mono>
          <Name x={106} y={74} width={168} max={34} fill={text} anchor="start" text={cert.short} />
        </>
      )

    case "ticket":
      return (
        <>
          <line
            x1={222}
            y1={22}
            x2={222}
            y2={128}
            stroke={accent}
            strokeOpacity={0.6}
            strokeWidth={1.5}
            strokeDasharray="4 5"
          />
          <Mono x={32} y={40} size={10} spacing={2.5} fill={accent} anchor="start">
            {issuer}
          </Mono>
          <Name x={32} y={78} width={174} max={34} fill={text} anchor="start" text={cert.short} />
          {cert.credentialId ? (
            <Mono x={32} y={114} size={9.5} spacing={1} fill={text} anchor="start" opacity={0.7} weight={500}>
              {`Nº ${cert.credentialId}`}
            </Mono>
          ) : null}
          <g transform="translate(256 75) rotate(-90)">
            <Mono x={0} y={0} size={17} spacing={2} fill={text}>
              {year}
            </Mono>
          </g>
        </>
      )

    case "label": {
      // Default quiet zone (10 modules a side) included: scanners need the margin.
      const bars = cert.credentialId ? code128Bars(cert.credentialId) : null
      const barWidth = 212
      const scale = bars ? barWidth / bars.width : 1
      return (
        <>
          {/* Inverted band across the top, cut along the same fold as the label. */}
          <path d="M 24 10 H 238 L 270 42 V 46 H 10 V 24 A 14 14 0 0 1 24 10 Z" fill={text} />
          <Mono x={28} y={28} size={11} spacing={2.5} fill={fill} anchor="start">
            {issuer}
          </Mono>
          <Mono x={226} y={28} size={11} fill={fill} anchor="end" opacity={0.85}>
            {year}
          </Mono>
          <Name x={140} y={78} width={220} max={30} fill={text} text={cert.short} />
          {bars ? (
            <>
              {/* Dark bars on a light plate, whatever the sticker's colours: an
                  inverted barcode is one most scanners will not read. */}
              <rect x={140 - barWidth / 2} y={96} width={barWidth} height={46} rx={3} fill={VINYL} />
              <g transform={`translate(${140 - barWidth / 2} 100) scale(${scale} 1)`}>
                {bars.bars.map((b) => (
                  <rect key={b.x} x={b.x} y={0} width={b.width} height={38} fill="#0A0A0A" />
                ))}
              </g>
              <Mono x={140} y={152} size={10} spacing={3} fill={text} weight={500}>
                {cert.credentialId}
              </Mono>
            </>
          ) : (
            <Mono x={140} y={124} size={11} fill={text}>
              {cert.issued}
            </Mono>
          )}
        </>
      )
    }

    case "grid": {
      // A spreadsheet: column letters, row numbers, cell lines, one selected cell.
      const cols = ["A", "B", "C", "D", "E", "F"]
      return (
        <>
          <path d="M 22 10 H 228 A 12 12 0 0 1 240 22 V 30 H 10 V 22 A 12 12 0 0 1 22 10 Z" fill={accent} fillOpacity={0.14} />
          {cols.map((c, i) => (
            <Mono key={c} x={46 + i * 37} y={20} size={8.5} fill={text} opacity={0.6} weight={500}>
              {c}
            </Mono>
          ))}
          {[1, 2, 3, 4, 5, 6].map((r, i) => (
            <Mono key={r} x={19} y={41 + i * 22} size={8.5} fill={text} opacity={0.6} weight={500}>
              {r}
            </Mono>
          ))}
          <g stroke={accent} strokeOpacity={0.22} strokeWidth={1}>
            {[28, 65, 102, 139, 176, 213].map((x) => (
              <line key={x} x1={x} y1={10} x2={x} y2={170} />
            ))}
            {[30, 52, 74, 96, 118, 140].map((y) => (
              <line key={y} x1={10} y1={y} x2={240} y2={y} />
            ))}
          </g>
          <rect x={46} y={64} width={176} height={56} fill={fill} stroke={accent} strokeWidth={2.5} />
          <rect x={218} y={116} width={8} height={8} fill={accent} stroke={fill} strokeWidth={1.5} />
          <Name x={134} y={92} width={156} max={30} fill={text} text={cert.short} />
          <Mono x={28} y={150} size={9.5} spacing={2} fill={accent} anchor="start">
            {issuer}
          </Mono>
          <Mono x={224} y={150} size={10.5} fill={text} anchor="end" opacity={0.85}>
            {year}
          </Mono>
        </>
      )
    }

    case "rect":
    default:
      return (
        <>
          {style.rule ? (
            <rect x={19} y={19} width={218} height={132} rx={15} fill="none" stroke={style.rule} strokeWidth={1.5} />
          ) : null}
          <Mono x={34} y={44} size={10} spacing={3} fill={accent} anchor="start">
            {issuer}
          </Mono>
          <Name x={34} y={88} width={188} max={40} fill={text} anchor="start" text={cert.short} />
          <line x1={34} y1={116} x2={222} y2={116} stroke={accent} strokeOpacity={0.35} strokeWidth={1.5} />
          <Mono x={34} y={138} size={12} fill={text} anchor="start" opacity={0.8}>
            {year}
          </Mono>
          {star ? (
            <Mono x={222} y={138} size={13} fill={accent} anchor="end">
              {star}
            </Mono>
          ) : null}
        </>
      )
  }
}

// ── The sticker ──────────────────────────────────────────────────────────────

type Props = {
  cert: Certification
  style: StickerStyle
  shape: StickerShape
}

export function Sticker({ cert, style, shape }: Props) {
  const geo = GEOMETRY[shape]
  const shapeId = `stk-shape-${cert.id}`
  const use = `#${shapeId}`
  return (
    <svg className="stk__svg" viewBox={`0 0 ${geo.w} ${geo.h}`} aria-hidden="true" focusable="false">
      <defs>
        <path id={shapeId} d={geo.path} />
      </defs>
      {/* The white vinyl edge: the cut path stroked wide underneath the face. */}
      <use href={use} fill={VINYL} stroke={VINYL} strokeWidth={RIM * 2} strokeLinejoin="round" />
      <use href={use} fill={style.fill} />
      {/* Matte grain, masked to the face. */}
      <use href={use} fill="#000" filter="url(#stk-grain)" opacity={0.14} />
      <Content shape={shape} cert={cert} style={style} issuer={issuerCode(cert.issuer)} year={issuedYear(cert.issued)} />
      {cert.featured ? <use href={use} className="stk__holo" fill="url(#stk-holo)" /> : null}
      <use href={use} className="stk__sheen" fill="url(#stk-sheen)" />
      {shape === "label" ? (
        // The peeled corner: the fold flap showing the sticker's white backing.
        <>
          <path d="M 238 10 L 270 42 L 238 42 Z" fill="#000" opacity={0.28} transform="translate(2 3)" />
          <path d="M 238 10 L 270 42 L 238 42 Z" fill="url(#stk-flap)" stroke={VINYL} strokeWidth={1} strokeLinejoin="round" />
        </>
      ) : null}
    </svg>
  )
}

/**
 * Gradients and the grain filter every sticker on the page shares. Rendered once,
 * invisibly; url(#…) references resolve across inline SVGs in the same document.
 */
export function StickerDefs() {
  return (
    <svg className="stk-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="stk-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.38" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="stk-holo" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0" stopColor="#FF6AD5" />
          <stop offset="0.2" stopColor="#C774E8" />
          <stop offset="0.38" stopColor="#8795E8" />
          <stop offset="0.55" stopColor="#94D0FF" />
          <stop offset="0.72" stopColor="#A7FFCF" />
          <stop offset="1" stopColor="#FFEF9F" />
        </linearGradient>
        <linearGradient id="stk-flap" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#CFCAC0" />
        </linearGradient>
        <filter id="stk-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" stitchTiles="stitch" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0" result="grain" />
          <feComposite in="grain" in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
    </svg>
  )
}
