// components/laptop/lib/canvas2d.ts
//
// Drawing helpers shared by every screen painter.
//
// These run inside the render loop, so they avoid allocating: no template strings
// in tight loops, no array building, no gradient objects created per call unless
// the caller caches them.

import { COLORS, FONTS } from "../config"

export type ScreenCtx = {
  ctx: CanvasRenderingContext2D
  /** Canvas pixel dimensions. */
  w: number
  h: number
  /** 0→1 progress within the section being drawn. */
  t: number
  /** Global 0→1 scroll progress, for anything that needs absolute position. */
  global: number
}

export type ScreenPainter = (s: ScreenCtx) => void

/** Fill the whole screen with the base colour. */
export function clearScreen(s: ScreenCtx, color: string = COLORS.screenBg): void {
  s.ctx.fillStyle = color
  s.ctx.fillRect(0, 0, s.w, s.h)
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

// ─── Font resolution ─────────────────────────────────────────────────────────
//
// next/font generates hashed family names ("__JetBrains_Mono_abc123") and exposes
// them as CSS custom properties. Canvas 2D can't read custom properties, so asking
// it for "JetBrains Mono" silently falls back to the generic monospace and the
// screen loses its typography. Resolve the real family names once from the DOM.

type ResolvedFonts = { mono: string; display: string; body: string }
let resolved: ResolvedFonts | null = null

function readVar(styles: CSSStyleDeclaration, name: string, fallback: string): string {
  const v = styles.getPropertyValue(name).trim()
  return v ? `${v}, ${fallback}` : fallback
}

export function resolveFonts(): ResolvedFonts {
  if (resolved) return resolved
  if (typeof window === "undefined") return FONTS
  const styles = getComputedStyle(document.body)
  resolved = {
    mono: readVar(styles, "--font-mono", FONTS.mono),
    display: readVar(styles, "--font-syne", FONTS.display),
    body: readVar(styles, "--font-jakarta", FONTS.body),
  }
  return resolved
}

/** Call after webfonts settle so cached names are re-read. */
export function invalidateFonts(): void {
  resolved = null
}

export function mono(size: number, weight: number | string = 400): string {
  return `${weight} ${size}px ${resolveFonts().mono}`
}

export function display(size: number, weight: number | string = 800): string {
  return `${weight} ${size}px ${resolveFonts().display}`
}

export function body(size: number, weight: number | string = 400): string {
  return `${weight} ${size}px ${resolveFonts().body}`
}

/**
 * Reveal `text` a character at a time as `t` goes 0→1.
 * Returns the visible substring so callers can position a cursor after it.
 */
export function typed(text: string, t: number): string {
  if (t <= 0) return ""
  if (t >= 1) return text
  return text.slice(0, Math.ceil(text.length * t))
}

/** A blinking block cursor. `phase` is any monotonically increasing number. */
export function cursorVisible(phase: number, hz = 1.6): boolean {
  return Math.floor(phase * hz) % 2 === 0
}

export function drawCursor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string = COLORS.neon
): void {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

/**
 * Largest font size at which `text` fits `maxWidth`.
 *
 * Text drawn on the screen texture is laid out in canvas pixels, so anything sized
 * as a fraction of the canvas will overflow once the content is long enough — a
 * name, a project title, a URL. Fit it instead of hoping.
 *
 * One proportional jump lands within a pixel or two, then we step down; that is far
 * cheaper than a binary search over measureText.
 */
export function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  makeFont: (size: number) => string,
  minSize = 8
): number {
  let size = Math.max(minSize, Math.round(startSize))
  ctx.font = makeFont(size)
  const w = ctx.measureText(text).width
  if (w <= maxWidth) return size

  size = Math.max(minSize, Math.floor(size * (maxWidth / w)))
  ctx.font = makeFont(size)
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 1
    ctx.font = makeFont(size)
  }
  return size
}

/** Split a full name into display lines: given name, then everything else. */
export function nameLines(full: string): string[] {
  const parts = full.trim().split(/\s+/)
  if (parts.length < 2) return [full.trim()]
  return [parts[0], parts.slice(1).join(" ")]
}

/** Truncate to fit `maxWidth`, appending an ellipsis. */
export function ellipsize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  let lo = 0
  let hi = text.length
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (ctx.measureText(text.slice(0, mid) + "…").width <= maxWidth) lo = mid
    else hi = mid - 1
  }
  return text.slice(0, lo) + "…"
}

/**
 * Greedy word wrap. Writes into `out` and returns the line count, so callers can
 * reuse one array instead of allocating per frame.
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  out: string[]
): number {
  out.length = 0
  let line = ""
  let start = 0
  for (let i = 0; i <= text.length; i++) {
    const isEnd = i === text.length
    if (!isEnd && text[i] !== " ") continue
    const word = text.slice(start, i)
    const candidate = line ? `${line} ${word}` : word
    if (ctx.measureText(candidate).width > maxWidth && line) {
      out.push(line)
      line = word
    } else {
      line = candidate
    }
    start = i + 1
  }
  if (line) out.push(line)
  return out.length
}

/** Faint CRT scanlines. Cheap: one fillRect per other row, no per-pixel work. */
export function drawScanlines(s: ScreenCtx, alpha = 0.045, step = 3): void {
  s.ctx.fillStyle = `rgba(0,0,0,${alpha})`
  for (let y = 0; y < s.h; y += step) s.ctx.fillRect(0, y, s.w, 1)
}

/** Subtle vignette so the panel doesn't read as a flat sticker. */
export function drawVignette(s: ScreenCtx, strength = 0.35): void {
  const g = s.ctx.createRadialGradient(
    s.w / 2, s.h / 2, Math.min(s.w, s.h) * 0.25,
    s.w / 2, s.h / 2, Math.max(s.w, s.h) * 0.72
  )
  g.addColorStop(0, "rgba(0,0,0,0)")
  g.addColorStop(1, `rgba(0,0,0,${strength})`)
  s.ctx.fillStyle = g
  s.ctx.fillRect(0, 0, s.w, s.h)
}
