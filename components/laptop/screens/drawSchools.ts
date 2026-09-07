// components/laptop/screens/drawSchools.ts
//
// The Education screen: your schooling as a git history.
//
// Rendered as `git log --graph` rather than a plain CHANGELOG, because About is a
// README and Contact is a terminal — a graph rail with commit dots and tags reads
// as its own thing rather than a third page of monospace text.
//
// Entries land oldest-first, so the history builds toward the school you are at
// now, which ends on HEAD.

import { education } from "@/data/education"

import { COLORS } from "../config"
import { clamp01, smoothstep } from "../lib/keyframes"
import {
  clearScreen,
  drawScanlines,
  drawVignette,
  ellipsize,
  mono,
  roundRect,
  type ScreenCtx,
} from "../lib/canvas2d"

/**
 * Fraction of the section across which entries start appearing.
 *
 * Deliberately well short of 1: at 0.82 the last school landed at 93% of the
 * section, leaving almost no scroll to take in the finished history. Finishing
 * earlier buys a real hold on the complete log.
 */
const REVEAL_SPAN = 0.62
/** Fraction of the section one entry takes to appear. */
const REVEAL_DURATION = 0.2

/**
 * Stable pseudo-hash per entry. Deterministic so it never changes between frames
 * or reloads — a hash that flickered would read as corruption.
 */
function shortHash(seed: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7)
}

export const drawSchools: (s: ScreenCtx) => void = (s) => {
  const { ctx, w, h, t } = s
  clearScreen(s, COLORS.screenBg)

  const padX = Math.round(w * 0.062)
  const count = education.length

  // ── Header ──
  ctx.textBaseline = "middle"
  ctx.font = mono(Math.round(h * 0.030), 500)
  ctx.fillStyle = COLORS.screenDim
  ctx.fillText("$ git log --graph --tags --reverse", padX, h * 0.062)

  ctx.fillStyle = "rgba(240,237,230,0.08)"
  ctx.fillRect(padX, h * 0.10, w - padX * 2, 1)

  // ── Rows ──
  const top = h * 0.145
  const bottom = h * 0.055
  const rowH = (h - top - bottom) / count
  const railX = padX + Math.round(w * 0.026)

  const revealOf = (i: number) =>
    smoothstep(0, 1, clamp01((t - (i / count) * REVEAL_SPAN) / REVEAL_DURATION))

  // Graph rail, drawn only as far as the history has been revealed.
  const lastVisible = education.reduce((acc, _, i) => (revealOf(i) > 0.02 ? i : acc), -1)
  if (lastVisible >= 0) {
    const y0 = top + rowH / 2
    const y1 = top + lastVisible * rowH + rowH / 2
    // Weight is in CANVAS pixels on a 1600px-wide texture, so a 2px rail renders
    // sub-pixel once the screen is mapped onto the lid — drawn, but invisible.
    ctx.strokeStyle = "rgba(232,255,71,0.45)"
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(railX, y0)
    ctx.lineTo(railX, y1)
    ctx.stroke()
  }

  for (let i = 0; i < count; i++) {
    const reveal = revealOf(i)
    if (reveal <= 0.001) continue

    const entry = education[i]
    const cy = top + i * rowH + rowH / 2
    const slide = (1 - reveal) * w * 0.03

    ctx.save()
    ctx.globalAlpha = reveal

    // Commit dot — filled for HEAD, hollow for history.
    const r = Math.max(4, rowH * 0.11)
    ctx.beginPath()
    ctx.arc(railX, cy, r, 0, Math.PI * 2)
    if (entry.current) {
      ctx.fillStyle = COLORS.neon
      ctx.fill()
    } else {
      ctx.fillStyle = COLORS.screenBg
      ctx.fill()
      ctx.strokeStyle = "rgba(240,237,230,0.55)"
      ctx.lineWidth = 4
      ctx.stroke()
    }

    // Three text lines per row, positioned explicitly rather than by eye: at this
    // row height the school name and the degree were overlapping.
    const lineTag = cy - rowH * 0.30
    const lineSchool = cy + rowH * 0.02
    const lineMeta = cy + rowH * 0.33

    const textX = railX + Math.round(w * 0.038) - slide
    const rightX = w - padX

    // Tag badge + hash on the first line.
    const tagSize = Math.round(rowH * 0.24)
    ctx.font = mono(tagSize, 700)
    const tagW = ctx.measureText(entry.version).width
    const padTag = tagSize * 0.6
    ctx.fillStyle = entry.current ? COLORS.neon : "rgba(240,237,230,0.10)"
    roundRect(ctx, textX, lineTag - tagSize * 0.85, tagW + padTag * 2, tagSize * 1.7, 4)
    ctx.fill()
    ctx.fillStyle = entry.current ? COLORS.screenBg : "rgba(240,237,230,0.65)"
    ctx.fillText(entry.version, textX + padTag, lineTag)

    ctx.font = mono(Math.round(rowH * 0.21), 400)
    ctx.fillStyle = "rgba(240,237,230,0.22)"
    const hash = shortHash(entry.school + entry.year)
    ctx.fillText(hash, textX + tagW + padTag * 2 + w * 0.014, lineTag)

    if (entry.current) {
      ctx.font = mono(Math.round(rowH * 0.2), 700)
      ctx.fillStyle = COLORS.neon
      const head = "HEAD -> main"
      ctx.fillText(head, rightX - ctx.measureText(head).width, lineTag)
    }

    // School on the second line, degree and year on the third.
    ctx.font = mono(Math.round(rowH * 0.27), 600)
    ctx.fillStyle = entry.current ? COLORS.paper : "rgba(240,237,230,0.88)"
    ctx.fillText(ellipsize(ctx, entry.school, w * 0.62), textX, lineSchool)

    ctx.font = mono(Math.round(rowH * 0.21), 400)
    ctx.fillStyle = "rgba(240,237,230,0.46)"
    ctx.fillText(ellipsize(ctx, entry.degree, w * 0.52), textX, lineMeta)

    ctx.fillStyle = "rgba(240,237,230,0.34)"
    ctx.fillText(entry.year, rightX - ctx.measureText(entry.year).width, lineMeta)

    ctx.restore()
  }

  drawScanlines(s, 0.04)
  drawVignette(s, 0.4)
}
