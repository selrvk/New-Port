// components/laptop/languages/greetingLoop.ts
//
// The greeting typing loop's timing, shared by the 3D keyboard and the text
// version's keyboard so both type at the same unhurried rhythm. Import-free on
// purpose: greeting.ts reaches three.js through its own imports, and the text
// version must not. See greeting.ts for why this one place needs a clock.

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
