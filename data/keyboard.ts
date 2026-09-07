// data/keyboard.ts
//
// The model's keyboard is PAINTED INTO THE TEXTURE — there is no key geometry.
// We overlay a grid of glow quads aligned to the painted keys (see Keycaps.tsx),
// so this layout must match the artwork, not a generic keyboard.
//
// The artwork is a SPANISH ISO layout: there is an Ñ right of L, accent keys, an
// L-shaped Return, and — the one that actually matters — an extra `<` key between
// left Shift and Z, which pushes Z–M one position right compared to ANSI. Modelling
// it as ANSI put every letter on the bottom row over the wrong painted key.
//
// Widths are in units (1u = one standard keycap). Every row totals 15u.
//
// Rows are NOT all the same height: the painted function row is roughly two-thirds
// the height of the others, as on a real laptop. Treating all six as equal spread
// them too tall across the measured key block, so every row below the first sat
// progressively low — the glow drifted down and away from the keys it belonged to.

/**
 * Height of each row in units, top to bottom. The function row is short.
 * Sums to ROW_UNITS_Y, which is what unit.z is divided by.
 */
export const ROW_HEIGHTS = [0.62, 1, 1, 1, 1, 1] as const

export type KeyDef = {
  /** Stable id — referenced by languages.ts `keycaps` overrides. */
  id: string
  /** Legend as painted on the model. */
  legend: string
  /** Width in units. Defaults to 1. */
  w?: number
  /** A–Z letter this key represents, for the skills backlight. */
  letter?: string
}

export const KEY_ROWS: KeyDef[][] = [
  // Function row
  [
    { id: "esc", legend: "esc" },
    { id: "f1", legend: "F1" }, { id: "f2", legend: "F2" }, { id: "f3", legend: "F3" },
    { id: "f4", legend: "F4" }, { id: "f5", legend: "F5" }, { id: "f6", legend: "F6" },
    { id: "f7", legend: "F7" }, { id: "f8", legend: "F8" }, { id: "f9", legend: "F9" },
    { id: "f10", legend: "F10" }, { id: "f11", legend: "F11" }, { id: "f12", legend: "F12" },
    { id: "f13", legend: "F13" }, { id: "power", legend: "⏻" },
  ],
  // Number row — ISO Spanish
  [
    { id: "masculine", legend: "º" },
    { id: "1", legend: "1" }, { id: "2", legend: "2" }, { id: "3", legend: "3" },
    { id: "4", legend: "4" }, { id: "5", legend: "5" }, { id: "6", legend: "6" },
    { id: "7", legend: "7" }, { id: "8", legend: "8" }, { id: "9", legend: "9" },
    { id: "0", legend: "0" },
    { id: "minus", legend: "'" }, { id: "equal", legend: "¡" },
    { id: "backspace", legend: "⌫", w: 2 },
  ],
  // Top letter row
  [
    { id: "tab", legend: "tab", w: 1.5 },
    { id: "q", legend: "Q", letter: "Q" }, { id: "w", legend: "W", letter: "W" },
    { id: "e", legend: "E", letter: "E" }, { id: "r", legend: "R", letter: "R" },
    { id: "t", legend: "T", letter: "T" }, { id: "y", legend: "Y", letter: "Y" },
    { id: "u", legend: "U", letter: "U" }, { id: "i", legend: "I", letter: "I" },
    { id: "o", legend: "O", letter: "O" }, { id: "p", legend: "P", letter: "P" },
    { id: "bracketLeft", legend: "`" }, { id: "bracketRight", legend: "+" },
    // Upper arm of the L-shaped ISO Return.
    { id: "enterTop", legend: "↵", w: 1.5 },
  ],
  // Home row
  [
    { id: "caps", legend: "caps", w: 1.75 },
    { id: "a", legend: "A", letter: "A" }, { id: "s", legend: "S", letter: "S" },
    { id: "d", legend: "D", letter: "D" }, { id: "f", legend: "F", letter: "F" },
    { id: "g", legend: "G", letter: "G" }, { id: "h", legend: "H", letter: "H" },
    { id: "j", legend: "J", letter: "J" }, { id: "k", legend: "K", letter: "K" },
    { id: "l", legend: "L", letter: "L" },
    { id: "semicolon", legend: "Ñ" }, { id: "quote", legend: "´" },
    { id: "backslash", legend: "Ç" },
    { id: "enter", legend: "", w: 1.25 },
  ],
  // Bottom letter row — the ISO `<` key is why Z–M sit one slot right of ANSI.
  [
    { id: "shiftLeft", legend: "⇧", w: 1.25 },
    { id: "iso", legend: "<" },
    { id: "z", legend: "Z", letter: "Z" }, { id: "x", legend: "X", letter: "X" },
    { id: "c", legend: "C", letter: "C" }, { id: "v", legend: "V", letter: "V" },
    { id: "b", legend: "B", letter: "B" }, { id: "n", legend: "N", letter: "N" },
    { id: "m", legend: "M", letter: "M" },
    { id: "comma", legend: "," }, { id: "period", legend: "." }, { id: "slash", legend: "-" },
    { id: "shiftRight", legend: "⇧", w: 2.75 },
  ],
  // Modifier row
  [
    { id: "fn", legend: "fn" },
    { id: "ctrl", legend: "ctrl" },
    { id: "optLeft", legend: "alt" },
    { id: "cmdLeft", legend: "cmd", w: 1.25 },
    { id: "space", legend: "", w: 5.5 },
    { id: "cmdRight", legend: "cmd", w: 1.25 },
    { id: "optRight", legend: "alt" },
    { id: "arrowLeft", legend: "←" },
    { id: "arrowUpDown", legend: "↕" },
    { id: "arrowRight", legend: "→" },
  ],
]

/**
 * Flattened, with computed unit-space position. Origin = top-left of the key block.
 * `y` is the cumulative height of the rows above, so short rows do not push the
 * rows below them out of alignment.
 */
export type PlacedKey = KeyDef & { row: number; x: number; y: number; w: number; h: number }

export const KEYS: PlacedKey[] = KEY_ROWS.flatMap((row, r) => {
  let cursor = 0
  const y = ROW_HEIGHTS.slice(0, r).reduce((a, b) => a + b, 0)
  const h = ROW_HEIGHTS[r] ?? 1
  return row.map((k) => {
    const w = k.w ?? 1
    const placed: PlacedKey = { ...k, w, h, row: r, x: cursor, y }
    cursor += w
    return placed
  })
})

export const KEY_COUNT = KEYS.length
/** Widest row, in units. Used to normalise the grid onto the model. */
export const GRID_UNITS_X = Math.max(...KEY_ROWS.map((r) => r.reduce((n, k) => n + (k.w ?? 1), 0)))
/** Total row height in units — NOT the row count, because rows differ in height. */
export const GRID_UNITS_Y = ROW_HEIGHTS.reduce((a, b) => a + b, 0)

/** id → index into KEYS, for fast per-key instance updates. */
export const KEY_INDEX: Record<string, number> = Object.fromEntries(KEYS.map((k, i) => [k.id, i]))

/** A–Z → index into KEYS. */
export const LETTER_KEY_INDEX: Record<string, number> = Object.fromEntries(
  KEYS.map((k, i) => [k.letter, i]).filter(([l]) => l) as [string, number][]
)
