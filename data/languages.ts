// data/languages.ts
// Extracted from components/sections/languages.tsx.
//
// `keycaps` drives the Languages section: selecting an input source relabels the
// physical keyboard to that language's layout.
//
// IMPORTANT: the model's painted keyboard is a SPANISH ISO layout (see
// data/keyboard.ts). So Spanish is the default state with nothing to override, and
// it is English and Filipino that visibly relabel keys — the opposite of what you
// would assume. Each entry lists only the keys that DIFFER from what is painted.
//
// Filipino deliberately carries the same overrides as English: the Philippines uses
// the US layout, so switching between them changes no keys. That is accurate rather
// than a gap, and the panel says so instead of inventing a difference.

export type Language = {
  code: string
  /** BCP-47 tag, used for `lang` attributes on the DOM fallback. */
  tag: string
  name: string
  /** Endonym — what the language calls itself. Shown in the input-source panel. */
  endonym: string
  level: "Native" | "Fluent" | "Conversational" | "Beginner"
  percent: number
  note: string
  /** Layout label shown in the OS-style panel, e.g. "ABC — QWERTY". */
  layout: string
  /**
   * Typed on the physical keyboard and into the panel's preview field, on a loop,
   * for as long as this input source is selected. Keep it to characters we have a
   * key for — see keysForChar in components/laptop/languages/greeting.ts.
   */
  greeting: string
  /** Per-key legend overrides, keyed by key id. Empty = use what is painted. */
  keycaps: Record<string, string>
  /** Shown in the panel when a layout is shared with another language. */
  note2?: string
}

/**
 * US ANSI legends for the keys the painted Spanish layout renders differently.
 * `iso` is blank because a US board has no key between left Shift and Z.
 */
const US_LAYOUT: Record<string, string> = {
  masculine: "`",
  minus: "-",
  equal: "=",
  bracketLeft: "[",
  bracketRight: "]",
  semicolon: ";",
  quote: "'",
  backslash: "\\",
  slash: "/",
  iso: "",
}

export const languages: Language[] = [
  {
    code: "EN",
    tag: "en",
    name: "English",
    endonym: "English",
    level: "Fluent",
    percent: 90,
    note: "Professional & academic proficiency",
    layout: "ABC — US QWERTY",
    greeting: "hello!",
    keycaps: US_LAYOUT,
  },
  {
    code: "FIL",
    tag: "fil",
    name: "Filipino",
    endonym: "Filipino",
    level: "Native",
    percent: 100,
    note: "Mother tongue",
    layout: "Filipino — US QWERTY",
    greeting: "kamusta",
    keycaps: US_LAYOUT,
    note2: "Shares the US layout — no keys remapped",
  },
  {
    code: "ES",
    tag: "es",
    name: "Spanish",
    endonym: "Español",
    level: "Beginner",
    percent: 15,
    note: "Currently learning",
    layout: "Español — ES ISO",
    greeting: "hola",
    // Nothing to override: this is the layout the model already has painted on it.
    keycaps: {},
    note2: "The layout this keyboard is printed with",
  },
]

export const levelAccent: Record<Language["level"], "neon" | "hot"> = {
  Native: "neon",
  Fluent: "neon",
  Conversational: "neon",
  Beginner: "hot",
}

/** Keys whose legend differs between two languages. Drives the change highlight. */
export function changedKeys(from: Language | null, to: Language): string[] {
  const ids = new Set([...Object.keys(from?.keycaps ?? {}), ...Object.keys(to.keycaps)])
  const changed: string[] = []
  for (const id of ids) {
    if ((from?.keycaps[id] ?? null) !== (to.keycaps[id] ?? null)) changed.push(id)
  }
  return changed
}
