import { Helmet } from "react-helmet-async";
import {Link} from "react-router-dom";

const About = () => {
    return (
        <div className="min-h-screen py-16 px-6 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white">

            <Helmet>
                <title>About Codesphere - Modern Collaborative Coding Platform</title>
                <meta
                    name="description"
                    content="Learn about Codesphere, a platform that connects students and educators with a modern, collaborative coding environment."
                />
            </Helmet>

            <div className="max-w-5xl mx-auto space-y-20">
                {/* Title */}
                <section>
                    <h1 className="text-5xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600">
                        About Codesphere
                    </h1>
                    <p className="mt-6 text-xl text-center max-w-3xl mx-auto text-gray-800 dark:text-gray-300">
                        Codesphere is a platform that connects students and educators in a modern,
                        collaborative coding environment. Built to support real-world learning,
                        we focus on simplicity, usability, and innovation.
                    </p>
                </section>

                {/* Mission */}
                <section>
                    <h2 className="text-3xl font-semibold mb-6 text-indigo-700 dark:text-indigo-400 border-b-2 border-indigo-300 dark:border-indigo-600 pb-2">
                        Our Mission
                    </h2>
                    <ul className="list-disc list-inside space-y-3 text-lg text-gray-800 dark:text-gray-300">
                        <li>Make programming education accessible and intuitive.</li>
                        <li>Empower teachers with powerful tools and real-time feedback.</li>
                        <li>Encourage teamwork and creative problem-solving.</li>
                    </ul>
                </section>

                {/* Tech Stack */}
                <section>
                    <h2 className="text-3xl font-semibold mb-6 text-purple-700 dark:text-purple-400 border-b-2 border-purple-300 dark:border-purple-600 pb-2">
                        Tech Stack
                    </h2>
                    <ul className="list-disc list-inside space-y-3 text-lg text-gray-800 dark:text-gray-300">
                        <li>React + TypeScript</li>
                        <li>Tailwind CSS</li>
                        <li>Redux Toolkit & RTK Query</li>
                        <li>Node.js & Express</li>
                        <li>MongoDB</li>
                    </ul>
                </section>

                {/* Developer */}
                <section>
                    <h2 className="text-3xl font-semibold mb-8 text-pink-700 dark:text-pink-400 text-center border-b-2 border-pink-300 dark:border-pink-600 pb-2">
                        Meet the Developer
                    </h2>
                    <div className="flex justify-center">
                        <div className="rounded-xl bg-white dark:bg-gray-800 p-8 text-center shadow-lg hover:shadow-2xl transition max-w-sm">
                            <img
                                src="/"
                                alt="Yusif Shabanli"
                                className="w-28 h-28 rounded-full mx-auto object-cover mb-6 ring-4 ring-indigo-400 dark:ring-indigo-600"
                            />
                            <h3 className="text-xl font-semibold mb-1">Yusif Shabanli</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Fullstack Engineer
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                I'm the creator of Codesphere — dedicated to building modern,
                                elegant tools for coding education. I love React, backend logic, and everything in between.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section>
                    <h2 className="text-3xl font-semibold mb-4 text-indigo-700 dark:text-indigo-400 border-b-2 border-indigo-300 dark:border-indigo-600 pb-2">
                        Contact
                    </h2>
                    <p className="text-lg mb-2 text-gray-800 dark:text-gray-300">
                        📧 Email:{" "}
                        <a
                            href="mailto:team@codesphere.dev"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            team@codesphere.dev
                        </a>
                    </p>
                    <p className="text-lg text-gray-800 dark:text-gray-300">
                        🌍 Website:{" "}
                        <a
                            href="https://codesphere.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            https://codesphere.dev
                        </a>
                    </p>
                </section>
                <div className="text-center mt-12">
                    <Link
                        to="/"
                        className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        ⬅ Go to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default About;
