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

                        <div className="text-center mt-20 text-palette-one font-vietnam font-bold text-xl">
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
                        
                        className="">
                        
                        <div className="grid grid-cols-2 grid-rows-2 gap-10 mt-10 text-palette-one font-vietnam">
                            <div className="flex justify-center">
                                <Image src="/icons/con-email-icon.png" alt="Hero Image" width={50} height={50} 
                                    className="rounded-full bg-palette-one" />
                            </div>

                            <div>
                                <h1>
                                    selrvk@gmail.com
                                </h1>
                            </div>
                            

                            <div className="flex justify-center">
                                <Image src="/icons/con-phone-icon.png" alt="Hero Image" width={50} height={50} 
                                    className="rounded-full bg-palette-one" />
                            </div>

                            <div>
                                <h1>
                                    +63 939 354 7380
                                </h1>
                            </div>
                        </div>
                        
                    </motion.div>
                    

                    <motion.div 
                
                        initial={{ opacity: 0, y: 20 }}   
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        
                        className="">

                        <h1 className="font-vietnam text-palette-one font-bold mt-10 text-center text-xl">
                            or reach out to me on common platforms
                        </h1>

                        <div className="grid grid-cols-2 grid-rows-2 text-palette-one font-vietnam mt-10 gap-10 text-lg">

                            <div className="flex justify-center">
                                <Image src="/icons/con-dc-icon.jpg" alt="Discord Icon" width={50} height={50} 
                                className="rounded-sm" />
                            </div>

                            <div>
                                <h1>
                                    selrvk
                                </h1>
                            </div>

                            <div className="flex justify-center ">
                                <Image src="/icons/con-ig-icon.png" alt="Instagram Icon" width={50} height={50} 
                                className="" />
                            </div>

                            <div>
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