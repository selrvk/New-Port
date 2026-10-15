// components/laptop/lib/bootProgress.ts
//
// How far the 3D boot has got, as a number the boot screen can show.
//
// The boot screen is server-rendered (it has to be on screen before any JavaScript
// runs), while the progress comes from inside the lazily-loaded 3D chunk. This tiny
// store is the bridge, and it imports nothing so the boot screen stays out of the
// three.js bundle.
//
// The stages are real, not a timer dressed up as one:
//   10   the gate has mounted and asked for the 3D chunk
//   35   the 3D chunk has arrived and the canvas exists
//   35→90 the model downloading (drei's loader progress)
//   100  fonts are ready and the scene has drawn complete frames
//
// Monotonic on purpose: drei's loader reports 100%, then drops back when a second
// batch of assets starts. A bar that goes backwards reads as something breaking.

let value = 0
const listeners = new Set<() => void>()

export function reportBootProgress(percent: number): void {
  const next = Math.max(value, Math.min(100, percent))
  if (next === value) return
  value = next
  for (const l of listeners) l()
}

/** Called when the scene unmounts, so a later return to 3D starts from zero. */
export function resetBootProgress(): void {
  if (value === 0) return
  value = 0
  for (const l of listeners) l()
}

export function getBootProgress(): number {
  return value
}

export function subscribeBootProgress(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
