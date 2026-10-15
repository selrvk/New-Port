"use client"

// components/keys/SkillsPalette.tsx
//
// Skills as the 3D version shows them: a command palette whose search field types
// a category, with the matching skills listed underneath. Here the categories are
// keys you press. Tabs in the ARIA sense — arrow keys move between them, which on a
// page made of a keyboard is the natural thing to try.
//
// Every category's results are in the HTML from the start (hidden panels are still
// served), so crawlers and the 3D version's screen-reader layer get all of it.

import { useEffect, useRef, useState, type KeyboardEvent } from "react"

import { useDomPaused } from "@/components/portfolio-dom/DomActivity"
import { skillCategories, type SkillSource } from "@/data/skills-map"

import { useReducedMotion } from "./Chrome"

/** Where each skill is evidenced, shown the way a palette shows a result's source. */
const SOURCE: Record<SkillSource, string> = {
  projects: "in projects",
  certifications: "certified",
  skills: "listed",
  profile: "focus",
}

/** Typing speed for the query, per character. */
const TYPE_MS = 70

export function SkillsPalette() {
  const [active, setActive] = useState(0)
  // Until the palette has been seen, the query sits there already typed, which is
  // also exactly what the server renders.
  const [typed, setTyped] = useState<string>(skillCategories[0].query)
  const [seen, setSeen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const reduced = useReducedMotion()
  const paused = useDomPaused()

  useEffect(() => {
    if (paused || seen) return
    const el = rootRef.current
    if (!el || !("IntersectionObserver" in window)) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [paused, seen])

  // Type the active category's query, one keystroke at a time.
  useEffect(() => {
    if (!seen) return
    const q = skillCategories[active].query
    if (reduced) {
      const t = window.setTimeout(() => setTyped(q), 0)
      return () => window.clearTimeout(t)
    }
    let i = 0
    const t = window.setInterval(() => {
      i += 1
      setTyped(q.slice(0, i))
      if (i >= q.length) window.clearInterval(t)
    }, TYPE_MS)
    const blank = window.setTimeout(() => setTyped(""), 0)
    return () => {
      window.clearInterval(t)
      window.clearTimeout(blank)
    }
  }, [active, seen, reduced])

  const select = (i: number, focus: boolean) => {
    setActive(i)
    if (focus) tabRefs.current[i]?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = skillCategories.length
    const to =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? (i + 1) % n
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? (i - 1 + n) % n
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? n - 1
              : null
    if (to === null) return
    e.preventDefault()
    select(to, true)
  }

  const cat = skillCategories[active]

  return (
    <div className="pal" ref={rootRef}>
      <div className="pal__keys" role="tablist" aria-label="Skill categories">
        {skillCategories.map((c, i) => (
          <button
            key={c.id}
            ref={(el) => {
              tabRefs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`skills-tab-${c.id}`}
            aria-selected={i === active}
            aria-controls={`skills-panel-${c.id}`}
            tabIndex={i === active ? 0 : -1}
            className="kc kc--word"
            data-legend={c.query[0].toUpperCase()}
            onClick={() => select(i, false)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            <span>{c.label}</span>
            <span className="kc__mod">{c.skills.length}</span>
          </button>
        ))}
      </div>

      <div className="pal__win">
        <div className="pal__search" aria-hidden="true">
          <span className="kc kc--xs">⌘K</span>
          <span className="pal__query">{typed}</span>
          <span className="pal__caret" />
          <span className="pal__count">{cat.skills.length} results</span>
        </div>
        {skillCategories.map((c, i) => (
          <div
            key={c.id}
            role="tabpanel"
            id={`skills-panel-${c.id}`}
            aria-labelledby={`skills-tab-${c.id}`}
            hidden={i !== active}
            tabIndex={0}
          >
            <p className="pal__group">
              {c.group} › {c.label}
            </p>
            <ul className="pal__results">
              {c.skills.map((s) => (
                <li key={s.name} className="pal__item">
                  <span className="pal__glyph" aria-hidden="true">
                    {s.name[0]}
                  </span>
                  <span className="pal__name">{s.name}</span>
                  {s.learning ? <span className="pal__tag">learning</span> : null}
                  <span className="pal__src">{SOURCE[s.from]}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
