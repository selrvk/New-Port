// components/laptop/languages/greeting.ts
//
// The Languages typing loop: each input source types its own greeting, over and
// over, until you scroll to the next one.
//
// ── The one deliberate exception to "everything is a function of scroll" ────────
//
// Every other moving thing here is derived from scroll progress, so scrubbing
// backwards reproduces the same pixels exactly. This loop is not: it keeps typing
// while the visitor holds still, which needs a clock.
//
// It is a bounded exception rather than a hole in the rule:
//   · Scroll still decides WHICH language is typing. Only the phase within one
//     cycle comes from time.
//   · A loop accumulates nothing. There is no state to undo, so scrolling away and
//     back lands somewhere in the same cycle rather than in a different world.
//   · It is derived, not stored: frame = f(text, now). Two callers passing the same
//     clock get the same answer, which is what keeps the lit keys and the on-screen
//     text in step.
//
// Contact already set this precedent for a blinking caret; this is the second and,
// ideally, last place that needs a clock.
//
// ── Why both consumers live here ────────────────────────────────────────────────
//
// The physical keys and the screen's preview field are showing the same act of
// typing from two angles. If each computed its own character index they would drift
// by a frame or two and the lit key would stop matching the letter that appeared,
// which is precisely the thing that makes the effect legible. One function, both
// consumers.

import { KEY_INDEX, LETTER_KEY_INDEX } from "@/data/keyboard"
import { languages, type Language } from "@/data/languages"

import { clamp01 } from "../lib/keyframes"
import { FLASH_DECAY, FLASH_PEAK } from "../skills/glow"

/** Tunables for the loop. All milliseconds. */
export const GREETING = {
  /** Per character while typing. Roughly an unhurried 85wpm. */
  typeMs: 118,
  /** How long the finished greeting sits there before it clears. */
  holdMs: 1500,
  /** Per character while deleting — faster than typing, as real backspacing is. */
  eraseMs: 62,
  /** Empty-field pause before the next pass, so the loop breathes. */
  restMs: 520,
  /** Caret blink half-cycle, while the field is idle. */
  caretMs: 520,
} as const

export type GreetingPhase = "type" | "hold" | "erase" | "rest"

export type GreetingFrame = {
  /** What is in the preview field right now. */
  shown: string
  /** Solid while keys are moving, blinking while idle — as a real caret behaves. */
  caretOn: boolean
  phase: GreetingPhase
  /**
   * Characters struck so far, in fractional character units. Deliberately keeps
   * climbing past the end of the word during the hold, so the last key's flash has
   * somewhere to decay to instead of freezing lit. -1 when nothing is being typed.
   */
  charProgress: number
}

/** Total length of one full type/hold/erase/rest cycle. */
export function greetingPeriod(text: string): number {
  return (
    text.length * GREETING.typeMs +
    GREETING.holdMs +
    text.length * GREETING.eraseMs +
    GREETING.restMs
  )
}

const blink = (elapsed: number) => Math.floor(elapsed / GREETING.caretMs) % 2 === 0

/**
 * The state of the loop at `nowMs`. Pure: same inputs, same output, so this can be
 * tested directly and called from as many places as needed.
 */
export function greetingFrame(text: string, nowMs: number): GreetingFrame {
  const n = text.length
  if (n === 0) return { shown: "", caretOn: true, phase: "rest", charProgress: -1 }

  const period = greetingPeriod(text)
  // Modulo twice: a negative clock would otherwise land outside the cycle.
  const e = ((nowMs % period) + period) % period

  const typeEnd = n * GREETING.typeMs
  const holdEnd = typeEnd + GREETING.holdMs
  const eraseEnd = holdEnd + n * GREETING.eraseMs

  if (e < typeEnd) {
    const chars = e / GREETING.typeMs
    return {
      shown: text.slice(0, Math.floor(chars)),
      caretOn: true,
      phase: "type",
      charProgress: chars,
    }
  }

  if (e < holdEnd) {
    return {
      shown: text,
      caretOn: blink(e),
      phase: "hold",
      charProgress: n + (e - typeEnd) / GREETING.typeMs,
    }
  }

  if (e < eraseEnd) {
    const gone = Math.floor((e - holdEnd) / GREETING.eraseMs)
    return {
      shown: text.slice(0, Math.max(0, n - gone)),
      caretOn: true,
      phase: "erase",
      charProgress: -1,
    }
  }

  return { shown: "", caretOn: blink(e), phase: "rest", charProgress: -1 }
}

// ── Characters to keys ───────────────────────────────────────────────────────
//
// Only what the greetings actually need. Guessing at a full punctuation map across
// two layouts would be inventing behaviour we cannot see to check.

const PUNCT_KEYS: Record<string, { id: string; shift?: boolean }> = {
  " ": { id: "space" },
  // Shift+1 on both the painted Spanish board and the US layout we relabel to.
  "!": { id: "1", shift: true },
  ",": { id: "comma" },
  ".": { id: "period" },
}

/** Key indices lit by typing `ch`. Empty when we have no key for it. */
export function keysForChar(ch: string): number[] {
  const upper = ch.toUpperCase()
  const letter = LETTER_KEY_INDEX[upper]
  if (letter !== undefined) {
    // A capital means shift is held down too, same as on a real board.
    const isCapital = ch === upper && ch !== ch.toLowerCase()
    const shift = KEY_INDEX["shiftLeft"]
    return isCapital && shift !== undefined ? [letter, shift] : [letter]
  }

  const punct = PUNCT_KEYS[ch]
  if (!punct) return []
  const key = KEY_INDEX[punct.id]
  if (key === undefined) return []
  const shift = KEY_INDEX["shiftLeft"]
  return punct.shift && shift !== undefined ? [key, shift] : [key]
}

/**
 * Write per-key glow for the greeting loop into `out`.
 *
 * Same strike-and-fade as the Skills section, reusing its constants on purpose:
 * two sections lighting the same hardware should light it the same way. Nothing
 * lights during erase or rest, which gives the board a rest between passes rather
 * than strobing a backspace key ~16 times a second.
 */
export function computeGreetingGlow(
  text: string,
  nowMs: number,
  out: Float32Array
): GreetingFrame {
  out.fill(0)
  const frame = greetingFrame(text, nowMs)
  if (frame.charProgress < 0) return frame

  for (let i = 0; i < text.length; i++) {
    if (frame.charProgress < i + 1) break
    const age = frame.charProgress - (i + 1)
    const v = FLASH_PEAK * Math.exp(-age * FLASH_DECAY)
    if (v < 0.01) continue
    for (const key of keysForChar(text[i])) {
      if (v > out[key]) out[key] = v
    }
  }

  return frame
}

// ── Which language is selected ───────────────────────────────────────────────

export type LanguageSlot = {
  index: number
  /** 0→1 within this language's share of the section. */
  frac: number
  language: Language
  /** The one before it, for working out which keys changed. */
  previous: Language | null
}

/** Split the Languages section's local 0→1 into one slot per input source. */
export function languageSlot(t: number): LanguageSlot {
  const raw = clamp01(t) * languages.length
  const index = Math.min(languages.length - 1, Math.floor(raw))
  return {
    index,
    frac: clamp01(raw - index),
    language: languages[index],
    previous: index > 0 ? languages[index - 1] : null,
  }
}

/**
 * Everything about the screen that can change without scrolling, as one comparable
 * string. Lets the repaint fire on character boundaries and caret blinks — a few
 * times a second — instead of on a fixed timer.
 */
export function greetingSignature(slot: LanguageSlot, nowMs: number): string {
  const f = greetingFrame(slot.language.greeting, nowMs)
  return `${slot.index}:${f.shown.length}:${f.caretOn ? 1 : 0}`
}
