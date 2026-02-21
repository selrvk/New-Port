"use client"
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function AboutMe() {

    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <section id="about-me" className="relative min-h-screen overflow-hidden bg-linear-to-l from-[#1C2442] to-palette-four">
                    
                    <div className="flex flex-col items-center justify-center">
        
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}   
                            whileInView={{ opacity: 1, y: 0 }} 
                            viewport={{ once: false, amount: 0.5 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                        >
                            <h1 className="text-palette-one font-bebas text-6xl text-center mt-20">
                                About Me
                            </h1>
        
                            <h2 className="text-palette-two font-calistoga text-xl text-center -mt-3">
                                uh yeah
                            </h2>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}   
                            whileInView={{ opacity: 1, y: 0 }} 
                            viewport={{ once: false, amount: 0.2 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="mt-20 space-y-6 max-w-[80%] justify-center text-lg leading-relaxed text-center">
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className='text-palette-one font-vietnam'
                            >
                                Hi, I'm <span className="font-semibold text-white">Charles</span> — a full-stack web developer with a strong foundation in software engineering and a passion for building clean, scalable, and user-centered digital products.
                            </motion.p>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                        className="space-y-6 overflow-hidden text-palette-one font-vietnam"
                                    >
                                        <p>
                                            I began my journey studying BS-Software Technology at De La Salle University, and I am currently pursuing BS-Information Technology at Lyceum of the Philippines University – Batangas. My academic background, combined with hands-on project experience, has shaped my ability to work across the entire development stack — from crafting intuitive user interfaces to architecting robust backend systems.
                                        </p>
                                        
                                        <p>
                                            I'm proficient in a wide range of programming languages and frameworks, with certifications to support my technical expertise. I work confidently with front-end libraries, modern backend development, RESTful APIs, and both SQL and NoSQL databases. I also have experience in system design, cloud services (AWS), deployment pipelines, and version control with Git, enabling me to deliver complete, production-ready solutions.
                                        </p>
                                        
                                        <p>
                                            As a nationally certified Visual Graphics Designer, I bring a strong sense of UI/UX, allowing me to blend technical precision with meaningful design. Whether collaborating in Agile environments or working through structured Waterfall processes, I communicate clearly, work efficiently, and prioritize reliability and scalability in every project.
                                        </p>
                                        
                                        <p>
                                            Driven, adaptable, and eager to learn, I'm constantly pushing myself to evolve with new technologies and industry best practices. My goal is to build products that solve real problems, perform flawlessly, and deliver exceptional experiences for both users and clients.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="mt-8 px-4 py-2  rounded-lg bg-linear-to-t from-[#191E32] to-palette-four
                                        transition-all duration-300 shadow-2xl/40 shadow-palette-one border border-black text-palette-one"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {isExpanded ? "Show Less" : "Read More"}
                            </motion.button>
                        </motion.div>
                    </div>
        </section>
    )
}