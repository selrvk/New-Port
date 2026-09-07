// components/laptop/screens/drawLanguages.ts
//
// The Languages screen: an OS "Input Sources" preference pane.
//
// A settings window is the one common desktop surface none of the other screens
// occupy — Projects is a browser, Skills a command palette, Schools a git log,
// About a README, Contact a terminal. It is also the honest place for this: input
// sources are literally where you would switch a keyboard layout, which is what the
// physical keys below are doing at the same moment.

import { changedKeys, languages, levelAccent } from "@/data/languages"

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

export const drawLanguages: (s: ScreenCtx) => void = (s) => {
  const { ctx, w, h, t } = s
  clearScreen(s, "#07090B")

  const raw = t * languages.length
  const index = Math.min(languages.length - 1, Math.floor(raw))
  const frac = clamp01(raw - index)
  const active = languages[index]
  const previous = index > 0 ? languages[index - 1] : null
  const changed = changedKeys(previous, active)

  // ── Window ──
  const winX = w * 0.07
  const winY = h * 0.09
  const winW = w - winX * 2
  const winH = h - winY * 2

  ctx.save()
  ctx.shadowColor = "rgba(0,0,0,0.55)"
  ctx.shadowBlur = h * 0.04
  ctx.shadowOffsetY = h * 0.01
  ctx.fillStyle = "#12161A"
  roundRect(ctx, winX, winY, winW, winH, 12)
  ctx.fill()
  ctx.restore()

  ctx.strokeStyle = "rgba(240,237,230,0.10)"
  ctx.lineWidth = 1
  roundRect(ctx, winX, winY, winW, winH, 12)
  ctx.stroke()

  // Title bar
  const barH = h * 0.085
  ctx.fillStyle = "rgba(255,255,255,0.03)"
  roundRect(ctx, winX, winY, winW, barH, 12)
  ctx.fill()
  ctx.fillStyle = "rgba(240,237,230,0.08)"
  ctx.fillRect(winX, winY + barH, winW, 1)

  const dotR = h * 0.010
  const dots = ["#FF5F57", "#FEBC2E", "#28C840"]
  dots.forEach((c, i) => {
    ctx.beginPath()
    ctx.arc(winX + h * 0.035 + i * h * 0.032, winY + barH / 2, dotR, 0, Math.PI * 2)
    ctx.fillStyle = c
    ctx.globalAlpha = 0.75
    ctx.fill()
    ctx.globalAlpha = 1
  })

  ctx.textBaseline = "middle"
  ctx.font = mono(Math.round(h * 0.028), 600)
  ctx.fillStyle = "rgba(240,237,230,0.72)"
  const title = "Keyboard — Input Sources"
  ctx.fillText(title, winX + winW / 2 - ctx.measureText(title).width / 2, winY + barH / 2)

  // ── Sidebar: the list of input sources ──
  const padIn = h * 0.036
  const listX = winX + padIn
  const listY = winY + barH + padIn
  const listW = winW * 0.38
  const rowH = h * 0.115

  ctx.font = mono(Math.round(h * 0.022), 500)
  ctx.fillStyle = "rgba(240,237,230,0.32)"
  ctx.fillText("INPUT SOURCES", listX, listY)

  for (let i = 0; i < languages.length; i++) {
    const lang = languages[i]
    const y = listY + h * 0.045 + i * rowH
    const isActive = i === index
    // The selection slides onto the active row rather than snapping.
    const sel = isActive ? smoothstep(0, 0.25, frac) : 0

    if (isActive) {
      ctx.fillStyle = `rgba(232,255,71,${(0.08 + 0.07 * sel).toFixed(3)})`
      roundRect(ctx, listX - padIn * 0.4, y, listW, rowH * 0.86, 6)
      ctx.fill()
      ctx.fillStyle = COLORS.neon
      ctx.fillRect(listX - padIn * 0.4, y, 3, rowH * 0.86)
    }

    ctx.font = mono(Math.round(h * 0.026), 700)
    ctx.fillStyle = isActive ? COLORS.neon : "rgba(240,237,230,0.34)"
    ctx.fillText(lang.code, listX + padIn * 0.4, y + rowH * 0.28)

    ctx.font = mono(Math.round(h * 0.030), isActive ? 600 : 400)
    ctx.fillStyle = isActive ? COLORS.paper : "rgba(240,237,230,0.60)"
    ctx.fillText(lang.name, listX + padIn * 2.4, y + rowH * 0.28)

    ctx.font = mono(Math.round(h * 0.021), 400)
    ctx.fillStyle = "rgba(240,237,230,0.30)"
    ctx.fillText(lang.endonym, listX + padIn * 2.4, y + rowH * 0.58)
  }

  // ── Detail pane ──
  const detX = winX + winW * 0.46
  const detW = winW * 0.46
  let y = listY + h * 0.01

  ctx.font = mono(Math.round(h * 0.022), 500)
  ctx.fillStyle = "rgba(240,237,230,0.32)"
  ctx.fillText("SELECTED", detX, y)
  y += h * 0.058

  ctx.font = mono(Math.round(h * 0.042), 700)
  ctx.fillStyle = COLORS.paper
  ctx.fillText(ellipsize(ctx, active.endonym, detW), detX, y)
  y += h * 0.056

  // Proficiency
  const accent = levelAccent[active.level] === "hot" ? COLORS.hot : COLORS.neon
  ctx.font = mono(Math.round(h * 0.024), 600)
  ctx.fillStyle = accent
  ctx.fillText(active.level.toUpperCase(), detX, y)
  const pctLabel = `${active.percent}%`
  ctx.fillStyle = "rgba(240,237,230,0.45)"
  ctx.fillText(pctLabel, detX + detW - ctx.measureText(pctLabel).width, y)
  y += h * 0.032

  const barW = detW
  ctx.fillStyle = "rgba(240,237,230,0.10)"
  ctx.fillRect(detX, y, barW, 4)
  ctx.fillStyle = accent
  ctx.fillRect(detX, y, barW * (active.percent / 100) * smoothstep(0, 0.4, frac), 4)
  y += h * 0.052

  ctx.font = mono(Math.round(h * 0.023), 400)
  ctx.fillStyle = "rgba(240,237,230,0.50)"
  ctx.fillText(ellipsize(ctx, active.note, detW), detX, y)
  y += h * 0.055

  // Layout + what it did to the physical keys.
  ctx.fillStyle = "rgba(240,237,230,0.08)"
  ctx.fillRect(detX, y, detW, 1)
  y += h * 0.045

  ctx.font = mono(Math.round(h * 0.022), 500)
  ctx.fillStyle = "rgba(240,237,230,0.32)"
  ctx.fillText("LAYOUT", detX, y)
  y += h * 0.038

  ctx.font = mono(Math.round(h * 0.026), 600)
  ctx.fillStyle = COLORS.paper
  ctx.fillText(ellipsize(ctx, active.layout, detW), detX, y)
  y += h * 0.048

  const remapPulse = Math.exp(-frac * 5)
  ctx.font = mono(Math.round(h * 0.023), 500)
  if (changed.length) {
    ctx.fillStyle = `rgba(232,255,71,${(0.55 + 0.45 * remapPulse).toFixed(3)})`
    ctx.fillText(`⌁ ${changed.length} keys remapped`, detX, y)
  } else {
    ctx.fillStyle = "rgba(240,237,230,0.34)"
    ctx.fillText("no keys remapped", detX, y)
  }
  y += h * 0.038

  if (active.note2) {
    ctx.font = mono(Math.round(h * 0.020), 400)
    ctx.fillStyle = "rgba(240,237,230,0.32)"
    ctx.fillText(ellipsize(ctx, active.note2, detW), detX, y)
  }

  // Footer tying the panel to the hardware below.
  ctx.font = mono(Math.round(h * 0.020), 400)
  ctx.fillStyle = "rgba(240,237,230,0.24)"
  const foot = "the keys below relabel to match"
  ctx.fillText(foot, winX + winW / 2 - ctx.measureText(foot).width / 2, winY + winH - h * 0.032)

  drawScanlines(s, 0.04)
  drawVignette(s, 0.4)
}
