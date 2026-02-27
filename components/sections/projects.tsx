"use client"

import { motion } from "motion/react"
import { CarouselUI } from "../carousel-ui"

const SPRING = [0.16, 1, 0.3, 1] as const

export default function Projects() {
  return (
    <section
      id="projects"
      className="relative min-h-screen overflow-hidden bg-ca-bg"
      style={{
        backgroundImage:
          "linear-gradient(#1E1E1E 1px, transparent 1px), linear-gradient(90deg, #1E1E1E 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    >

      <div className="flex items-stretch border-b border-ca-rule">
        <div className="flex items-center border-r border-ca-rule px-5 py-4">
          <span className="font-mono text-[0.6rem] tracking-[0.14em] text-ca-muted">002</span>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-4">
          <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.28em] text-ca-muted">
            Selected Work
          </span>
        </div>
        <div className="flex items-center border-l border-ca-rule px-5 py-4">
          <span className="font-mono text-[0.6rem] tracking-[0.14em] text-ca-muted">2026</span>
        </div>
      </div>

      {/* ── Headline ── */}
      <div className="px-6 pt-12 pb-2 md:px-14 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: SPRING }}
        >
          <div className="flex items-center gap-4 mb-3">
            <span className="h-px w-8 bg-ca-neon opacity-60" />
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ca-neon">
              Projects
            </span>
          </div>
          <h2 className="font-syne text-[clamp(2.4rem,7vw,6rem)] font-extrabold leading-[0.9] tracking-[-0.03em] text-ca-paper">
            THINGS I'VE
            <br />
            <span
              className="font-syne font-extrabold"
              style={{
                WebkitTextStroke: "2px #F0EDE6",
                WebkitTextFillColor: "transparent",
              }}
            >
              BUILT.
            </span>
          </h2>
        </motion.div>
      </div>

      {/* ── Carousel ── */}
      <CarouselUI />
    </section>
  )
}