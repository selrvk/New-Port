// components/laptop/skills/glow.ts
//
// Which keys light, and how brightly, as each category types itself.
//
// Scrolling walks the categories. Each one spells its own name on the physical
// keyboard while the same characters land in the palette's search field — so a lit
// key is legible on sight, rather than standing for a rule the visitor has to infer.
//
// Pure functions, kept out of the component so they can be tested directly: an
// off-by-one in the character walk would light plausible-but-wrong keys with no
// visible error.

import { LETTER_KEY_INDEX } from "@/data/keyboard"
import { CATEGORY_COUNT, skillCategories, type SkillCategory } from "@/data/skills-map"

/** Fraction of a category's slot spent typing its name. */
export const TYPE_FRACTION = 0.4
/** Brightness of a key at the instant it is struck. */
export const FLASH_PEAK = 2.4
/**
 * How fast a struck key fades back to dark, measured in characters of typing.
 * ~0.2 of peak one character later, dark within three — so the lit keys read as a
 * cursor moving across the board rather than as a word accumulating on it.
 */
export const FLASH_DECAY = 1.8

export type SkillsCursor = {
  index: number
  category: SkillCategory
  /** 0→1 within this category's slot. */
  frac: number
  /** 0→1 typing progress, clamped. */
  typeT: number
  /**
   * Typing progress WITHOUT the clamp, so it keeps advancing after the word is
   * finished. The glow trail decays against this; against `typeT` it would freeze
   * at whatever it reached and leave the last keys lit for the rest of the slot.
   */
  typeClock: number
  /** Characters of the query revealed so far. */
  typed: string
  /** 0→1 reveal of the results list, after typing finishes. */
  resultsT: number
}

export function skillsCursor(t: number): SkillsCursor {
  const raw = Math.max(0, Math.min(1, t)) * CATEGORY_COUNT
  const index = Math.min(CATEGORY_COUNT - 1, Math.floor(raw))
  const frac = Math.max(0, Math.min(1, raw - index))
  const category = skillCategories[index]

  const typeClock = frac / TYPE_FRACTION
  const typeT = Math.max(0, Math.min(1, typeClock))
  const typed = category.query.slice(0, Math.floor(typeT * category.query.length))
  const resultsT = Math.max(0, Math.min(1, (frac - TYPE_FRACTION) / (1 - TYPE_FRACTION)))

  return { index, category, frac, typeT, typeClock, typed, resultsT }
}

/**
 * Write per-key glow into `out` for local Skills progress `t`.
 *
 * Repeated letters in a query (the two Ns in "frontend") map to the same key, so
 * intensities are combined with max rather than overwritten — otherwise a later,
 * dimmer occurrence would cancel the flash of an earlier one.
 */
export function computeGlow(t: number, out: Float32Array): SkillsCursor {
  out.fill(0)
  const cursor = skillsCursor(t)

  // Each struck key flashes and then fades to nothing. Nothing is carried over
  // from earlier categories, and nothing stays lit once a word is finished.
  const query = cursor.category.query.toUpperCase()
  const charProgress = cursor.typeClock * query.length
  for (let i = 0; i < query.length; i++) {
    if (charProgress < i + 1) break
    const key = LETTER_KEY_INDEX[query[i]]
    if (key === undefined) continue
    const age = charProgress - (i + 1)
    const v = FLASH_PEAK * Math.exp(-age * FLASH_DECAY)
    if (v > out[key]) out[key] = v
  }

  return cursor
}
