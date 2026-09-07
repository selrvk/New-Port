// components/laptop/lib/keyframes.ts
//
// The one interpolation primitive the whole experience is built on.
//
// Everything visible — camera pose, lid angle, emissive intensity, sticker landings —
// is a PURE FUNCTION of a single 0→1 scroll value. No enter/leave events, no stored
// animation state. That is what makes scrolling up perfectly undo scrolling down.
//
// Zero allocation in the hot path: `sampleCamera` writes into caller-owned vectors.

import * as THREE from "three"
import { EASE, type EaseName } from "../config"

export type Keyed = { progress: number }

/**
 * Find the two keyframes bracketing `p` and return them with the eased 0→1 blend
 * factor between them. Clamps at both ends.
 *
 * Assumes `frames` is sorted ascending by `progress`.
 */
export function bracket<T extends Keyed>(
  frames: readonly T[],
  p: number,
  ease: EaseName = "inOutCubic"
): { a: T; b: T; t: number } {
  const n = frames.length
  if (n === 0) throw new Error("bracket(): no keyframes")
  if (n === 1 || p <= frames[0].progress) return { a: frames[0], b: frames[0], t: 0 }
  if (p >= frames[n - 1].progress) return { a: frames[n - 1], b: frames[n - 1], t: 0 }

  // Linear scan. Keyframe lists here are ~15 entries; a binary search would be
  // slower in practice and the branch predictor loves this.
  let i = 0
  while (i < n - 2 && frames[i + 1].progress <= p) i++

  const a = frames[i]
  const b = frames[i + 1]
  const span = b.progress - a.progress
  const raw = span <= 0 ? 0 : (p - a.progress) / span
  return { a, b, t: EASE[ease](raw) }
}

/** Scalar keyframe track. */
export function sampleScalar<T extends Keyed & Record<K, number>, K extends string>(
  frames: readonly T[],
  p: number,
  key: K,
  ease: EaseName = "inOutCubic"
): number {
  const { a, b, t } = bracket(frames, p, ease)
  return a[key] + (b[key] - a[key]) * t
}

export type CameraSample = {
  position: THREE.Vector3
  lookAt: THREE.Vector3
  fov: number
}

/**
 * Sample a camera track into caller-owned vectors. Allocates nothing.
 */
export function sampleCamera(
  frames: readonly {
    progress: number
    position: readonly [number, number, number]
    lookAt: readonly [number, number, number]
    fov?: number
  }[],
  p: number,
  out: CameraSample,
  defaultFov: number,
  ease: EaseName = "inOutCubic"
): CameraSample {
  const { a, b, t } = bracket(frames, p, ease)

  out.position.set(
    a.position[0] + (b.position[0] - a.position[0]) * t,
    a.position[1] + (b.position[1] - a.position[1]) * t,
    a.position[2] + (b.position[2] - a.position[2]) * t
  )
  out.lookAt.set(
    a.lookAt[0] + (b.lookAt[0] - a.lookAt[0]) * t,
    a.lookAt[1] + (b.lookAt[1] - a.lookAt[1]) * t,
    a.lookAt[2] + (b.lookAt[2] - a.lookAt[2]) * t
  )

  const fa = a.fov ?? defaultFov
  const fb = b.fov ?? defaultFov
  out.fov = fa + (fb - fa) * t

  return out
}

export function makeCameraSample(): CameraSample {
  return { position: new THREE.Vector3(), lookAt: new THREE.Vector3(), fov: 35 }
}

// ─── Range helpers ───────────────────────────────────────────────────────────

/** Map `p` from [start, end] onto 0→1, clamped. */
export function localProgress(p: number, start: number, end: number): number {
  if (end <= start) return 0
  return clamp01((p - start) / (end - start))
}

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** 0→1 ramp with smooth ends, for fades. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

/**
 * Sample a `[position, value][]` table — used for the boot flicker, where the
 * point is a deliberately non-smooth stutter, so this interpolates linearly.
 */
export function sampleTable(table: readonly [number, number][], x: number): number {
  const n = table.length
  if (n === 0) return 0
  if (x <= table[0][0]) return table[0][1]
  if (x >= table[n - 1][0]) return table[n - 1][1]
  let i = 0
  while (i < n - 2 && table[i + 1][0] <= x) i++
  const [x0, y0] = table[i]
  const [x1, y1] = table[i + 1]
  const span = x1 - x0
  return span <= 0 ? y0 : y0 + ((y1 - y0) * (x - x0)) / span
}

/**
 * Stagger helper: given N items sharing a [0,1] window, return each item's own
 * 0→1 local progress. `overlap` lets consecutive items bleed into each other.
 */
export function staggered(index: number, count: number, p: number, overlap = 0.35): number {
  if (count <= 0) return 0
  const slot = 1 / count
  const start = index * slot
  const span = slot * (1 + overlap)
  return clamp01((p - start) / span)
}
