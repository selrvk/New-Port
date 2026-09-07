"use client"

// components/laptop/ContactAnchor.tsx
//
// Projects the laptop's display area into CSS pixels each frame, so the invisible
// contact <input> can sit exactly on top of it.
//
// The screen is a plane on a lid that rotates and a camera that moves, so its
// on-screen rectangle is only knowable from inside the scene. This writes it into
// shared state; the DOM layer reads it and positions itself.

import { useFrame, useThree } from "@react-three/fiber"
import { useMemo } from "react"
import * as THREE from "three"

import { SCREEN, SECTIONS } from "./config"
import { contactState } from "./contact/state"
import { localProgress } from "./lib/keyframes"

type Props = {
  progressRef: React.RefObject<number>
}

/**
 * The form stops accepting input just before the lid starts closing (0.86).
 *
 * This was 0.78, which — combined with Contact being the last 8% of the page —
 * left the field live only between roughly 92% and 98% of the scroll. Scrolling to
 * the bottom, which is the natural thing to do, put you past it: the overlay was
 * hidden and clicking the screen hit nothing at all.
 */
const INTERACTIVE_UNTIL = 0.84

export function ContactAnchor({ progressRef }: Props) {
  const corners = useMemo(
    () =>
      [
        new THREE.Vector3(-SCREEN.size.width / 2, -SCREEN.size.height / 2, 0),
        new THREE.Vector3(SCREEN.size.width / 2, -SCREEN.size.height / 2, 0),
        new THREE.Vector3(SCREEN.size.width / 2, SCREEN.size.height / 2, 0),
        new THREE.Vector3(-SCREEN.size.width / 2, SCREEN.size.height / 2, 0),
      ] as const,
    []
  )
  const scratch = useMemo(() => new THREE.Vector3(), [])
  const scene = useThree((s) => s.scene)

  useFrame((state) => {
    const p = progressRef.current ?? 0
    const { start, end } = SECTIONS.contact
    const rect = contactState.rect

    // `p < end` excludes the very bottom of the page, because the final section's
    // end IS 1.0. sectionAt() already falls through to the last section for that
    // reason; this has to agree with it or the form dies on the last pixel.
    const inSection = p >= start && (p < end || end >= 1)
    const t = inSection ? localProgress(p, start, end) : 0

    if (!inSection || t > INTERACTIVE_UNTIL) {
      if (rect.visible) {
        rect.visible = false
        contactState.version++
      }
      return
    }

    const mesh = scene.getObjectByName("screen-surface")
    if (!mesh) return

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const corner of corners) {
      scratch.copy(corner).applyMatrix4(mesh.matrixWorld).project(state.camera)
      const x = (scratch.x * 0.5 + 0.5) * state.size.width
      const y = (-scratch.y * 0.5 + 0.5) * state.size.height
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }

    // Inset slightly: the projected quad is a trapezoid once the lid tilts, and its
    // bounding box overshoots the visible glass at the corners.
    const insetX = (maxX - minX) * 0.06
    const insetY = (maxY - minY) * 0.06

    rect.x = minX + insetX
    rect.y = minY + insetY
    rect.w = Math.max(0, maxX - minX - insetX * 2)
    rect.h = Math.max(0, maxY - minY - insetY * 2)
    if (!rect.visible) {
      rect.visible = true
      contactState.version++
    }
  })

  return null
}
