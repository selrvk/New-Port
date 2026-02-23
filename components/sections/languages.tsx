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
            { threshold: 0.5 } // 50% visible
        )
        if (ref.current) observer.observe(ref.current)
        return () => {
            if (ref.current) observer.unobserve(ref.current)
        }
    }, [])

    

    return (
        <section id="languages" className="relative min-h-screen overflow-hidden bg-linear-to-l from-[#1C2442] to-palette-four">
            
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

                    <h2 className="text-palette-two font-calistoga text-2xl text-center -mt-3">
                        (not programming ones)
                    </h2>
                </motion.div>

                <motion.div
                        initial={{ opacity: 0, y: 20 }}   
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 1.2, ease: "easeOut" }} 
                    className="grid grid-rows-3 grid-cols-2 justify-items-center gap-10 text-palette-one text-2xl font-bebas mt-35">
                    
                    <div className="flex items-center">
                        <h1>
                            English
                        </h1>
                    </div>
                        <AnimatedCircularProgressBar value={90} gaugePrimaryColor="#F0F0DB" gaugeSecondaryColor="#ACBAC4"/>
                    <div className="flex items-center">
                        <h1>
                            Filipino
                        </h1>
                    </div>
                    <AnimatedCircularProgressBar value={80} gaugePrimaryColor="#F0F0DB" gaugeSecondaryColor="#ACBAC4"/>
                    <div className="flex items-center">
                        <h1>
                            Spanish
                        </h1>
                    </div>
                    <AnimatedCircularProgressBar min={0} max={100} value={15} gaugePrimaryColor="#F0F0DB" gaugeSecondaryColor="#ACBAC4"/>
                </motion.div>


            </div>

        </section>
    )
}