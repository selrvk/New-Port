"use client"

// components/laptop/lib/presentationStore.ts
//
// Which presentation the visitor gets, held outside React.
//
// This is genuinely external state: it depends on WebGL support, a media query,
// viewport width and localStorage, none of which exist during SSR. Modelling it as
// an external store and reading it with useSyncExternalStore avoids the
// detect-then-setState-in-an-effect pattern (which causes a cascading render, and
// which React's lint rules now reject) and gives React a correct server snapshot.

import {
  detectCapability,
  readStoredMode,
  storeMode,
  type PresentationMode,
} from "./capability"
import { PERF } from "../config"

let cached: PresentationMode | null = null
const listeners = new Set<() => void>()

function notify(): void {
  for (const l of listeners) l()
}

function compute(): PresentationMode {
  const stored = readStoredMode()
  if (stored) return stored
  const cap = detectCapability()
  if (!cap.canRun3d && cap.reason) {
    console.info(`[portfolio] static presentation — ${cap.reason}`)
  }
  return cap.canRun3d ? "3d" : "text"
}

/** Must be referentially stable between calls or React will loop. */
export function getSnapshot(): PresentationMode {
  if (cached === null) cached = compute()
  return cached
}

/** The server can't detect anything, so it always renders the static baseline. */
export function getServerSnapshot(): PresentationMode {
  return "text"
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)

  // Fall back to the static layout if the window shrinks past the breakpoint.
  const onResize = () => {
    if (cached === "3d" && window.innerWidth < PERF.mobileBreakpoint) {
      cached = "text"
      notify()
    }
  }
  window.addEventListener("resize", onResize)

  return () => {
    listeners.delete(listener)
    window.removeEventListener("resize", onResize)
  }
}

/** Explicit user choice. Persisted, and beats detection from then on. */
export function setPresentation(next: PresentationMode): void {
  if (cached === next) return
  cached = next
  storeMode(next)
  notify()
}

/**
 * Used by the "back to 3D" affordance to know whether to offer itself.
 * Cached: this is read as a useSyncExternalStore snapshot, which must return a
 * stable value — and detectCapability() creates a throwaway WebGL context.
 */
let capable: boolean | null = null
export function canRun3d(): boolean {
  if (capable === null) capable = detectCapability().canRun3d
  return capable
}
