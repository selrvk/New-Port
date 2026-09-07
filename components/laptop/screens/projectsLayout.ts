// components/laptop/screens/projectsLayout.ts
//
// Geometry shared by the Projects painter and its hit-testing.
//
// The tab strip is drawn by drawProjects and clicked via UV raycasting against the
// screen plane. If those two had separate copies of the layout they would drift the
// moment either changed, and the clickable regions would silently stop matching the
// pixels. One definition, both consumers.

import { projects } from "@/data/projects"
import { SCREEN, SECTIONS } from "../config"

export const PROJECTS_LAYOUT = {
  /** Fraction of canvas height taken by the tab strip. Owned by config so the
   *  drawn strip and the raycast hit region cannot disagree. */
  tabStrip: SCREEN.tabStripUvHeight,
  /** Fraction of canvas height taken by the address bar, below the tabs. */
  addressBar: 0.085,
  /** Fraction of each project's slot spent typing its URL. */
  typeFraction: 0.35,
  /** Fraction of each project's slot spent cross-fading from the previous one. */
  crossFade: 0.18,
} as const

export const PROJECT_COUNT = projects.length

/** Where the content area starts, as a fraction of canvas height. */
export const CONTENT_TOP = PROJECTS_LAYOUT.tabStrip + PROJECTS_LAYOUT.addressBar

/**
 * Split the Projects section's local 0→1 into per-project slots.
 * Returns the active index plus how far through that slot we are.
 */
export function projectSlot(t: number): { index: number; frac: number } {
  const raw = t * PROJECT_COUNT
  const index = Math.min(PROJECT_COUNT - 1, Math.max(0, Math.floor(raw)))
  return { index, frac: Math.min(1, Math.max(0, raw - index)) }
}

/** Global scroll progress that centres project `i` on screen. */
export function progressForProject(i: number): number {
  const { start, end } = SECTIONS.projects
  const slot = (i + 0.5) / PROJECT_COUNT
  return start + (end - start) * slot
}

/**
 * Map a UV hit on the screen plane to a tab index, or null if the hit missed the
 * tab strip.
 *
 * NOTE the Y flip. CanvasTexture has flipY enabled, so the canvas's top row lands
 * at uv.y = 1. Forgetting this puts the clickable tabs at the bottom of the screen.
 */
export function tabAtUv(u: number, v: number): number | null {
  const y = 1 - v
  if (y < 0 || y > PROJECTS_LAYOUT.tabStrip) return null
  if (u < 0 || u > 1) return null
  const i = Math.floor(u * PROJECT_COUNT)
  return i >= 0 && i < PROJECT_COUNT ? i : null
}

// ─── Link hit regions ────────────────────────────────────────────────────────
//
// The tab strip has fixed geometry, so its hit test is pure maths. The demo/source
// links do not: they sit below a title and description that wrap to different
// heights per project, so their position is only known once drawn.
//
// Rather than duplicate the layout maths (which would drift the moment either side
// changed), the painter records the rectangles it actually drew and the hit test
// reads those. The screen repaints before any pointer event can be handled, so the
// rectangles are always current.

export type LinkKind = "demo" | "source"

export type LinkHit = {
  /** Canvas-pixel rect. */
  x: number
  y: number
  w: number
  h: number
  kind: LinkKind
  project: number
  href: string
}

let linkHits: LinkHit[] = []
let hovered: string | null = null

export const linkKey = (project: number, kind: LinkKind) => `${project}:${kind}`

/** Called at the start of each Projects repaint. */
export function resetLinkHits(): void {
  linkHits = []
}

export function addLinkHit(hit: LinkHit): void {
  linkHits.push(hit)
}

/** Hit test in UV space. Mirrors tabAtUv's flipY handling. */
export function linkAtUv(u: number, v: number, canvasW: number, canvasH: number): LinkHit | null {
  const x = u * canvasW
  const y = (1 - v) * canvasH
  for (const r of linkHits) {
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r
  }
  return null
}

/**
 * Hover is the one thing on this screen that is NOT a function of scroll, so it is
 * held here rather than derived. Returns true when the value actually changed, so
 * the caller can trigger exactly one repaint instead of one per frame.
 */
export function setHoveredLink(key: string | null): boolean {
  if (hovered === key) return false
  hovered = key
  return true
}

export function getHoveredLink(): string | null {
  return hovered
}
