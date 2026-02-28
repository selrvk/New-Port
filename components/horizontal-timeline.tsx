"use client"

import { education } from "@/data/education"
import { useRef, useState } from "react"
import { motion } from "motion/react"

const SPRING = [0.16, 1, 0.3, 1] as const

export default function HorizontalEducationTimeline() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX]     = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }
  const handleMouseLeave = () => setIsDragging(false)
  const handleMouseUp    = () => setIsDragging(false)
  const handleMouseMove  = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x    = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  return (
    <div className="relative">

      {/* ── Scrollable track ── */}
      <div
        ref={scrollRef}
        className="scrollbar-hide select-none overflow-x-auto cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div className="flex items-start min-w-max px-6 md:px-14 lg:px-20 pb-12 pt-8">

          {education.map((item, index) => {
            const isLast   = index === education.length - 1
            const isActive = activeIndex === index

            return (
              <div
                key={index}
                className="relative flex flex-col items-start shrink-0 w-[280px] md:w-[320px]"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >

                {/* ── Connector line ── */}
                {!isLast && (
                  <div
                    className="absolute left-[28px] top-[28px] h-[2px] w-full"
                    style={{
                      background: "linear-gradient(90deg, #E8FF47 0%, #1E1E1E 100%)",
                      zIndex: 0,
                    }}
                  />
                )}
                {/* Left cap on connector (all except first) */}
                {index !== 0 && (
                  <div
                    className="absolute right-full top-[27px] h-[2px]"
                    style={{
                      width: "0px", // handled by previous item's line
                      background: "#E8FF47",
                    }}
                  />
                )}

                {/* ── Station marker ── */}
                <motion.div
                  className="relative z-10 flex items-center justify-center"
                  animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                  transition={{ duration: 0.25, ease: SPRING }}
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center border bg-ca-bg"
                    style={{
                      borderColor: isActive ? "#E8FF47" : "#3A3A3A",
                      boxShadow: isActive
                        ? "0 0 0 1px #E8FF47, 0 0 20px rgba(232,255,71,0.25)"
                        : "none",
                      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    }}
                  >
                    <span
                      className="font-mono text-[0.65rem] font-bold tracking-[0.1em]"
                      style={{ color: isActive ? "#E8FF47" : "#6B6860" }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </motion.div>

                {/* ── Card ── */}
                <motion.div
                  className="mt-6 mr-8 flex flex-col gap-2 border bg-ca-bg p-5"
                  animate={
                    isActive
                      ? { y: -4, borderColor: "#3A3A3A" }
                      : { y: 0,  borderColor: "#1E1E1E" }
                  }
                  transition={{ duration: 0.25, ease: SPRING }}
                  style={{
                    boxShadow: isActive
                      ? "0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px #2A2A2A"
                      : "none",
                  }}
                >
                  {/* Year badge */}
                  <div className="flex items-center gap-2 mb-1 ">
                    <span
                      className="font-mono text-[0.56rem] uppercase tracking-[0.2em] "
                      style={{ color: isActive ? "#E8FF47" : "#6B6860" }}
                    >
                      {item.year}
                    </span>
                    {isActive && (
                      <span
                        className="h-px flex-1 "
                        style={{
                          background: "linear-gradient(90deg, #E8FF47, transparent)",
                          opacity: 0.4,
                        }}
                      />
                    )}
                  </div>

                  {/* School */}
                  <h3 className="font-zen text-[1.2rem] font-light leading-tight tracking-[-0.01em] text-ca-paper">
                    {item.school}
                  </h3>

                  {/* Degree */}
                  {item.degree && (
                    <p className="font-jakarta text-[0.78rem] leading-snug text-ca-paper/40">
                      {item.degree}
                    </p>
                  )}

                  {/* Description */}
                  {item.description && (
                    <p className="font-jakarta mt-1 text-[0.72rem] leading-relaxed text-ca-muted opacity-70">
                      {item.description}
                    </p>
                  )}

                  {/* Bottom index tag */}
                  <div className="mt-3 flex items-center gap-2 border-t border-ca-rule pt-3">
                    <span className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-ca-muted opacity-90">
                      entry_{String(index + 1).padStart(2, "0")}
                    </span>
                    <div
                      className="h-1 w-1 rounded-full"
                      style={{
                        background: isActive ? "#E8FF47" : "#3A3A3A",
                        boxShadow: isActive ? "0 0 6px rgba(232,255,71,0.7)" : "none",
                        transition: "background 0.2s ease, box-shadow 0.2s ease",
                      }}
                    />
                  </div>
                </motion.div>

              </div>
            )
          })}

        </div>
      </div>

      {/* ── Right fade ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-24"
        style={{
          background: "linear-gradient(to left, #0A0A0A, transparent)",
        }}
      />
      {/* ── Left fade ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-12"
        style={{
          background: "linear-gradient(to right, #0A0A0A, transparent)",
        }}
      />

    </div>
  )
}