// components/laptop/screens/drawCerts.ts
//
// The Certifications screen.
//
// The camera is behind the lid for most of this section, so the display is facing
// away and largely unseen — this only has to hold up during the orbit in and out.
// It is a verification log: each credential checking off as its sticker lands, so
// the screen and the lid are telling the same story from opposite sides.

import { issuerCode, sortedCertifications } from "@/data/certifications"

import { COLORS, STICKERS } from "../config"
import { clamp01, smoothstep } from "../lib/keyframes"
import {
  clearScreen,
  drawScanlines,
  drawVignette,
  ellipsize,
  mono,
  type ScreenCtx,
} from "../lib/canvas2d"

export const drawCerts: (s: ScreenCtx) => void = (s) => {
  const { ctx, w, h, t } = s
  clearScreen(s, COLORS.screenBg)

  const pad = Math.round(w * 0.06)
  ctx.textBaseline = "middle"

  ctx.font = mono(Math.round(h * 0.032), 500)
  ctx.fillStyle = COLORS.screenDim
  ctx.fillText("$ verify --credentials", pad, pad + h * 0.012)

  const rowH = Math.round(h * 0.072)
  let y = pad + h * 0.10

  for (let i = 0; i < sortedCertifications.length; i++) {
    // Mirrors the sticker landing schedule so the two sides stay in step.
    const slotStart = (i / sortedCertifications.length) * STICKERS.landSpan
    const land = clamp01((t - slotStart) / STICKERS.landDuration)
    if (land <= 0) break

    const cert = sortedCertifications[i]
    const reveal = smoothstep(0, 0.5, land)
    const cy = y + rowH / 2

    ctx.save()
    ctx.globalAlpha = reveal

    ctx.font = mono(Math.round(h * 0.030), 700)
    ctx.fillStyle = land > 0.55 ? COLORS.neon : "rgba(240,237,230,0.25)"
    ctx.fillText(land > 0.55 ? "[ ok ]" : "[ .. ]", pad, cy)
    const markW = ctx.measureText("[ ok ] ").width

    ctx.font = mono(Math.round(h * 0.030), 500)
    ctx.fillStyle = COLORS.paper
    ctx.fillText(ellipsize(ctx, cert.short, w * 0.34), pad + markW, cy)

    ctx.font = mono(Math.round(h * 0.026), 400)
    ctx.fillStyle = "rgba(240,237,230,0.34)"
    const code = issuerCode(cert.issuer)
    ctx.fillText(code, w - pad - ctx.measureText(code).width, cy)

    ctx.restore()
    y += rowH
  }

  ctx.font = mono(Math.round(h * 0.026), 500)
  ctx.fillStyle = COLORS.screenDim
  const done = sortedCertifications.filter((_, i) => {
    const slotStart = (i / sortedCertifications.length) * STICKERS.landSpan
    return clamp01((t - slotStart) / STICKERS.landDuration) > 0.55
  }).length
  ctx.fillText(
    `${done} / ${sortedCertifications.length} verified`,
    pad,
    h - pad - h * 0.01
  )

  drawScanlines(s, 0.045)
  drawVignette(s, 0.4)
}
