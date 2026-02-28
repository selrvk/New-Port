"use client"

import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { skillsData, SkillCategory } from "@/data/skills"

type ActiveSkill = {
  category: SkillCategory
  type: string
}

const NAV: { category: SkillCategory; type: string; index: string }[] = [
  { category: "Web Development",       type: "Front End",     index: "01" },
  { category: "Web Development",       type: "Back End",      index: "02" },
  { category: "Web Development",       type: "Practices",     index: "03" },
  { category: "Software Development",  type: "Desktop Apps",  index: "04" },
  { category: "Software Development",  type: "Mobile Apps",   index: "05" },
  { category: "Visual Graphic Design", type: "Brand Identity",index: "06" },
]

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  "Web Development":       "web_dev",
  "Software Development":  "software_dev",
  "Visual Graphic Design": "design",
}

// Group NAV items by category
const GROUPED = NAV.reduce<Record<string, typeof NAV>>((acc, item) => {
  const key = CATEGORY_LABELS[item.category]
  if (!acc[key]) acc[key] = []
  acc[key].push(item)
  return acc
}, {})

const SPRING = [0.16, 1, 0.3, 1] as const

export default function Skills() {
  const [active, setActive] = useState<ActiveSkill>({
    category: "Web Development",
    type: "Front End",
  })

  const skills: string[] = (skillsData[active.category] as any)[active.type] ?? []
  const activeNav = NAV.find(n => n.category === active.category && n.type === active.type)

  return (
    <section
      id="skills"
      className="relative min-h-screen bg-ca-bg"
      style={{
        backgroundImage:
          "linear-gradient(#1E1E1E 1px, transparent 1px), linear-gradient(90deg, #1E1E1E 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    >
      {/* ── Section header bar ── */}
      <div className="flex items-stretch border-b border-ca-rule">
        <div className="flex items-center border-r border-ca-rule px-5 py-4">
          <span className="font-mono text-[0.6rem] tracking-[0.14em] text-ca-muted">003</span>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-4">
          <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.28em] text-ca-muted">
            Skills &amp; Stack
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
              Skills
            </span>
          </div>
          <h2 className="font-syne text-[clamp(2.2rem,6.5vw,5.5rem)] font-extrabold leading-[0.9] tracking-[-0.03em] text-ca-paper">
            WHAT I
            <br />
            <span
              style={{
                WebkitTextStroke: "2px #F0EDE6",
                WebkitTextFillColor: "transparent",
              }}
            >
              WORK WITH.
            </span>
          </h2>
        </motion.div>
      </div>

      <div className="flex min-h-[60vh] flex-col md:flex-row">

        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: SPRING }}
          className="flex-shrink-0 border-b border-ca-rule md:w-[220px] md:border-b-0 md:border-r lg:w-[260px]"
        >
          {/* Explorer header */}
          <div className="flex items-center gap-2 border-b border-ca-rule px-5 py-3">
            <span className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-ca-muted">
              Explorer
            </span>
          </div>

          {/* Grouped nav */}
          <div className="py-2">
            {Object.entries(GROUPED).map(([groupKey, items]) => (
              <div key={groupKey}>
                {/* Group label */}
                <div className="flex items-center gap-2 px-5 py-2">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="flex-shrink-0">
                    <path d="M2 1l4 3-4 3" stroke="#585B70" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="font-mono text-[0.56rem] uppercase tracking-[0.16em] text-ca-muted">
                    {groupKey}
                  </span>
                </div>

                {/* Nav items */}
                {items.map((item) => {
                  const isActive = active.category === item.category && active.type === item.type
                  return (
                    <button
                      key={`${item.category}-${item.type}`}
                      onClick={() => setActive({ category: item.category, type: item.type })}
                      className="group relative flex w-full items-center gap-3 px-8 py-2.5 text-left transition-colors duration-150"
                      style={{
                        background: isActive ? "rgba(232,255,71,0.05)" : "transparent",
                        borderLeft: isActive ? "2px solid #E8FF47" : "2px solid transparent",
                      }}
                    >
                      <span
                        className="font-mono text-[0.56rem] tracking-[0.1em]"
                        style={{ color: isActive ? "#E8FF47" : "#585B70" }}
                      >
                        {item.index}
                      </span>
                      <span
                        className="font-mono text-[0.7rem] transition-colors duration-150"
                        style={{
                          color: isActive ? "#F0EDE6" : "#6B6860",
                        }}
                      >
                        {item.type}
                      </span>
                      {isActive && (
                        <span
                          className="ml-auto font-mono text-[0.5rem] text-ca-neon"
                          style={{ textShadow: "0 0 8px rgba(232,255,71,0.5)" }}
                        >
                          ●
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </motion.aside>

        <div className="flex flex-1 flex-col">

          {/* Panel tab bar */}
          <div className="flex items-center gap-0 border-b border-ca-rule">
            <div
              className="flex items-center gap-2 border-r border-ca-rule px-5 py-3"
              style={{ borderTop: "1px solid #E8FF47" }}
            >
              <span className="font-mono text-[0.62rem] text-ca-paper">
                {active.type.toLowerCase().replace(" ", "_")}.ts
              </span>
              <span className="font-mono text-[0.5rem] text-ca-muted">✕</span>
            </div>
            <div className="flex-1" />
            <div className="px-5 py-3">
              <span className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-ca-muted">
                {activeNav?.index} / 06
              </span>
            </div>
          </div>

          {/* Code-style breadcrumb */}
          <div className="border-b border-ca-rule px-6 py-2.5">
            <span className="font-mono text-[0.6rem] text-ca-muted">
              <span className="text-ca-neon opacity-70">const</span>{" "}
              <span className="text-[#F0EDE6]">{active.type.toLowerCase().replace(" ", "_")}</span>{" "}
              <span className="text-ca-muted">=</span>{" "}
              <span className="text-ca-neon opacity-70">[</span>
              <span className="text-ca-muted"> ...{skills.length} skills </span>
              <span className="text-ca-neon opacity-70">]</span>
            </span>
          </div>

          {/* Skills grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${active.category}-${active.type}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex-1 p-6 md:p-8 lg:p-10"
            >
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {skills.map((skill, i) => (
                  <motion.li
                    key={skill}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: SPRING,
                      delay: i * 0.055,
                    }}
                  >
                    <SkillItem text={skill} index={i} />
                  </motion.li>
                ))}
              </ul>

              {/* Bottom line count — IDE flavour */}
              <div className="mt-8 flex items-center gap-3 border-t border-ca-rule pt-4">
                <span className="font-mono text-[0.56rem] text-ca-muted">
                  {skills.length} items
                </span>
                <div className="h-px flex-1 bg-ca-rule" />
                <span className="font-mono text-[0.56rem] text-ca-muted">
                  {CATEGORY_LABELS[active.category]}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </section>
  )
}

function SkillItem({ text, index }: { text: string; index: number }) {
  return (
    <div
      className="group relative flex items-center gap-3 border border-ca-rule bg-ca-bg px-4 py-3 transition-all duration-200 hover:border-[#3A3A3A] cursor-default"
      style={{
        transition: "border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = "#E8FF47"
        el.style.boxShadow = "0 0 16px rgba(232,255,71,0.08)"
        el.style.background = "rgba(232,255,71,0.03)"
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = "#1E1E1E"
        el.style.boxShadow = "none"
        el.style.background = "#0A0A0A"
      }}
    >
      {/* Line number */}
      <span className="font-mono w-5 flex-shrink-0 text-[0.55rem] text-ca-muted opacity-40 select-none">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Neon dot */}
      <span
        className="h-1 w-1 flex-shrink-0 rounded-full bg-ca-neon opacity-60"
        style={{ boxShadow: "0 0 4px rgba(232,255,71,0.5)" }}
      />

      {/* Skill name */}
      <span className="font-mono text-[0.72rem] text-ca-muted transition-colors duration-200 group-hover:text-ca-paper">
        {text}
      </span>
    </div>
  )
}