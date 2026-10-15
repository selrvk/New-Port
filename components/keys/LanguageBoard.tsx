"use client"

// components/keys/LanguageBoard.tsx
//
// The 3D laptop's own keyboard — every key placed from data/keyboard.ts, the same
// Spanish ISO layout the 3D model has painted on it — with an input-source switcher.
//
// Choosing a language does two things the 3D version does:
//   · relabels the keys to that language's layout (Spanish is what is printed;
//     English and Filipino swap a handful of keys to US legends — the swapped ones
//     flash pink so the change is visible),
//   · types that language's greeting into the field, lighting each key as it is
//     struck and letting the light decay — same rhythm (greetingLoop.ts) and same
//     flash (FLASH_PEAK / FLASH_DECAY) as the 3D keyboard.
//
// The loop runs only while the board is on screen, never while the 3D layer is
// covering the page, and not at all under reduced motion — there the greeting is
// simply shown with its keys lit.
//
// And it is a keyboard you can use. Tap its keys — or, with the board on screen,
// type on a real one — and the letters go into the field: shift and caps lock
// work, ⌫ deletes, ↵ clears, esc hands back to the greeting. Each layout types
// what its legends say, so the Spanish board has its Ñ. A few seconds after the
// last keystroke the greeting loop takes over again.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from "react"

import { greetingFrame } from "@/components/laptop/languages/greetingLoop"
import { FLASH_DECAY, FLASH_PEAK } from "@/components/laptop/skills/glow"
import { useDomPaused } from "@/components/portfolio-dom/DomActivity"
import { GRID_UNITS_X, GRID_UNITS_Y, KEYS, LETTER_KEY_INDEX } from "@/data/keyboard"
import { changedKeys, languages } from "@/data/languages"

import { isTypingTarget, useReducedMotion } from "./Chrome"

/** The field shows the most recent characters once it is full. */
const FIELD_MAX = 24
/** Quiet this long after a keystroke and the greeting loop takes over again. */
const IDLE_MS = 7000
/** Legends that are not characters you could type. */
const NOT_TEXT = /^(?:[←→↕↵⌫⇧⏻]|F\d+|esc|fn|ctrl|alt|cmd|tab|caps)$/i
const LETTER = /^\p{L}$/u

const append = (text: string | null, ch: string) => ((text ?? "") + ch).slice(-FIELD_MAX)

/** Punctuation the greetings use, as key ids (shift where needed). */
const PUNCT: Record<string, { id: string; shift?: boolean }> = {
  " ": { id: "space" },
  "!": { id: "1", shift: true },
  ",": { id: "comma" },
  ".": { id: "period" },
}

/** The key ids struck to type `ch`. */
function keyIdsFor(ch: string): string[] {
  const upper = ch.toUpperCase()
  const letter = LETTER_KEY_INDEX[upper]
  if (letter !== undefined) {
    const isCapital = ch === upper && ch !== ch.toLowerCase()
    return isCapital ? [KEYS[letter].id, "shiftLeft"] : [KEYS[letter].id]
  }
  const p = PUNCT[ch]
  if (!p) return []
  return p.shift ? [p.id, "shiftLeft"] : [p.id]
}

/** Every key a greeting uses, lit — the reduced-motion resting state. */
function staticLit(text: string): Set<string> {
  return new Set([...text].flatMap(keyIdsFor))
}

// The ISO Return spans two rows: its upper arm (enterTop) is drawn as one L-shaped
// key and the lower arm (enter) is folded into it.
const BOARD_KEYS = KEYS.filter((k) => k.id !== "enter").map((k) =>
  k.id === "enterTop" ? { ...k, h: k.h * 2 } : k
)

export function LanguageBoard() {
  const [index, setIndex] = useState(0)
  const lang = languages[index]
  const previous = useRef<number>(0)
  const reduced = useReducedMotion()
  const paused = useDomPaused()

  const boardRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLSpanElement>(null)
  const caretRef = useRef<HTMLSpanElement>(null)
  const keyEls = useRef(new Map<string, HTMLElement>())
  const radioRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [relabelled, setRelabelled] = useState<Set<string>>(new Set())

  // What the visitor has typed. null means the greeting loop has the field.
  const [manual, setManual] = useState<string | null>(null)
  const [shift, setShiftState] = useState(false)
  const [caps, setCapsState] = useState(false)
  // Mirrors read by the key handler: a key tapped (or typed) faster than React can
  // re-render would otherwise see the previous shift / caps lock.
  const shiftRef = useRef(false)
  const capsRef = useRef(false)
  const setShift = (v: boolean) => {
    shiftRef.current = v
    setShiftState(v)
  }
  const setCaps = (v: boolean) => {
    capsRef.current = v
    setCapsState(v)
  }
  const manualRef = useRef<string | null>(null)
  const visibleRef = useRef(false)
  const auto = manual === null

  const lit = useMemo(() => (reduced ? staticLit(lang.greeting) : null), [reduced, lang.greeting])

  // The typing loop — only while nobody is typing by hand.
  useEffect(() => {
    if (reduced || paused || !auto) return
    const board = boardRef.current
    if (!board) return

    let raf = 0
    let visible = false
    const start = performance.now()
    let lastShown = -1
    let lastCaret: boolean | null = null
    const glowing = new Set<string>()

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const text = lang.greeting
      const f = greetingFrame(text, now - start)

      if (f.shown.length !== lastShown && fieldRef.current) {
        fieldRef.current.textContent = f.shown
        lastShown = f.shown.length
      }
      if (f.caretOn !== lastCaret && caretRef.current) {
        caretRef.current.toggleAttribute("data-off", !f.caretOn)
        lastCaret = f.caretOn
      }

      const values = new Map<string, number>()
      if (f.charProgress >= 0) {
        for (let i = 0; i < text.length; i++) {
          if (f.charProgress < i + 1) break
          const v = FLASH_PEAK * Math.exp(-(f.charProgress - (i + 1)) * FLASH_DECAY)
          if (v < 0.02) continue
          for (const id of keyIdsFor(text[i])) values.set(id, Math.max(values.get(id) ?? 0, v))
        }
      }
      // Only touch keys whose light changed.
      for (const id of glowing) {
        if (!values.has(id)) {
          const el = keyEls.current.get(id)
          el?.style.removeProperty("--g")
          el?.removeAttribute("data-glow")
          glowing.delete(id)
        }
      }
      for (const [id, v] of values) {
        const el = keyEls.current.get(id)
        if (!el) continue
        el.style.setProperty("--g", Math.min(1, v).toFixed(3))
        el.toggleAttribute("data-glow", v > 0.25)
        glowing.add(id)
      }
    }

    const io = new IntersectionObserver(([e]) => {
      const now = !!e?.isIntersecting
      if (now === visible) return
      visible = now
      if (visible) raf = requestAnimationFrame(frame)
      else cancelAnimationFrame(raf)
    })
    io.observe(board)

    const els = keyEls.current
    const caret = caretRef.current
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      caret?.removeAttribute("data-off")
      for (const id of glowing) {
        els.get(id)?.style.removeProperty("--g")
        els.get(id)?.removeAttribute("data-glow")
      }
    }
  }, [lang, reduced, paused, auto])

  // ── Typing by hand ──

  useEffect(() => {
    manualRef.current = manual
  }, [manual])

  // Hand the field back to the greeting after a quiet spell.
  useEffect(() => {
    if (manual === null) return
    const t = window.setTimeout(() => {
      setManual(null)
      setShift(false)
    }, IDLE_MS)
    return () => window.clearTimeout(t)
  }, [manual])

  const legendOf = useCallback(
    (id: string) => {
      const k = BOARD_KEYS.find((key) => key.id === id)
      if (!k) return ""
      return id === "enterTop" ? "↵" : (lang.keycaps[id] ?? k.legend)
    },
    [lang]
  )

  /** A tap on the board's key `id`. */
  const press = (id: string) => {
    switch (id) {
      case "backspace":
        setManual((m) => (m ?? "").slice(0, -1))
        return
      case "enterTop":
        setManual("")
        return
      case "space":
        setManual((m) => append(m, " "))
        return
      case "shiftLeft":
      case "shiftRight":
        setShift(!shiftRef.current)
        return
      case "caps":
        setCaps(!capsRef.current)
        return
      case "esc":
        setManual(null)
        setShift(false)
        return
    }
    const legend = legendOf(id)
    if ([...legend].length !== 1 || NOT_TEXT.test(legend)) return
    const upper = shiftRef.current !== capsRef.current
    const ch = LETTER.test(legend) ? (upper ? legend.toUpperCase() : legend.toLowerCase()) : legend
    setManual((m) => append(m, ch))
    if (shiftRef.current) setShift(false)
  }

  const onBoardClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!(e.target instanceof Element)) return
    const key = e.target.closest<HTMLElement>("[data-key]")
    if (key?.dataset.key) press(key.dataset.key)
  }

  // A real keyboard types into the field too, while the board is on screen. The
  // keys themselves already light up (Chrome.tsx's key echo); this adds the text.
  useEffect(() => {
    if (paused) return
    const board = boardRef.current
    if (!board) return
    const io = new IntersectionObserver(
      ([e]) => {
        visibleRef.current = !!e && e.intersectionRatio >= 0.5
      },
      { threshold: [0, 0.5, 1] }
    )
    io.observe(board)
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (!visibleRef.current || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return
      const typing = manualRef.current !== null
      if (e.key === "Escape" && typing) {
        setManual(null)
      } else if (e.key === "Backspace" && typing) {
        setManual((m) => (m ?? "").slice(0, -1))
      } else if (e.key === "Enter" && typing) {
        setManual("")
      } else if (e.key === " ") {
        // Space only types once typing has started; otherwise it scrolls the page.
        if (!typing) return
        e.preventDefault()
        setManual((m) => append(m, " "))
      } else if (e.key.length === 1 && e.key !== "/") {
        setManual((m) => append(m, e.key))
      }
    }
    window.addEventListener("keydown", onKey)
    return () => {
      io.disconnect()
      window.removeEventListener("keydown", onKey)
    }
  }, [paused])

  // Flash the keys whose legend changed with the input source.
  useEffect(() => {
    if (relabelled.size === 0) return
    const t = window.setTimeout(() => setRelabelled(new Set()), 900)
    return () => window.clearTimeout(t)
  }, [relabelled])

  const choose = (i: number, focus: boolean) => {
    if (i === index) return
    const from = languages[previous.current]
    previous.current = i
    setIndex(i)
    setManual(null)
    setShift(false)
    setRelabelled(new Set(changedKeys(from, languages[i])))
    if (focus) radioRefs.current[i]?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = languages.length
    const to =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? (i + 1) % n
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? (i - 1 + n) % n
          : null
    if (to === null) return
    e.preventDefault()
    choose(to, true)
  }

  return (
    <div className="lang">
      <div>
        <div className="lang__sources" role="radiogroup" aria-label="Input source">
          {languages.map((l, i) => (
            <button
              key={l.code}
              ref={(el) => {
                radioRefs.current[i] = el
              }}
              type="button"
              role="radio"
              aria-checked={i === index}
              aria-label={`${l.code} — ${l.name}`}
              tabIndex={i === index ? 0 : -1}
              className="kc"
              data-legend={l.code}
              onClick={() => choose(i, false)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {l.code}
            </button>
          ))}
        </div>

        <p className="lang__name">
          <span lang={lang.tag}>{lang.endonym}</span>
          {lang.endonym !== lang.name ? <span className="k-dim"> · {lang.name}</span> : null}
        </p>
        <p className="lang__meta">
          {lang.level} — {lang.note}
        </p>
        <p className="lang__meta k-mono">
          {lang.layout}
          {lang.note2 ? ` · ${lang.note2}` : ""}
        </p>

        <p className="lang__fieldlabel" aria-hidden="true">
          Tap or type to test the layout
        </p>
        <div className="lang__field" aria-hidden="true" lang={lang.tag} data-manual={auto ? undefined : ""}>
          {auto ? (
            // Written to directly by the loop; keyed so a new language gets a fresh node.
            <span key={lang.code} ref={fieldRef}>
              {lang.greeting}
            </span>
          ) : (
            <span>{manual}</span>
          )}
          <span ref={caretRef} className="lang__caret" />
        </div>
        <p className="sr-only">
          Greeting in {lang.name}: <span lang={lang.tag}>{lang.greeting}</span>
        </p>
      </div>

      <div
        className="board"
        ref={boardRef}
        aria-hidden="true"
        style={{ "--cols": GRID_UNITS_X, "--rows": GRID_UNITS_Y } as CSSProperties}
      >
        {/* Taps type; the board is aria-hidden, and keyboard users type on their
            own keyboard, which this listens to as well. */}
        <div className="board__plate" onClick={onBoardClick}>
          {BOARD_KEYS.map((k) => {
            const legend = k.id === "enterTop" ? "↵" : (lang.keycaps[k.id] ?? k.legend)
            const on = lit?.has(k.id)
            return (
              <span
                key={k.id}
                ref={(el) => {
                  if (el) keyEls.current.set(k.id, el)
                  else keyEls.current.delete(k.id)
                }}
                className={`kc${k.row === 0 ? " kc--fn" : ""}${k.id === "enterTop" ? " kc--iso-enter" : ""}`}
                data-key={k.id}
                data-legend={legend.toUpperCase() || undefined}
                data-held={
                  (shift && k.id.startsWith("shift")) || (caps && k.id === "caps") ? "" : undefined
                }
                data-relabel={relabelled.has(k.id) ? "" : undefined}
                data-glow={on ? "" : undefined}
                style={
                  {
                    "--x": k.x,
                    "--y": k.y,
                    "--w": k.w,
                    "--h": k.h,
                    ...(on ? { "--g": 1 } : null),
                  } as CSSProperties
                }
              >
                {legend}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
