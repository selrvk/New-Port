"use client"

// app/calibrate/CalibrateClient.tsx
//
// Dev-only rig for tuning components/laptop/config.ts against the real model.
//
//   /calibrate?kf=3      jump to CAMERA_KEYFRAMES[3]
//   /calibrate?p=0.42    arbitrary scroll progress
//   /calibrate?free=1    OrbitControls, for finding new poses
//   /calibrate?helpers=1 axes + grid + hinge marker
//   /calibrate?keys=1&tune=1  nudge the keycap grid onto the painted keys with the
//                             arrow keys (shift = resize), then copy the printed
//                             values into KEYBOARD in config.ts
//
// Not shipped: app/calibrate/page.tsx 404s outside development.

import { OrbitControls } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"

import { CameraRig } from "@/components/laptop/CameraRig"
import { KEY_COUNT } from "@/data/keyboard"
import { Keycaps } from "@/components/laptop/Keycaps"
import { Laptop, type MeasureInfo } from "@/components/laptop/Laptop"
import {
  CAMERA,
  CAMERA_KEYFRAMES,
  DECK,
  HINGE,
  KEYBOARD,
  LID,
  LID_EASE,
  LID_KEYFRAMES,
  LIGHTS,
  SCREEN,
  SCREEN_CENTER,
  SECTIONS,
  SECTION_ORDER,
} from "@/components/laptop/config"
import { sampleScalar } from "@/components/laptop/lib/keyframes"

const fmt = (v: number) => (Math.round(v * 1000) / 1000).toFixed(3)
const fmtVec = (v: THREE.Vector3) => `[${fmt(v.x)}, ${fmt(v.y)}, ${fmt(v.z)}]`

/**
 * Drives the render loop from a timer instead of requestAnimationFrame.
 *
 * The Browser pane this gets screenshotted in is often hidden, and hidden tabs
 * never fire rAF — so R3F's normal loop would never paint a frame. Timers do run
 * in hidden tabs, so `frameloop="never"` + explicit advance() gives us a
 * deterministic, always-paintable frame. Production uses the normal rAF loop.
 */
function TimerLoop({ onTick }: { onTick: (n: number) => void }) {
  const advance = useThree((s) => s.advance)
  useEffect(() => {
    let n = 0
    const id = setInterval(() => {
      advance(performance.now())
      onTick(++n)
    }, 100)
    return () => clearInterval(id)
  }, [advance, onTick])
  return null
}

/**
 * Dev probe. Reports through React state (and therefore the DOM) rather than a
 * global: the automation context that reads this page shares the DOM but not
 * `window`, so globals are invisible to it.
 */
function SceneProbe({ onReport }: { onReport: (r: SceneReport) => void }) {
  const state = useThree()
  const frames = useRef(0)
  const last = useRef(0)
  useFrame(() => {
    frames.current++
    const now = performance.now()
    if (now - last.current < 400) return
    last.current = now
    let meshes = 0
    let visibleMeshes = 0
    state.scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        meshes++
        if (o.visible) visibleMeshes++
      }
    })
    onReport({
      frames: frames.current,
      meshes,
      visibleMeshes,
      sceneChildren: state.scene.children.length,
      size: [state.size.width, state.size.height],
      camPos: state.camera.position.toArray().map((v) => +v.toFixed(3)) as [number, number, number],
    })
  })
  return null
}

type SceneReport = {
  frames: number
  meshes: number
  visibleMeshes: number
  sceneChildren: number
  size: [number, number]
  camPos: [number, number, number]
}

export default function CalibrateClient() {
  const params = useSearchParams()

  const free = params.get("free") === "1"
  const helpers = params.get("helpers") === "1"
  /** ?bare=1 renders a plain box instead of the GLB — isolates loader problems. */
  const bare = params.get("bare") === "1"
  /** ?clean=1 hides the overlays so they don't occlude what's being measured. */
  const clean = params.get("clean") === "1"
  /** ?keys=1 overlays the keycap grid (wireframe) for aligning it to the painting. */
  const keys = params.get("keys") === "1"
  /** ?tune=1 enables live nudging of the keycap grid. */
  const tune = params.get("tune") === "1"
  const kf = params.get("kf")
  const pParam = params.get("p")

  const progress = useMemo(() => {
    if (pParam != null) return Math.max(0, Math.min(1, parseFloat(pParam) || 0))
    if (kf != null) {
      const i = Math.max(0, Math.min(CAMERA_KEYFRAMES.length - 1, parseInt(kf, 10) || 0))
      return CAMERA_KEYFRAMES[i].progress
    }
    return 0
  }, [pParam, kf])

  const progressRef = useRef(progress)
  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  const [measured, setMeasured] = useState<MeasureInfo | null>(null)
  const onMeasure = useCallback((m: MeasureInfo) => setMeasured(m), [])

  const [report, setReport] = useState<SceneReport | null>(null)
  const onReport = useCallback((r: SceneReport) => setReport(r), [])
  const [ticks, setTicks] = useState(0)
  // Debug grid does not animate; Keycaps still wants a glow buffer.
  const debugGlow = useRef(new Float32Array(KEY_COUNT))
  const onTick = useCallback((n: number) => setTicks(n), [])

  // ── Live keycap-grid tuning ──
  // Alignment has to be judged by eye against painted artwork, so rather than
  // guess-and-rebuild, nudge it here and paste the result into config.
  const [cal, setCal] = useState({
    origin: { ...KEYBOARD.origin },
    unit: { ...KEYBOARD.unit },
  })

  useEffect(() => {
    if (!tune) return
    const STEPS: Record<string, [axis: "x" | "z", dir: number]> = {
      ArrowLeft: ["x", -1],
      ArrowRight: ["x", 1],
      ArrowUp: ["z", -1],
      ArrowDown: ["z", 1],
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "r") {
        setCal({ origin: { ...KEYBOARD.origin }, unit: { ...KEYBOARD.unit } })
        return
      }
      const move = STEPS[e.key]
      if (!move) return

      // preventDefault belongs here, not inside the updater: React treats updaters
      // as pure and calls them twice under StrictMode, which both fires the side
      // effect twice and applies the nudge twice per keypress.
      e.preventDefault()

      const [axis, dir] = move
      const step = (e.shiftKey ? 0.002 : 0.004) * dir
      setCal((c) =>
        e.shiftKey
          ? { origin: { ...c.origin }, unit: { ...c.unit, [axis]: c.unit[axis] + step } }
          : { origin: { ...c.origin, [axis]: c.origin[axis] + step }, unit: { ...c.unit } }
      )
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [tune])

  const activeKf = useMemo(() => {
    let best = CAMERA_KEYFRAMES[0]
    for (const f of CAMERA_KEYFRAMES) if (f.progress <= progress + 1e-6) best = f
    return best
  }, [progress])

  const activeSection = useMemo(
    () => SECTION_ORDER.find((id) => progress >= SECTIONS[id].start && progress < SECTIONS[id].end) ?? "contact",
    [progress]
  )

  const lidRotation = sampleScalar(LID_KEYFRAMES, progress, "rotation", LID_EASE)

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0A0A0A" }}>
      <Canvas
        dpr={1}
        frameloop="never"
        gl={{ antialias: true }}
        camera={{ fov: CAMERA.defaultFov, near: CAMERA.near, far: CAMERA.far, position: [3, 2, 4] }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
        }}
      >
        <color attach="background" args={["#0A0A0A"]} />

        <ambientLight intensity={LIGHTS.ambient.intensity} color={LIGHTS.ambient.color} />
        <directionalLight position={LIGHTS.key.position} intensity={LIGHTS.key.intensity} color={LIGHTS.key.color} />
        <directionalLight position={LIGHTS.fill.position} intensity={LIGHTS.fill.intensity} color={LIGHTS.fill.color} />
        <directionalLight position={LIGHTS.rim.position} intensity={LIGHTS.rim.intensity} color={LIGHTS.rim.color} />

        {bare ? (
          <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[2, 1.2, 1.4]} />
            <meshStandardMaterial color="#E8FF47" />
          </mesh>
        ) : (
        <Laptop
          progressRef={progressRef}
          onMeasure={onMeasure}
          lidChildren={
            helpers ? (
              <>
                {/* Where the ScreenSurface plane will sit. */}
                <mesh position={[0, SCREEN.placement.y, SCREEN.placement.z]}>
                  <planeGeometry args={[SCREEN.size.width, SCREEN.size.height]} />
                  <meshBasicMaterial color="#E8FF47" wireframe transparent opacity={0.8} />
                </mesh>
                {/* Lid up-axis. */}
                <arrowHelper args={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), LID.height, 0xff2d6b]} />
              </>
            ) : null
          }
        >
          {helpers ? (
            <>
              <axesHelper args={[2]} />
              <gridHelper args={[8, 16, "#1E1E1E", "#141414"]} />
              {/* Hinge marker. */}
              <mesh position={[HINGE.x, HINGE.y, HINGE.z]}>
                <sphereGeometry args={[0.03, 12, 12]} />
                <meshBasicMaterial color="#FF2D6B" />
              </mesh>
              {/* Where the keyboard overlay grid will sit. */}
              <mesh position={[0, DECK.topY + 0.001, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[2.32, 1.0]} />
                <meshBasicMaterial color="#E8FF47" wireframe transparent opacity={0.45} />
              </mesh>
            </>
          ) : null}
          {keys ? <Keycaps glowRef={debugGlow} debug calibration={tune ? cal : undefined} /> : null}
        </Laptop>
        )}

        {free ? (
          <OrbitControls makeDefault target={[0, 0.7, -0.4]} />
        ) : (
          <CameraRig progressRef={progressRef} damping={0} />
        )}

        <TimerLoop onTick={onTick} />
        <SceneProbe onReport={onReport} />
      </Canvas>

      {/* ── Readout ── */}
      <div
        style={{
          display: clean ? "none" : "block",
          position: "fixed",
          left: 12,
          bottom: 12,
          maxWidth: 560,
          padding: "12px 14px",
          background: "rgba(10,10,10,0.86)",
          border: "1px solid #1E1E1E",
          color: "#F0EDE6",
          font: "11px/1.55 ui-monospace, SFMono-Regular, Menlo, monospace",
          whiteSpace: "pre-wrap",
          pointerEvents: "none",
        }}
      >
        <div style={{ color: "#E8FF47" }}>
          progress {fmt(progress)} · section {activeSection} · kf &quot;{activeKf.label}&quot;
        </div>
        <div>
          cam pos [{activeKf.position.map(fmt).join(", ")}] look [{activeKf.lookAt.map(fmt).join(", ")}] fov{" "}
          {activeKf.fov ?? CAMERA.defaultFov}
        </div>
        <div>
          lid worldRot {fmt(lidRotation)} rad ({fmt((lidRotation * 180) / Math.PI)}°) · open{" "}
          {fmt((LID.worldOpen * 180) / Math.PI)}° closed {fmt((LID.worldClosed * 180) / Math.PI)}°
        </div>
        <div>screenCenter [{SCREEN_CENTER.map(fmt).join(", ")}]</div>
        <div style={{ color: report ? "#E8FF47" : "#FF2D6B" }}>
          ticks {ticks} · {report
            ? `frames ${report.frames} · meshes ${report.visibleMeshes}/${report.meshes} · sceneChildren ${report.sceneChildren} · canvas ${report.size[0]}x${report.size[1]} · cam [${report.camPos.join(", ")}]`
            : "NO FRAMES RENDERED"}
        </div>
        {measured ? (
          <div style={{ marginTop: 6, color: "#8f8f8f" }}>
            <div style={{ color: "#FF2D6B" }}>MEASURED (open pose, scene units)</div>
            <div>deck min {fmtVec(measured.deck.min)} max {fmtVec(measured.deck.max)}</div>
            <div>lid min {fmtVec(measured.lid.min)} max {fmtVec(measured.lid.max)}</div>
            <div>whole min {fmtVec(measured.whole.min)} max {fmtVec(measured.whole.max)}</div>
            <div>nodes: {measured.nodeNames.join(", ")}</div>
          </div>
        ) : (
          <div style={{ marginTop: 6, color: "#8f8f8f" }}>measuring…</div>
        )}
      </div>

      {/* ── Grid tuner ── */}
      {tune ? (
        <div
          style={{
            position: "fixed",
            left: 12,
            top: 12,
            zIndex: 60,
            padding: "10px 12px",
            background: "rgba(10,10,10,0.92)",
            border: "1px solid #E8FF47",
            color: "#F0EDE6",
            font: "11px/1.6 ui-monospace, Menlo, monospace",
            whiteSpace: "pre",
          }}
        >
          <div style={{ color: "#E8FF47" }}>KEYCAP GRID TUNER</div>
          <div style={{ color: "#6B6860" }}>arrows = move · shift+arrows = resize · r = reset</div>
          <div style={{ marginTop: 6 }}>
            {`origin: { x: ${cal.origin.x.toFixed(4)}, z: ${cal.origin.z.toFixed(4)} },`}
          </div>
          <div>{`unit:   { x: ${cal.unit.x.toFixed(4)}, z: ${cal.unit.z.toFixed(4)} },`}</div>
        </div>
      ) : null}

      {/* ── Keyframe index ── */}
      <div
        style={{
          display: clean ? "none" : "block",
          position: "fixed",
          right: 12,
          top: 12,
          padding: "10px 12px",
          background: "rgba(10,10,10,0.86)",
          border: "1px solid #1E1E1E",
          color: "#6B6860",
          font: "10px/1.7 ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        {CAMERA_KEYFRAMES.map((f, i) => (
          <div key={i} style={{ color: f === activeKf ? "#E8FF47" : undefined }}>
            <a href={`?kf=${i}`} style={{ color: "inherit", textDecoration: "none" }}>
              {String(i).padStart(2, "0")} {fmt(f.progress)} {f.label}
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
