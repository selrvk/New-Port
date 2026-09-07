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
/** Overshoot on the character just typed, decaying as scrolling continues. */
export const FLASH_GAIN = 1.4
export const FLASH_DECAY = 6
/** Keys typed by earlier categories keep a faint afterglow, so the board warms up. */
export const RESIDUAL = 0.22

export type SkillsCursor = {
  index: number
  category: SkillCategory
  /** 0→1 within this category's slot. */
  frac: number
  /** 0→1 typing progress. */
  typeT: number
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

  const typeT = Math.max(0, Math.min(1, frac / TYPE_FRACTION))
  const typed = category.query.slice(0, Math.floor(typeT * category.query.length))
  const resultsT = Math.max(0, Math.min(1, (frac - TYPE_FRACTION) / (1 - TYPE_FRACTION)))

  return { index, category, frac, typeT, typed, resultsT }
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

  // Afterglow from categories already typed.
  for (let c = 0; c < cursor.index; c++) {
    for (const ch of skillCategories[c].query.toUpperCase()) {
      const key = LETTER_KEY_INDEX[ch]
      if (key !== undefined) out[key] = Math.max(out[key], RESIDUAL)
    }
  }

  // The current category, one character at a time.
  const query = cursor.category.query.toUpperCase()
  const charProgress = cursor.typeT * query.length
  for (let i = 0; i < query.length; i++) {
    if (charProgress < i + 1) break
    const key = LETTER_KEY_INDEX[query[i]]
    if (key === undefined) continue
    const age = charProgress - (i + 1)
    out[key] = Math.max(out[key], 1 + FLASH_GAIN * Math.exp(-age * FLASH_DECAY))
  }

  return cursor
}
