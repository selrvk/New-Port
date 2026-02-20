// components/sections/projects.tsx
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { Car } from "lucide-react"

import Image from "next/image"
import { CarouselUI } from "../carousel-ui"

export default function Projects() {
    return (
        <section id="projects" className="relative min-h-screen overflow-hidden bg-linear-to-l from-[#1C2442] to-palette-four">
            
            <div className="flex flex-col items-center justify-center">

                <div>
                    <h1 className="text-palette-one font-bebas text-6xl text-center mt-20">
                        Projects
                    </h1>

                    <h2 className="text-palette-two font-calistoga text-2xl text-center -mt-3">
                        some of my work
                    </h2>
                </div>

                <CarouselUI />

            </div>

        </section>
    )
}