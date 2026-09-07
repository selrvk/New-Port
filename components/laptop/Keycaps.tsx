"use client"

// components/laptop/Keycaps.tsx
//
// Backlighting for the painted keyboard.
//
// The model has NO key geometry — the keyboard is artwork baked into the frame
// texture. The first instinct is to cover it with opaque keycap tiles, but that
// throws away the painted legends, and then every letter has to be re-rendered as
// a texture just to get back to where the model started.
//
// Instead these are ADDITIVE glow quads sitting a hair above the deck. A key with
// glow 0 gets instanceColor black, and additive black contributes nothing — so it
// is genuinely invisible and the artwork shows through untouched. Turning a key up
// adds light over its painted legend, which is exactly what a backlit key does.
//
// One InstancedMesh, one draw call, per-key intensity through instanceColor. No
// allocation in the frame loop.

import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"

import { KEYS, KEY_COUNT } from "@/data/keyboard"
import { COLORS, KEYBOARD } from "./config"

type Props = {
  /**
   * Per-key glow, 0→1+, indexed like KEYS. Owned by the caller so the Skills and
   * Languages sections can each drive it. Mutated in place, never reallocated.
   */
  glowRef: React.RefObject<Float32Array>
  /** Renders the grid as wireframe for aligning it to the painted keyboard. */
  debug?: boolean
  /** Live override for the calibration rig; production uses config. */
  calibration?: { origin: { x: number; z: number }; unit: { x: number; z: number } }
}

const _m = new THREE.Matrix4()
const _pos = new THREE.Vector3()
const _quat = new THREE.Quaternion()
const _scale = new THREE.Vector3()
const _color = new THREE.Color()
const NEON = new THREE.Color(COLORS.neon)
const WHITE = new THREE.Color(0xffffff)
const BLACK = new THREE.Color(0x000000)

/** Lay the quads flat on the deck, facing up. */
const FLAT = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))

/**
 * Soft-edged rounded rectangle used as the glow sprite. Drawn once, procedurally,
 * so there is no texture to ship and it scales with the key size.
 */
function makeGlowTexture(): THREE.CanvasTexture {
  const size = 128
  const c = document.createElement("canvas")
  c.width = c.height = size
  const ctx = c.getContext("2d")!
  ctx.clearRect(0, 0, size, size)
  ctx.filter = "blur(9px)"
  ctx.fillStyle = "#ffffff"
  const inset = 20
  const r = 14
  const w = size - inset * 2
  const h = size - inset * 2
  ctx.beginPath()
  ctx.moveTo(inset + r, inset)
  ctx.arcTo(inset + w, inset, inset + w, inset + h, r)
  ctx.arcTo(inset + w, inset + h, inset, inset + h, r)
  ctx.arcTo(inset, inset + h, inset, inset, r)
  ctx.arcTo(inset, inset, inset + w, inset, r)
  ctx.closePath()
  ctx.fill()
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export function Keycaps({ glowRef, debug = false, calibration }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const texture = useMemo(() => makeGlowTexture(), [])
  useEffect(() => () => texture.dispose(), [texture])

  // Static layout — computed once. Positions are on the deck, in scene units.
  const layout = useMemo(() => {
    const origin = calibration?.origin ?? KEYBOARD.origin
    const unit = calibration?.unit ?? KEYBOARD.unit
    const { gap } = KEYBOARD
    return KEYS.map((k) => ({
      x: origin.x + (k.x + k.w / 2) * unit.x,
      // k.y is the cumulative height of the rows above, and k.h this row's height,
      // so the short function row does not shift everything below it.
      z: origin.z + (k.y + k.h / 2) * unit.z,
      // Glow spills slightly past the keycap, as backlight bleed does.
      w: k.w * unit.x * (1 - gap) * 1.25,
      d: k.h * unit.z * (1 - gap) * 1.3,
    }))
  }, [calibration])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    for (let i = 0; i < layout.length; i++) {
      const l = layout[i]
      _pos.set(l.x, KEYBOARD.y, l.z)
      _quat.copy(FLAT)
      _scale.set(l.w, l.d, 1)
      _m.compose(_pos, _quat, _scale)
      mesh.setMatrixAt(i, _m)
      // InstancedMesh multiplies material.color by instanceColor, so in debug the
      // instances must be white or the wireframe inherits whatever colour is set.
      mesh.setColorAt(i, debug ? WHITE : BLACK)
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [layout, debug])

  useFrame(() => {
    const mesh = meshRef.current
    const glow = glowRef.current
    if (debug || !mesh || !glow || !mesh.instanceColor) return
    for (let i = 0; i < KEY_COUNT; i++) {
      const g = glow[i]
      // Black is the "off" state: additive blending makes it contribute nothing.
      if (g <= 0) _color.copy(BLACK)
      else _color.copy(NEON).multiplyScalar(Math.min(g, 2.4))
      mesh.setColorAt(i, _color)
    }
    mesh.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, KEY_COUNT]}
      frustumCulled={false}
      name="keycaps"
      renderOrder={2}
    >
      <planeGeometry args={[1, 1]} />
      {debug ? (
        <meshBasicMaterial color="#00FF88" wireframe depthTest={false} transparent opacity={0.95} />
      ) : (
        <meshBasicMaterial
          map={texture}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      )}
    </instancedMesh>
  )
}
