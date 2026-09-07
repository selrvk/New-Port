"use client"

// components/laptop/KeyLegends.tsx
//
// Relabels individual keycaps, for the Languages section.
//
// The keyboard is painted into the frame texture, and the glow overlay is additive
// precisely so it does not hide those painted legends. But changing a legend means
// covering one — so this is a separate, mostly-transparent plane lying over the key
// block, opaque ONLY on the keys a language actually remaps.
//
// Repainting the model's own 1024² atlas was the alternative. It would look native,
// but it needs a per-key UV map of artwork we did not author, and every key we got
// wrong would corrupt the texture. This needs only the grid we already calibrated
// for the glow, and it cannot damage anything.
//
// The plane sits in the same space as the keycap glow, so the two stay aligned by
// construction rather than by a second set of numbers.

import { useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import * as THREE from "three"

import { GRID_UNITS_X, GRID_UNITS_Y, KEYS } from "@/data/keyboard"
import { COLORS, KEYBOARD } from "./config"
import { mono } from "./lib/canvas2d"

/** Canvas resolution across the key block. Matches the grid's aspect. */
const TEX_W = 2048
const TEX_H = Math.round((TEX_W * GRID_UNITS_Y) / GRID_UNITS_X)

export type LegendState = {
  /** Key id → replacement legend. Empty string blanks the key. */
  overrides: Record<string, string>
  /** Key ids currently highlighted as just-changed, 0→1 strength. */
  highlight: number
  changed: Set<string>
}

type Props = {
  /** Owned by the caller; mutated in place and read each frame. */
  stateRef: React.RefObject<LegendState>
}

type Resources = { ctx: CanvasRenderingContext2D; texture: THREE.CanvasTexture }

function createResources(): Resources {
  const canvas = document.createElement("canvas")
  canvas.width = TEX_W
  canvas.height = TEX_H
  const ctx = canvas.getContext("2d")!
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return { ctx, texture }
}

export function KeyLegends({ stateRef }: Props) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null)
  const lastKey = useRef("")
  // A ref, not useMemo: we mutate `texture.needsUpdate` every repaint, and values
  // returned from hooks are not meant to be mutated.
  const resRef = useRef<Resources | null>(null)

  useEffect(() => {
    if (!resRef.current) resRef.current = createResources()
    const mat = matRef.current
    if (mat) {
      mat.map = resRef.current.texture
      mat.needsUpdate = true
    }
    lastKey.current = ""
    const res = resRef.current
    return () => {
      res.texture.dispose()
      resRef.current = null
    }
  }, [])

  useFrame(() => {
    const state = stateRef.current
    const mat = matRef.current
    const res = resRef.current
    if (!state || !mat || !res) return

    // Repaint only when the label set or the highlight actually changes.
    const signature = `${Object.entries(state.overrides).join("|")}#${state.highlight.toFixed(2)}`
    if (signature === lastKey.current) return
    lastKey.current = signature

    paintLegends(res.ctx, state)
    res.texture.needsUpdate = true
    mat.opacity = Object.keys(state.overrides).length ? 1 : 0
  })

  const w = GRID_UNITS_X * KEYBOARD.unit.x
  const d = GRID_UNITS_Y * KEYBOARD.unit.z

  return (
    <mesh
      name="key-legends"
      // Just above the deck, just below the glow, lying flat.
      position={[KEYBOARD.origin.x + w / 2, KEYBOARD.y - 0.0015, KEYBOARD.origin.z + d / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={1}
    >
      <planeGeometry args={[w, d]} />
      <meshBasicMaterial
        ref={matRef}
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}

function paintLegends(ctx: CanvasRenderingContext2D, state: LegendState) {
  ctx.clearRect(0, 0, TEX_W, TEX_H)

  const ux = TEX_W / GRID_UNITS_X
  const uz = TEX_H / GRID_UNITS_Y
  const inset = ux * 0.07

  for (const key of KEYS) {
    const label = state.overrides[key.id]
    if (label === undefined) continue

    const x = key.x * ux + inset
    const y = key.y * uz + inset
    const w = key.w * ux - inset * 2
    const h = key.h * uz - inset * 2

    // Opaque keycap face, matched to the painted keys, so the old legend is gone.
    ctx.fillStyle = "#0E0F11"
    roundRectPath(ctx, x, y, w, h, Math.min(w, h) * 0.17)
    ctx.fill()

    // A just-remapped key gets a neon edge so the change is legible at a glance.
    const hot = state.changed.has(key.id) ? state.highlight : 0
    if (hot > 0.01) {
      ctx.strokeStyle = `rgba(232,255,71,${(0.85 * hot).toFixed(3)})`
      ctx.lineWidth = Math.max(2, ux * 0.05)
      roundRectPath(ctx, x, y, w, h, Math.min(w, h) * 0.17)
      ctx.stroke()
    } else {
      ctx.strokeStyle = "rgba(240,237,230,0.10)"
      ctx.lineWidth = 2
      roundRectPath(ctx, x, y, w, h, Math.min(w, h) * 0.17)
      ctx.stroke()
    }

    if (!label) continue

    const size = Math.round(Math.min(h * 0.5, ux * 0.42))
    ctx.font = mono(size, 500)
    ctx.textBaseline = "middle"
    ctx.fillStyle = hot > 0.01 ? COLORS.neon : COLORS.paper
    ctx.fillText(label, x + w / 2 - ctx.measureText(label).width / 2, y + h / 2)
  }
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
