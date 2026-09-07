// components/laptop/screens/drawAbout.ts
//
// The About screen: README.md, rendered.
//
// Restrained on purpose — the spec asks for a real markdown-preview look rather
// than an animated one, so there is no per-character typing here. Instead the
// document SCROLLS as you scroll, and lines fade in as they rise into view. That
// reads as reading, handles however much prose the data holds, and keeps it
// distinct from the terminal (Contact) and the git log (Schools).
//
// Layout is a tiny block engine: measure once per canvas width, cache, then draw
// with a vertical offset. Wrapping five paragraphs every frame would be wasteful
// given the text never changes.

import { aboutLead, aboutParagraphs, aboutStats, whoami } from "@/data/about"
import { profile } from "@/data/profile"

import { COLORS } from "../config"
import { clamp01, smoothstep } from "../lib/keyframes"
import {
  body,
  clearScreen,
  display,
  drawScanlines,
  drawVignette,
  mono,
  roundRect,
  type ScreenCtx,
  wrapText,
} from "../lib/canvas2d"

type Block =
  | { kind: "h1"; text: string }
  | { kind: "sub"; text: string }
  | { kind: "badges" }
  | { kind: "rule" }
  | { kind: "quote"; lines: string[] }
  | { kind: "p"; lines: string[] }
  | { kind: "h2"; text: string }
  | { kind: "code" }

type Layout = { blocks: { block: Block; y: number; h: number }[]; total: number }

let cache: { width: number; layout: Layout } | null = null
const wrapBuf: string[] = []

const PAD = 0.068 // of canvas width
const HEADER = 0.072 // of canvas height

function buildLayout(ctx: CanvasRenderingContext2D, w: number, h: number): Layout {
  const pad = w * PAD
  const contentW = w - pad * 2
  const blocks: { block: Block; y: number; h: number }[] = []
  let y = 0

  const push = (block: Block, height: number, gap = h * 0.03) => {
    blocks.push({ block, y, h: height })
    y += height + gap
  }

  push({ kind: "h1", text: profile.name }, h * 0.09, h * 0.012)
  push({ kind: "sub", text: profile.title }, h * 0.042)
  push({ kind: "badges" }, h * 0.11)
  push({ kind: "rule" }, 2, h * 0.034)

  const quoteText = `${aboutLead.greeting} ${aboutLead.name} ${aboutLead.pronunciation} ${aboutLead.rest}`
  ctx.font = body(Math.round(h * 0.031), 400)
  const quoteLines = wrapText(ctx, quoteText, contentW - w * 0.03, wrapBuf).valueOf()
  const quote = wrapBuf.slice(0, quoteLines)
  push({ kind: "quote", lines: quote }, quote.length * h * 0.048 + h * 0.02)

  ctx.font = body(Math.round(h * 0.030), 400)
  for (const para of aboutParagraphs) {
    const n = wrapText(ctx, para, contentW, wrapBuf)
    const lines = wrapBuf.slice(0, n)
    push({ kind: "p", lines }, lines.length * h * 0.046)
  }

  push({ kind: "h2", text: "whoami" }, h * 0.05, h * 0.018)
  push({ kind: "code" }, whoami.length * h * 0.042 + h * 0.04)

  return { blocks, total: y }
}

export const drawAbout: (s: ScreenCtx) => void = (s) => {
  const { ctx, w, h, t } = s
  clearScreen(s, COLORS.screenBg)

  if (!cache || cache.width !== w) cache = { width: w, layout: buildLayout(ctx, w, h) }
  const { blocks, total } = cache.layout

  const pad = w * PAD
  const headerH = h * HEADER
  const viewH = h - headerH
  const maxScroll = Math.max(0, total - viewH + h * 0.06)
  // Ease the scroll so it settles at both ends rather than stopping dead.
  const scroll = smoothstep(0.04, 0.96, t) * maxScroll

  // ── Document ──
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, headerH, w, viewH)
  ctx.clip()
  ctx.translate(0, headerH + h * 0.03 - scroll)

  for (const { block, y } of blocks) {
    // Fade in as a line rises into view, and out as it leaves the top.
    const screenY = y + headerH + h * 0.03 - scroll
    const enter = smoothstep(h * 0.98, h * 0.80, screenY)
    const leave = smoothstep(headerH - h * 0.04, headerH + h * 0.05, screenY)
    const alpha = Math.min(enter, leave)
    if (alpha <= 0.01) continue

    ctx.globalAlpha = alpha
    drawBlock(s, block, pad, y, w - pad * 2)
    ctx.globalAlpha = 1
  }
  ctx.restore()

  drawHeader(s, headerH, total > 0 ? clamp01(scroll / Math.max(maxScroll, 1)) : 0)

  drawScanlines(s, 0.04)
  drawVignette(s, 0.4)
}

function drawHeader(s: ScreenCtx, headerH: number, scrolled: number) {
  const { ctx, w, h } = s
  ctx.fillStyle = COLORS.screenChrome
  ctx.fillRect(0, 0, w, headerH)
  ctx.fillStyle = "rgba(240,237,230,0.08)"
  ctx.fillRect(0, headerH - 1, w, 1)

  const pad = w * PAD
  ctx.textBaseline = "middle"
  ctx.font = mono(Math.round(h * 0.028), 500)
  ctx.fillStyle = COLORS.screenDim
  ctx.fillText("◇", pad, headerH / 2)
  ctx.fillStyle = COLORS.paper
  ctx.fillText("README.md", pad + w * 0.026, headerH / 2)

  ctx.font = mono(Math.round(h * 0.024), 400)
  ctx.fillStyle = "rgba(240,237,230,0.28)"
  const label = "preview"
  ctx.fillText(label, w - pad - ctx.measureText(label).width, headerH / 2)

  // Scroll position, so the document reads as longer than the screen.
  const trackX = w - pad * 0.45
  const trackTop = headerH + h * 0.03
  const trackH = h - trackTop - h * 0.04
  ctx.fillStyle = "rgba(240,237,230,0.07)"
  ctx.fillRect(trackX, trackTop, 3, trackH)
  const thumbH = trackH * 0.22
  ctx.fillStyle = "rgba(232,255,71,0.5)"
  ctx.fillRect(trackX, trackTop + (trackH - thumbH) * scrolled, 3, thumbH)
}

function drawBlock(s: ScreenCtx, block: Block, x: number, y: number, w: number) {
  const { ctx, h } = s
  ctx.textBaseline = "top"

  switch (block.kind) {
    case "h1":
      ctx.font = display(Math.round(h * 0.072), 800)
      ctx.fillStyle = COLORS.paper
      ctx.fillText(block.text, x, y)
      return

    case "sub":
      ctx.font = mono(Math.round(h * 0.030), 500)
      ctx.fillStyle = COLORS.neon
      ctx.fillText(block.text, x, y)
      return

    case "rule":
      ctx.fillStyle = "rgba(240,237,230,0.10)"
      ctx.fillRect(x, y, w, 2)
      return

    case "badges": {
      // Stat chips, the way a README carries shields.
      const size = Math.round(h * 0.024)
      ctx.font = mono(size, 500)
      const gap = h * 0.014
      const chipH = size * 2.4
      let cx = x
      let cy = y
      for (const stat of aboutStats) {
        const label = stat.label.toUpperCase()
        const value = stat.value
        const lw = ctx.measureText(label).width
        const vw = ctx.measureText(value).width
        const chipW = lw + vw + size * 3
        if (cx + chipW > x + w) {
          cx = x
          cy += chipH + gap
        }
        ctx.fillStyle = "rgba(240,237,230,0.10)"
        roundRect(ctx, cx, cy, lw + size * 1.4, chipH, 4)
        ctx.fill()
        ctx.fillStyle = COLORS.neon
        roundRect(ctx, cx + lw + size * 1.4, cy, vw + size * 1.6, chipH, 4)
        ctx.fill()

        ctx.textBaseline = "middle"
        ctx.fillStyle = "rgba(240,237,230,0.62)"
        ctx.fillText(label, cx + size * 0.7, cy + chipH / 2)
        ctx.fillStyle = COLORS.screenBg
        ctx.fillText(value, cx + lw + size * 2.2, cy + chipH / 2)
        ctx.textBaseline = "top"

        cx += chipW + gap
      }
      return
    }

    case "quote": {
      ctx.fillStyle = COLORS.neon
      ctx.fillRect(x, y, 3, block.lines.length * h * 0.048)
      ctx.font = body(Math.round(h * 0.031), 400)
      ctx.fillStyle = "rgba(240,237,230,0.92)"
      block.lines.forEach((line, i) => {
        ctx.fillText(line, x + h * 0.026, y + i * h * 0.048)
      })
      return
    }

    case "p":
      ctx.font = body(Math.round(h * 0.030), 400)
      ctx.fillStyle = "rgba(240,237,230,0.70)"
      block.lines.forEach((line, i) => {
        ctx.fillText(line, x, y + i * h * 0.046)
      })
      return

    case "h2":
      ctx.font = display(Math.round(h * 0.042), 800)
      ctx.fillStyle = COLORS.paper
      ctx.fillText(`## ${block.text}`, x, y)
      return

    case "code": {
      const rowH = h * 0.042
      ctx.fillStyle = "rgba(240,237,230,0.04)"
      roundRect(ctx, x, y, w, whoami.length * rowH + h * 0.03, 6)
      ctx.fill()
      ctx.font = mono(Math.round(h * 0.026), 400)
      whoami.forEach(([key, value], i) => {
        const ry = y + h * 0.015 + i * rowH
        ctx.fillStyle = COLORS.neon
        ctx.fillText(key.padEnd(8), x + h * 0.022, ry)
        ctx.fillStyle = "rgba(240,237,230,0.72)"
        ctx.fillText(value, x + h * 0.022 + w * 0.13, ry)
      })
      return
    }
  }
}
