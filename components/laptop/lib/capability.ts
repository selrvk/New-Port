// components/laptop/lib/capability.ts
//
// Decides whether the 3D presentation runs at all.
//
// The 3D layer is a progressive enhancement: the semantic DOM portfolio is always
// rendered and is the baseline. If anything here says no, that baseline is simply
// left visible and no WebGL context is ever created.

import { PERF } from "../config"

export type PresentationMode = "3d" | "text"

export type Capability = {
  webgl: boolean
  reducedMotion: boolean
  smallViewport: boolean
  /** True only when every gate passes. */
  canRun3d: boolean
  reason: string | null
}

/**
 * Probe for a real WebGL context, then throw it away.
 *
 * The throwaway matters: browsers cap simultaneous contexts (~16), and a leaked
 * probe context counts against that budget for the life of the page.
 */
export function detectWebGL(): boolean {
  if (typeof document === "undefined") return false
  try {
    const canvas = document.createElement("canvas")
    const gl =
      (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ??
      (canvas.getContext("webgl") as WebGLRenderingContext | null)
    if (!gl) return false
    gl.getExtension("WEBGL_lose_context")?.loseContext()
    return true
  } catch {
    return false
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function isSmallViewport(): boolean {
  if (typeof window === "undefined") return false
  return window.innerWidth < PERF.mobileBreakpoint
}

export function detectCapability(): Capability {
  const webgl = detectWebGL()
  const reducedMotion = prefersReducedMotion()
  const smallViewport = isSmallViewport()

  let reason: string | null = null
  if (!webgl) reason = "WebGL unavailable"
  else if (reducedMotion) reason = "prefers-reduced-motion"
  else if (smallViewport) reason = `viewport under ${PERF.mobileBreakpoint}px`

  return {
    webgl,
    reducedMotion,
    smallViewport,
    canRun3d: webgl && !reducedMotion && !smallViewport,
    reason,
  }
}

const STORAGE_KEY = "portfolio:presentation"

/** An explicit user choice always beats capability detection. */
export function readStoredMode(): PresentationMode | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    return v === "3d" || v === "text" ? v : null
  } catch {
    // Private browsing and blocked site-data both throw here.
    return null
  }
}

export function storeMode(mode: PresentationMode): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    /* non-fatal */
  }
}
