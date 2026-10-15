// components/keys/code128.ts
//
// A Code 128 (code set B) encoder, so the barcode on a label sticker is a real
// one: point a phone camera at it and it reads the credential ID printed beneath
// it. A decorative stripe pattern would be a small lie on a page that otherwise
// only states facts.
//
// Code set B covers printable ASCII (32–127), which credential IDs fit inside.

/**
 * Bar/space widths, in modules, for symbol values 0–106. Each symbol alternates
 * bar, space, bar, space, bar, space and is 11 modules wide; the stop symbol (106)
 * has a seventh element and is 13. Verified by the parity rule every Code 128
 * symbol obeys — its bars sum to an even width and its spaces to an odd one — which
 * catches any single transcription error in this table.
 */
const PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312",
  "132212", "221213", "221312", "231212", "112232", "122132", "122231", "113222",
  "123122", "123221", "223211", "221132", "221231", "213212", "223112", "312131",
  "311222", "321122", "321221", "312212", "322112", "322211", "212123", "212321",
  "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121",
  "313121", "211331", "231131", "213113", "213311", "213131", "311123", "311321",
  "331121", "312113", "312311", "332111", "314111", "221411", "431111", "111224",
  "111422", "121124", "121421", "141122", "141221", "112214", "112412", "122114",
  "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112",
  "421211", "212141", "214121", "412121", "111143", "111341", "131141", "114113",
  "114311", "411113", "411311", "113141", "114131", "311141", "411131", "211412",
  "211214", "211232", "2331112",
] as const

const START_B = 104
const STOP = 106

/** Exposed for the parity check in development tooling. */
export const CODE128_PATTERNS: readonly string[] = PATTERNS

/** Symbol values for `text` in code set B, including start, checksum and stop. */
export function code128Values(text: string): number[] {
  const values = [START_B]
  for (const ch of text) {
    const code = ch.charCodeAt(0)
    if (code < 32 || code > 127) {
      throw new Error(`Code 128 set B cannot encode ${JSON.stringify(ch)}`)
    }
    values.push(code - 32)
  }
  // Weighted modulo-103 checksum: the start symbol counts once, each data symbol by
  // its position.
  let sum = START_B
  for (let i = 1; i < values.length; i++) sum += values[i] * i
  values.push(sum % 103, STOP)
  return values
}

export type Bar = { x: number; width: number }

/**
 * The dark bars for `text`, in modules, with a quiet zone of `quiet` modules on
 * each side — scanners need that blank margin to find where the code starts.
 */
export function code128Bars(text: string, quiet = 10): { bars: Bar[]; width: number } {
  const bars: Bar[] = []
  let x = quiet
  for (const value of code128Values(text)) {
    const widths = PATTERNS[value]
    for (let i = 0; i < widths.length; i++) {
      const w = Number(widths[i])
      if (i % 2 === 0) bars.push({ x, width: w })
      x += w
    }
  }
  return { bars, width: x + quiet }
}
