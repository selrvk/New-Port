// components/laptop/screens/drawSkills.ts
//
// The Skills screen: a ⌘K command palette.
//
// Deliberately NOT a browser. Projects already owns that, and a second one would
// read as the same idea twice. A palette has a completely different silhouette — a
// floating card over a dimmed desktop rather than full-bleed chrome with tabs — it
// is developer-native, and it matches the IDE metaphor the static Skills section
// already uses.
//
// The query field fills in lockstep with the physical keys lighting up, which is
// what makes a lit key legible: you can read the word it is spelling.

import { skillCategories, totalMappedSkills } from "@/data/skills-map"

import { COLORS } from "../config"
import { smoothstep } from "../lib/keyframes"
import { skillsCursor } from "../skills/glow"
import {
  clearScreen,
  cursorVisible,
  display,
  drawScanlines,
  drawVignette,
  ellipsize,
  mono,
  roundRect,
  type ScreenCtx,
} from "../lib/canvas2d"

export const drawSkills: (s: ScreenCtx) => void = (s) => {
  const { ctx, w, h, t } = s
  const cur = skillsCursor(t)

  drawBackdrop(s, cur.category.group)

  // ── Palette card ──
  const cardW = Math.round(w * 0.74)
  const cardX = Math.round((w - cardW) / 2)
  const cardY = Math.round(h * 0.13)
  const cardH = Math.round(h * 0.74)

  ctx.save()
  ctx.shadowColor = "rgba(0,0,0,0.6)"
  ctx.shadowBlur = Math.round(h * 0.05)
  ctx.shadowOffsetY = Math.round(h * 0.012)
  ctx.fillStyle = "#101316"
  roundRect(ctx, cardX, cardY, cardW, cardH, 14)
  ctx.fill()
  ctx.restore()

  ctx.strokeStyle = "rgba(240,237,230,0.10)"
  ctx.lineWidth = 1
  roundRect(ctx, cardX, cardY, cardW, cardH, 14)
  ctx.stroke()

  // ── Query field ──
  const fieldH = Math.round(h * 0.115)
  const padX = Math.round(cardW * 0.045)
  const fieldCy = cardY + fieldH / 2

  ctx.font = mono(Math.round(fieldH * 0.38), 400)
  ctx.textBaseline = "middle"
  ctx.fillStyle = COLORS.screenDim
  ctx.fillText("⌘K", cardX + padX, fieldCy)
  const promptW = ctx.measureText("⌘K").width

  const queryX = cardX + padX + promptW + Math.round(w * 0.022)
  const querySize = Math.round(fieldH * 0.46)
  ctx.font = mono(querySize, 500)
  ctx.fillStyle = COLORS.paper
  ctx.fillText(cur.typed, queryX, fieldCy)

  // Caret sits after the typed text while typing, then blinks in place.
  const caretX = queryX + ctx.measureText(cur.typed).width + 4
  if (cur.typeT >= 1 ? cursorVisible(cur.frac * 26) : true) {
    ctx.fillStyle = COLORS.neon
    ctx.fillRect(caretX, fieldCy - querySize * 0.56, 2, querySize * 1.12)
  }

  // Ghost of the remaining characters, so the word reads before it finishes.
  if (cur.typed.length < cur.category.query.length) {
    ctx.globalAlpha = 0.16
    ctx.fillStyle = COLORS.paper
    ctx.fillText(cur.category.query.slice(cur.typed.length), caretX + 6, fieldCy)
    ctx.globalAlpha = 1
  }

  // Result count, right-aligned.
  ctx.font = mono(Math.round(fieldH * 0.26), 500)
  ctx.fillStyle = COLORS.screenDim
  const count = cur.resultsT > 0 ? `${cur.category.skills.length} results` : "…"
  ctx.fillText(count, cardX + cardW - padX - ctx.measureText(count).width, fieldCy)

  ctx.fillStyle = "rgba(240,237,230,0.09)"
  ctx.fillRect(cardX, cardY + fieldH, cardW, 1)

  // ── Results ──
  drawResults(s, cur, cardX, cardY + fieldH, cardW, cardH - fieldH, padX)

  // ── Footer ──
  ctx.font = mono(Math.round(h * 0.024), 400)
  ctx.fillStyle = "rgba(240,237,230,0.22)"
  const footer = `${cur.index + 1} of ${skillCategories.length} · ${totalMappedSkills} skills indexed`
  ctx.fillText(footer, cardX, cardY + cardH + Math.round(h * 0.045))

  drawScanlines(s, 0.04)
  drawVignette(s, 0.42)
}

/** Dimmed "desktop" behind the palette, with the parent group ghosted large. */
function drawBackdrop(s: ScreenCtx, group: string) {
  const { ctx, w, h } = s
  clearScreen(s, "#07090B")

  ctx.strokeStyle = "rgba(240,237,230,0.030)"
  ctx.lineWidth = 1
  const step = Math.round(w * 0.055)
  ctx.beginPath()
  for (let x = 0; x <= w; x += step) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
  }
  for (let y = 0; y <= h; y += step) {
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
  }
  ctx.stroke()

  ctx.save()
  ctx.textBaseline = "middle"
  ctx.font = display(Math.round(h * 0.115), 800)
  ctx.fillStyle = "rgba(240,237,230,0.045)"
  const label = group.toUpperCase()
  ctx.fillText(label, (w - ctx.measureText(label).width) / 2, h * 0.5)
  ctx.restore()
}

function drawResults(
  s: ScreenCtx,
  cur: ReturnType<typeof skillsCursor>,
  x: number,
  y: number,
  w: number,
  h: number,
  padX: number
) {
  const { ctx, h: H } = s
  const skills = cur.category.skills

  // Two columns once a list gets long.
  //
  // This camera frames the keyboard AND the screen, so the display is a good deal
  // smaller in frame than it is during Projects. Twelve single rows would be
  // physically legible on the texture but unreadable on screen; halving the row
  // count roughly doubles the type size.
  const cols = skills.length > 7 ? 2 : 1
  const rows = Math.ceil(skills.length / cols)
  const colW = (w - padX * 2) / cols

  const headY = y + H * 0.038
  ctx.font = mono(Math.round(H * 0.026), 500)
  ctx.textBaseline = "middle"
  ctx.fillStyle = COLORS.screenDim
  ctx.fillText(cur.category.label.toUpperCase(), x + padX, headY)

  const listTop = y + H * 0.075
  const listH = h - (listTop - y) - H * 0.03
  const rowH = Math.min(Math.round(H * 0.088), Math.floor(listH / rows))
  const nameSize = Math.round(rowH * 0.46)
  const tagSize = Math.round(rowH * 0.26)

  for (let i = 0; i < skills.length; i++) {
    const rowT = rowReveal(cur.resultsT, i, skills.length)
    if (rowT <= 0.001) continue

    const col = Math.floor(i / rows)
    const rowInCol = i % rows
    const cx = x + padX + col * colW
    const rowY = listTop + rowInCol * rowH
    const cy = rowY + rowH / 2
    const slide = (1 - rowT) * w * 0.03

    ctx.save()
    ctx.globalAlpha = rowT

    // First row reads as the highlighted selection, as a palette would show.
    if (i === 0) {
      ctx.fillStyle = "rgba(232,255,71,0.10)"
      roundRect(ctx, cx - padX * 0.4, rowY + 2, colW - 6, rowH - 4, 6)
      ctx.fill()
      ctx.fillStyle = COLORS.neon
      ctx.fillRect(cx - padX * 0.4, rowY + 2, 2, rowH - 4)
    }

    ctx.beginPath()
    ctx.arc(cx + 4 - slide, cy, Math.max(2, rowH * 0.06), 0, Math.PI * 2)
    ctx.fillStyle = i === 0 ? COLORS.neon : "rgba(240,237,230,0.30)"
    ctx.fill()

    ctx.font = display(nameSize, 700)
    ctx.fillStyle = i === 0 ? COLORS.paper : "rgba(240,237,230,0.80)"
    const nameX = cx + rowH * 0.32 - slide
    ctx.fillText(ellipsize(ctx, skills[i].name, colW - rowH * 0.9), nameX, cy)

    // Provenance tag only where there is room for it.
    if (cols === 1) {
      ctx.font = mono(tagSize, 400)
      ctx.fillStyle = "rgba(240,237,230,0.26)"
      const tag = skills[i].from
      ctx.fillText(tag, x + w - padX - ctx.measureText(tag).width, cy)
    }

    ctx.restore()
  }
}

/**
 * Staggered reveal, normalised by row count.
 *
 * The stagger used to be a fixed per-row delay, so a 12-item category needed 87% of
 * its slot before the last row landed — leaving almost nothing to read it. Spreading
 * the same window across however many rows there are means every category finishes
 * at the same point regardless of length.
 */
function rowReveal(resultsT: number, i: number, count: number): number {
  const STAGGER_WINDOW = 0.45
  const ROW_FADE = 0.2
  const start = count <= 1 ? 0 : (i / count) * STAGGER_WINDOW
  return smoothstep(start, start + ROW_FADE, resultsT)
}
