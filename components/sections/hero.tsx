// components/sections/hero.tsx

'use client'

import { ShimmerButton } from "@/components/ui/shimmer-button"
import { motion } from "motion/react"
import Image from "next/image"

export default function Hero() {
    return (
        <section id="hero" className="pb-40 relative min-h-screen overflow-hidden bg-linear-to-l from-[#1C2442] to-palette-four">
            
            <div>

                {/* Hero Header Div */}
                <motion.div 
                
                        initial={{ opacity: 0, y: -20 }}   
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        
                className=" flex justify-between bg-palette-one text-palette-four rounded-[50] px-5 pt-2 pb-0.5 m-5 text-center
                            md:bg-transparent md:text-palette-one">
                    
                    <a href="#contact">
                        <h2 className="font-bebas w-10 leading-3.5">
                            LET'S TALK
                        </h2>
                    </a>

                    <h1 className="font-bebas text-2xl">
                        CHARLES ALCANTARA
                    </h1>

                    <h2 className="font-bebas w-10 leading-7 mt-0.5">
                        2026
                    </h2>

                </motion.div>

                {/* Title and Picture Div */}
                <motion.div 
                                
                        initial={{ opacity: 0, y: -20 }}   
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        
                className=" flex flex-row items-center justify-center mt-20 gap-2 
                            md:gap-[5%]">
                    
                    <div className="flex flex-col">
                        <h2 className="text-palette-one font-calistoga text-4xl md:text-6xl lg:text-8xl">
                            full-stack
                        </h2>
                        <h1 className="text-palette-two font-bebas text-5xl md:text-6xl lg:text-8xl">
                            DEVELOPER
                        </h1>
                        <h2 className="text-palette-one font-calistoga text-4xl md:text-6xl lg:text-8xl">
                            & ui/ux
                        </h2>
                        <h1 className="text-palette-two font-bebas text-5xl md:text-6xl lg:text-8xl">
                            DESIGNER
                        </h1>
                    </div>

                    <div className="relative h-[20vh] md:h-[30vh] lg:h-[40vh] aspect-[3/3]"> 
                        <Image
                            src="/pictures/my-closeup.png"
                            alt="Hero Image"
                            fill
                            className="object-cover rounded-lg"
                            priority 
                        />
                    </div>
                </motion.div>

                {/* Short info and learn more button Div */}
                <motion.div 
                                
                        initial={{ opacity: 0, y: 20 }}   
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        
                className="flex flex-col mt-20
                            md:flex-col md:justify-center md:gap-[10%]">

                    <h1 className="font-vietnam text-palette-one text-center w-80 self-center
                                    md:text-xl md:w-180">
                        Hi, I'm Charles — a full-stack web developer with a strong foundation in software engineering and a passion for building clean, scalable, and user-centered digital products.
                    </h1>
                    
                    <a href="#about-me" className=" self-end 
                                                    md:self-center">
                        <ShimmerButton shimmerColor="#8040ed" shimmerSize="0.2em" background="rgba(225, 217, 188, 1)" className="text-black font-vietnam text-xs font-bold w-23 h-7 mt-10 mr-15 md:mr-0">About me</ShimmerButton>
                    </a>
                    
                </motion.div> 

                {/* Socials buttons Div */}
                <motion.div 
                                
                        initial={{ opacity: 0, y: 20 }}   
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 3, ease: "easeOut" }}
                        
                className=" flex justify-between px-25 mt-15 
                            md:gap-10 md:justify-center md:flex-row">

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
                </motion.div>

            </div>
        </section>
    )
}   