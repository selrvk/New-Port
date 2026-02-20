"use client"

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

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  return (
    <Carousel
      setApi={setApi}
      opts={{
        align: "center",
        loop: true,
      }}
      plugins={[plugin.current]}
      className="w-full h-screen mt-20"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {projects.map((project, index) => (
          <CarouselItem
            key={project.id}
            className="basis-[70%] md:basis-[50%] flex justify-center py-12"
          >
            <div
              className={`transition-all duration-500 ${
                index === current
                  ? "scale-95 opacity-100"
                  : "scale-85 opacity-60"
              }`}
            >
              <CarouselCard project={project} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}