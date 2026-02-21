import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import {education} from "@/data/education"
import EducationCarouselCard from "@/components/education-carousel-card"

export default function EducationCarousel() {
  return (
    <Carousel
      opts={{
        align: "start",
      }}
      orientation="vertical"
      className="flex w-[80%] mt-30"
    >
      <CarouselContent className="h-100">
        {education.map((school) => (
                  <CarouselItem
                    key={school.id}
                    className="basis-1/2"
                  >
                    <div>
                      <EducationCarouselCard school={school} />
                    </div>
                  </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
