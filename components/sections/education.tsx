"use client"
import { motion } from "motion/react"
import HorizontalEducationTimeline from "../horizontal-timeline";

export default function Education() {

    return (
        <section id="education" className="relative min-h-screen overflow-hidden bg-linear-to-l from-[#1C2442] to-palette-four">
                    
                    <div className="flex flex-col items-center justify-center">
        
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}   
                            whileInView={{ opacity: 1, y: 0 }} 
                            viewport={{ once: false, amount: 0.5 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                        >
                            <h1 className="text-palette-one font-bebas text-6xl text-center mt-20">
                                Education
                            </h1>
        
                            <h2 className="text-palette-two font-calistoga text-xl text-center -mt-3">
                                what brought me here
                            </h2>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}   
                            whileInView={{ opacity: 1, y: 0 }} 
                            viewport={{ once: false, amount: 0.2 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="max-w-full mt-40"
                        >
                            <HorizontalEducationTimeline/>

                        </motion.div>
                        
                    </div>
        
        </section>
    )
}