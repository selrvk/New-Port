// components/laptop/screens/index.ts
//
// Dispatches the global 0→1 scroll value to whichever section painter owns it,
// handing that painter its own local 0→1. Adding a section = one entry here plus
// one draw file — no changes to ScreenSurface.

import { SECTIONS, SECTION_ORDER, type SectionId } from "../config"
import { localProgress } from "../lib/keyframes"
import type { ScreenCtx, ScreenPainter } from "../lib/canvas2d"
import { drawAbout } from "./drawAbout"
import { drawBoot } from "./drawBoot"
import { drawCerts } from "./drawCerts"
import { drawContact } from "./drawContact"
import { drawLanguages } from "./drawLanguages"
import { drawProjects } from "./drawProjects"
import { drawSchools } from "./drawSchools"
import { drawSkills } from "./drawSkills"

const PAINTERS: Record<SectionId, ScreenPainter> = {
  hero: drawBoot,
  projects: drawProjects,
  skills: drawSkills,
  certifications: drawCerts,
  schools: drawSchools,
  about: drawAbout,
  languages: drawLanguages,
  contact: drawContact,
}

export function sectionAt(progress: number): SectionId {
  for (const id of SECTION_ORDER) {
    const r = SECTIONS[id]
    if (progress >= r.start && progress < r.end) return id
  }
  return SECTION_ORDER[SECTION_ORDER.length - 1]
}

/** Paint the screen for a given global progress. Mutates the supplied context. */
export function paintScreen(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number
): SectionId {
  const id = sectionAt(progress)
  const range = SECTIONS[id]
  const s: ScreenCtx = {
    ctx,
    w: width,
    h: height,
    t: localProgress(progress, range.start, range.end),
    global: progress,
  }
  PAINTERS[id](s)
  return id
}
