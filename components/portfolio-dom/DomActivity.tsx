"use client"

// components/portfolio-dom/DomActivity.tsx
//
// Tells the DOM portfolio when it is hidden behind the 3D layer.
//
// While the 3D experience runs, the semantic portfolio is only VISUALLY clipped —
// it stays in the document for crawlers and screen readers, which means every
// component in it is still mounted and still running. That was a second animation
// system competing for frames while producing nothing visible: one
// requestAnimationFrame loop per project card, a carousel autoplay timer, and
// framer-motion animating elements clipped to a single pixel.
//
// Unmounting is not an option — the content has to stay in the DOM. So instead the
// markup is left exactly as it is and only the WORK is paused. Nothing here changes
// what is rendered, so there is no hydration risk: the server and the first client
// render agree by construction.

import { MotionConfig } from "motion/react"
import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react"

import {
  getServerSnapshot,
  getSnapshot,
  subscribe,
} from "@/components/laptop/lib/presentationStore"

const PausedContext = createContext(false)

/** True when this content is hidden behind the 3D scene and should stand down. */
export function useDomPaused(): boolean {
  return useContext(PausedContext)
}

export function DomActivityProvider({ children }: { children: ReactNode }) {
  // The same store the 3D gate reads, so the two can never disagree about which
  // presentation is active. Its server snapshot is "text", so the first client
  // render matches the server and only swaps after mount.
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const paused = mode === "3d"

  // Reflected onto <html> so the pause state is inspectable without instrumenting
  // every consumer — this is otherwise invisible by design.
  useEffect(() => {
    document.documentElement.dataset.domPaused = paused ? "on" : "off"
    return () => {
      delete document.documentElement.dataset.domPaused
    }
  }, [paused])

  return (
    <PausedContext.Provider value={paused}>
      {paused ? (
        // Motion components resolve to their end state instead of animating.
        <MotionConfig reducedMotion="always">{children}</MotionConfig>
      ) : (
        children
      )}
    </PausedContext.Provider>
  )
}
