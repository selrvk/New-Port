"use client"

// components/laptop/lib/stickerTexture.ts
//
// The certification stickers for the back of the 3D lid, painted onto canvas
// textures.
//
// The design — die-cut shape, layout, fitted text, finishes — is shared with the
// text version and lives in stickerDesign.ts; this paints its display list with
// canvas 2D, as components/keys/Sticker.tsx renders it as SVG. Path2D accepts the
// same SVG path strings, so every cut is literally the same outline.
//
// Each texture is transparent outside its cut, so the plane carrying it shows only
// the sticker's shape. The canvas also gets a margin all round for a painted
// shadow: planes lying flush on the lid cannot cast one, and without it the
// stickers read as printed on rather than stuck on.
//
// Painting happens twice: once at mount, and again once web fonts have loaded
// (see Stickers.tsx). Canvas text drawn before then falls back to a system face,
// and names are sized for Syne's real widths.

import * as THREE from "three"

import type { Certification, StickerShape } from "@/data/certifications"

import { display, mono } from "./canvas2d"
import {
  FLAP,
  GEOMETRY,
  GRAIN_OPACITY,
  HOLO,
  HOLO_OPACITY,
  RIM,
  SHEEN,
  VINYL,
  shapeFor,
  stickerElements,
  type Gradient,
  type StickerEl,
  type TextEl,
} from "./stickerDesign"
import { stickerStyle } from "./stickerStyles"

/** Texture pixels per viewBox unit — about twice the size it is ever seen at. */
const PX = 2.4
/** Transparent margin, in viewBox units, that the painted shadow falls into. */
export const STICKER_PAD = 14

/** The sticker's full extent, margin included, in viewBox units. */
export function paddedSize(shape: StickerShape): { w: number; h: number } {
  const { w, h } = GEOMETRY[shape]
  return { w: w + STICKER_PAD * 2, h: h + STICKER_PAD * 2 }
}

export function makeStickerTexture(cert: Certification, index: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  paintSticker(canvas, cert, index)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/** Paint (or repaint) sticker `index` of sortedCertifications onto `canvas`. */
export function paintSticker(canvas: HTMLCanvasElement, cert: Certification, index: number): void {
  const shape = shapeFor(cert, index)
  const geo = GEOMETRY[shape]
  const style = stickerStyle(cert, index)
  const padded = paddedSize(shape)

  canvas.width = Math.round(padded.w * PX)
  canvas.height = Math.round(padded.h * PX)
  const ctx = canvas.getContext("2d")!
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  // From here on, draw in the design's own viewBox units.
  ctx.setTransform(PX, 0, 0, PX, STICKER_PAD * PX, STICKER_PAD * PX)

  const cut = new Path2D(geo.path)

  // 1. The white vinyl edge, casting the sticker's shadow onto the lid. Shadow
  //    offsets are in device pixels, unaffected by the transform.
  ctx.save()
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
  ctx.shadowBlur = 7 * PX
  ctx.shadowOffsetY = 3 * PX
  ctx.strokeStyle = VINYL
  ctx.lineWidth = RIM * 2
  ctx.lineJoin = "round"
  ctx.stroke(cut)
  ctx.restore()
  ctx.fillStyle = VINYL
  ctx.fill(cut)

  // 2. The face, with its matte grain.
  ctx.fillStyle = style.fill
  ctx.fill(cut)
  ctx.save()
  ctx.clip(cut)
  ctx.globalAlpha = GRAIN_OPACITY
  ctx.fillStyle = grainPattern(ctx)
  ctx.fillRect(0, 0, geo.w, geo.h)
  ctx.restore()

  // 3. The content.
  for (const el of stickerElements(cert, style, shape)) drawElement(ctx, el)

  // 4. Holographic film on the featured ones, and 5. the sheen over everything.
  if (cert.featured) {
    ctx.save()
    ctx.clip(cut)
    ctx.globalCompositeOperation = "soft-light"
    ctx.globalAlpha = HOLO_OPACITY
    ctx.fillStyle = gradient(ctx, HOLO, geo.w, geo.h)
    ctx.fillRect(0, 0, geo.w, geo.h)
    ctx.restore()
  }
  ctx.save()
  ctx.clip(cut)
  ctx.fillStyle = gradient(ctx, SHEEN, geo.w, geo.h)
  ctx.fillRect(0, 0, geo.w, geo.h)
  ctx.restore()

  // 6. The label's peeled-back corner.
  if (shape === "label") {
    const flap = new Path2D(FLAP.path)
    ctx.save()
    ctx.translate(FLAP.shadow.dx, FLAP.shadow.dy)
    ctx.globalAlpha = FLAP.shadow.opacity
    ctx.fillStyle = "#000"
    ctx.fill(flap)
    ctx.restore()
    ctx.fillStyle = gradient(ctx, FLAP.gradient, geo.w, geo.h)
    ctx.fill(flap)
    ctx.strokeStyle = VINYL
    ctx.lineWidth = 1
    ctx.lineJoin = "round"
    ctx.stroke(flap)
  }
}

// ── Finishes ─────────────────────────────────────────────────────────────────

function gradient(ctx: CanvasRenderingContext2D, g: Gradient, w: number, h: number): CanvasGradient {
  const lg = ctx.createLinearGradient((g.x1 ?? 0) * w, (g.y1 ?? 0) * h, g.x2 * w, g.y2 * h)
  for (const [offset, color, opacity] of g.stops) lg.addColorStop(offset, withAlpha(color, opacity))
  return lg
}

function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

/** One tile of random speckle, made once and repeated: the canvas grain. */
let grainTile: HTMLCanvasElement | null = null
function grainPattern(ctx: CanvasRenderingContext2D): CanvasPattern {
  if (!grainTile) {
    grainTile = document.createElement("canvas")
    grainTile.width = grainTile.height = 96
    const g = grainTile.getContext("2d")!
    const img = g.createImageData(96, 96)
    for (let i = 0; i < img.data.length; i += 4) {
      img.data[i + 3] = Math.random() < 0.5 ? Math.round(Math.random() * 150) : 0
    }
    g.putImageData(img, 0, 0)
  }
  const pattern = ctx.createPattern(grainTile, "repeat")!
  // Undo the drawing scale so each speckle is one texture pixel.
  pattern.setTransform(new DOMMatrix().scale(1 / PX))
  return pattern
}

// ── The display list ─────────────────────────────────────────────────────────

function drawElement(ctx: CanvasRenderingContext2D, el: StickerEl): void {
  switch (el.kind) {
    case "path":
    case "circle":
    case "rect":
    case "line": {
      const p = new Path2D()
      if (el.kind === "path") p.addPath(new Path2D(el.d))
      else if (el.kind === "circle") p.arc(el.cx, el.cy, el.r, 0, Math.PI * 2)
      else if (el.kind === "rect") {
        if (el.rx) p.roundRect(el.x, el.y, el.w, el.h, el.rx)
        else p.rect(el.x, el.y, el.w, el.h)
      } else {
        p.moveTo(el.x1, el.y1)
        p.lineTo(el.x2, el.y2)
      }
      ctx.save()
      if (el.fill && el.kind !== "line") {
        ctx.globalAlpha = el.fillOpacity ?? 1
        ctx.fillStyle = el.fill
        ctx.fill(p)
      }
      if (el.stroke) {
        ctx.globalAlpha = el.strokeOpacity ?? 1
        ctx.strokeStyle = el.stroke
        ctx.lineWidth = el.strokeWidth ?? 1
        ctx.setLineDash(el.dash ?? [])
        ctx.stroke(p)
      }
      ctx.restore()
      return
    }
    case "text":
      drawText(ctx, el)
      return
    case "ring":
      drawRing(ctx, el)
      return
    case "bars": {
      const sx = el.w / el.modules
      ctx.fillStyle = el.fill
      for (const b of el.bars) ctx.fillRect(el.x + b.x * sx, el.y, b.width * sx, el.h)
      return
    }
  }
}

function fontFor(el: Pick<TextEl, "font" | "size" | "weight">): string {
  return el.font === "display" ? display(el.size, el.weight) : mono(el.size, el.weight)
}

/**
 * Text, centred on y like SVG's dominant-baseline="central". Letter-spaced text is
 * set a character at a time — canvas letterSpacing is not everywhere yet — with
 * the space after every character, including the last, as SVG adds it.
 */
function drawText(ctx: CanvasRenderingContext2D, el: TextEl): void {
  ctx.save()
  ctx.globalAlpha = el.opacity
  ctx.fillStyle = el.fill
  ctx.font = fontFor(el)
  ctx.textBaseline = "middle"
  ctx.translate(el.x, el.y)
  if (el.rotate) ctx.rotate((el.rotate * Math.PI) / 180)

  if (!el.spacing) {
    ctx.textAlign = el.anchor === "middle" ? "center" : el.anchor === "end" ? "right" : "left"
    ctx.fillText(el.text, 0, 0)
  } else {
    const chars = [...el.text]
    const widths = chars.map((c) => ctx.measureText(c).width)
    const total = widths.reduce((a, b) => a + b, 0) + chars.length * el.spacing
    let x = el.anchor === "middle" ? -total / 2 : el.anchor === "end" ? -total : 0
    ctx.textAlign = "left"
    chars.forEach((c, i) => {
      ctx.fillText(c, x, 0)
      x += widths[i] + el.spacing
    })
  }
  ctx.restore()
}

/**
 * Text around a full circle, clockwise from the left — what SVG's textPath does
 * with textLength and lengthAdjust="spacing": natural glyph widths, with the slack
 * shared out evenly between them.
 */
function drawRing(ctx: CanvasRenderingContext2D, el: Extract<StickerEl, { kind: "ring" }>): void {
  ctx.save()
  ctx.fillStyle = el.fill
  ctx.font = mono(el.size, 700)
  ctx.textBaseline = "middle"
  ctx.textAlign = "center"
  const chars = [...el.text]
  const widths = chars.map((c) => ctx.measureText(c).width)
  const length = 2 * Math.PI * el.r - 6
  const gap = (length - widths.reduce((a, b) => a + b, 0)) / chars.length
  let s = 0
  chars.forEach((c, i) => {
    const a = Math.PI + (s + widths[i] / 2) / el.r
    ctx.save()
    ctx.translate(el.cx + el.r * Math.cos(a), el.cy + el.r * Math.sin(a))
    ctx.rotate(a + Math.PI / 2)
    ctx.fillText(c, 0, 0)
    ctx.restore()
    s += widths[i] + gap
  })
  ctx.restore()
}
