"use client"

import { motion, useInView } from "motion/react"
import { useRef } from "react"

const SPRING = [0.16, 1, 0.3, 1] as const

// ── Language data ──────────────────────────────────────────────────────────────
const LANGUAGES = [
  {
    name:       "English",
    level:      "Fluent",
    code:       "EN",
    percent:    90,
    note:       "Professional & academic proficiency",
  },
  {
    name:       "Filipino",
    level:      "Native",
    code:       "FIL",
    percent:    100,
    note:       "Mother tongue",
  },
  {
    name:       "Spanish",
    level:      "Beginner",
    code:       "ES",
    percent:    15,
    note:       "Currently learning",
  },
]

// ── Level → neon intensity ─────────────────────────────────────────────────────
const LEVEL_COLOR: Record<string, string> = {
  Native:       "#E8FF47",   // full neon
  Fluent:       "#E8FF47",   // full neon
  Conversational:"#E8FF47", // full neon
  Beginner:     "#FF2D6B",  // hot pink — signals in-progress
}

export default function Languages() {
  return (
    <section
      id="languages"
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
          <span className="font-mono text-[0.6rem] tracking-[0.14em] text-ca-muted">006</span>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-4">
          <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.28em] text-ca-muted">
            Languages
          </span>
        </div>
        <div className="flex items-center border-l border-ca-rule px-5 py-4">
          <span className="font-mono text-[0.6rem] tracking-[0.14em] text-ca-muted">2026</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-6 py-12 md:px-14 lg:px-20">

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: SPRING }}
          className="mb-14"
        >
          <div className="flex items-center gap-4 mb-3">
            <span className="h-px w-8 bg-ca-neon opacity-60" />
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ca-neon">
              Languages
            </span>
          </div>
          <h2 className="font-syne text-[clamp(2.2rem,6.5vw,5.5rem)] font-extrabold leading-[0.9] tracking-[-0.03em] text-ca-paper">
            I SPEAK
            <br />
            <span
              style={{
                WebkitTextStroke: "2px #F0EDE6",
                WebkitTextFillColor: "transparent",
              }}
            >
              THESE.
            </span>
          </h2>
          <p className="font-mono mt-4 text-[0.62rem] text-ca-muted">
            <span className="text-ca-neon opacity-60">{"// "}</span>
            not the programming kind
          </p>
        </motion.div>

        {/* Language rows */}
        <div className="flex flex-col divide-y divide-ca-rule border border-ca-rule max-w-2xl">
          {LANGUAGES.map((lang, i) => (
            <LanguageRow key={lang.code} lang={lang} index={i} />
          ))}
        </div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 flex items-center gap-3"
        >
          <div className="h-px w-4 bg-ca-neon opacity-30" />
          <span className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-ca-muted opacity-50">
            self-assessed proficiency levels
          </span>
        </motion.div>

      </div>
    </section>
  )
}

// ── Individual language row ────────────────────────────────────────────────────
function LanguageRow({
  lang,
  index,
}: {
  lang: (typeof LANGUAGES)[number]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const accentColor = LEVEL_COLOR[lang.level] ?? "#E8FF47"

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, ease: SPRING, delay: index * 0.1 }}
      className="group relative flex flex-col gap-4 bg-ca-bg p-6 transition-colors duration-200 hover:bg-[#0D0D0D]"
    >
      {/* Top row: code + name + level badge */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Language code — monospace index */}
          <span
            className="font-mono w-10 flex-shrink-0 text-[0.65rem] font-bold tracking-[0.1em]"
            style={{ color: accentColor }}
          >
            {lang.code}
          </span>

          {/* Language name */}
          <h3 className="font-syne text-xl font-extrabold tracking-[-0.02em] text-ca-paper">
            {lang.name}
          </h3>
        </div>

        {/* Level badge */}
        <span
          className="font-mono flex-shrink-0 border px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.14em]"
          style={{
            borderColor: accentColor,
            color: accentColor,
            boxShadow: `0 0 10px ${accentColor}22`,
          }}
        >
          {lang.level}
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-4">
        {/* Track */}
        <div className="relative h-[3px] flex-1 bg-ca-rule overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full"
            initial={{ width: "0%" }}
            animate={inView ? { width: `${lang.percent}%` } : { width: "0%" }}
            transition={{ duration: 1.4, ease: SPRING, delay: 0.2 + index * 0.15 }}
            style={{
              background:
                lang.percent === 100
                  ? `linear-gradient(90deg, ${accentColor}, ${accentColor})`
                  : `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}99 100%)`,
              boxShadow: `0 0 8px ${accentColor}55`,
            }}
          />
        </div>

        {/* Percentage */}
        <motion.span
          className="font-mono w-10 flex-shrink-0 text-right text-[0.65rem] font-bold"
          style={{ color: accentColor }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.4 + index * 0.15 }}
        >
          {lang.percent}%
        </motion.span>
      </div>

      {/* Note */}
      <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-ca-muted opacity-60">
        {lang.note}
      </p>

      {/* Left accent bar — appears on hover */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background: accentColor,
          boxShadow: `0 0 8px ${accentColor}66`,
        }}
      />
    </motion.div>
  )
}