"use client"

// components/keys/Chrome.tsx
//
// Everything interactive that frames the page:
//
//   · The function row (slots 1 and 5): esc and F1–F7 along the top. They are the
//     navigation, and they stay backlit as you scroll past their sections — the
//     scroll indicator. ⌘K at the end opens the command palette.
//   · The command palette: every section, plus email, call, copy, socials and the
//     switch back to 3D. ⌘K, Ctrl+K or "/" open it from anywhere.
//   · Typing on view: section titles (KeyWord) strike their keys when they first
//     scroll into view.
//   · Key echo: on a real keyboard, pressing a key presses every keycap on the page
//     with that legend. It costs nothing on a phone, and on a laptop it is the
//     moment people remember.
//   · Pressable keys: tapping or clicking any keycap — titles, the name, the
//     languages board — presses it down and lights it. It is the first thing anyone
//     does with something that looks like a key.
//
// All of it stands down while the 3D layer is covering the page (useDomPaused):
// no listeners, no observers, nothing rendered.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react"

import { canRun3d, setPresentation } from "@/components/laptop/lib/presentationStore"
import { useDomPaused } from "@/components/portfolio-dom/DomActivity"
import { contact } from "@/data/contact"
import { socials } from "@/data/profile"

import { SECTIONS } from "./sections"

// ── Shared ──────────────────────────────────────────────────────────────────

const REDUCED = "(prefers-reduced-motion: reduce)"
function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia(REDUCED)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false
  )
}

const noopSubscribe = () => () => {}

/** True while focus is somewhere the visitor is typing, so keystrokes are theirs. */
export function isTypingTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false
  return t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)
}

export function Chrome() {
  const paused = useDomPaused()
  const [open, setOpen] = useState(false)
  const openPalette = useCallback(() => setOpen(true), [])
  const closePalette = useCallback(() => setOpen(false), [])

  useTypeOnView(paused)
  useKeyEcho(paused)
  usePressKeys(paused)

  // ⌘K / Ctrl+K anywhere; "/" when not already typing.
  useEffect(() => {
    if (paused) return
    const onKey = (e: KeyboardEvent) => {
      const combo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"
      const slash = e.key === "/" && !isTypingTarget(e.target)
      if (!combo && !slash) return
      e.preventDefault()
      setOpen((v) => !v)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [paused])

  if (paused) return null

  return (
    <>
      <FunctionRow onOpenPalette={openPalette} />
      <CommandPalette open={open} onClose={closePalette} />
    </>
  )
}

// ── The function row ─────────────────────────────────────────────────────────

function FunctionRow({ onOpenPalette }: { onOpenPalette: () => void }) {
  const [current, setCurrent] = useState(0)
  // The way back to the 3D laptop lives on the keyboard too, as its own key —
  // only where the 3D version can actually run (canRun3d caches its probe).
  const supports3d = useSyncExternalStore(noopSubscribe, canRun3d, () => false)

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id))
    let raf = 0
    const measure = () => {
      raf = 0
      // A section is current once its top passes a third of the way down.
      const line = window.innerHeight * 0.34
      let idx = 0
      els.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= line) idx = i
      })
      const doc = document.documentElement
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 4) idx = els.length - 1
      setCurrent(idx)
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    schedule()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [])

  const [home, ...rest] = SECTIONS
  return (
    <nav className="frow" aria-label="Sections">
      <a
        className="kc kc--esc"
        href={`#${home.id}`}
        aria-label="esc — back to top"
        aria-current={current === 0 ? "true" : undefined}
      >
        esc
      </a>
      <div className="frow__keys">
        {rest.map((s, i) => {
          const index = i + 1
          return (
            <a
              key={s.id}
              className="kc"
              href={`#${s.id}`}
              aria-label={`${s.fkey} ${s.label}`}
              aria-current={current === index ? "true" : undefined}
              data-passed={index < current ? "" : undefined}
            >
              <span aria-hidden="true">{s.fkey}</span>
              <span className="frow__label" aria-hidden="true">
                {s.label}
              </span>
            </a>
          )
        })}
      </div>
      <button
        type="button"
        className="kc kc--cmd"
        aria-haspopup="dialog"
        aria-label="⌘K — open the command menu"
        onClick={onOpenPalette}
      >
        ⌘K
      </button>
      {supports3d ? (
        <button
          type="button"
          className="kc kc--cmd kc--enter"
          aria-label="3D — switch to the 3D laptop"
          onClick={() => {
            setPresentation("3d")
            window.scrollTo({ top: 0, behavior: "instant" })
          }}
        >
          3D
        </button>
      ) : null}
    </nav>
  )
}

// ── The command palette ──────────────────────────────────────────────────────

type Command = {
  id: string
  label: string
  /** The key shown beside it. */
  key: string
  /** Extra words it should match on. */
  keywords?: string
  run: () => void
}

function scrollToSection(id: string, reduced: boolean) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" })
  // Move focus too, so keyboard and screen-reader users land where they went.
  el.focus({ preventScroll: true })
}

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)
  const reduced = useReducedMotion()
  const supports3d = useSyncExternalStore(noopSubscribe, canRun3d, () => false)

  const commands = useMemo<Command[]>(() => {
    const list: Command[] = SECTIONS.map((s) => ({
      id: `go-${s.id}`,
      label: `Go to ${s.label}`,
      key: s.fkey,
      keywords: s.word,
      run: () => scrollToSection(s.id, reduced),
    }))
    list.push(
      {
        id: "email",
        label: `Email ${contact.email}`,
        key: "↵",
        keywords: "mail contact write message",
        run: () => {
          window.location.assign(`mailto:${contact.email}`)
        },
      },
      {
        id: "copy",
        label: copied ? "Copied to clipboard" : "Copy email address",
        key: "⌘C",
        keywords: "copy clipboard email",
        run: () => {
          void navigator.clipboard?.writeText(contact.email).then(() => setCopied(true))
        },
      },
      {
        id: "call",
        label: `Call ${contact.phone}`,
        key: "☎",
        keywords: "phone call",
        run: () => {
          window.location.assign(contact.phoneHref)
        },
      }
    )
    for (const so of socials) {
      list.push({
        id: `social-${so.code}`,
        label: `Open ${so.label}`,
        key: so.code,
        keywords: so.value,
        run: () => window.open(so.href, "_blank", "noopener,noreferrer"),
      })
    }
    if (supports3d) {
      list.push({
        id: "3d",
        label: "Switch to the 3D laptop",
        key: "3D",
        keywords: "three laptop webgl",
        run: () => {
          setPresentation("3d")
          window.scrollTo({ top: 0, behavior: "instant" })
        },
      })
    }
    return list
  }, [copied, reduced, supports3d])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) => `${c.label} ${c.keywords ?? ""} ${c.key}`.toLowerCase().includes(q))
  }, [commands, query])

  // Opening and closing go through the native <dialog>: it traps focus, makes the
  // page behind it inert, closes on Esc and returns focus to the opener.
  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    if (open && !d.open) {
      d.showModal()
      inputRef.current?.focus()
    } else if (!open && d.open) {
      d.close()
    }
  }, [open])

  const reset = () => {
    setQuery("")
    setActive(0)
    setCopied(false)
  }

  const run = (c: Command) => {
    // Copying keeps the palette open so the confirmation can be read.
    if (c.id === "copy") {
      c.run()
      return
    }
    onClose()
    // After the dialog has closed and focus has returned, so the command's own
    // focus move is the one that sticks.
    requestAnimationFrame(c.run)
  }

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => Math.min(results.length - 1, a + 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => Math.max(0, a - 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const c = results[active]
      if (c) run(c)
    }
  }

  const current = results[active]

  return (
    <dialog
      ref={dialogRef}
      className="cmdk"
      aria-label="Command menu"
      onClose={() => {
        onClose()
        reset()
      }}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself.
        if (e.target === dialogRef.current) onClose()
      }}
    >
      <div className="cmdk__field">
        <span className="kc kc--xs" aria-hidden="true">
          ⌘K
        </span>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="cmdk-list"
          aria-autocomplete="list"
          aria-activedescendant={current ? `cmdk-${current.id}` : undefined}
          aria-label="Search commands"
          placeholder="Type a command or a section…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
          }}
          onKeyDown={onKeyDown}
        />
      </div>
      {results.length ? (
        <ul id="cmdk-list" className="cmdk__list" role="listbox" aria-label="Commands">
          {results.map((c, i) => (
            <li
              key={c.id}
              id={`cmdk-${c.id}`}
              role="option"
              aria-selected={i === active}
              className="cmdk__opt"
              onMouseMove={() => setActive(i)}
              onClick={() => run(c)}
            >
              <span className="kc kc--xs" aria-hidden="true">
                {c.key}
              </span>
              <span>{c.label}</span>
              {i === active ? (
                <span className="cmdk__hint" aria-hidden="true">
                  ↵
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="cmdk__empty" role="status">
          No command matches “{query}”.
        </p>
      )}
      <p className="cmdk__foot" aria-hidden="true">
        <span>↑↓ move</span>
        <span>↵ run</span>
        <span>esc close</span>
      </p>
    </dialog>
  )
}

// ── Typing on view ───────────────────────────────────────────────────────────

function useTypeOnView(paused: boolean) {
  useEffect(() => {
    if (paused) return
    const words = document.querySelectorAll<HTMLElement>("[data-type-on-view]:not([data-typed])")
    if (!("IntersectionObserver" in window)) {
      words.forEach((w) => w.setAttribute("data-typed", ""))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.setAttribute("data-typed", "")
          io.unobserve(e.target)
        }
      },
      { threshold: 0.6 }
    )
    words.forEach((w) => io.observe(w))
    return () => io.disconnect()
  }, [paused])
}

// ── Key echo ─────────────────────────────────────────────────────────────────

/** Keys whose legends are words or symbols rather than the character typed. */
const NAMED: Record<string, string> = { Enter: "↵", Escape: "ESC", Backspace: "⌫", Tab: "TAB" }

function useKeyEcho(paused: boolean) {
  useEffect(() => {
    if (paused) return
    const timers = new Set<number>()
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return
      const legend = NAMED[e.key] ?? (e.key.length === 1 ? e.key.toUpperCase() : null)
      if (!legend) return
      const keys = document.querySelectorAll<HTMLElement>(
        `.keys .kc[data-legend="${CSS.escape(legend)}"]`
      )
      keys.forEach((k) => {
        k.setAttribute("data-strike", "")
        k.setAttribute("data-lit", "")
      })
      const up = window.setTimeout(() => keys.forEach((k) => k.removeAttribute("data-strike")), 140)
      const dim = window.setTimeout(() => keys.forEach((k) => k.removeAttribute("data-lit")), 650)
      timers.add(up).add(dim)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [paused])
}

// ── Pressable keys ───────────────────────────────────────────────────────────

/**
 * One delegated listener for every decorative keycap. Links and buttons that look
 * like keys are left alone — they have their own :active press and do something.
 * The press holds while the pointer is down, as a real key does, and the light
 * lingers a moment after release.
 */
function usePressKeys(paused: boolean) {
  useEffect(() => {
    if (paused) return
    const root = document.querySelector<HTMLElement>(".keys")
    if (!root) return
    let held: HTMLElement | null = null
    const timers = new Set<number>()

    const release = () => {
      const key = held
      held = null
      if (!key) return
      key.removeAttribute("data-strike")
      timers.add(window.setTimeout(() => key.removeAttribute("data-lit"), 350))
    }
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || !(e.target instanceof Element)) return
      const key = e.target.closest<HTMLElement>(".kc")
      if (!key || !root.contains(key) || key.closest("a, button")) return
      release()
      held = key
      key.setAttribute("data-strike", "")
      key.setAttribute("data-lit", "")
    }

    root.addEventListener("pointerdown", onDown)
    window.addEventListener("pointerup", release)
    window.addEventListener("pointercancel", release)
    return () => {
      root.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointerup", release)
      window.removeEventListener("pointercancel", release)
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [paused])
}
