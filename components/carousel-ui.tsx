"use client"

import { motion } from "motion/react"
import { projects } from "@/data/projects"
import * as React from "react"
import Autoplay from "embla-carousel-autoplay"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

import CarouselCard from "./carousel-card"

export function CarouselUI() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  )

  React.useEffect(() => {
    if (!api) return
    setCurrent(api.selectedScrollSnap())
    api.on("select", () => setCurrent(api.selectedScrollSnap()))
  }, [api])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full py-10 pb-20"
    >
      {/* Project counter */}
      <div className="mb-6 flex items-center gap-3 px-6 md:px-14 lg:px-20">
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-ca-muted">
          {String(current + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
        </span>
        <div className="flex gap-1.5">
          {projects.map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={`h-[3px] transition-all duration-300 ${
                i === current
                  ? "w-6 bg-ca-neon"
                  : "w-3 bg-ca-rule hover:bg-ca-muted"
              }`}
              style={i === current ? { boxShadow: "0 0 8px rgba(232,255,71,0.6)" } : {}}
              aria-label={`Go to project ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <Carousel
        setApi={setApi}
        opts={{ align: "center", loop: true }}
        plugins={[plugin.current]}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="-ml-4">
          {projects.map((project, index) => (
            <CarouselItem
              key={project.id}
              className="basis-[88%] md:basis-[55%] lg:basis-[42%] pl-4"
            >
              <div
                className={`transition-all duration-500 ${
                  index === current
                    ? "opacity-100 scale-100"
                    : "opacity-40 scale-[0.94]"
                }`}
              >
                <CarouselCard project={project} isActive={index === current} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Custom nav buttons */}
        <div className="mt-8 flex items-center justify-center gap-4 px-6 md:px-14">
          <CarouselPrevious
            className="
              static translate-y-0
              h-9 w-9 rounded-none
              border border-ca-rule bg-transparent
              text-ca-muted
              hover:border-ca-neon hover:bg-ca-neon hover:text-ca-bg
              transition-all duration-200
              font-mono
            "
          />
          <CarouselNext
            className="
              static translate-y-0
              h-9 w-9 rounded-none
              border border-ca-rule bg-transparent
              text-ca-muted
              hover:border-ca-neon hover:bg-ca-neon hover:text-ca-bg
              transition-all duration-200
              font-mono
            "
          />
        </div>
      </Carousel>
    </motion.div>
  )
}