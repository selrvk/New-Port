// components/laptop/certs/landing.ts
//
// Where each sticker is at a given point in the Certifications section.
//
// Pure, and kept out of the component so it can be tested: a sticker that never
// finishes landing, or settles a few degrees off, looks like a rendering glitch
// rather than a logic error, and there is nothing to catch it at runtime.

import { LID, STICKERS } from "../config"

const DEG = Math.PI / 180

export type StickerPose = {
  visible: boolean
  x: number
  y: number
  z: number
  scaleX: number
  scaleY: number
  rotation: number
  opacity: number
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

/**
 * Resting pose of sticker `i`, in lidGroup space.
 *
 * `z` steps further out with the index so overlapping stickers have a definite
 * order rather than fighting for the same depth.
 */
export function stickerSlot(i: number) {
  const slot = STICKERS.layout[i]
  return {
    x: slot.x * (LID.width / 2),
    y: slot.y * LID.height,
    rot: slot.rot * DEG,
    scale: slot.s,
    z: STICKERS.z - i * STICKERS.stackStep,
  }
}

/** How far through its own landing sticker `i` is, at section progress `t`. */
export function landProgress(t: number, i: number, count: number): number {
  const start = (i / count) * STICKERS.landSpan
  return clamp01((t - start) / STICKERS.landDuration)
}

export function stickerPose(t: number, i: number, count: number): StickerPose {
  const slot = stickerSlot(i)
  const land = landProgress(t, i, count)

  if (land <= 0) {
    return {
      visible: false,
      x: slot.x,
      y: slot.y,
      z: slot.z - STICKERS.dropHeight,
      scaleX: slot.scale * STICKERS.dropScale,
      scaleY: slot.scale * STICKERS.dropScale,
      rotation: slot.rot + STICKERS.dropRotation * DEG,
      opacity: 0,
    }
  }

  const { impact } = STICKERS

  if (land < impact) {
    // Travelling in, decelerating onto the surface.
    const a = land / impact
    const eased = 1 - Math.pow(1 - a, 3)
    const s = slot.scale * (STICKERS.dropScale + (1 - STICKERS.dropScale) * eased)
    return {
      visible: true,
      x: slot.x,
      y: slot.y,
      z: slot.z - STICKERS.dropHeight * (1 - eased),
      scaleX: s,
      scaleY: s,
      rotation: slot.rot + STICKERS.dropRotation * DEG * (1 - eased),
      opacity: clamp01(a * 4),
    }
  }

  // Landed: damped squash — widens as it flattens, then settles.
  const a = (land - impact) / (1 - impact)
  const wobble =
    Math.cos(a * Math.PI * STICKERS.squashFreq) *
    Math.exp(-a * STICKERS.squashDecay) *
    STICKERS.squash

  return {
    visible: true,
    x: slot.x,
    y: slot.y,
    z: slot.z,
    scaleX: slot.scale * (1 + wobble),
    scaleY: slot.scale * (1 - wobble),
    rotation: slot.rot,
    opacity: 1,
  }
}
