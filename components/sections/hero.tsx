// components/sections/hero.tsx
import { ShimmerButton } from "@/components/ui/shimmer-button"

import Image from "next/image"

export default function Hero() {
    return (
        <section id="hero" className="relative min-h-screen overflow-hidden bg-linear-to-l from-[#1C2442] to-palette-four">
            
            <div>

                {/* Hero Header Div */}
                <div className="flex justify-between bg-palette-one rounded-[50] px-5 pt-2 pb-0.5 m-5 text-center">

                    <h2 className="font-bebas w-10 leading-3.5 ">
                        LET'S TALK
                    </h2>

                    <h1 className="font-bebas text-2xl">
                        CHARLES ALCANTARA
                    </h1>

                    <h2 className="font-bebas w-10 leading-7 mt-0.5">
                        2026
                    </h2>

                </div>

                {/* Title and Picture Div */}
                <div className="flex flex-row items-center justify-center mt-20 gap-2">
                    
                    <div className="flex flex-col">
                        <h2 className="text-palette-one font-calistoga text-4xl">
                            full-stack
                        </h2>
                        <h1 className="text-palette-two font-bebas text-5xl">
                            DEVELOPER
                        </h1>
                        <h2 className="text-palette-one font-calistoga text-4xl">
                            & ui/ux
                        </h2>
                        <h1 className="text-palette-two font-bebas text-5xl">
                            DESIGNER
                        </h1>
                    </div>

                    <Image src="/pictures/my-closeup.png" alt="Hero Image" width={200} height={300} 
                    className="" />
                </div>

                {/* Short info and learn more button Div */}
                <div className="flex flex-col mt-20">

                    <h1 className="font-vietnam text-palette-one text-center w-80 self-center">
                        Hi, I'm Charles — a full-stack web developer with a strong foundation in software engineering and a passion for building clean, scalable, and user-centered digital products.
                    </h1>

                    <ShimmerButton shimmerColor="#8040ed" shimmerSize="0.2em" background="rgba(225, 217, 188, 1)" className="text-black font-vietnam text-xs font-bold w-23 h-7 mt-10 mr-15 self-end">About me</ShimmerButton>
                </div> 

                {/* Socials buttons Div */}
                <div className="flex justify-between px-25 mt-15">

                    <a href="https://github.com/selrvk">
                        <Image src="/icons/git-icon-coloured.png" alt="Hero Image" width={30} height={40} 
                        className="" />
                    </a>

                    <a href="https://linkedin/in/charles-alcantara">
                        <Image src="/icons/linkedin-icon-coloured.png" alt="Hero Image" width={30} height={40} 
                        className="" />
                    </a>

                    <a href="https://instagram.com/selrvk">
                        <Image src="/icons/insta-icon-coloured.png" alt="Hero Image" width={30} height={40} 
                        className="" />
                    </a>
                </div>

            </div>
        </section>
    )
}   