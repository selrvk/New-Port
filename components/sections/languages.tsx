'use client'

import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar"
import { motion } from "motion/react"
import { useRef, useState, useEffect } from "react"


export default function Languages() {

    const ref = useRef<HTMLDivElement>(null)
    const [inView, setInView] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
            if (entry.isIntersecting) setInView(true)
            },
            { threshold: 0.5 }
        )
        if (ref.current) observer.observe(ref.current)
        return () => {
            if (ref.current) observer.unobserve(ref.current)
        }
    }, [])

    

    return (
        <section id="languages" className="pb-80 relative min-h-screen overflow-hidden bg-linear-to-l from-[#1C2442] to-palette-four">
            
            <div className="flex flex-col items-center justify-center">

                <motion.div
                        initial={{ opacity: 0, y: 20 }}   
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                >
                    <h1 className="text-palette-one font-bebas text-6xl text-center mt-20">
                        Languages
                    </h1>

                    <h2 className="text-palette-two font-calistoga text-xl text-center -mt-3">
                        (not programming ones)
                    </h2>
                </motion.div>

                <motion.div
                        initial={{ opacity: 0, y: 20 }}   
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 1.2, ease: "easeOut" }} 
                    className="grid grid-rows-3 grid-cols-2 justify-items-center gap-10 text-palette-one text-2xl mt-35 pb-10">
                    
                    <div className="flex items-center font-bebas">
                        <h1>
                            English
                        </h1>
                    </div>
                        <AnimatedCircularProgressBar className="max-w-30 md:max-w-50" value={90} gaugePrimaryColor="#F0F0DB" gaugeSecondaryColor="#ACBAC4"/>
                    <div className="flex items-center font-bebas">
                        <h1>
                            Filipino
                        </h1>
                    </div>
                    <AnimatedCircularProgressBar className="max-w-30 md:max-w-50" value={80} gaugePrimaryColor="#F0F0DB" gaugeSecondaryColor="#ACBAC4"/>
                    <div className="flex items-center font-bebas">
                        <h1>
                            Spanish
                        </h1>
                    </div>
                    <AnimatedCircularProgressBar className="max-w-30 md:max-w-50" min={0} max={100} value={15} gaugePrimaryColor="#F0F0DB" gaugeSecondaryColor="#ACBAC4"/>
                </motion.div>


            </div>

        </section>
    )
}