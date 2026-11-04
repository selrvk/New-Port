// components/keys/keyPress.ts
//
// Key travel for the text version's keycaps. A struck key goes down, then springs
// back up a little past where it started and settles: the bounce that makes a
// keystroke read as a press instead of only a light coming on.
//
// Three callers:
//   · a real keyboard (Chrome.tsx's key echo): down on keydown, held while the key
//     is held, springs on keyup;
//   · a tap or click (Chrome.tsx's usePressKeys): the same, on the pointer;
//   · the languages board's greeting loop (LanguageBoard.tsx): a whole strike per
//     letter, since nobody is holding anything.
//
// It animates the `translate` property, not `transform`, so it adds to whatever
// else a key is doing (a title still typing itself in, a link's :active travel)
// instead of fighting it. It uses Web Animations rather than a class, because the
// same key is often struck again before its last bounce has finished — the "ll" in
// "Hello", a quick double tap — and an animation can be restarted from wherever the
// key is, where a class would jump.
//
// The distance is a share of the key's own size, so a hero keycap and a board key
// travel in proportion. Nothing moves under reduced motion; keys still light.

const REDUCED = "(prefers-reduced-motion: reduce)"

/** Travel, as a share of the key's shorter side. */
const TRAVEL = 0.09
/** The spring after the bottom of the stroke: overshoot up, a smaller dip, rest. */
const SPRING = [-0.45, 0.14, 0] as const
const DOWN_MS = 45
const SPRING_MS = 250

const running = new WeakMap<HTMLElement, Animation>()
const dimTimers = new Map<HTMLElement, number>()

const still = () => window.matchMedia(REDUCED).matches

function travel(el: HTMLElement): number {
  return Math.max(1.5, Math.min(el.offsetWidth, el.offsetHeight) * TRAVEL)
}

/** Where the key is right now, mid-bounce or not, in px. */
function currentY(el: HTMLElement): number {
  const t = getComputedStyle(el).translate
  if (!t || t === "none") return 0
  const y = parseFloat(t.split(" ")[1] ?? "0")
  return Number.isFinite(y) ? y : 0
}

const at = (y: number) => `0 ${y.toFixed(2)}px`

function play(el: HTMLElement, frames: Keyframe[], ms: number, hold = false) {
  const from = currentY(el)
  running.get(el)?.cancel()
  const a = el.animate([{ translate: at(from), easing: "ease-out" }, ...frames], {
    duration: ms,
    fill: hold ? "forwards" : "none",
  })
  running.set(el, a)
}

/** The spring, as keyframes after the bottom of the stroke. */
function springFrames(d: number): Keyframe[] {
  return [
    { translate: at(SPRING[0] * d), easing: "ease-in-out" },
    { translate: at(SPRING[1] * d), easing: "ease-in-out" },
    { translate: at(SPRING[2] * d) },
  ]
}

/** Light the key and push it down, holding it there until releaseKey. */
export function pressKey(el: HTMLElement): void {
  window.clearTimeout(dimTimers.get(el))
  dimTimers.delete(el)
  el.setAttribute("data-strike", "")
  el.setAttribute("data-lit", "")
  if (still()) return
  play(el, [{ translate: at(travel(el)) }], DOWN_MS, true)
}

/** Let the key spring back up, and let its light fade after `dimMs`. */
export function releaseKey(el: HTMLElement, dimMs: number): void {
  el.removeAttribute("data-strike")
  window.clearTimeout(dimTimers.get(el))
  dimTimers.set(
    el,
    window.setTimeout(() => {
      el.removeAttribute("data-lit")
      dimTimers.delete(el)
    }, dimMs)
  )
  if (still()) {
    running.get(el)?.cancel()
    return
  }
  // The first frame of the spring is wherever the press got to, so a tap quicker
  // than the press itself still bounces from a real depth.
  play(el, springFrames(travel(el)), SPRING_MS)
}

/** One whole keystroke — down and back up — with no light. For the greeting loop. */
export function bounceKey(el: HTMLElement): void {
  if (still()) return
  const d = travel(el)
  const total = DOWN_MS + SPRING_MS
  const frames = springFrames(d)
  // Put the bottom of the stroke at the same moment a held press would reach it.
  const bottom: Keyframe = { translate: at(d), offset: DOWN_MS / total, easing: "ease-out" }
  play(el, [bottom, ...frames], total)
}
