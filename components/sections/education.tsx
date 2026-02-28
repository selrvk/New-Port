"use client"

import { motion } from "motion/react"
import HorizontalEducationTimeline from "../horizontal-timeline"

const SPRING = [0.16, 1, 0.3, 1] as const

export default function Education() {
  return (
    <section
      id="education"
      className="relative min-h-screen bg-ca-bg overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(#1E1E1E 1px, transparent 1px), linear-gradient(90deg, #1E1E1E 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    >
      {/* ── Section header bar ── */}
      <div className="flex items-stretch border-b border-ca-rule">
        <div className="flex items-center border-r border-ca-rule px-5 py-4">
          <span className="font-mono text-[0.6rem] tracking-[0.14em] text-ca-muted">004</span>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-4">
          <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.28em] text-ca-muted">
            Education
          </span>
        </div>
        <div className="flex items-center border-l border-ca-rule px-5 py-4">
          <span className="font-mono text-[0.6rem] tracking-[0.14em] text-ca-muted">2026</span>
        </div>
      </div>

      {/* ── Headline ── */}
      <div className="border-b border-ca-rule px-6 pt-10 pb-8 md:px-14 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: SPRING }}
        >
          <div className="flex items-center gap-4 mb-3">
            <span className="h-px w-8 bg-ca-neon opacity-60" />
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ca-neon">
              Education
            </span>
          </div>
          <h2 className="font-syne text-[clamp(2.2rem,6.5vw,5.5rem)] font-extrabold leading-[0.9] tracking-[-0.03em] text-ca-paper">
            THE PATH
            <br />
            <span
              style={{
                WebkitTextStroke: "2px #F0EDE6",
                WebkitTextFillColor: "transparent",
              }}
            >
              HERE.
            </span>
          </h2>
        </motion.div>
      </div>

      {/* ── Timeline ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, ease: SPRING, delay: 0.15 }}
        className="py-16 pb-24"
      >
        <HorizontalEducationTimeline />
      </motion.div>

      {/* ── Scroll hint — mobile only ── */}
      <div className="border-t border-ca-rule px-6 py-3 md:hidden">
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-ca-muted">
          ← drag to explore →
        </span>
      </div>

    </section>
  )
}