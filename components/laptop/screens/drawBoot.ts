// components/laptop/screens/drawBoot.ts
//
// The Hero screen: a machine powering on.
//
// Three phases across the Hero section's local 0→1:
//   0.00–0.315  dark — the lid is still opening, the panel is genuinely off
//   0.315–0.63  POST — boot lines land one at a time while the backlight stutters
//   0.63–1.00   settled — the identity card the camera pushes in on
//
// The stutter itself lives in SCREEN.bootFlicker and is applied to emissive
// intensity by ScreenSurface; here we only mirror it in the drawn brightness so
// the glow and the picture agree.

import { certifications } from "@/data/certifications"
import { education } from "@/data/education"
import { languages } from "@/data/languages"
import { profile } from "@/data/profile"
import { projects } from "@/data/projects"
import { totalMappedSkills } from "@/data/skills-map"

import { COLORS, SCREEN } from "../config"
import { clamp01, sampleTable, smoothstep } from "../lib/keyframes"
import {
  clearScreen,
  cursorVisible,
  display,
  drawScanlines,
  drawVignette,
  fitFontSize,
  mono,
  nameLines,
  type ScreenCtx,
  typed,
} from "../lib/canvas2d"

/** POST lines. Counts come from the real data so they can never drift. */
const BOOT_LINES: readonly [string, string][] = [
  ["display", `${SCREEN.canvas.width}x${SCREEN.canvas.height} · 60hz`],
  ["input", "keyboard · es-iso"],
  ["projects", `${projects.length} loaded`],
  ["skills", `${totalMappedSkills} indexed`],
  ["certifications", `${certifications.length} verified`],
  ["education", `${education.length} records`],
  ["languages", languages.map((l) => l.code.toLowerCase()).join(" · ")],
]

// Local-t phase boundaries. Must stay in step with SCREEN.bootFlicker, which is
// also expressed in hero-local t. With the hero at 3.2vh these give roughly
// 1.0vh dark (lid opening), 1.0vh of POST log, and 1.2vh of the name card.
const PHASE_DARK_END = 0.315
const PHASE_POST_END = 0.63

// Where the name card finishes cross-dissolving in. Most of the card's phase used
// to be spent mid-dissolve, so it was on screen far longer than it was actually
// readable; ending the fade earlier buys real hold time without extra scroll.
const PHASE_SETTLED = 0.82

export const drawBoot: (s: ScreenCtx) => void = (s) => {
  const { ctx, w, h, t } = s

  // Brightness follows the same flicker table that drives the emissive glow.
  const flicker = sampleTable(SCREEN.bootFlicker, t)

  clearScreen(s, "#05070A")
  if (flicker <= 0.001) {
    // Genuinely off: just the faint sheen of dark glass.
    drawVignette(s, 0.5)
    return
  }

  ctx.save()
  ctx.globalAlpha = flicker

  const pad = Math.round(w * 0.075)
  const postT = clamp01((t - PHASE_DARK_END) / (PHASE_POST_END - PHASE_DARK_END))
  const settleT = smoothstep(PHASE_POST_END, PHASE_SETTLED, t)

  // ── POST log ──────────────────────────────────────────────────────────────
  // Fades out as the identity card takes over, so the two phases cross-dissolve.
  const logAlpha = 1 - settleT
  if (logAlpha > 0.01) {
    ctx.save()
    ctx.globalAlpha = flicker * logAlpha
    ctx.textBaseline = "top"

    const lineH = Math.round(h * 0.052)
    let y = pad

    ctx.font = mono(Math.round(h * 0.032), 500)
    ctx.fillStyle = COLORS.screenDim
    ctx.fillText(`${profile.name.toLowerCase().replace(/\s+/g, ".")} — portfolio ${profile.year}`, pad, y)
    y += lineH * 1.35

    const shown = postT * BOOT_LINES.length
    for (let i = 0; i < BOOT_LINES.length; i++) {
      const lineT = clamp01(shown - i)
      if (lineT <= 0) break
      const [label, detail] = BOOT_LINES[i]

      ctx.font = mono(Math.round(h * 0.034), 500)
      ctx.fillStyle = COLORS.neon
      ctx.fillText("[ ok ]", pad, y)

      const labelX = pad + ctx.measureText("[ ok ] ").width
      ctx.fillStyle = COLORS.paper
      ctx.fillText(typed(label, clamp01(lineT * 2.2)), labelX, y)

      if (lineT > 0.55) {
        ctx.font = mono(Math.round(h * 0.03), 400)
        ctx.fillStyle = COLORS.screenDim
        ctx.globalAlpha = flicker * logAlpha * smoothstep(0.55, 0.95, lineT)
        ctx.fillText(detail, w - pad - ctx.measureText(detail).width, y + 2)
        ctx.globalAlpha = flicker * logAlpha
      }
      y += lineH
    }

    // Cursor trailing the log while it is still filling.
    if (postT < 1) {
      ctx.font = mono(Math.round(h * 0.034), 500)
      const cw = ctx.measureText("M").width
      if (cursorVisible(t * 40)) {
        ctx.fillStyle = COLORS.neon
        ctx.fillRect(pad, y + 4, cw, Math.round(h * 0.034))
      }
    }
    ctx.restore()
  }

  // ── Identity card ─────────────────────────────────────────────────────────
  if (settleT > 0.01) {
    ctx.save()
    ctx.globalAlpha = flicker * settleT
    ctx.textBaseline = "alphabetic"

    // Slides up a little as it resolves.
    const rise = (1 - settleT) * h * 0.05
    const cx = pad
    const maxWidth = w - pad * 2

    ctx.font = mono(Math.round(h * 0.032), 500)
    ctx.fillStyle = COLORS.neon
    ctx.fillText("● online", cx, h * 0.30 + rise)

    // The name is stacked, and each line is fitted to the panel width rather than
    // sized as a fraction of it — "CHARLES ALCANTARA" on one line measured wider
    // than the canvas and ran off the edge.
    const lines = nameLines(profile.name.toUpperCase())
    const cap = Math.round(h * 0.155)
    let size = cap
    for (const line of lines) {
      size = Math.min(size, fitFontSize(ctx, line, maxWidth, cap, (s) => display(s, 800)))
    }

    const lineGap = Math.round(size * 0.98)
    let y = h * 0.46 + rise
    ctx.font = display(size, 800)
    for (let i = 0; i < lines.length; i++) {
      ctx.fillStyle = i === 0 ? COLORS.paper : COLORS.neon
      ctx.fillText(lines[i], cx, y)
      y += lineGap
    }

    // Accent rule under the name.
    ctx.fillStyle = COLORS.neon
    ctx.fillRect(cx, y - Math.round(size * 0.62), Math.round(w * 0.16), 3)

    y += Math.round(h * 0.022)
    const titleSize = fitFontSize(ctx, profile.title, maxWidth, Math.round(h * 0.038), (s) =>
      mono(s, 500)
    )
    ctx.font = mono(titleSize, 500)
    ctx.fillStyle = COLORS.screenDim
    ctx.fillText(profile.title, cx, y)

    y += Math.round(h * 0.055)
    ctx.font = mono(Math.round(h * 0.034), 400)
    ctx.fillStyle = COLORS.hot
    ctx.fillText(profile.location, cx, y)

    ctx.restore()
  }

  ctx.restore()
  drawScanlines(s, 0.05 * flicker)
  drawVignette(s, 0.4)
}
