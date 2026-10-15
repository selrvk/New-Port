"use client"

// components/laptop/LaptopExperience.tsx
//
// The gate. Decides whether the 3D presentation runs, and gets out of the way
// entirely if it shouldn't.
//
// The semantic portfolio in the DOM is the baseline and is always rendered by the
// server. This component only ever *adds* the 3D layer on top — so no-JS, no-WebGL,
// reduced-motion, small screens and load failures all converge on the same good
// static page rather than on an error or an empty canvas.

import dynamic from "next/dynamic"
import { Component, useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from "react"
import { flushSync } from "react-dom"

import { reportBootProgress } from "./lib/bootProgress"
import {
  canRun3d,
  getServerSnapshot,
  getSnapshot,
  setPresentation,
  subscribe,
} from "./lib/presentationStore"

// The scene — three.js, R3F, drei, the model — is its own chunk, requested only once
// this gate has decided on 3D. Phones and everyone else on the text layout never
// download it. A failed chunk load throws into SceneBoundary below, which falls back
// to the text layout like any other scene error.
const ScrollStage = dynamic(() => import("./ScrollStage").then((m) => m.ScrollStage), {
  ssr: false,
  loading: () => null,
})

/**
 * Marks <html> so CSS can visually hide the DOM portfolio while 3D is running.
 * The inline boot script sets it to "boot" before first paint; this upgrades it to
 * "on" once the gate has confirmed, and removes it to reveal the text layout.
 */
const ROOT_FLAG = "laptop"

export default function LaptopExperience() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [failed, setFailed] = useState(false)

  const active = mode === "3d" && !failed

  useEffect(() => {
    const root = document.documentElement
    if (active) {
      root.dataset[ROOT_FLAG] = "on"
      reportBootProgress(10)
    } else {
      delete root.dataset[ROOT_FLAG]
    }
    return () => {
      delete root.dataset[ROOT_FLAG]
    }
  }, [active])

  // ── Keyboard focus ──
  //
  // While the scene runs, the text layout is clipped to a single pixel but stays in
  // the document — it is what screen readers read, since the canvas is aria-hidden.
  // Its links and buttons therefore stay in the Tab order: a keyboard user tabbing
  // past the scene's own controls would land on content they cannot see, with no
  // visible focus anywhere on screen.
  //
  // Removing them from the Tab order (inert, tabindex=-1) would also hide them from
  // assistive tech. Instead, focus arriving in that layer is taken as what it is —
  // someone navigating content by keyboard — and the layer they are navigating is
  // revealed, with focus left exactly where it landed. Not persisted: it applies to
  // this visit and never overwrites a preference the visitor set themselves.
  useEffect(() => {
    if (!active) return
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target
      if (!(target instanceof HTMLElement) || !target.closest("[data-portfolio-dom]")) return
      // Synchronous, so the scroll spacer is gone and the layer is laid out before
      // we scroll the focused element into view.
      flushSync(() => setPresentation("text", { persist: false }))
      delete document.documentElement.dataset[ROOT_FLAG]
      // The browser scrolls a newly focused element into view by itself, and it did
      // that while the layer was still collapsed to one pixel — so every
      // overflow:hidden ancestor got scrolled sideways to fit the element into that
      // pixel (the hero ended up 144px off). Those containers are not meant to
      // scroll at all; put them back before scrolling the page to the element.
      for (let el = target.parentElement; el && el !== document.body; el = el.parentElement) {
        const { overflowX, overflowY } = getComputedStyle(el)
        if (overflowX === "hidden" || overflowX === "clip") el.scrollLeft = 0
        if (overflowY === "hidden" || overflowY === "clip") el.scrollTop = 0
      }
      // Centre what fits on screen; align anything taller (the skip link targets
      // <main> itself) to the top, since centring a page-tall element is meaningless.
      const tall = target.getBoundingClientRect().height > window.innerHeight
      target.scrollIntoView({ block: tall ? "start" : "center", behavior: "instant" })
    }
    document.addEventListener("focusin", onFocusIn)
    return () => document.removeEventListener("focusin", onFocusIn)
  }, [active])

  const choose = useCallback((next: "3d" | "text") => {
    setPresentation(next)
    // "instant", not "auto": the page sets scroll-behavior: smooth, so "auto" would
    // animate a scroll across a document seventeen screens tall.
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [])

  const handleError = useCallback(() => setFailed(true), [])

  if (!active) {
    return mode === "text" ? <RestoreButton onRestore={() => choose("3d")} /> : null
  }

  return (
    <SceneBoundary onError={handleError}>
      <ScrollStage onExit={() => choose("text")} onFatal={handleError} />
    </SceneBoundary>
  )
}

/** Offers the enhancement back, but only where it would actually work. */
function RestoreButton({ onRestore }: { onRestore: () => void }) {
  const supported = useSyncExternalStore(
    noopSubscribe,
    canRun3d,
    () => false
  )
  if (!supported) return null
  return (
    <button type="button" className="laptop-restore" onClick={onRestore}>
      View the 3D version
    </button>
  )
}

const noopSubscribe = () => () => {}

/**
 * If anything in the scene throws — a malformed GLB, a lost context that cannot be
 * recovered — we fall back to the static portfolio instead of showing the user a
 * broken canvas.
 */
class SceneBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { crashed: boolean }
> {
  state = { crashed: false }

  static getDerivedStateFromError() {
    return { crashed: true }
  }

  componentDidCatch(error: unknown) {
    console.error("[portfolio] 3D scene failed, falling back to static layout:", error)
    this.props.onError()
  }

  render() {
    return this.state.crashed ? null : this.props.children
  }
}
