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

import { Component, useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from "react"

import {
  canRun3d,
  getServerSnapshot,
  getSnapshot,
  setPresentation,
  subscribe,
} from "./lib/presentationStore"
import { ScrollStage } from "./ScrollStage"

/** Marks <html> so CSS can visually hide the DOM portfolio while 3D is running. */
const ROOT_FLAG = "laptop"

export default function LaptopExperience() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [failed, setFailed] = useState(false)

  const active = mode === "3d" && !failed

  useEffect(() => {
    const root = document.documentElement
    if (active) root.dataset[ROOT_FLAG] = "on"
    else delete root.dataset[ROOT_FLAG]
    return () => {
      delete root.dataset[ROOT_FLAG]
    }
  }, [active])

  const choose = useCallback((next: "3d" | "text") => {
    setPresentation(next)
    window.scrollTo({ top: 0, behavior: "auto" })
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
