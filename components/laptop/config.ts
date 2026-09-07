// components/laptop/config.ts
//
// ─────────────────────────────────────────────────────────────────────────────
//  THE ONE PLACE TO TUNE THE 3D EXPERIENCE.
//  Camera keyframes, progress ranges, easing, glow, colours, key grid, stickers.
//  Adding a section = add a SECTION range + a CAMERA keyframe. No new anim code.
// ─────────────────────────────────────────────────────────────────────────────
//
//  MODEL FACTS (measured from public/laptop.glb — do not guess these):
//
//    Nodes:  Sketchfab_model → .fbx → RootNode → { Frame, Screen }
//      "Frame"  → mesh Frame_ComputerFrame_0   (8222 verts, material "ComputerFrame")
//                 The ENTIRE laptop base. The keyboard is PAINTED INTO ITS TEXTURE —
//                 there are no keycap meshes. Hence the InstancedMesh overlay.
//      "Screen" → mesh Screen_ComputerScreen_0 (203 verts, material "ComputerScreen")
//                 The whole lid: display face + lid back + rim, one material.
//                 There is no separate display mesh — hence the ScreenSurface plane.
//
//    Node matrices decompose to:
//      Frame  : Rx(-90°), scale 100, translate (0, 0.9755, 0)
//      Screen : Ry(180°),  scale (100, 100, 88.235), translate (0, 0.65, -10.3)
//
//    Because Screen carries Ry(180°), its LOCAL +X points to world -X. So a local
//    rotation.x of φ produces a world rotation of -φ about world +X.
//      rotation.x =  0        → lid perfectly upright (90° open)
//      rotation.x = -PI/2     → lid closed, flat on the deck
//      rotation.x = +0.26     → lid leaning back ~105° (natural "open" pose)
//
//    Native-unit bounds (before MODEL_SCALE):
//      deck   X [-15.2, 15.2]  Y [-0.02, 0.98]  Z [-10.5, 9.6]
//      hinge  (0, 0.65, -10.3)   ← back edge of the deck, just above its surface
//      lid    30.4 wide x 20.1 tall, display faces world +Z
//
//  Values marked [CAL] were calibrated against the render, not just the matrices.

import * as THREE from "three"

// ─── Model ───────────────────────────────────────────────────────────────────

export const MODEL = {
  path: "/laptop.glb",
  /** 1 scene unit ≈ 10 cm. Deck becomes 3.04 wide x 2.01 deep. */
  scale: 0.1,
  nodes: {
    frame: "Frame",
    frameMesh: "Frame_ComputerFrame_0",
    lid: "Screen",
    lidMesh: "Screen_ComputerScreen_0",
  },
  materials: {
    frame: "ComputerFrame",
    screen: "ComputerScreen",
  },
  /** Native-unit measurements, scaled by `scale` at use sites. */
  native: {
    deck: { minX: -15.2, maxX: 15.2, minY: -0.02, maxY: 0.98, minZ: -10.5, maxZ: 9.6 },
    hinge: new THREE.Vector3(0, 0.65, -10.3),
    lidSize: { w: 30.4, h: 20.1 },
  },
} as const

/** Scaled convenience values — everything below is in scene units. */
export const DECK = {
  halfWidth: 15.2 * MODEL.scale,   // 1.52
  frontZ: 9.6 * MODEL.scale,       // 0.96
  backZ: -10.5 * MODEL.scale,      // -1.05
  topY: 0.98 * MODEL.scale,        // 0.098
}

export const HINGE = new THREE.Vector3(0, 0.65 * MODEL.scale, -10.3 * MODEL.scale) // (0, 0.065, -1.03)

/**
 * The lid.
 *
 * IMPORTANT: we never parent our own meshes to the GLB's "Screen" node — it carries
 * a non-uniform scale (100, 100, 88.235), which would distort any child's size and
 * offsets. Instead we keep a plain `lidGroup` in clean scene units, pinned at the
 * hinge, and drive BOTH it and the GLB node from the same rotation value.
 *
 *   lidGroup.rotation.x       = worldRotation
 *   screenNode.rotation.x     = worldRotation * nodeSign
 *
 * `nodeSign` is -1 because the GLB node carries Ry(180°), which flips its local X.
 *
 * In lidGroup local space (at worldRotation 0, i.e. bolt upright):
 *   +Y runs up the panel from the hinge,  +Z faces the viewer,  +X is screen-right.
 */
export const LID = {
  /** World rotation about +X. Folds the lid forward, flat onto the deck. */
  worldClosed: Math.PI / 2,
  /** ~105° open — the natural lean-back pose. Negative = top tips away from viewer. */
  worldOpen: -0.26,
  /** The GLB "Screen" node's local rotation is the negation of the world one. */
  nodeSign: -1,
  /** Lid dimensions in scene units. VERIFIED against the GLB: 3.040 x 1.991. */
  width: 3.04,
  /** Panel height measured from the hinge. */
  height: 1.99,
  /** Height of the panel's centre above the hinge (the mesh starts a hair below 0). */
  panelCenter: 0.986,
  /**
   * MEASURED: the lid is not a single slab. Its front is a dark bezel at z -0.033
   * with a separate DISPLAY QUAD behind it at z -0.038 — 2.94 x 1.70, centred at
   * y 1.0036 — and that quad is textured white.
   *
   * Our screen plane must match it. Sized smaller (it was 2.74 wide) the white
   * showed around the edges; that was the halo behind the UI.
   */
  displayQuad: { width: 2.94, height: 1.70, centerY: 1.0036, z: -0.038 },
  /**
   * MEASURED from the mesh, not assumed. In lidGroup space the lid is a slab
   * spanning z -0.060 to +0.034, and its flat outer face — the one the camera sees
   * when it orbits behind — is a perfectly flat 22-triangle plane at z = -0.0597.
   *
   * The stickers were originally placed at -0.004 on the assumption that "just
   * behind the lid" meant a small negative offset. That is INSIDE the slab, so they
   * rendered embedded between the display and the outer shell.
   */
  backFaceZ: -0.0597,
  /**
   * The hinge sits INSIDE the deck (y 0.065 vs deck top 0.098), because the model
   * was authored permanently open — the lid's bottom edge tucks behind the deck.
   * Rotating to a flat 90° therefore buries the lid in the base: it would span
   * y 0.024–0.125 against a deck of 0–0.098, leaving coplanar side faces that
   * z-fight and a closed laptop only 1.25 cm tall.
   *
   * Lifting the lid by this much as it closes seats it ON the deck instead, giving
   * a ~2 cm closed height. Ramped in over the last few degrees, so it reads as the
   * hinge taking up slack rather than the lid floating.
   */
  closedLift: 0.074,
}

// ─── Section progress ranges ─────────────────────────────────────────────────
//
// One continuous 0→1 scroll. Every visual is a pure function of it.
// `scrollVh` sets how many viewport-heights of scroll each section gets, which is
// what actually determines the page height; the ranges are derived from it.

export const SECTION_ORDER = [
  "hero",
  "projects",
  "skills",
  "certifications",
  "schools",
  "about",
  "languages",
  "contact",
] as const

export type SectionId = (typeof SECTION_ORDER)[number]

/** Viewport-heights of scroll allocated to each section. */
export const SECTION_SCROLL_VH: Record<SectionId, number> = {
  // The hero is long because three things happen in it: the lid opens, the POST
  // log types out, then the name card settles. Roughly 1.0vh / 1.0vh / 1.2vh.
  hero: 3.2,
  // ~0.52vh per project, so adding one lengthens the section rather than
  // speeding the others up. Six projects -> 3.1.
  projects: 3.1,
  // Six categories, each typing its name then listing its skills.
  skills: 3.0,
  certifications: 1.9,
  schools: 1.7,
  // Most reading of any section: four paragraphs plus the whoami block.
  about: 2.0,
  languages: 1.3,
  contact: 1.4,
}

export const TOTAL_SCROLL_VH = Object.values(SECTION_SCROLL_VH).reduce((a, b) => a + b, 0)

/** Derived { start, end } in 0→1 progress space. */
export const SECTIONS: Record<SectionId, { start: number; end: number }> = (() => {
  const out = {} as Record<SectionId, { start: number; end: number }>
  let cursor = 0
  for (const id of SECTION_ORDER) {
    const span = SECTION_SCROLL_VH[id] / TOTAL_SCROLL_VH
    out[id] = { start: cursor, end: cursor + span }
    cursor += span
  }
  return out
})()

/**
 * Resolve a point inside a section to global 0→1 progress.
 *
 * Every keyframe below is expressed this way rather than as a hardcoded global
 * number. That is the difference between the config being tunable and being a trap:
 * retiming one section (say, giving the hero twice the scroll) would otherwise slide
 * every later section out from under keyframes that were pinned to absolute values.
 *
 *   at("skills", 0)   → the moment the Skills section begins
 *   at("skills", 0.5) → halfway through it, whatever length it happens to be
 */
export function at(section: SectionId, t: number): number {
  const { start, end } = SECTIONS[section]
  return start + (end - start) * t
}

// ─── Camera ──────────────────────────────────────────────────────────────────
//
// Each frame: find the two keyframes bracketing progress, ease between them,
// then camera.lookAt(interpolated target). Adding a beat = adding a row here.

export type CameraKeyframe = {
  /** 0→1 scroll position this pose is pinned to. */
  progress: number
  position: [number, number, number]
  lookAt: [number, number, number]
  /** Vertical FOV in degrees. Lerped like everything else. */
  fov?: number
  /** Label for debugging / the calibration overlay. */
  label?: string
}

export const CAMERA = {
  defaultFov: 35,
  near: 0.1,
  far: 100,
  /** Extra smoothing applied to the camera on top of keyframe easing (0 = none). */
  damping: 0.12,
} as const

/**
 * Screen-centre when the lid is at LID.worldOpen — what most keyframes look at.
 * A world rotation θ about +X sends the panel's up-axis (0,1,0) to (0, cos θ, sin θ).
 */
const _theta = LID.worldOpen
export const SCREEN_CENTER: [number, number, number] = [
  0,
  HINGE.y + Math.cos(_theta) * LID.panelCenter,
  HINGE.z + Math.sin(_theta) * LID.panelCenter,
]
// ≈ [0, 1.018, -1.283]  (verified against the lid's measured bbox centre)

/** Outward normal of the display face at LID.worldOpen — used to place cameras. */
export const SCREEN_NORMAL: [number, number, number] = [0, -Math.sin(_theta), Math.cos(_theta)]
// ≈ [0, 0.257, 0.966]

/**
 * Framing maths behind the on-screen poses (all verified against the real mesh):
 *
 *   screen centre S = [0, 1.018, -1.283]      display normal n = [0, 0.257, 0.966]
 *   camera         = S + n * d
 *   visible height = 2 * d * tan(fov / 2)     → d = height / (2 * tan(fov / 2))
 *
 * The screen plane is 1.71 tall, so filling ~92% of frame height needs d ≈ 2.95
 * at fov 35. Width is never the binding constraint above ~4:3; NARROW VIEWPORTS
 * ARE — see CameraRig's aspect guard when that lands.
 */
export const CAMERA_KEYFRAMES: CameraKeyframe[] = [
  // ── Hero: closed, 3/4 angle, drifting in as the lid opens ──
  { progress: at("hero", 0.00), position: [2.30, 1.30, 2.55], lookAt: [0, 0.15, 0], fov: 38, label: "hero:closed" },
  { progress: at("hero", 0.30), position: [2.00, 1.35, 2.45], lookAt: [0, 0.45, -0.25], fov: 36, label: "hero:opening" },
  { progress: at("hero", 0.55), position: [1.35, 1.65, 2.30], lookAt: [0, 0.85, -0.60], fov: 35, label: "hero:awake" },
  { progress: at("hero", 1.00), position: [1.10, 1.72, 2.10], lookAt: [0, 0.95, -0.75], fov: 35, label: "hero:hold" },

  // ── Projects: push in until the screen fills the frame (d ≈ 2.95) ──
  { progress: at("projects", 0.06), position: [0.00, 1.776, 1.567], lookAt: SCREEN_CENTER, fov: 35, label: "projects:on-screen" },
  { progress: at("projects", 0.95), position: [0.00, 1.738, 1.422], lookAt: SCREEN_CENTER, fov: 34, label: "projects:hold" },

  // ── Skills: frame the keyboard AND the screen together ──
  //
  // This deliberately is NOT a top-down keyboard shot any more. The section's
  // payoff — the category name and its skill list — is drawn on the display, and a
  // top-down pose cannot see the display at all. Framing both means you watch the
  // keys light while the same word appears in the palette, which is the whole
  // reason a lit key is legible.
  //
  // Verified: at fov 46 from here, the deck's front edge sits ~20.3° off-axis and
  // the lid's top edge ~19.6°, both inside the 23° half-angle.
  { progress: at("skills", 0.06), position: [0.85, 2.45, 3.20], lookAt: [0, 0.66, -0.40], fov: 46, label: "skills:enter" },
  { progress: at("skills", 0.28), position: [0.00, 2.60, 3.30], lookAt: [0, 0.72, -0.45], fov: 46, label: "skills:both" },
  { progress: at("skills", 0.95), position: [0.00, 2.54, 3.22], lookAt: [0, 0.74, -0.48], fov: 45, label: "skills:hold" },

  // ── Certifications: orbit around to the back of the lid ──
  // The back-of-lid pose sits on -n so the lid back is near face-on (dot ≈ 0.96).
  { progress: at("certifications", 0.18), position: [2.35, 1.55, -2.20], lookAt: [0, 1.10, -1.30], fov: 38, label: "certs:orbit-in" },
  { progress: at("certifications", 0.50), position: [0.00, 1.05, -4.60], lookAt: [0, 1.15, -1.35], fov: 36, label: "certs:lid-back" },
  { progress: at("certifications", 0.95), position: [0.00, 1.08, -4.45], lookAt: [0, 1.15, -1.35], fov: 36, label: "certs:hold" },

  // ── Schools: swing back around to the screen ──
  { progress: at("schools", 0.14), position: [-2.20, 1.60, -1.90], lookAt: SCREEN_CENTER, fov: 37, label: "schools:orbit-out" },
  { progress: at("schools", 0.45), position: [0.00, 1.776, 1.567], lookAt: SCREEN_CENTER, fov: 35, label: "schools:on-screen" },
  { progress: at("schools", 0.95), position: [0.00, 1.762, 1.512], lookAt: SCREEN_CENTER, fov: 35, label: "schools:hold" },

  // ── About: settle slightly closer ──
  { progress: at("about", 0.30), position: [0.00, 1.743, 1.441], lookAt: SCREEN_CENTER, fov: 34, label: "about:readme" },
  { progress: at("about", 0.95), position: [0.00, 1.737, 1.410], lookAt: SCREEN_CENTER, fov: 34, label: "about:hold" },

  // ── Languages: pull back so screen AND keyboard are both visible ──
  { progress: at("languages", 0.30), position: [0.00, 2.30, 2.45], lookAt: [0, 0.80, -0.45], fov: 40, label: "languages:both" },
  { progress: at("languages", 0.95), position: [0.00, 2.26, 2.38], lookAt: [0, 0.80, -0.45], fov: 40, label: "languages:hold" },

  // ── Contact: back to the screen, then drift out as the lid closes ──
  { progress: at("contact", 0.22), position: [0.00, 1.743, 1.441], lookAt: SCREEN_CENTER, fov: 34, label: "contact:terminal" },
  // Hold on the form while it is fillable, then pull out as the lid folds shut.
  { progress: at("contact", 0.84), position: [0.00, 1.750, 1.470], lookAt: SCREEN_CENTER, fov: 34, label: "contact:hold" },
  { progress: at("contact", 1.00), position: [2.30, 1.30, 2.55], lookAt: [0, 0.15, 0], fov: 38, label: "contact:closed" },
]

/**
 * Keyframes must be sorted ascending — `bracket()` scans forward and assumes it.
 * Section-relative values make an out-of-order entry easy to introduce and
 * invisible at runtime (the camera would just snap), so fail loudly in development.
 */
if (process.env.NODE_ENV !== "production") {
  for (let i = 1; i < CAMERA_KEYFRAMES.length; i++) {
    if (CAMERA_KEYFRAMES[i].progress < CAMERA_KEYFRAMES[i - 1].progress) {
      console.error(
        `[config] CAMERA_KEYFRAMES out of order: "${CAMERA_KEYFRAMES[i - 1].label}" ` +
          `(${CAMERA_KEYFRAMES[i - 1].progress.toFixed(4)}) precedes ` +
          `"${CAMERA_KEYFRAMES[i].label}" (${CAMERA_KEYFRAMES[i].progress.toFixed(4)})`
      )
    }
  }
}

// ─── Lid keyframes ───────────────────────────────────────────────────────────
// Same bracket-and-lerp machinery as the camera. Closed → open → closed.

/**
 * `rotation` is the WORLD rotation about +X. See the LID block for the sign rules.
 *
 * The lid finishes opening at hero t=0.34, a hair after the panel first flickers at
 * t=0.315 — so the screen catches just as the hinge settles, rather than glowing at
 * a shut laptop or waking long after it stopped moving.
 */
export const LID_KEYFRAMES: { progress: number; rotation: number }[] = [
  { progress: at("hero", 0.00), rotation: LID.worldClosed },
  { progress: at("hero", 0.08), rotation: LID.worldClosed },
  { progress: at("hero", 0.34), rotation: LID.worldOpen },
  // The lid must not begin closing until the form has stopped accepting input
  // (ContactAnchor.INTERACTIVE_UNTIL = 0.84), or the invisible field ends up
  // hovering over a screen that is folding away.
  { progress: at("contact", 0.86), rotation: LID.worldOpen },
  { progress: at("contact", 1.00), rotation: LID.worldClosed },
]

/**
 * Vertical offset that seats the closed lid on top of the deck instead of inside
 * it — see LID.closedLift. Ramps out early in the open and back in late on the
 * close, so while the lid is open it contributes exactly nothing.
 */
export const LID_LIFT_KEYFRAMES: { progress: number; lift: number }[] = [
  { progress: at("hero", 0.00), lift: LID.closedLift },
  { progress: at("hero", 0.08), lift: LID.closedLift },
  { progress: at("hero", 0.24), lift: 0 },
  { progress: at("contact", 0.92), lift: 0 },
  { progress: at("contact", 1.00), lift: LID.closedLift },
]

// ─── Screen surface ──────────────────────────────────────────────────────────
//
// A plane inside `lidGroup` (clean scene units), floating just off the glass. It
// carries the CanvasTexture and is the raycast target for the Projects tab strip
// (its UVs are a clean 0→1, unlike the model's atlas UVs).

/**
 * Render layer that keeps the screen's spill light off the screen itself.
 *
 * That light exists to throw display-glow onto the deck and keyboard. Parked on the
 * panel's centre line to do that, it also lit the panel — so the display was
 * illuminating itself, and bloomed a soft white blob over the middle of the UI.
 *
 * The light is restricted to this layer; the model opts in, the screen plane does
 * not. Objects stay on layer 0 as well, so camera visibility is unaffected.
 */
export const SPILL_LAYER = 1

// ─── Floor ───────────────────────────────────────────────────────────────────

/**
 * The surface the machine sits on. One unlit, transparent plane carrying a
 * generated texture: a soft pool of light, a grid, and the shadow.
 *
 * The shadow is PAINTED, not computed. No light in this scene has `castShadow`,
 * so there is no shadow map to sample; and the deck never moves (only the lid
 * rotates, and its contribution to a contact shadow is negligible), so a real
 * shadow pass every frame would cost a render target to reproduce something we can
 * bake once. It is punched out of the light pool rather than drawn on top of it —
 * a shadow is the absence of the floor glow, which is also why it reads at all
 * against a black background.
 *
 * All distances are world units. The deck measures 3.04 x 2.01 at y = 0.
 */
export const FLOOR = {
  /** Exactly the deck's underside, so the machine sits ON it rather than above it. */
  y: 0,
  /** Plane size. The fade finishes well inside this, so no edge is ever visible. */
  size: 24,
  /** Texture resolution across `size`. Power of two, so mipmaps are generated. */
  resolution: 2048,
  /**
   * Light pooling around the machine. This is what the shadow cuts INTO, so it sets
   * the ceiling on how dark the shadow can read: punched out of a 5% pool, a shadow
   * is at most 5% dark, i.e. invisible. Tight and reasonably bright beats wide and
   * faint for that reason.
   */
  pool: { radius: 5.2, alpha: 0.135 },
  grid: { step: 1.0, majorEvery: 4, minorAlpha: 0.05, majorAlpha: 0.11, width: 2 },
  /** Everything fades to nothing by here — comfortably inside `size` / 2. */
  fadeRadius: 8.5,
  /** Ellipse under the deck. `soft` is how far the penumbra reaches past it. */
  shadow: { x: 0, z: -0.045, rx: 1.55, rz: 1.15, soft: 2.1, strength: 1.0 },
} as const

export const SCREEN = {
  /**
   * Drawn canvas resolution. The aspect MUST match the plane's, or every painter's
   * layout is stretched. The plane now matches the model's display quad (1.728),
   * so this does too — it used to be 1.6.
   */
  canvas: { width: 1728, height: 1000 },
  /** Exactly the model's display quad, so no white shows around the UI. */
  size: { width: 2.94, height: 1.7014 },
  /**
   * Placement inside `lidGroup`, whose origin is the hinge.
   * +Y runs up the panel, +Z faces the viewer. A PlaneGeometry already faces +Z,
   * so no rotation is needed.
   */
  placement: {
    /** Centre of the model's display quad (measured), not of the whole lid. */
    y: LID.displayQuad.centerY,
    /**
     * Sits between the bezel (-0.033) and the display quad (-0.038): in front of
     * the white so it is fully covered, but only ~3 mm proud of the bezel so the
     * UI does not visibly float above it at oblique angles. It used to be at
     * +0.002 — 4 cm off the glass.
     */
    z: -0.035,
  },
  /**
   * How much scene light the panel itself picks up.
   *
   * The UI is drawn as an emissive map, so this only governs the glass's own
   * response to the lights. It used to be white, which meant the spill light —
   * a point light parked 0.73 in front of the screen, on its centre line, to throw
   * screen-glow onto the keyboard — bloomed straight back off the middle of the
   * display as a white haze over the UI.
   *
   * The blob itself is now fixed at the source — the spill light no longer touches
   * the panel at all, see SPILL_LAYER. This knob only governs the flat wash left by
   * the ambient/key/rim lights. #222 is ~13% of white: enough that the glass still
   * catches a little light, far from the white sheet it started as. Raise toward
   * #fff for more sheen, drop to #000 for a pure display that ignores lights.
   */
  surface: { color: "#222222", roughness: 0.35, metalness: 0 },
  /** Emissive intensity as a function of section — the "powered on" feel. */
  emissive: {
    off: 0.0,
    boot: 2.4,
    on: 1.35,
    dim: 0.7,
  },
  /** Boot flicker: [progress within hero, intensity multiplier] pairs. */
  bootFlicker: [
    [0.00, 0.0], [0.315, 0.0], [0.35, 1.0], [0.385, 0.15],
    [0.43, 0.9], [0.47, 0.35], [0.53, 1.0], [0.63, 0.88], [1.00, 1.0],
  ] as [number, number][],
  /** Tab strip occupies the top slice of the drawn canvas (Projects raycasting). */
  tabStripUvHeight: 0.13,
} as const

// ─── Keyboard overlay ────────────────────────────────────────────────────────
//
// InstancedMesh of keycap tiles laid over the PAINTED keyboard. Aligned in the
// deck's local space. [CAL] — these are eyeballed against the render.

// CALIBRATED by unprojecting the painted key block's corners onto the deck plane
// (y = 0.098) from a top-down camera. Measured block: X -1.302 -> 1.476 (width
// 2.778), Z -0.929 -> 0.170 (depth 1.099).
//
// The X centre landed by bisection, confirmed against the render:
//   0.000  forcing symmetry on the assumption a keyboard is centred — too far left
//   0.087  the raw unprojected measurement                          — too far right
//   0.0435 halfway, and correct
// So the painted keyboard IS right of the deck's centre line, but by half what the
// corner readings suggested: the pixel estimates overshot on the right edge. Both
// the assumption and the raw measurement were wrong, in opposite directions.
export const KEYBOARD = {
  /** Top-left (back-left) corner of the key block, in scene units on the deck. */
  origin: { x: -1.3455, z: -0.929 },
  /**
   * Size of 1 keycap unit. 15 units across; vertically the block spans
   * ROW_HEIGHTS (5.62 units, not 6 — the function row is short), so
   * unit.z = measured depth 1.099 / 5.62.
   */
  unit: { x: 0.1852, z: 0.1955 },
  /** Gap between keycaps, as a fraction of `unit`. */
  gap: 0.12,
  /** Keycap height above the deck surface. */
  height: 0.012,
  /** Y of the keycap tops. */
  y: DECK.topY + 0.004,
  /** Legend texture atlas resolution (one cell per key). */
  glyphAtlas: { cell: 128, cols: 10 },
  emissive: {
    dark: 0.0,
    lit: 1.6,
    /** Brief overshoot when a key first lights. */
    flash: 2.8,
  },
} as const

// ─── Stickers (Certifications) ───────────────────────────────────────────────
//
// Textured planes inside `lidGroup`, flush against the BACK of the lid.
//
// `layout` is normalised to the lid: x -1→1 across it, y 0→1 from hinge to top edge.
// A sticker is 0.62 x 0.42 scene units on a 3.04 x 1.99 lid, so its half-size is
// 0.204 in normalised x and 0.106 in y — meaning x must stay within ±0.796 and y
// within 0.106→0.894 or it hangs off the edge. An earlier draft had a slot at
// y -0.14, which is below the hinge entirely.
//
// Neighbours are placed CLOSER than their full width and height so they overlap.
// A tidy grid reads as printed-on artwork; a real laptop accumulates stickers over
// years and they land on top of each other. `s` varies the size slightly for the
// same reason.
//
// Overlapping means draw order matters. The planes are near-coplanar, so depth
// sorting between them is unstable and would flicker; instead each sticker sits
// `stackStep` further out than the one before and carries an explicit renderOrder,
// so later certs are simply stuck on top of earlier ones — which is also the
// physically honest reading.
export const STICKERS = {
  /**
   * Z of the first sticker: just proud of the lid's measured outer face
   * (LID.backFaceZ), not merely "slightly negative". See that constant.
   */
  z: LID.backFaceZ - 0.0028,
  /** Each subsequent sticker sits this much further out, to fix the stacking. */
  stackStep: 0.0013,
  /** How far out along the lid normal a sticker starts before landing. */
  dropHeight: 0.34,
  /** Scale it starts at, so it reads as approaching rather than fading in. */
  dropScale: 1.32,
  /** Extra rotation, in degrees, shed as it lands. */
  dropRotation: 16,
  /** Fraction of a sticker's landing spent travelling; the rest is the settle. */
  impact: 0.55,
  /** Peak squash on impact, as a fraction. */
  squash: 0.16,
  /** Damping and frequency of the settle wobble. */
  squashDecay: 5,
  squashFreq: 2.4,
  /** Fraction of the section across which all stickers start landing. */
  landSpan: 0.78,
  /** Fraction of the section one sticker takes to land. */
  landDuration: 0.26,
  size: { w: 0.62, h: 0.42 },
  /**
   * Self-illumination so a sticker is never invisible just because nothing happens
   * to be lighting the lid's back at that moment. High enough to read, low enough
   * that the lid-back light still visibly does something during the orbit.
   */
  emissiveFloor: 0.55,
  /** One slot per cert, in data/certifications.ts order. [CAL] */
  layout: [
    { x: -0.56, y: 0.74, rot: -9, s: 1.00 },
    { x: -0.19, y: 0.80, rot: 6, s: 0.92 },
    { x: 0.17, y: 0.75, rot: -5, s: 1.06 },
    { x: 0.55, y: 0.68, rot: 10, s: 0.95 },
    { x: -0.42, y: 0.50, rot: 7, s: 1.04 },
    { x: -0.05, y: 0.54, rot: -8, s: 0.90 },
    { x: 0.36, y: 0.48, rot: 5, s: 1.00 },
    { x: 0.68, y: 0.38, rot: -7, s: 0.88 },
    { x: -0.30, y: 0.26, rot: 9, s: 1.02 },
    { x: 0.10, y: 0.22, rot: -6, s: 0.94 },
  ],
} as const

// ─── Colours ─────────────────────────────────────────────────────────────────
// Mirrors the --color-ca-* tokens in app/globals.css. Keep in sync.

export const COLORS = {
  bg: "#0A0A0A",
  paper: "#F0EDE6",
  neon: "#E8FF47",
  hot: "#FF2D6B",
  muted: "#3A3A3A",
  rule: "#1E1E1E",
  /** Screen-only shades. */
  screenBg: "#0B0D0F",
  screenChrome: "#16191C",
  screenDim: "#6B6860",
} as const

export const FONTS = {
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  display: "'Syne', system-ui, sans-serif",
  body: "'Plus Jakarta Sans', system-ui, sans-serif",
} as const

// ─── Lighting ────────────────────────────────────────────────────────────────

// The model's albedo is a neutral grey, so saturated fill/rim lights tint the whole
// body. Keep the accents low or the laptop turns beige instead of reading as dark.
export const LIGHTS = {
  ambient: { intensity: 0.40, color: "#8892a0" },
  key: { position: [3.2, 4.0, 3.0] as [number, number, number], intensity: 2.4, color: "#ffffff" },
  fill: { position: [-3.0, 1.8, 2.2] as [number, number, number], intensity: 0.25, color: COLORS.hot },
  rim: { position: [0, 2.2, -4.0] as [number, number, number], intensity: 0.45, color: COLORS.neon },
  /** Glow cast by the screen onto the deck when powered. */
  screenSpill: { intensity: 0.9, distance: 3.0, color: "#cfe3ff" },
  /**
   * The lid's back is lit by nothing — the key light is in front and the rim is
   * low and behind-but-below — so it renders near black. This fades in only while
   * the camera is round there for the certifications.
   */
  lidBack: {
    position: [0.9, 1.9, -3.4] as [number, number, number],
    intensity: 2.6,
    distance: 7.0,
    color: "#ffffff",
    /**
     * Held on until the camera has actually swung away. Fading it out at 0.88 of
     * the section dimmed the lid while the camera was still pointed at it.
     */
    fadeIn: 0.14,
    fadeOut: 0.99,
  },
} as const

// ─── Performance / capability ────────────────────────────────────────────────

export const PERF = {
  /** Cap devicePixelRatio at 2 per the budget. */
  dpr: [1, 2] as [number, number],
  /** Below this viewport width we serve the static DOM portfolio instead. */
  mobileBreakpoint: 768,
  /**
   * Automatic step-down, enforced by PerfGovernor. Halving dpr quarters the pixels
   * shaded, which is the single biggest lever available without changing the scene.
   *
   * The decision is one-way for the session: recovering would raise dpr, which
   * lowers fps, which degrades again — a machine sitting near the threshold would
   * visibly oscillate between resolutions instead of just running at the lower one.
   */
  degradedDpr: 1,
  /** Sustained fps below this for `degradeAfterMs` steps down to `degradedDpr`. */
  fpsFloor: 45,
  degradeAfterMs: 2500,
} as const

// ─── Easing ──────────────────────────────────────────────────────────────────

export const EASE = {
  /** Default for camera keyframe interpolation. */
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  inOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  outBack: (t: number) => {
    const c1 = 1.70158, c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  },
  linear: (t: number) => t,
} as const

export type EaseName = keyof typeof EASE

/** Easing used between camera keyframes. */
export const CAMERA_EASE: EaseName = "inOutCubic"
/** Easing used for the lid. */
export const LID_EASE: EaseName = "inOutCubic"
