// components/laptop/screens/drawProjects.ts
//
// The Projects screen: a browser, painted onto the laptop's display.
//
// Tab strip, address bar and content area, laid out from PROJECTS_LAYOUT so the
// clickable tab regions (see tabAtUv) always match the drawn ones. Scrolling walks
// the tabs; each one retypes its URL and swaps the page beneath it.
//
// Everything is a pure function of scroll — including the "typing", which is driven
// by position within the project's slot rather than by elapsed time. Scrub backwards
// and the URL untypes.

import { projects } from "@/data/projects"

import { COLORS } from "../config"
import { clamp01, smoothstep } from "../lib/keyframes"
import { drawImageCover, getImage } from "../lib/imageCache"
import {
  body,
  clearScreen,
  cursorVisible,
  display,
  drawScanlines,
  drawVignette,
  ellipsize,
  mono,
  roundRect,
  type ScreenCtx,
  typed,
  wrapText,
} from "../lib/canvas2d"
import {
  addLinkHit,
  CONTENT_TOP,
  getHoveredLink,
  linkKey,
  PROJECTS_LAYOUT,
  PROJECT_COUNT,
  projectSlot,
  resetLinkHits,
} from "./projectsLayout"

/** Reused across frames so the painter allocates nothing per repaint. */
const wrapBuf: string[] = []

export const drawProjects: (s: ScreenCtx) => void = (s) => {
  const { ctx, w, h, t } = s
  const { index, frac } = projectSlot(t)
  // Project 0 has no predecessor to hand off from — show it immediately.
  const firstSlot = index === 0

  clearScreen(s, COLORS.screenBg)
  // Hit regions are rebuilt from whatever this frame actually draws.
  resetLinkHits()

  const stripH = h * PROJECTS_LAYOUT.tabStrip
  const barH = h * PROJECTS_LAYOUT.addressBar
  const contentY = h * CONTENT_TOP

  drawTabStrip(s, stripH, index, frac)
  drawAddressBar(s, stripH, barH, index, frac)

  // Swap projects by sliding, not by cross-fading.
  //
  // Fading both at once stacked two titles, two descriptions and two chip rows on
  // top of each other. Making the curves complementary fixed that but left a dead
  // zone where neither was drawn and the page went blank. Sliding sidesteps both:
  // the pair is always at full opacity and never occupies the same space, so the
  // outgoing page leaves as the incoming one arrives — which is also how switching
  // a browser tab actually reads.
  const k = smoothstep(0, PROJECTS_LAYOUT.crossFade, frac)

  ctx.save()
  ctx.beginPath()
  ctx.rect(0, contentY, w, h - contentY)
  ctx.clip()

  if (firstSlot || k >= 1) {
    drawContent(s, index, contentY, 1, 0)
  } else {
    drawContent(s, index - 1, contentY, 1, -w * k)
    drawContent(s, index, contentY, 1, w * (1 - k))
  }
  ctx.restore()

  drawScanlines(s, 0.04)
  drawVignette(s, 0.38)
}

// ── Tab strip ────────────────────────────────────────────────────────────────

function drawTabStrip(s: ScreenCtx, stripH: number, active: number, frac: number) {
  const { ctx, w } = s
  ctx.fillStyle = COLORS.screenChrome
  ctx.fillRect(0, 0, w, stripH)

  const tabW = w / PROJECT_COUNT
  const labelSize = Math.round(stripH * 0.26)

  for (let i = 0; i < PROJECT_COUNT; i++) {
    const x = i * tabW
    const isActive = i === active

    if (isActive) {
      // Active tab reads as continuous with the page below it.
      ctx.fillStyle = COLORS.screenBg
      roundRect(ctx, x + 4, 8, tabW - 8, stripH - 8, 12)
      ctx.fill()
      ctx.fillStyle = COLORS.neon
      ctx.fillRect(x + 4, 8, tabW - 8, 3)
    } else if (i > 0) {
      ctx.fillStyle = "rgba(240,237,230,0.10)"
      ctx.fillRect(x, stripH * 0.28, 1, stripH * 0.44)
    }

    // Favicon dot — neon for the active tab, muted otherwise.
    const dotR = Math.round(stripH * 0.075)
    const dotX = x + tabW * 0.11
    const dotY = stripH * 0.52
    ctx.beginPath()
    ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2)
    ctx.fillStyle = isActive ? COLORS.neon : "rgba(240,237,230,0.28)"
    ctx.fill()

    ctx.font = mono(labelSize, 500)
    ctx.textBaseline = "middle"
    ctx.fillStyle = isActive ? COLORS.paper : COLORS.screenDim
    const labelX = dotX + dotR + tabW * 0.06
    const maxLabel = tabW - (labelX - x) - tabW * 0.1
    ctx.fillText(ellipsize(ctx, projects[i].title, maxLabel), labelX, dotY)
  }

  // Progress hairline showing position within the active tab.
  ctx.fillStyle = "rgba(232,255,71,0.35)"
  ctx.fillRect(active * tabW + 4, stripH - 2, (tabW - 8) * frac, 2)
}

// ── Address bar ──────────────────────────────────────────────────────────────

function drawAddressBar(s: ScreenCtx, stripH: number, barH: number, index: number, frac: number) {
  const { ctx, w } = s
  const project = projects[index]

  ctx.fillStyle = "#0F1214"
  ctx.fillRect(0, stripH, w, barH)

  const cy = stripH + barH / 2
  const glyphSize = Math.round(barH * 0.36)
  ctx.font = mono(glyphSize, 400)
  ctx.textBaseline = "middle"
  ctx.fillStyle = "rgba(240,237,230,0.30)"
  ctx.fillText("←  →  ⟳", w * 0.025, cy)

  // URL pill
  const pillX = w * 0.14
  const pillW = w * 0.80
  const pillH = barH * 0.62
  ctx.fillStyle = "rgba(0,0,0,0.45)"
  roundRect(ctx, pillX, cy - pillH / 2, pillW, pillH, pillH / 2)
  ctx.fill()
  ctx.strokeStyle = "rgba(240,237,230,0.08)"
  ctx.lineWidth = 1
  ctx.stroke()

  const urlSize = Math.round(barH * 0.34)
  ctx.font = mono(urlSize, 400)
  const lockX = pillX + pillH * 0.55
  ctx.fillStyle = COLORS.neon
  ctx.fillText("🔒", lockX, cy)

  // Character-by-character retype, driven by scroll position in the slot.
  const typeT = clamp01(frac / PROJECTS_LAYOUT.typeFraction)
  const full = project.demo
  const shown = typed(full, typeT)
  const textX = lockX + urlSize * 1.6

  ctx.fillStyle = COLORS.paper
  ctx.fillText(shown, textX, cy)

  if (typeT < 1 && cursorVisible(frac * 60)) {
    const cw = ctx.measureText(shown).width
    ctx.fillStyle = COLORS.neon
    ctx.fillRect(textX + cw + 3, cy - urlSize * 0.55, 2, urlSize * 1.1)
  }
}

// ── Page content ─────────────────────────────────────────────────────────────

function drawContent(s: ScreenCtx, index: number, contentY: number, alpha: number, dx: number) {
  if (alpha <= 0.01) return
  const { ctx, w, h } = s
  const project = projects[index]

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(dx, 0)

  const pad = Math.round(w * 0.038)
  const top = contentY + pad
  const availH = h - top - pad

  // ── Screenshot ──
  const imgW = Math.round(w * 0.46)
  const imgH = Math.round(availH * 0.78)
  const imgY = top + Math.round((availH - imgH) / 2)
  const img = getImage(project.image)

  if (img) {
    drawImageCover(ctx, img, pad, imgY, imgW, imgH, 10)
    ctx.strokeStyle = "rgba(240,237,230,0.12)"
    ctx.lineWidth = 1
    roundRect(ctx, pad, imgY, imgW, imgH, 10)
    ctx.stroke()
  } else {
    // Not loaded yet — a quiet placeholder rather than a hole.
    ctx.fillStyle = "rgba(240,237,230,0.04)"
    roundRect(ctx, pad, imgY, imgW, imgH, 10)
    ctx.fill()
    ctx.font = mono(Math.round(h * 0.026), 400)
    ctx.fillStyle = COLORS.screenDim
    ctx.textBaseline = "middle"
    const msg = "loading preview…"
    ctx.fillText(msg, pad + (imgW - ctx.measureText(msg).width) / 2, imgY + imgH / 2)
  }

  // ── Text column ──
  const tx = pad + imgW + Math.round(w * 0.045)
  const tw = w - tx - pad
  let y = imgY + Math.round(h * 0.03)

  ctx.textBaseline = "alphabetic"
  ctx.font = mono(Math.round(h * 0.026), 500)
  ctx.fillStyle = COLORS.neon
  ctx.fillText(
    `${String(index + 1).padStart(2, "0")} / ${String(PROJECT_COUNT).padStart(2, "0")}`,
    tx,
    y
  )
  y += Math.round(h * 0.055)

  // Title, wrapped then fitted so long names never overflow the column.
  const titleSize = fitTitle(ctx, project.title, tw, Math.round(h * 0.07))
  ctx.font = display(titleSize, 800)
  const titleLines = wrapText(ctx, project.title, tw, wrapBuf)
  ctx.fillStyle = COLORS.paper
  for (let i = 0; i < titleLines; i++) {
    ctx.fillText(wrapBuf[i], tx, y)
    y += Math.round(titleSize * 1.06)
  }

  y += Math.round(h * 0.018)
  ctx.font = body(Math.round(h * 0.032), 400)
  ctx.fillStyle = "rgba(240,237,230,0.58)"
  const descLines = wrapText(ctx, project.description, tw, wrapBuf)
  for (let i = 0; i < descLines; i++) {
    ctx.fillText(wrapBuf[i], tx, y)
    y += Math.round(h * 0.046)
  }

  // ── Stack chips ──
  y += Math.round(h * 0.022)
  const chipSize = Math.round(h * 0.024)
  ctx.font = mono(chipSize, 500)
  const chipH = Math.round(chipSize * 2.1)
  const gap = Math.round(w * 0.008)
  let cx = tx
  for (const tech of project.stack) {
    const tWidth = ctx.measureText(tech).width
    const chipW = tWidth + chipSize * 1.8
    if (cx + chipW > tx + tw) {
      cx = tx
      y += chipH + gap
    }
    ctx.strokeStyle = "rgba(240,237,230,0.16)"
    ctx.lineWidth = 1
    roundRect(ctx, cx, y - chipH * 0.72, chipW, chipH, 4)
    ctx.stroke()
    ctx.fillStyle = "rgba(240,237,230,0.62)"
    ctx.fillText(tech, cx + chipSize * 0.9, y)
    cx += chipW + gap
  }

  // ── Links ──
  //
  // Only the settled project registers hit regions: mid-slide the content is
  // translated and half of it is off-screen, so clicking there would be a lottery.
  y += Math.round(h * 0.062)
  const linkSize = Math.round(h * 0.028)
  const interactive = dx === 0 && alpha > 0.99
  const hoveredKey = getHoveredLink()

  const links: { kind: "demo" | "source"; label: string; href: string }[] = [
    { kind: "demo", label: "↗  live demo", href: project.demo },
    { kind: "source", label: "source  ↗", href: project.source },
  ]

  ctx.font = mono(linkSize, 500)
  let lx = tx
  for (const link of links) {
    const labelW = ctx.measureText(link.label).width
    const padX = Math.round(linkSize * 0.7)
    const padY = Math.round(linkSize * 0.55)
    const boxX = lx - padX
    const boxY = y - linkSize - padY * 0.5
    const boxW = labelW + padX * 2
    const boxH = linkSize + padY * 1.6

    const isHot = interactive && hoveredKey === linkKey(index, link.kind)
    const primary = link.kind === "demo"

    if (isHot) {
      ctx.fillStyle = primary ? COLORS.neon : "rgba(240,237,230,0.14)"
      roundRect(ctx, boxX, boxY, boxW, boxH, 5)
      ctx.fill()
    } else {
      ctx.strokeStyle = primary ? "rgba(232,255,71,0.55)" : "rgba(240,237,230,0.20)"
      ctx.lineWidth = 1
      roundRect(ctx, boxX, boxY, boxW, boxH, 5)
      ctx.stroke()
    }

    ctx.fillStyle = isHot
      ? primary
        ? COLORS.screenBg
        : COLORS.paper
      : primary
        ? COLORS.neon
        : COLORS.screenDim
    ctx.fillText(link.label, lx, y)

    if (interactive) {
      addLinkHit({
        x: boxX,
        y: boxY,
        w: boxW,
        h: boxH,
        kind: link.kind,
        project: index,
        href: link.href,
      })
    }

    lx += boxW + Math.round(w * 0.018)
  }

  ctx.restore()
}

/** Largest title size at which the wrapped title stays within three lines. */
function fitTitle(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number
): number {
  let size = startSize
  for (let i = 0; i < 8; i++) {
    ctx.font = display(size, 800)
    if (wrapText(ctx, text, maxWidth, wrapBuf) <= 2) return size
    size = Math.round(size * 0.9)
    if (size < 18) break
  }
  return Math.max(18, size)
}
