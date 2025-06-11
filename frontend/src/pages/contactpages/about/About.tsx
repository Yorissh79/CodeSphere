import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const containerVariant = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.15,
        },
    },
};

const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const imageVariant = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

const About = () => {
    return (
        <div className="min-h-screen py-16 px-6 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white">
                <title>About Codesphere - Modern Collaborative Coding Platform</title>
                <meta
                    name="description"
                    content="Learn about Codesphere, a platform that connects students and educators with a modern, collaborative coding environment."
                />

            <div className="max-w-5xl mx-auto space-y-20">

                {/* Title Section with stagger */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={containerVariant}
                    className="text-center"
                >
                    <motion.h1
                        variants={itemVariant}
                        className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600"
                    >
                        About Codesphere
                    </motion.h1>
                    <motion.p
                        variants={itemVariant}
                        className="mt-6 text-xl max-w-3xl mx-auto text-gray-800 dark:text-gray-300"
                    >
                        Codesphere is a platform that connects students and educators in a modern,
                        collaborative coding environment. Built to support real-world learning,
                        we focus on simplicity, usability, and innovation.
                    </motion.p>
                </motion.section>

                {/* Our Mission */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={containerVariant}
                >
                    <motion.h2
                        variants={itemVariant}
                        className="text-3xl font-semibold mb-6 text-indigo-700 dark:text-indigo-400 border-b-2 border-indigo-300 dark:border-indigo-600 pb-2"
                    >
                        Our Mission
                    </motion.h2>
                    <motion.ul
                        variants={containerVariant}
                        className="list-disc list-inside space-y-3 text-lg text-gray-800 dark:text-gray-300"
                    >
                        {["Make programming education accessible and intuitive.",
                            "Empower teachers with powerful tools and real-time feedback.",
                            "Encourage teamwork and creative problem-solving."].map((mission, idx) => (
                            <motion.li key={idx} variants={itemVariant}>{mission}</motion.li>
                        ))}
                    </motion.ul>
                </motion.section>

                {/* Tech Stack */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={containerVariant}
                >
                    <motion.h2
                        variants={itemVariant}
                        className="text-3xl font-semibold mb-6 text-purple-700 dark:text-purple-400 border-b-2 border-purple-300 dark:border-purple-600 pb-2"
                    >
                        Tech Stack
                    </motion.h2>
                    <motion.ul
                        variants={containerVariant}
                        className="list-disc list-inside space-y-3 text-lg text-gray-800 dark:text-gray-300"
                    >
                        {[
                            "React + TypeScript",
                            "Tailwind CSS",
                            "Redux Toolkit & RTK Query",
                            "Node.js & Express",
                            "MongoDB",
                        ].map((tech, idx) => (
                            <motion.li key={idx} variants={itemVariant}>{tech}</motion.li>
                        ))}
                    </motion.ul>
                </motion.section>

                {/* Meet the Developer */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={containerVariant}
                >
                    <motion.h2
                        variants={itemVariant}
                        className="text-3xl font-semibold mb-8 text-pink-700 dark:text-pink-400 text-center border-b-2 border-pink-300 dark:border-pink-600 pb-2"
                    >
                        Meet the Developer
                    </motion.h2>
                    <motion.div
                        variants={itemVariant}
                        className="flex justify-center"
                    >
                        <motion.div
                            variants={containerVariant}
                            className="rounded-xl bg-white dark:bg-gray-800 p-8 text-center shadow-lg hover:shadow-2xl transition max-w-sm"
                        >
                            <motion.img
                                src="/img.png"
                                alt="Yusif Shabanli"
                                loading="lazy"
                                variants={imageVariant}
                                className="w-28 h-28 rounded-full mx-auto object-cover mb-6 ring-4 ring-indigo-400 dark:ring-indigo-600"
                            />
                            <motion.h3 variants={itemVariant} className="text-xl font-semibold mb-1">
                                Yusif Shabanli
                            </motion.h3>
                            <motion.p variants={itemVariant} className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Fullstack Engineer
                            </motion.p>
                            <motion.p variants={itemVariant} className="text-sm text-gray-700 dark:text-gray-300">
                                I'm the creator of Codesphere — dedicated to building modern,
                                elegant tools for coding education. I love React, backend logic, and everything in between.
                            </motion.p>
                        </motion.div>
                    </motion.div>
                </motion.section>

                {/* Contact */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={containerVariant}
                >
                    <motion.h2
                        variants={itemVariant}
                        className="text-3xl font-semibold mb-4 text-indigo-700 dark:text-indigo-400 border-b-2 border-indigo-300 dark:border-indigo-600 pb-2"
                    >
                        Contact
                    </motion.h2>
                    <motion.p variants={itemVariant} className="text-lg mb-2 text-gray-800 dark:text-gray-300">
                        📧 Email:{" "}
                        <a
                            href="mailto:team@codesphere.dev"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            team@codesphere.dev
                        </a>
                    </motion.p>
                    <motion.p variants={itemVariant} className="text-lg text-gray-800 dark:text-gray-300">
                        🌍 Website:{" "}
                        <a
                            href="https://codesphere.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            https://codesphere.dev
                        </a>
                    </motion.p>
                </motion.section>

                {/* Go Home Button */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={itemVariant}
                    className="text-center mt-12"
                >
                    <Link
                        to="/"
                        className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        ⬅ Go to Home
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default About;
