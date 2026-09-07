"use client"

// components/laptop/Floor.tsx
//
// The surface the laptop sits on.
//
// Until now the machine floated in a void, which is why the black read as empty
// rather than as deliberate: nothing in frame had any relationship to anything
// else. This is one unlit, transparent plane at the deck's underside carrying a
// generated texture — a soft pool of light, a grid receding into it, and the
// shadow.
//
// Three decisions worth recording:
//
//  1. UNLIT (MeshBasicMaterial). A lit floor would be washed by the key light and
//     re-tinted by the lid-back light during the certifications orbit. What is
//     painted here is exactly what shows.
//
//  2. The shadow is PAINTED, not rendered. No light in this scene sets
//     `castShadow`, so there is no shadow map to sample, and drei's ContactShadows
//     would mean an extra render pass every frame to reproduce something static:
//     the deck never moves, and the lid's contribution to a contact shadow is
//     negligible. It also cannot go wrong — a depth pass would capture the keycap
//     glow plane lying flat on the deck as if it were solid.
//
//  3. The shadow is punched OUT of the light pool (`destination-out`) rather than
//     drawn on top of it. On a black background a dark blob is invisible; a shadow
//     only reads as the absence of something brighter. That is also physically
//     what it is.
//
// The texture is generated once and never mutated, so there is no per-frame cost
// beyond one extra draw call.

import { useEffect, useRef } from "react"
import * as THREE from "three"

import { COLORS, FLOOR } from "./config"

/** World units → texture pixels. */
const PX_PER_UNIT = FLOOR.resolution / FLOOR.size

/**
 * World (x, z) → canvas (px, py).
 *
 * The plane is rotated -90° about X, which maps local +Y to world -Z. With
 * CanvasTexture's default flipY that works out to: world +X runs right across the
 * canvas and world +Z runs DOWN it. Getting this backwards would put the shadow on
 * the wrong side of the machine — which is invisible in a symmetric grid, hence
 * the note.
 */
const toPx = (worldX: number) => (worldX + FLOOR.size / 2) * PX_PER_UNIT
const toPy = (worldZ: number) => (worldZ + FLOOR.size / 2) * PX_PER_UNIT

/** Exported so the calibrate harness can show it flat — see /calibrate/screen?floor=1 */
export function createFloorTexture(): THREE.CanvasTexture {
  const size = FLOOR.resolution
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!

  const cx = size / 2
  const cy = size / 2

  // ── 1. The pool of light the machine stands in ──
  const poolR = FLOOR.pool.radius * PX_PER_UNIT
  const pool = ctx.createRadialGradient(cx, cy, 0, cx, cy, poolR)
  pool.addColorStop(0, withAlpha(COLORS.paper, FLOOR.pool.alpha))
  pool.addColorStop(0.55, withAlpha(COLORS.paper, FLOOR.pool.alpha * 0.42))
  pool.addColorStop(1, withAlpha(COLORS.paper, 0))
  ctx.fillStyle = pool
  ctx.fillRect(0, 0, size, size)

  // ── 2. Grid ──
  //
  // Drawn across the whole texture and then masked by the fade below, rather than
  // stopping the lines early: a line that ends abruptly reads as a drawing mistake.
  const step = FLOOR.grid.step * PX_PER_UNIT
  const half = Math.ceil(FLOOR.size / 2 / FLOOR.grid.step)
  ctx.lineWidth = FLOOR.grid.width

  for (let i = -half; i <= half; i++) {
    const major = i % FLOOR.grid.majorEvery === 0
    ctx.strokeStyle = withAlpha(
      COLORS.paper,
      major ? FLOOR.grid.majorAlpha : FLOOR.grid.minorAlpha
    )
    const at = cx + i * step
    ctx.beginPath()
    ctx.moveTo(at, 0)
    ctx.lineTo(at, size)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, at)
    ctx.lineTo(size, at)
    ctx.stroke()
  }

  // ── 3. Fade everything out well before the plane's edge ──
  const fadeR = FLOOR.fadeRadius * PX_PER_UNIT
  const fade = ctx.createRadialGradient(cx, cy, 0, cx, cy, fadeR)
  fade.addColorStop(0, "rgba(255,255,255,1)")
  fade.addColorStop(0.6, "rgba(255,255,255,0.85)")
  fade.addColorStop(1, "rgba(255,255,255,0)")
  ctx.globalCompositeOperation = "destination-in"
  ctx.fillStyle = fade
  ctx.fillRect(0, 0, size, size)

  // ── 4. The shadow: remove the floor under the machine ──
  const { x, z, rx, rz, soft, strength } = FLOOR.shadow
  const sx = toPx(x)
  const sy = toPy(z)
  const outer = (Math.max(rx, rz) + soft) * PX_PER_UNIT

  ctx.globalCompositeOperation = "destination-out"
  ctx.save()
  ctx.translate(sx, sy)
  // Circular gradient squashed into the deck's footprint, so the penumbra stays
  // proportional on both axes instead of being stretched on one.
  ctx.scale(1, (rz + soft) / (rx + soft))
  const shadow = ctx.createRadialGradient(0, 0, 0, 0, 0, outer)
  const core = (rx / (rx + soft)) * 0.85
  shadow.addColorStop(0, `rgba(0,0,0,${strength})`)
  shadow.addColorStop(core, `rgba(0,0,0,${strength * 0.72})`)
  shadow.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = shadow
  ctx.beginPath()
  ctx.arc(0, 0, outer, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.globalCompositeOperation = "source-over"

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  // The floor is seen almost edge-on from every camera pose, which is exactly the
  // case that turns a grid into moiré without this.
  texture.anisotropy = 8
  return texture
}

/** `#rrggbb` + alpha → `rgba(...)`. */
function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`
}

export function Floor() {
  const matRef = useRef<THREE.MeshBasicMaterial>(null)
  // Built in an effect rather than useMemo: this touches the DOM to make a canvas,
  // which is not something to do during render.
  const texRef = useRef<THREE.CanvasTexture | null>(null)

  useEffect(() => {
    if (!texRef.current) texRef.current = createFloorTexture()
    const mat = matRef.current
    if (mat) {
      mat.map = texRef.current
      mat.needsUpdate = true
    }
    const tex = texRef.current
    return () => {
      tex.dispose()
      texRef.current = null
    }
  }, [])

  return (
    <mesh
      name="floor"
      position={[0, FLOOR.y, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      // Drawn before the machine so it never sorts in front of it.
      renderOrder={-1}
    >
      <planeGeometry args={[FLOOR.size, FLOOR.size]} />
      <meshBasicMaterial ref={matRef} transparent depthWrite={false} />
    </mesh>
  )
}
