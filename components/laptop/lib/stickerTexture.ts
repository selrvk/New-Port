"use client"

// components/laptop/lib/stickerTexture.ts
//
// Generates one sticker texture per certification.
//
// Drawn rather than shipped as image files: there are ten of them, they need to
// stay in step with data/certifications.ts, and drawing means a new cert becomes a
// sticker automatically instead of requiring an asset.
//
// Each has a die-cut border — the white outline real vinyl stickers have — which is
// what stops them reading as flat rectangles printed on the lid.

import * as THREE from "three"

import { issuedYear, issuerCode, type Certification } from "@/data/certifications"
import { COLORS } from "../config"
import { display, fitFontSize, mono, roundRect } from "./canvas2d"

const W = 512
const H = 340

type Style = {
  fill: string
  text: string
  accent: string
  /** Border drawn just inside the die-cut edge. */
  rule?: string
}

/**
 * A small palette so the lid looks collected-over-time rather than art-directed.
 * Featured certs get the loud ones.
 */
const FEATURED_STYLES: Style[] = [
  { fill: COLORS.neon, text: "#0A0A0A", accent: "#0A0A0A" },
  { fill: "#101316", text: COLORS.neon, accent: COLORS.neon, rule: COLORS.neon },
  { fill: COLORS.hot, text: COLORS.paper, accent: COLORS.paper },
]

const PLAIN_STYLES: Style[] = [
  { fill: COLORS.paper, text: "#0A0A0A", accent: "#0A0A0A" },
  { fill: "#171A1E", text: COLORS.paper, accent: COLORS.hot, rule: "rgba(240,237,230,0.25)" },
  { fill: "#232830", text: COLORS.paper, accent: COLORS.neon },
]

export function makeStickerTexture(cert: Certification, index: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")!

  const pool = cert.featured ? FEATURED_STYLES : PLAIN_STYLES
  const style = pool[index % pool.length]

  ctx.clearRect(0, 0, W, H)

  // Die-cut: an opaque paper edge slightly larger than the coloured face.
  const pad = 10
  const radius = 26
  ctx.fillStyle = "#F4F1EA"
  roundRect(ctx, pad, pad, W - pad * 2, H - pad * 2, radius)
  ctx.fill()

  const inset = pad + 9
  ctx.fillStyle = style.fill
  roundRect(ctx, inset, inset, W - inset * 2, H - inset * 2, radius - 7)
  ctx.fill()

  if (style.rule) {
    ctx.strokeStyle = style.rule
    ctx.lineWidth = 2
    roundRect(ctx, inset + 8, inset + 8, W - (inset + 8) * 2, H - (inset + 8) * 2, radius - 12)
    ctx.stroke()
  }

  const left = inset + 26
  const right = W - inset - 26
  const innerW = right - left

  // Issuer, letterspaced across the top.
  ctx.textBaseline = "middle"
  const code = issuerCode(cert.issuer)
  const codeSize = fitFontSize(ctx, code, innerW, 30, (s) => mono(s, 700))
  ctx.font = mono(codeSize, 700)
  ctx.fillStyle = style.accent
  ctx.globalAlpha = 0.85
  ctx.fillText(spaced(code), left, inset + 44)
  ctx.globalAlpha = 1

  // Short name, the sticker's actual subject.
  const nameSize = fitFontSize(ctx, cert.short, innerW, 62, (s) => display(s, 800))
  ctx.font = display(nameSize, 800)
  ctx.fillStyle = style.text
  ctx.fillText(cert.short, left, H / 2 + 6)

  // Rule + year along the bottom.
  ctx.fillStyle = style.accent
  ctx.globalAlpha = 0.35
  ctx.fillRect(left, H - inset - 58, innerW, 2)
  ctx.globalAlpha = 1

  ctx.font = mono(24, 500)
  ctx.fillStyle = style.text
  ctx.globalAlpha = 0.75
  ctx.fillText(issuedYear(cert.issued), left, H - inset - 30)
  ctx.globalAlpha = 1

  if (cert.featured) {
    ctx.font = mono(26, 700)
    ctx.fillStyle = style.accent
    const star = "★"
    ctx.fillText(star, right - ctx.measureText(star).width, H - inset - 30)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/** Letterspacing, which canvas 2D has no property for. */
function spaced(text: string): string {
  return text.split("").join(" ")
}
