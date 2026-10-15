// components/keys/Sticker.tsx
//
// A certification sticker as SVG, for the text version.
//
// The design itself — shapes, layout, fitted text, finishes — lives in
// components/laptop/lib/stickerDesign.ts, shared with the 3D lid, which draws the
// same display list onto canvas textures (stickerTexture.ts). This file only
// translates it into SVG.
//
// SVG here rather than HTML because the text then scales with the sticker exactly,
// and the cut shapes, rings of text and barcode are native to it. Decorative: the
// section lists every certificate in full beside the lid, and the lid is
// aria-hidden.

import type { ReactNode } from "react"

import {
  FLAP,
  GEOMETRY,
  GRAIN_OPACITY,
  HOLO,
  HOLO_OPACITY,
  RIM,
  SHEEN,
  VINYL,
  stickerElements,
  type Gradient,
  type StickerEl,
} from "@/components/laptop/lib/stickerDesign"
import type { StickerStyle } from "@/components/laptop/lib/stickerStyles"
import type { Certification, StickerShape } from "@/data/certifications"

export { shapeFor } from "@/components/laptop/lib/stickerDesign"

export function stickerSize(shape: StickerShape): { w: number; h: number } {
  const { w, h } = GEOMETRY[shape]
  return { w, h }
}

function Grad({ id, g, w, h }: { id: string; g: Gradient; w: number; h: number }) {
  return (
    <linearGradient
      id={id}
      gradientUnits="userSpaceOnUse"
      x1={(g.x1 ?? 0) * w}
      y1={(g.y1 ?? 0) * h}
      x2={g.x2 * w}
      y2={g.y2 * h}
    >
      {g.stops.map(([offset, color, opacity]) => (
        <stop key={offset} offset={offset} stopColor={color} stopOpacity={opacity} />
      ))}
    </linearGradient>
  )
}

function render(el: StickerEl, i: number, id: string): ReactNode {
  switch (el.kind) {
    case "path":
    case "circle":
    case "rect":
    case "line": {
      const paint = {
        fill: el.fill ?? "none",
        fillOpacity: el.fillOpacity,
        stroke: el.stroke,
        strokeOpacity: el.strokeOpacity,
        strokeWidth: el.strokeWidth,
        strokeDasharray: el.dash?.join(" "),
      }
      if (el.kind === "path") return <path key={i} d={el.d} {...paint} />
      if (el.kind === "circle") return <circle key={i} cx={el.cx} cy={el.cy} r={el.r} {...paint} />
      if (el.kind === "rect")
        return <rect key={i} x={el.x} y={el.y} width={el.w} height={el.h} rx={el.rx} {...paint} />
      return <line key={i} x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} {...paint} />
    }
    case "text":
      return (
        <text
          key={i}
          className={el.font === "display" ? "stk-name" : "stk-mono"}
          x={el.x}
          y={el.y}
          fontSize={el.size.toFixed(2)}
          fontWeight={el.weight}
          letterSpacing={el.spacing || undefined}
          textAnchor={el.anchor}
          dominantBaseline="central"
          fill={el.fill}
          opacity={el.opacity < 1 ? el.opacity : undefined}
          transform={el.rotate ? `rotate(${el.rotate} ${el.x} ${el.y})` : undefined}
        >
          {el.text}
        </text>
      )
    case "ring": {
      const ringId = `${id}-ring-${i}`
      const { cx, cy, r } = el
      return (
        <g key={i}>
          <defs>
            <path id={ringId} d={`M ${cx - r} ${cy} a ${r} ${r} 0 1 1 ${2 * r} 0 a ${r} ${r} 0 1 1 ${-2 * r} 0`} />
          </defs>
          <text className="stk-mono" fontSize={el.size} fontWeight={700} fill={el.fill} dominantBaseline="central">
            <textPath href={`#${ringId}`} textLength={2 * Math.PI * r - 6} lengthAdjust="spacing">
              {el.text}
            </textPath>
          </text>
        </g>
      )
    }
    case "bars":
      return (
        <g key={i} transform={`translate(${el.x} ${el.y}) scale(${el.w / el.modules} 1)`}>
          {el.bars.map((b) => (
            <rect key={b.x} x={b.x} y={0} width={b.width} height={el.h} fill={el.fill} />
          ))}
        </g>
      )
  }
}

type Props = {
  cert: Certification
  style: StickerStyle
  shape: StickerShape
}

export function Sticker({ cert, style, shape }: Props) {
  const { w, h, path } = GEOMETRY[shape]
  const id = `stk-${cert.id}`
  const use = `#${id}-shape`
  return (
    <svg className="stk__svg" viewBox={`0 0 ${w} ${h}`} aria-hidden="true" focusable="false">
      <defs>
        <path id={`${id}-shape`} d={path} />
        <Grad id={`${id}-sheen`} g={SHEEN} w={w} h={h} />
        {cert.featured ? <Grad id={`${id}-holo`} g={HOLO} w={w} h={h} /> : null}
        {shape === "label" ? <Grad id={`${id}-flap`} g={FLAP.gradient} w={w} h={h} /> : null}
      </defs>
      {/* The white vinyl edge: the cut path stroked wide underneath the face. */}
      <use href={use} fill={VINYL} stroke={VINYL} strokeWidth={RIM * 2} strokeLinejoin="round" />
      <use href={use} fill={style.fill} />
      <use href={use} fill="#000" filter="url(#stk-grain)" opacity={GRAIN_OPACITY} />
      {stickerElements(cert, style, shape).map((el, i) => render(el, i, id))}
      {cert.featured ? (
        <use href={use} className="stk__holo" fill={`url(#${id}-holo)`} opacity={HOLO_OPACITY} />
      ) : null}
      <use href={use} className="stk__sheen" fill={`url(#${id}-sheen)`} />
      {shape === "label" ? (
        <>
          <path
            d={FLAP.path}
            fill="#000"
            opacity={FLAP.shadow.opacity}
            transform={`translate(${FLAP.shadow.dx} ${FLAP.shadow.dy})`}
          />
          <path d={FLAP.path} fill={`url(#${id}-flap)`} stroke={VINYL} strokeWidth={1} strokeLinejoin="round" />
        </>
      ) : null}
    </svg>
  )
}

/**
 * The grain filter every sticker on the page shares. Rendered once, invisibly;
 * url(#…) references resolve across inline SVGs in the same document.
 */
export function StickerDefs() {
  return (
    <svg className="stk-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <filter id="stk-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" stitchTiles="stitch" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0" result="grain" />
          <feComposite in="grain" in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
    </svg>
  )
}
