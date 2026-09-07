"use client"

// components/laptop/ScreenSurface.tsx
//
// The laptop's display: a plane inside `lidGroup` carrying a CanvasTexture.
//
// The UI is painted onto the model rather than floated over it in DOM, so it
// foreshortens with the lid and lights the scene. It lives on its own plane rather
// than on the model's screen mesh because that mesh shares one atlas between the
// display face, the lid back and the rim — painting it directly would smear the UI
// across all three. The plane also gives us clean 0→1 UVs, which is what makes the
// Projects tab raycasting work.
//
// Redraws are driven by progress, not by elapsed time — scrub backwards and you get
// the same pixels. Two sections are deliberate exceptions, and both repaint on a
// signal rather than on a fixed timer so a still page is not redrawing for nothing:
// Contact (a blinking caret and live typing) and Languages (the greeting loop).
//
// The canvas/texture live in a ref rather than useMemo because we mutate them
// (`texture.needsUpdate`) every frame, and values returned from hooks are not
// supposed to be mutated. The material's maps are attached in an effect.

import { useFrame, type ThreeEvent } from "@react-three/fiber"
import { useCallback, useEffect, useRef } from "react"
import * as THREE from "three"

import { projects } from "@/data/projects"
import { SCREEN, SECTIONS } from "./config"
import { invalidateFonts } from "./lib/canvas2d"
import { onImageLoaded, preloadImages } from "./lib/imageCache"
import { localProgress, sampleTable } from "./lib/keyframes"
import { contactState } from "./contact/state"
import { greetingSignature, languageSlot } from "./languages/greeting"
import { paintScreen, sectionAt } from "./screens"
import {
  linkAtUv,
  linkKey,
  progressForProject,
  setHoveredLink,
  tabAtUv,
  type LinkHit,
} from "./screens/projectsLayout"
import { useScrollToProgress } from "./useScrollProgress"

type Props = {
  progressRef: React.RefObject<number>
}

/** Progress delta below which a repaint is not worth it (~2500 steps per page). */
const REDRAW_EPSILON = 0.0004

type Resources = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  texture: THREE.CanvasTexture
}

function createResources(): Resources {
  const canvas = document.createElement("canvas")
  canvas.width = SCREEN.canvas.width
  canvas.height = SCREEN.canvas.height
  const ctx = canvas.getContext("2d", { alpha: false })!
  ctx.fillStyle = "#05070A"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  return { canvas, ctx, texture }
}

export function ScreenSurface({ progressRef }: Props) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const resRef = useRef<Resources | null>(null)
  const lastDrawn = useRef(Number.NaN)
  const hoveredTab = useRef<number | null>(null)
  const lastVersion = useRef(-1)
  const lastLive = useRef(0)
  const lastGreeting = useRef("")
  const scrollToProgress = useScrollToProgress()

  /** Force a repaint on the next frame. */
  const invalidatePaint = useCallback(() => {
    lastDrawn.current = Number.NaN
  }, [])

  // Create once, attach to the material, and dispose on unmount.
  useEffect(() => {
    if (!resRef.current) resRef.current = createResources()
    const { texture } = resRef.current
    const mat = matRef.current
    if (mat) {
      mat.map = texture
      mat.emissiveMap = texture
      mat.needsUpdate = true
    }
    invalidatePaint()
    return () => {
      resRef.current?.texture.dispose()
      resRef.current = null
    }
  }, [invalidatePaint])

  // Screenshots load asynchronously; repaint when each one lands so the project
  // preview appears instead of staying on the placeholder until the next scroll.
  useEffect(() => {
    preloadImages(projects.map((p) => p.image))
    return onImageLoaded(invalidatePaint)
  }, [invalidatePaint])

  // Webfonts resolve after first paint; re-read the family names and force a
  // repaint once they land, or the screen keeps whatever fell back initially.
  useEffect(() => {
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (cancelled) return
      invalidateFonts()
      invalidatePaint()
    })
    return () => {
      cancelled = true
    }
  }, [invalidatePaint])

  // Never leave the document stuck on a pointer cursor if we unmount mid-hover.
  useEffect(() => {
    return () => {
      if (hoveredTab.current !== null) document.body.style.cursor = ""
      setHoveredLink(null)
    }
  }, [])

  useFrame(() => {
    const res = resRef.current
    if (!res) return
    const p = progressRef.current ?? 0

    // The two screens that move without scrolling. Repainting this canvas is not
    // cheap (it is re-uploaded to the GPU whole), so neither of these runs every
    // frame.
    let live = false
    const section = sectionAt(p)

    if (section === "contact") {
      // A caret blinking on wall-clock time, plus whatever the visitor types.
      // 12fps is plenty for both.
      const now = performance.now()
      if (contactState.version !== lastVersion.current || now - lastLive.current > 80) {
        lastVersion.current = contactState.version
        lastLive.current = now
        live = true
      }
    } else if (section === "languages") {
      // The greeting loop. Only two things can change — the number of characters
      // in the field and the caret — so repaint when one of them actually does
      // rather than on a timer. That is a handful of repaints a second while
      // typing and two a second while the caret blinks over a finished word.
      const slot = languageSlot(
        localProgress(p, SECTIONS.languages.start, SECTIONS.languages.end)
      )
      const sig = greetingSignature(slot, performance.now())
      if (sig !== lastGreeting.current) {
        lastGreeting.current = sig
        live = true
      }
    }

    if (live || Number.isNaN(lastDrawn.current) || Math.abs(p - lastDrawn.current) > REDRAW_EPSILON) {
      paintScreen(res.ctx, res.canvas.width, res.canvas.height, p)
      res.texture.needsUpdate = true
      lastDrawn.current = p
    }

    // Emissive intensity: dark until the machine boots, then steady.
    const mat = matRef.current
    if (mat) {
      const hero = SECTIONS.hero
      mat.emissiveIntensity =
        p < hero.end
          ? sampleTable(SCREEN.bootFlicker, localProgress(p, hero.start, hero.end)) *
            SCREEN.emissive.boot
          : SCREEN.emissive.on
    }
  })

  /** The screen is only interactive while the Projects section owns it. */
  const hitTest = useCallback(
    (e: ThreeEvent<PointerEvent> | ThreeEvent<MouseEvent>) => {
      if (!e.uv || sectionAt(progressRef.current ?? 0) !== "projects") {
        return { tab: null as number | null, link: null as LinkHit | null }
      }
      return {
        tab: tabAtUv(e.uv.x, e.uv.y),
        link: linkAtUv(e.uv.x, e.uv.y, SCREEN.canvas.width, SCREEN.canvas.height),
      }
    },
    [progressRef]
  )

  const setCursor = useCallback((on: boolean) => {
    document.body.style.cursor = on ? "pointer" : ""
  }, [])

  const handleMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const { tab, link } = hitTest(e)
      const key = link ? linkKey(link.project, link.kind) : null
      // Only repaint when the hovered link actually changes, not every frame.
      if (setHoveredLink(key)) invalidatePaint()

      const target = tab !== null || link !== null
      if (target === (hoveredTab.current !== null)) return
      hoveredTab.current = target ? (tab ?? 0) : null
      setCursor(target)
    },
    [hitTest, invalidatePaint, setCursor]
  )

  const handleOut = useCallback(() => {
    if (setHoveredLink(null)) invalidatePaint()
    if (hoveredTab.current === null) return
    hoveredTab.current = null
    setCursor(false)
  }, [invalidatePaint, setCursor])

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      const { tab, link } = hitTest(e)

      // A link wins over the tab strip; they never overlap, but be explicit.
      if (link) {
        e.stopPropagation()
        window.open(link.href, "_blank", "noopener,noreferrer")
        return
      }
      if (tab !== null) {
        e.stopPropagation()
        scrollToProgress(progressForProject(tab))
      }
    },
    [hitTest, scrollToProgress]
  )

  return (
    <mesh
      name="screen-surface"
      position={[0, SCREEN.placement.y, SCREEN.placement.z]}
      onPointerMove={handleMove}
      onPointerOut={handleOut}
      onClick={handleClick}
    >
      <planeGeometry args={[SCREEN.size.width, SCREEN.size.height]} />
      <meshStandardMaterial
        ref={matRef}
        color={SCREEN.surface.color}
        emissive="#ffffff"
        emissiveIntensity={0}
        roughness={SCREEN.surface.roughness}
        metalness={SCREEN.surface.metalness}
        toneMapped={false}
      />
    </mesh>
  )
}
