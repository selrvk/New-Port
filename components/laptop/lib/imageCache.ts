"use client"

// components/laptop/lib/imageCache.ts
//
// Loads project screenshots for painting onto the laptop screen.
//
// The screen repaints as a pure function of scroll, so it cannot await anything.
// Instead: ask for an image, get null until it is ready, and repaint once it lands.
// Images are same-origin (/public), so the canvas is never tainted.

const cache = new Map<string, HTMLImageElement>()
const failed = new Set<string>()
const listeners = new Set<() => void>()

/** Subscribe to "an image finished loading" so the screen can repaint. */
export function onImageLoaded(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/**
 * Returns the image if it is decoded and ready to draw, otherwise null.
 * The first call for a src kicks off the load.
 */
export function getImage(src: string): HTMLImageElement | null {
  if (failed.has(src)) return null

  const existing = cache.get(src)
  if (existing) {
    return existing.complete && existing.naturalWidth > 0 ? existing : null
  }

  const img = new Image()
  cache.set(src, img)
  img.onload = () => {
    for (const l of listeners) l()
  }
  img.onerror = () => {
    failed.add(src)
    cache.delete(src)
    console.warn(`[portfolio] screenshot failed to load: ${src}`)
  }
  img.src = src
  return null
}

export function preloadImages(srcs: readonly string[]): void {
  for (const s of srcs) getImage(s)
}

/**
 * Draw `img` filling the box while preserving aspect (CSS `object-fit: cover`),
 * clipped to a rounded rectangle.
 */
export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 0
): void {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const dw = img.naturalWidth * scale
  const dh = img.naturalHeight * scale
  const dx = x + (w - dw) / 2
  const dy = y + (h - dh) / 2

  ctx.save()
  if (radius > 0) {
    const r = Math.min(radius, w / 2, h / 2)
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
    ctx.clip()
  } else {
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.clip()
  }
  ctx.drawImage(img, dx, dy, dw, dh)
  ctx.restore()
}
