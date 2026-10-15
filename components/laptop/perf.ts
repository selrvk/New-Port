// components/laptop/perf.ts
//
// Performance and capability constants, kept free of imports.
//
// The presentation gate (lib/capability.ts, lib/presentationStore.ts) needs the
// mobile breakpoint, and that gate runs for EVERY visitor — phones included. When
// this lived in config.ts it dragged three.js into the gate's import graph, so a
// phone that would never draw a single triangle still downloaded the 3D engine.
// The inline boot script in app/layout.tsx reads the breakpoint from here as well,
// so the decision made before first paint and the one React makes cannot drift.

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
