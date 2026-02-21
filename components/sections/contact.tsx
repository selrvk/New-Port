"use client"
import { motion } from "motion/react"

import Image from "next/image"

export default function Contact(){

    return (
        <section id="contact" className="pb-40 relative min-h-screen overflow-hidden bg-linear-to-l from-[#1C2442] to-palette-four">
            
            <div className="flex flex-col items-center justify-center">
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}   
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    >
                        <h1 className="text-palette-one font-bebas text-6xl text-center mt-20">
                            Contact
                        </h1>
        
                        <h2 className="text-palette-two font-calistoga text-xl text-center -mt-3">
                            Keep in touch
                        </h2>

                        <div className="text-center mt-20 text-palette-one font-vietnam font-bold">
                            <h1>
                                Have a project or design in mind?
                            </h1>
                            <h2>
                                Let's talk about it.
                            </h2>
                        </div>
                    </motion.div>

                    <motion.div 
                
                        initial={{ opacity: 0, y: 20 }}   
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        
                        className="flex flex-col gap-5 text-palette-one font-vietnam mt-10">

                        <div className="flex flex-row justify-between gap-10">
                            <Image src="/icons/con-email-icon.png" alt="Hero Image" width={50} height={50} 
                                className="rounded-full bg-palette-one" />
                            
                            <h1>
                                selrvk@gmail.com
                            </h1>
                        </div>
                        

                        <div className="flex flex-row justify-between">
                            <Image src="/icons/con-phone-icon.png" alt="Hero Image" width={50} height={50} 
                                className="rounded-full bg-palette-one" />
                            
                            <h1>
                                +63 939 354 7380
                            </h1>
                        </div>
                    </motion.div>
                    

                    <motion.div 
                
                        initial={{ opacity: 0, y: 20 }}   
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        
                        className="flex flex-col">

                        <h1 className="font-vietnam text-palette-one font-bold mt-10">
                            or reach out to me on common platforms
                        </h1>

                        <div className="flex flex-col justify-center text-palette-one font-vietnam mt-10 gap-10 text-lg">

                            <div className="flex justify-between">
                                <Image src="/icons/con-dc-icon.jpg" alt="Hero Image" width={50} height={50} 
                                className="rounded-sm" />

                                <h1>
                                    selrvk
                                </h1>
                            </div>

                            <div className="flex justify-between">
                                <Image src="/icons/con-ig-icon.png" alt="Hero Image" width={50} height={50} 
                                className="" />
                                <h1>
                                    instagram.com/selrvk
                                </h1>
                            </div>

                        </div>
                    </motion.div>
            </div>
        </section>
    )
}